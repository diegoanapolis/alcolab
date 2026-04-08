import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, updatePostStatus } from "@/lib/blog";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const UNAUTHORIZED = NextResponse.json(
  { error: "Não autenticado. Faça login em /admin/blog." },
  { status: 401 }
);

export async function GET() {
  if (!isAdminAuthenticated()) return UNAUTHORIZED;
  try {
    const locales = ["pt", "en"] as const;
    const allPosts = [];

    for (const locale of locales) {
      const posts = getAllPosts(locale);
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
