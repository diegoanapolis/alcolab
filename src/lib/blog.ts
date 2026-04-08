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
  content: string; // raw markdown
  html: string; // rendered HTML
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

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
        date: data.date ? String(data.date).slice(0, 10) : "",
        author: data.author || "",
        image: data.image || "",
        imageAlt: data.imageAlt || "",
        tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
        locale: data.locale || locale,
        published: data.published !== false,
        status: data.status || "rascunho",
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
    date: data.date ? String(data.date).slice(0, 10) : "",
    author: data.author || "",
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
    locale: data.locale || locale,
    published: true,
    status: data.status || "rascunho",
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
        date: data.date ? String(data.date).slice(0, 10) : "",
        author: data.author || "",
        image: data.image || "",
        imageAlt: data.imageAlt || "",
        tags: Array.isArray(data.tags) ? data.tags : typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()) : [],
        locale: data.locale || locale,
        published: data.published !== false,
        status: data.status || "rascunho",
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
    date: data.date ? String(data.date).slice(0, 10) : "",
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
  }
): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: existingContent } = matter(raw);

  // Update metadata fields if provided
  if (updates.title !== undefined) data.title = updates.title;
  if (updates.description !== undefined) data.description = updates.description;
  if (updates.author !== undefined) data.author = updates.author;
  if (updates.image !== undefined) data.image = updates.image;
  if (updates.imageAlt !== undefined) data.imageAlt = updates.imageAlt;
  if (updates.tags !== undefined) data.tags = updates.tags;
  if (updates.status !== undefined) {
    data.status = updates.status;
    data.published = updates.status === "publicado";
  }

  // Use updated content or keep existing
  const finalContent = updates.content !== undefined ? updates.content : existingContent;

  // Write back
  const updatedFile = matter.stringify(finalContent, data);
  fs.writeFileSync(filePath, updatedFile, "utf-8");

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date ? String(data.date).slice(0, 10) : "",
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
    content: finalContent,
    html: marked(finalContent) as string,
  };
}