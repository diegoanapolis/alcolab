import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllPosts, upsertTranslatedPost } from "@/lib/blog";
import { syncLocalFile } from "@/lib/github-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const UNAUTHORIZED = NextResponse.json(
  { error: "Não autenticado. Faça login em /admin/blog." },
  { status: 401 }
);

/**
 * POST /api/admin/translate-post
 * Body: { slug: string, locale: "pt" | "pt-BR" }
 *
 * Translates a Portuguese blog post into English using the Anthropic API
 * and writes the result to content/blog/en/<slug-en>.md, linking both
 * sides via the `translationSlug` frontmatter field.
 *
 * Requires the environment variable ANTHROPIC_API_KEY to be set.
 */
export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated()) return UNAUTHORIZED;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY não configurada no servidor. Adicione no Railway (Settings → Variables) e no .env.local para desenvolvimento.",
      },
      { status: 500 }
    );
  }

  let body: { slug?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { slug, locale } = body;
  if (!slug || !locale) {
    return NextResponse.json(
      { error: "Campos obrigatórios: slug, locale" },
      { status: 400 }
    );
  }

  // Only PT → EN supported for now; the button lives on the PT editor
  const normalized = locale.startsWith("pt") ? "pt" : null;
  if (normalized !== "pt") {
    return NextResponse.json(
      { error: "Somente tradução PT → EN é suportada." },
      { status: 400 }
    );
  }

  const ptPosts = getAllPosts("pt");
  const source = ptPosts.find((p) => p.slug === slug);
  if (!source) {
    return NextResponse.json(
      { error: `Post PT não encontrado: ${slug}` },
      { status: 404 }
    );
  }

  const prompt = buildPrompt(source);

  let claudeResponse: Response;
  try {
    claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Falha ao chamar Anthropic API: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 }
    );
  }

  if (!claudeResponse.ok) {
    const errorText = await claudeResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Anthropic API erro ${claudeResponse.status}: ${errorText.slice(0, 500)}`,
      },
      { status: 502 }
    );
  }

  const data = await claudeResponse.json();
  const text: string = Array.isArray(data?.content)
    ? data.content
        .filter((c: { type: string }) => c.type === "text")
        .map((c: { text: string }) => c.text)
        .join("\n")
    : "";

  if (!text) {
    return NextResponse.json(
      { error: "Resposta vazia da Anthropic API." },
      { status: 502 }
    );
  }

  // Expected response format:
  //
  //   <slug>how-to-...</slug>
  //   <title>...</title>
  //   <description>...</description>
  //   <focusKeyword>...</focusKeyword>
  //   <imageAlt>...</imageAlt>
  //   <tags>tag1, tag2, tag3</tags>
  //   <content>
  //   # ...
  //   markdown body here
  //   </content>
  const extract = (tag: string) => {
    const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim() : "";
  };

  const targetSlug = extract("slug");
  const targetTitle = extract("title");
  const targetDescription = extract("description");
  const targetFocusKeyword = extract("focusKeyword");
  const targetImageAlt = extract("imageAlt");
  const targetTagsRaw = extract("tags");
  const targetContent = extract("content");

  if (!targetSlug || !targetTitle || !targetContent) {
    return NextResponse.json(
      {
        error:
          "Tradução retornada em formato inválido (faltam <slug>, <title> ou <content>). Tente novamente.",
        raw: text.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  // Basic markdown validation: the content must at least have a heading and
  // preserve the same number of fenced code blocks / images as the source.
  const sourceFences = (source.content.match(/```/g) || []).length;
  const targetFences = (targetContent.match(/```/g) || []).length;
  if (sourceFences !== targetFences) {
    return NextResponse.json(
      {
        error: `Markdown inválido: quantidade de blocos de código diferente (source ${sourceFences}, target ${targetFences}).`,
        raw: text.slice(0, 2000),
      },
      { status: 502 }
    );
  }

  const tags = targetTagsRaw
    ? targetTagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : undefined;

  // If the PT source already has a linked EN translation, reuse that slug
  // so the existing file is OVERWRITTEN with the new translation.  Without
  // this, the LLM can pick a slightly different slug on each run and we
  // end up creating orphan files while the user keeps seeing the old EN.
  const effectiveTargetSlug =
    source.translationSlug && source.translationSlug.trim().length > 0
      ? source.translationSlug.trim()
      : targetSlug;

  const saved = upsertTranslatedPost("pt", slug, {
    locale: "en",
    slug: effectiveTargetSlug,
    title: targetTitle,
    description: targetDescription,
    content: targetContent,
    imageAlt: targetImageAlt || undefined,
    focusKeyword: targetFocusKeyword || undefined,
    tags,
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Falha ao salvar tradução no disco." },
      { status: 500 }
    );
  }

  // Mirror both the new EN file and the back-linked PT source to GitHub so
  // the translation and the translationSlug update survive redeploys.
  const cwd = process.cwd();
  await syncLocalFile(
    path.join(cwd, "content", "blog", "en", `${saved.slug}.md`),
    `admin(translate): create en/${saved.slug} from pt/${slug}`,
  );
  await syncLocalFile(
    path.join(cwd, "content", "blog", "pt", `${slug}.md`),
    `admin(translate): link pt/${slug} -> en/${saved.slug}`,
  );

  return NextResponse.json({
    ok: true,
    targetSlug: saved.slug,
    targetLocale: "en",
    message: `Tradução EN salva como rascunho em /blog/en/${saved.slug}. Revise antes de publicar.`,
  });
}

function buildPrompt(source: {
  slug: string;
  title: string;
  description: string;
  focusKeyword: string;
  imageAlt: string;
  tags: string[];
  content: string;
}): string {
  return `You are a professional technical translator for AlcoLab, a Brazilian public-health project about screening for methanol in adulterated alcoholic beverages. Translate the following Portuguese blog post into natural, technically accurate English for an international audience.

CRITICAL RULES:
1. Output MUST be wrapped in the exact XML tags shown below. Do not add anything outside the tags.
2. Preserve ALL markdown formatting: headings, lists, tables, blockquotes, links, images, fenced code blocks, HTML/SVG embeds, YouTube iframes.
3. Do NOT translate: URLs, file paths, code, chemical formulas, numeric values, unit symbols (mL, g/mL, °C, mPa·s), scientific drug names like "fomepizole" or "ethanol".
4. The number of fenced code blocks (\`\`\`) in the output MUST match the source exactly.
5. Generate an English SEO-optimized slug (kebab-case, no accents, <= 80 chars) for the <slug> tag.
6. Translate the title, description, imageAlt, and tags naturally for English SEO.
7. Choose an appropriate English focus keyword that reflects what English speakers search for on this topic.
8. Keep the same structure: if the source has an H1 from frontmatter (no # at top), do the same; do not add an H1 inside content.
9. Translate discourse connectors naturally (e.g., "Em suma" → "In summary", "Além disso" → "Moreover", "Portanto" → "Therefore").

SOURCE POST METADATA (Portuguese):
- slug: ${source.slug}
- title: ${source.title}
- description: ${source.description}
- focusKeyword: ${source.focusKeyword}
- imageAlt: ${source.imageAlt}
- tags: ${source.tags.join(", ")}

SOURCE POST BODY (Portuguese markdown):
<<<SOURCE
${source.content}
SOURCE>>>

Now produce the English version in exactly this format, replacing the placeholders:

<slug>english-kebab-slug-here</slug>
<title>English SEO title here</title>
<description>English meta description 120-160 chars here</description>
<focusKeyword>english focus keyword here</focusKeyword>
<imageAlt>English image alt text here</imageAlt>
<tags>tag one, tag two, tag three</tags>
<content>
The fully translated markdown body goes here, preserving every formatting element from the source.
</content>
`;
}
