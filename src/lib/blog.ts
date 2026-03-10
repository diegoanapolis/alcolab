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
