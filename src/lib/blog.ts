import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked } from "marked";
import markedKatex from "marked-katex-extension";

const markdownRenderer = new Marked(
  markedKatex({
    throwOnError: false,
    nonStandard: true,
  })
);

/**
 * tiptap-markdown escapes backslashes (\ → \\) and underscores (_ → \_) when
 * serialising the editor back to Markdown.  Inside LaTeX blocks those escapes
 * break KaTeX.  This helper reverses the damage *only* inside math delimiters
 * before the Markdown renderer (+ katex extension) ever sees the content.
 */
function fixLatexEscaping(md: string): string {
  // Display math: $$…$$ (possibly multi-line, with optional trailing \)
  md = md.replace(/\$\$\\?\n([\s\S]*?)\n?\$\$/g, (_match, inner: string) => {
    const fixed = inner
      .replace(/\\\\/g, "\\")       // \\mu  → \mu
      .replace(/\\_/g, "_")          // \_    → _
      .replace(/\\$/gm, "");         // trailing \ on lines
    return `$$\n${fixed}\n$$`;
  });

  // Inline math: $…$ (single line)
  md = md.replace(/\$([^\$\n]+?)\$/g, (_match, inner: string) => {
    const fixed = inner
      .replace(/\\\\/g, "\\")
      .replace(/\\_/g, "_");
    return `$${fixed}$`;
  });

  return md;
}

/* ───────────────────────────────────────────────────────────────────────────
 * BibTeX-style citation processor
 *
 * Usage in Markdown:
 *   - In the text:  \cite{key}  or  \cite{key1,key2,key3}
 *   - At the end:   a fenced code block tagged `bibtex` with standard entries
 *
 * The processor:
 *   1. Extracts all ```bibtex ... ``` blocks from the Markdown
 *   2. Parses each @type{key, field = {value}, ...} entry
 *   3. Assigns sequential numbers by order of FIRST \cite appearance
 *   4. Replaces \cite{key} with linked [N] superscripts
 *   5. Appends a formatted "Referências" / "References" section
 *
 * BibTeX entries that are never cited are omitted from the final list.
 * ─────────────────────────────────────────────────────────────────────────── */

interface BibEntry {
  key: string;
  type: string; // article, book, inproceedings, misc, …
  title: string;
  author: string;
  journal: string;
  booktitle: string;
  year: string;
  volume: string;
  number: string;
  pages: string;
  publisher: string;
  doi: string;
  url: string;
  note: string;
}

