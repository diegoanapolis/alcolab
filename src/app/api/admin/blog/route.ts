import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getAllPosts, getPost, updatePostStatus, updatePost } from "@/lib/blog";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { syncLocalFile } from "@/lib/github-sync";

/**
 * Persist a blog post (and its sibling translation, if any) to GitHub so
 * the edit survives Railway redeploys.  Runs async but we await it so the
 * caller returns only after the commit finishes — gives the editor correct
 * feedback if the sync fails.
 */
async function persistPostToGitHub(
  locale: "pt" | "en",
  slug: string,
  translationSlug: string | undefined,
  oldSlug: string | undefined,
  reason: string,
) {
  const cwd = process.cwd();
  // Main post
  const mainAbs = path.join(cwd, "content", "blog", locale, `${slug}.md`);
  await syncLocalFile(mainAbs, `admin(blog): ${reason} ${locale}/${slug}`);

  // If the post was renamed (newSlug != slug), delete the old file on GitHub
  if (oldSlug && oldSlug !== slug) {
    const oldAbs = path.join(cwd, "content", "blog", locale, `${oldSlug}.md`);
    await syncLocalFile(
      oldAbs, // file no longer exists locally, triggers delete
      `admin(blog): rename ${locale}/${oldSlug} -> ${slug}`,
    );
  }

  // If the post has a sibling translation, sync it too (featured image sync
  // and translationSlug backlinks can touch it).
  if (translationSlug) {
    const siblingLocale: "pt" | "en" = locale === "pt" ? "en" : "pt";
    const siblingAbs = path.join(
      cwd,
      "content",
      "blog",
      siblingLocale,
      `${translationSlug}.md`,
    );
    await syncLocalFile(
      siblingAbs,
      `admin(blog): sync sibling ${siblingLocale}/${translationSlug}`,
    );
  }
}

export const dynamic = "force-dynamic";

const UNAUTHORIZED = NextResponse.json(
  { error: "Não autenticado. Faça login em /admin/blog." },
  { status: 401 }
);

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated()) return UNAUTHORIZED;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const locale = searchParams.get("locale");

  // If slug and locale are provided, return a single post with full content
  if (slug && locale) {
    try {
      const normalizedLocale = locale.startsWith("pt") ? "pt" : locale === "en" ? "en" : null;
      if (!normalizedLocale) {
        return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
      }

      // Use getAllPosts to also get unpublished posts
      const posts = getAllPosts(normalizedLocale);
      const post = posts.find((p) => p.slug === slug);

      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      return NextResponse.json({
        slug: post.slug,
        title: post.title,
        author: post.author,
        date: post.date,
        status: post.status,
        published: post.published,
        locale: post.locale,
        tags: post.tags,
        description: post.description,
        image: post.image,
        imageAlt: post.imageAlt,
        focusKeyword: post.focusKeyword,
        content: post.content,
        html: post.html,
      });
    } catch (error) {
      console.error("Error fetching post:", error);
      return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
  }

  // Otherwise, return all posts (without content for performance)
  try {
    const locales = ["pt", "en"] as const;
    const allPosts = [];

    for (const loc of locales) {
      const posts = getAllPosts(loc);
      const postsWithoutContent = posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        author: post.author,
        date: post.date,
        status: post.status,
        published: post.published,
        locale: post.locale,
        tags: post.tags,
        description: post.description,
      }));
      allPosts.push(...postsWithoutContent);
    }

    return NextResponse.json(allPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminAuthenticated()) return UNAUTHORIZED;
  try {
    const body = await request.json();
    const { locale, slug, status } = body;

    // Validate required fields
    if (!locale || !slug || !status) {
      return NextResponse.json(
        { error: "Missing required fields: locale, slug, status" },
        { status: 400 }
      );
    }

    // Normalize and validate locale (accept "pt-BR" → "pt", "en" → "en")
    const normalizedLocale = locale.startsWith("pt") ? "pt" : locale === "en" ? "en" : null;
    if (!normalizedLocale) {
      return NextResponse.json(
        { error: "Invalid locale. Must be 'pt', 'pt-BR', or 'en'" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "rascunho",
      "em_revisao",
      "aprovado",
      "publicado",
    ] as const;
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update the post status
    const updatedPost = updatePostStatus(normalizedLocale, slug, status);

    if (!updatedPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Mirror to GitHub so the status change survives the next redeploy
    await persistPostToGitHub(
      normalizedLocale,
      updatedPost.slug,
      updatedPost.translationSlug,
      undefined,
      `status=${status}`,
    );

    // Return updated post without full content
    return NextResponse.json({
      slug: updatedPost.slug,
      title: updatedPost.title,
      author: updatedPost.author,
      date: updatedPost.date,
      status: updatedPost.status,
      published: updatedPost.published,
      locale: updatedPost.locale,
      tags: updatedPost.tags,
      description: updatedPost.description,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminAuthenticated()) return UNAUTHORIZED;
  try {
    const body = await request.json();
    const {
      locale,
      slug,
      newSlug,
      title,
      description,
      author,
      image,
      imageAlt,
      tags,
      status,
      content,
      date,
      focusKeyword,
    } = body;

    if (!locale || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: locale, slug" },
        { status: 400 }
      );
    }

    const normalizedLocale = locale.startsWith("pt") ? "pt" : locale === "en" ? "en" : null;
    if (!normalizedLocale) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    const updatedPost = updatePost(normalizedLocale, slug, {
      title,
      description,
      author,
      image,
      imageAlt,
      tags,
      status,
      content,
      date,
      focusKeyword,
      newSlug,
    });

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Mirror to GitHub so admin edits survive the next Railway redeploy.
    // Pass oldSlug so a rename also deletes the old file on GitHub.
    await persistPostToGitHub(
      normalizedLocale,
      updatedPost.slug,
      updatedPost.translationSlug,
      slug, // oldSlug (before rename)
      "update",
    );

    return NextResponse.json({
      slug: updatedPost.slug,
      title: updatedPost.title,
      author: updatedPost.author,
      date: updatedPost.date,
      status: updatedPost.status,
      published: updatedPost.published,
      locale: updatedPost.locale,
      tags: updatedPost.tags,
      description: updatedPost.description,
      image: updatedPost.image,
      imageAlt: updatedPost.imageAlt,
      focusKeyword: updatedPost.focusKeyword,
    });
  } catch (error) {
    console.error("Error saving post:", error);
    const message = error instanceof Error ? error.message : "Failed to save post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
