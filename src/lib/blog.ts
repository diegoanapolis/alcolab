import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

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
        html: marked(content) as string,
      } satisfies BlogPost;
    })
    .filter((p) => p.published)
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  return posts;
}

/**
 * Get a single post by slug and locale
 */
export function getPost(locale: "pt" | "en", slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

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
    html: marked(content) as string,
  };
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
        html: marked(content) as string,
      } satisfies BlogPost;
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));

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
    html: marked(content) as string,
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
    html: marked(finalContent) as string,
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
    html: marked(target.content) as string,
  };
}