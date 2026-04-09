import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getPost, updatePostStatus, updatePost } from "@/lib/blog";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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