/** Parse a single BibTeX field value, handling nested braces. */
function parseBibField(raw: string): string {
  let val = raw.trim();
  // Remove outer braces or quotes
  if ((val.startsWith("{") && val.endsWith("}")) ||
      (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  // Resolve common LaTeX accents: {\\~a} → ã, {\\^e} → ê, etc.
  val = val
    .replace(/\{\\~([a-zA-Z])\}/g, (_, c: string) => {
      const map: Record<string, string> = { a: "ã", o: "õ", n: "ñ", A: "Ã", O: "Õ", N: "Ñ" };
      return map[c] || c;
    })
    .replace(/\{\\\^([a-zA-Z])\}/g, (_, c: string) => {
      const map: Record<string, string> = { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" };
      return map[c] || c;
    })
    .replace(/\{\\['']([a-zA-Z])\}/g, (_, c: string) => {
      const map: Record<string, string> = { a: "á", e: "é", i: "í", o: "ó", u: "ú", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú" };
      return map[c] || c;
    })
    .replace(/\{\\`([a-zA-Z])\}/g, (_, c: string) => {
      const map: Record<string, string> = { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" };
      return map[c] || c;
    })
    .replace(/\{\\[""]([a-zA-Z])\}/g, (_, c: string) => {
      const map: Record<string, string> = { a: "ä", e: "ë", i: "ï", o: "ö", u: "ü", A: "Ä", E: "Ë", I: "Ï", O: "Ö", U: "Ü" };
      return map[c] || c;
    })
    .replace(/\{\\c\{([a-zA-Z])\}\}/g, (_, c: string) => {
      const map: Record<string, string> = { c: "ç", C: "Ç" };
      return map[c] || c;
    })
    // Strip remaining braces
    .replace(/[{}]/g, "");
  return val.trim();
}

/** Format "Last, First and Last2, First2" → "Last FM, Last2 F2" (abbreviated). */
function formatAuthors(raw: string): string {
  if (!raw) return "";
  const authors = raw.split(/\s+and\s+/i);
  return authors
    .map((a) => {
      const parts = a.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        const last = parts[0];
        const initials = parts[1]
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase())
          .join("");
        return `${last} ${initials}`;
      }
      return a.trim();
    })
    .join(", ");
}

/** Format a BibEntry into a readable reference string (Vancouver-ish style). */
function formatReference(e: BibEntry): string {
  const parts: string[] = [];
  if (e.author) parts.push(formatAuthors(e.author) + ".");
  if (e.title) parts.push(e.title.replace(/\.$/, "") + ".");
  if (e.journal) parts.push(`*${e.journal}*.`);
  else if (e.booktitle) parts.push(`In: *${e.booktitle}*.`);
  if (e.publisher) parts.push(e.publisher + ".");
  if (e.year) {
    let detail = e.year;
    if (e.volume) {
      detail += `;${e.volume}`;
      if (e.number) detail += `(${e.number})`;
    }
    if (e.pages) detail += `:${e.pages}`;
    parts.push(detail + ".");
  }
  if (e.doi) parts.push(`doi:[${e.doi}](https://doi.org/${e.doi})`);
  else if (e.url) parts.push(`[Link](${e.url})`);
  // Convert BibTeX double-dash to en-dash in the final string
  return parts.join(" ").replace(/--/g, "–");
}

/** Extract all BibTeX entries from ```bibtex fenced blocks. */
function parseBibtexBlocks(md: string): { cleaned: string; entries: Map<string, BibEntry> } {
  const entries = new Map<string, BibEntry>();

  // Remove ```bibtex ... ``` blocks and parse them
  const cleaned = md.replace(/```bibtex\s*\n([\s\S]*?)```/gi, (_, block: string) => {
    // Match individual entries: @type{key, ... }
    const entryRegex = /@(\w+)\s*\{\s*([^,\s]+)\s*,([\s\S]*?)(?=\n@|\n*$)/g;
    let m: RegExpExecArray | null;
    while ((m = entryRegex.exec(block)) !== null) {
      const type = m[1].toLowerCase();
      const key = m[2].trim();
      const body = m[3];

      const entry: BibEntry = {
        key, type,
        title: "", author: "", journal: "", booktitle: "",
        year: "", volume: "", number: "", pages: "",
        publisher: "", doi: "", url: "", note: "",
      };

      // Parse fields: name = {value} or name = "value"
      const fieldRegex = /(\w+)\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\}|"[^"]*"|\d+)/g;
      let fm: RegExpExecArray | null;
      while ((fm = fieldRegex.exec(body)) !== null) {
        const fname = fm[1].toLowerCase() as keyof BibEntry;
        if (fname in entry && fname !== "key" && fname !== "type") {
          (entry as unknown as Record<string, string>)[fname] = parseBibField(fm[2]);
        }
      }

      entries.set(key, entry);
    }
    return ""; // Remove the bibtex block from the markdown
  });

  return { cleaned, entries };
}

/**
 * Process \cite{key} and \cite{key1,key2} in the markdown, replace with
 * numbered links, and append the reference list.
 */
function processCitations(md: string): string {
  const { cleaned, entries } = parseBibtexBlocks(md);

  // No BibTeX blocks found → return as-is
  if (entries.size === 0) return md;

  // First pass: collect citation order by scanning \cite{...}
  const citationOrder: string[] = [];
  const citeRegex = /\\cite\{([^}]+)\}/g;
  let cm: RegExpExecArray | null;
  const tempMd = cleaned;
  while ((cm = citeRegex.exec(tempMd)) !== null) {
    const keys = cm[1].split(",").map((k) => k.trim());
    for (const k of keys) {
      if (!citationOrder.includes(k)) {
        citationOrder.push(k);
      }
    }
  }

  if (citationOrder.length === 0) return cleaned;

  // Build number map
  const numMap = new Map<string, number>();
  citationOrder.forEach((k, i) => numMap.set(k, i + 1));

  // Second pass: replace \cite{...} with grouped numbered links
  // e.g. \cite{a,b,c} → [1–3] or [1,4,5] with individual links per number
  let result = cleaned.replace(/\\cite\{([^}]+)\}/g, (_, keysStr: string) => {
    const keys = keysStr.split(",").map((k) => k.trim());
    const resolved = keys
      .map((k) => {
        const n = numMap.get(k);
        if (!n) return null;
        return { key: k, num: n };
      })
      .filter((x): x is { key: string; num: number } => x !== null);
    if (resolved.length === 0) return "";

    // Sort by number for grouping
    resolved.sort((a, b) => a.num - b.num);

    // Group consecutive numbers into ranges
    const groups: { start: { key: string; num: number }; end: { key: string; num: number } }[] = [];
    let current = { start: resolved[0], end: resolved[0] };
    for (let i = 1; i < resolved.length; i++) {
      if (resolved[i].num === current.end.num + 1) {
        current.end = resolved[i];
      } else {
        groups.push({ ...current });
        current = { start: resolved[i], end: resolved[i] };
      }
    }
    groups.push(current);

    // Render: each number is a link, ranges use en-dash
    const parts: string[] = [];
    for (const g of groups) {
      const t0 = entries.get(g.start.key)?.title || g.start.key;
      if (g.start.num === g.end.num) {
        // Single number
        parts.push(`<a href="#ref-${g.start.num}" class="citation-link" title="${t0}">${g.start.num}</a>`);
      } else if (g.end.num === g.start.num + 1) {
        // Two consecutive: show as N,M
        const t1 = entries.get(g.end.key)?.title || g.end.key;
        parts.push(`<a href="#ref-${g.start.num}" class="citation-link" title="${t0}">${g.start.num}</a>,<a href="#ref-${g.end.num}" class="citation-link" title="${t1}">${g.end.num}</a>`);
      } else {
        // Range of 3+: show as N–M
        const t1 = entries.get(g.end.key)?.title || g.end.key;
        parts.push(`<a href="#ref-${g.start.num}" class="citation-link" title="${t0}">${g.start.num}</a>–<a href="#ref-${g.end.num}" class="citation-link" title="${t1}">${g.end.num}</a>`);
      }
    }
    return `[${parts.join(",")}]`;
  });

  // Append references section
  const refLines: string[] = [
    "",
    "---",
    "",
    "## Referências",
    "",
  ];
  for (const key of citationOrder) {
    const n = numMap.get(key)!;
    const entry = entries.get(key);
    if (entry) {
      refLines.push(`<p id="ref-${n}" class="reference-item">${n}. ${formatReference(entry)}</p>`);
    } else {
      refLines.push(`<p id="ref-${n}" class="reference-item">${n}. [${key}] — referência não encontrada.</p>`);
    }
  }
  refLines.push("");

  result += "\n" + refLines.join("\n");
  return result;
}

function renderMarkdown(content: string): string {
  return markdownRenderer.parse(fixLatexEscaping(processCitations(content))) as string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image: string;
  imageAlt: string;
  tags: string[];
  locale: string;
  published: boolean;
  status: "rascunho" | "em_revisao" | "aprovado" | "publicado";
  focusKeyword: string;
  translationSlug?: string; // slug of the sibling post in the other locale
  content: string; // raw markdown
  html: string; // rendered HTML
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function normalizeDate(d: any): string {
  if (!d) return "";
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
  const s = String(d);
  // If it's an ISO string or yyyy-mm-dd, slice it
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Try parsing
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return "";
}


/**
 * Get all published posts for a locale, sorted by date (newest first)
 */
export function getPosts(locale: "pt" | "en"): BlogPost[] {
  const dir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(dir, filename);
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);

        return {
          slug,
          title: data.title || "",
          description: data.description || "",
          date: normalizeDate(data.date),
          author: data.author || "",
          image: data.image || "",
          imageAlt: data.imageAlt || "",
          tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
          locale: data.locale || locale,
          published: data.published !== false,
          status: data.status || "rascunho",
          focusKeyword: data.focusKeyword || "",
          translationSlug: data.translationSlug || undefined,
          content,
          html: renderMarkdown(content),
        } satisfies BlogPost;
      } catch (err) {
        console.error(`[blog] Skipping ${locale}/${slug}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
      }
    })
    .filter((p) => p !== null && p.published)
    .sort((a, b) => ((b as BlogPost).date > (a as BlogPost).date ? 1 : -1)) as BlogPost[];

  return posts;
}

/**
 * Get a single post by slug and locale
 */
export function getPost(locale: "pt" | "en", slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.published === false) return null;

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: normalizeDate(data.date),
      author: data.author || "",
      image: data.image || "",
      imageAlt: data.imageAlt || "",
      tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
      locale: data.locale || locale,
      published: true,
      status: data.status || "rascunho",
      focusKeyword: data.focusKeyword || "",
      translationSlug: data.translationSlug || undefined,
      content,
      html: renderMarkdown(content),
    };
  } catch (err) {
    console.error(`[blog] Error reading ${locale}/${slug}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/**
 * Get all slugs for static generation
 */
export function getAllSlugs(locale: "pt" | "en"): string[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

/**
 * Get all posts for a locale, including unpublished ones (for admin interface)
 */
export function getAllPosts(locale: "pt" | "en"): BlogPost[] {
  const dir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const posts = files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const filePath = path.join(dir, filename);
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);

        return {
          slug,
          title: data.title || "",
          description: data.description || "",
          date: normalizeDate(data.date),
          author: data.author || "",
          image: data.image || "",
          imageAlt: data.imageAlt || "",
          tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
          locale: data.locale || locale,
          published: data.published !== false,
          status: data.status || "rascunho",
          focusKeyword: data.focusKeyword || "",
          translationSlug: data.translationSlug || undefined,
          content,
          html: renderMarkdown(content),
        } satisfies BlogPost;
      } catch (err) {
        console.error(`[blog] Skipping ${locale}/${slug}: ${err instanceof Error ? err.message : String(err)}`);
        return null;
      }
    })
    .filter((p) => p !== null)
    .sort((a, b) => ((b as BlogPost).date > (a as BlogPost).date ? 1 : -1)) as BlogPost[];

  return posts;
}

/**
 * Update the status of a post and sync the published field
 */
export function updatePostStatus(
  locale: "pt" | "en",
  slug: string,
  status: "rascunho" | "em_revisao" | "aprovado" | "publicado"
): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  // Update status and published field
  data.status = status;
  data.published = status === "publicado";

  // Use gray-matter's stringify to write back
  const updatedContent = matter.stringify(content, data);
  fs.writeFileSync(filePath, updatedContent, "utf-8");

  // Return the updated post
  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: normalizeDate(data.date),
    author: data.author || "",
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim())
        : [],
    locale: data.locale || locale,
    published: data.published !== false,
    status: data.status || "rascunho",
    focusKeyword: data.focusKeyword || "",
        translationSlug: data.translationSlug || undefined,
    content,
    html: renderMarkdown(content),
  };
}

/**
 * Update a post's content and metadata (for the admin editor)
 */
export function updatePost(
  locale: "pt" | "en",
  slug: string,
  updates: {
    title?: string;
    description?: string;
    author?: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    status?: "rascunho" | "em_revisao" | "aprovado" | "publicado";
    content?: string;
    date?: string;
    focusKeyword?: string;
    newSlug?: string;
  }
): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: existingContent } = matter(raw);

  // Update metadata fields if provided
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.date !== undefined) data.date = updates.date;
  if (updates.focusKeyword !== undefined) data.focusKeyword = updates.focusKeyword;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.author !== undefined) data.author = updates.author;
  if (updates.image !== undefined) data.image = updates.image;
  if (updates.imageAlt !== undefined) data.imageAlt = updates.imageAlt;
  if (updates.tags !== undefined) data.tags = updates.tags;
  if (updates.status !== undefined) {
    data.status = updates.status;
    data.published = updates.status === "publicado";
  }

  // PT <-> EN sync: mirror featured image (and alt) to the linked sibling post
  // so when the user changes the cover in PT, the EN (and vice-versa) updates
  // automatically. Uses `translationSlug` from the current frontmatter.
  const siblingLocale: "pt" | "en" = locale === "pt" ? "en" : "pt";
  const siblingSlug: string | undefined = data.translationSlug;
  if (
    siblingSlug &&
    typeof siblingSlug === "string" &&
    siblingSlug.trim().length > 0 &&
    (updates.image !== undefined || updates.imageAlt !== undefined)
  ) {
    const siblingPath = path.join(
      CONTENT_DIR,
      siblingLocale,
      `${siblingSlug}.md`
    );
    if (fs.existsSync(siblingPath)) {
      try {
        const siblingRaw = fs.readFileSync(siblingPath, "utf-8");
        const { data: siblingData, content: siblingContent } = matter(siblingRaw);
        let siblingChanged = false;
        if (updates.image !== undefined && siblingData.image !== updates.image) {
          siblingData.image = updates.image;
          siblingChanged = true;
        }
        if (
          updates.imageAlt !== undefined &&
          siblingData.imageAlt !== updates.imageAlt
        ) {
          siblingData.imageAlt = updates.imageAlt;
          siblingChanged = true;
        }
        if (siblingChanged) {
          fs.writeFileSync(
            siblingPath,
            matter.stringify(siblingContent, siblingData),
            "utf-8"
          );
        }
      } catch (err) {
        console.error(
          `[updatePost] Failed to sync image to sibling ${siblingLocale}/${siblingSlug}:`,
          err
        );
      }
    }
  }

  // Use updated content or keep existing
  const finalContent = updates.content !== undefined ? updates.content : existingContent;

  // Determine final slug (handle rename if newSlug is provided and different)
  let finalSlug = slug;
  let finalPath = filePath;
  if (
    updates.newSlug &&
    updates.newSlug.trim().length > 0 &&
    updates.newSlug !== slug
  ) {
    const normalizedNewSlug = updates.newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (normalizedNewSlug.length > 0) {
      const newFilePath = path.join(CONTENT_DIR, locale, `${normalizedNewSlug}.md`);
      if (fs.existsSync(newFilePath)) {
        throw new Error(`Slug ja em uso: ${normalizedNewSlug}`);
      }
      finalSlug = normalizedNewSlug;
      finalPath = newFilePath;
    }
  }

  // Write back (to new path if renamed, otherwise original)
  const updatedFile = matter.stringify(finalContent, data);
  fs.writeFileSync(finalPath, updatedFile, "utf-8");

  // If renamed, remove the old file
  if (finalPath !== filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }
  }

  return {
    slug: finalSlug,
    title: data.title || "",
    description: data.description || "",
    date: normalizeDate(data.date),
    author: data.author || "",
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
        ? data.tags.split(",").map((t: string) => t.trim())
        : [],
    locale: data.locale || locale,
    published: data.published !== false,
    status: data.status || "rascunho",
    focusKeyword: data.focusKeyword || "",
    translationSlug: data.translationSlug || undefined,
    content: finalContent,
    html: renderMarkdown(finalContent),
  };
}

/**
 * Create or overwrite a translated post in the target locale and link it
 * bidirectionally with its source sibling via `translationSlug`. Used by the
 * "Atualizar versão EN" admin button.
 */
export function upsertTranslatedPost(
  sourceLocale: "pt" | "en",
  sourceSlug: string,
  target: {
    locale: "pt" | "en";
    slug: string;
    title: string;
    description: string;
    content: string;
    imageAlt?: string;
    focusKeyword?: string;
    tags?: string[];
  }
): BlogPost | null {
  const sourcePath = path.join(CONTENT_DIR, sourceLocale, `${sourceSlug}.md`);
  if (!fs.existsSync(sourcePath)) return null;

  const sourceRaw = fs.readFileSync(sourcePath, "utf-8");
  const { data: sourceData, content: sourceContent } = matter(sourceRaw);

  const normalizedTargetSlug = target.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedTargetSlug) return null;

  const targetDir = path.join(CONTENT_DIR, target.locale);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, `${normalizedTargetSlug}.md`);

  // If the target file ALREADY exists (re-translating an existing EN),
  // preserve its current status/published so we don't silently demote a
  // published translation back to draft.  For a fresh translation, start
  // as "em_revisao" + published=false so the author reviews before shipping.
  const targetExists = fs.existsSync(targetPath);
  let existingStatus: string = "em_revisao";
  let existingPublished: boolean = false;
  if (targetExists) {
    try {
      const { data: existingData } = matter(
        fs.readFileSync(targetPath, "utf-8"),
      );
      if (typeof existingData.status === "string") {
        existingStatus = existingData.status;
      }
      if (typeof existingData.published === "boolean") {
        existingPublished = existingData.published;
      }
    } catch {
      /* ignore — fall back to defaults */
    }
  }

  // Start from source frontmatter so everything (image, date, author, ...)
  // is mirrored unless the caller overrides a specific field.
  const targetData: Record<string, unknown> = {
    ...sourceData,
    title: target.title,
    description: target.description,
    locale: target.locale === "pt" ? "pt-BR" : "en",
    translationSlug: sourceSlug,
    // Preserve existing status when overwriting an already-translated post;
    // otherwise start as draft so the author reviews first.
    status: existingStatus,
    published: existingPublished,
  };

  if (target.imageAlt !== undefined) targetData.imageAlt = target.imageAlt;
  if (target.focusKeyword !== undefined)
    targetData.focusKeyword = target.focusKeyword;
  if (target.tags !== undefined) targetData.tags = target.tags;

  fs.writeFileSync(
    targetPath,
    matter.stringify(target.content, targetData),
    "utf-8"
  );

  // Link back from the source so future image changes also sync.
  if (sourceData.translationSlug !== normalizedTargetSlug) {
    sourceData.translationSlug = normalizedTargetSlug;
    fs.writeFileSync(
      sourcePath,
      matter.stringify(sourceContent, sourceData),
      "utf-8"
    );
  }

  return {
    slug: normalizedTargetSlug,
    title: target.title,
    description: target.description,
    date: normalizeDate(targetData.date),
    author: (targetData.author as string) || "",
    image: (targetData.image as string) || "",
    imageAlt: (targetData.imageAlt as string) || "",
    tags: Array.isArray(targetData.tags)
      ? (targetData.tags as string[])
      : [],
    locale: (targetData.locale as string) || target.locale,
    published: existingPublished,
    status: existingStatus as BlogPost["status"],
    focusKeyword: (targetData.focusKeyword as string) || "",
    translationSlug: sourceSlug,
    content: target.content,
    html: renderMarkdown(target.content),
  };
}