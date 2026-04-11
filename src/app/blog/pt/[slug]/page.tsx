import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs } from "@/lib/blog";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

const DEFAULT_BLOG_IMAGE = "/images/blog/default.jpg";

/**
 * Resolve a blog post image path: if the referenced file does not exist
 * in public/, fall back to the default blog image. External URLs are
 * returned as-is.
 */
function resolveImage(src: string | undefined | null): string {
  if (!src) return DEFAULT_BLOG_IMAGE;
  // External URLs (http/https) are passed through
  if (/^https?:\/\//i.test(src)) return src;
  try {
    const rel = src.startsWith("/") ? src.slice(1) : src;
    const abs = path.join(process.cwd(), "public", rel);
    if (fs.existsSync(abs)) return src;
  } catch {
    /* ignore */
  }
  return DEFAULT_BLOG_IMAGE;
}

export async function generateStaticParams() {
  return getAllSlugs("pt").map((slug) => ({ slug }));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T12:00:00");
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost("pt", params.slug);
  if (!post) return { title: "Post não encontrado" };

  const ogImage = resolveImage(post.image);

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://alcolab.org/blog/pt/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: ogImage, alt: post.imageAlt || post.title }],
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default function BlogPostPT({ params }: PageProps) {
  const post = getPost("pt", params.slug);
  if (!post) notFound();

  const heroImage = resolveImage(post.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `https://alcolab.org${heroImage}`,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "AlcoLab",
      url: "https://alcolab.org",
    },
    mainEntityOfPage: `https://alcolab.org/blog/pt/${post.slug}`,
    keywords: post.tags.join(", "),
    inLanguage: "pt-BR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-400 mb-4">
          <Link href="/blog/pt" className="hover:text-[#002060]">
            ← Blog
          </Link>
        </nav>

        {/* Hero: Texto à esquerda + imagem à direita (desktop) */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:gap-8">
            {/* Texto (esquerda) */}
            <div className="flex-1 order-2 md:order-1 mt-6 md:mt-0">
              <p className="text-xs text-neutral-400 mb-2">
                {formatDate(post.date)} {post.author && `· ${post.author}`}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#002060] leading-tight">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-neutral-500 mt-3 text-sm leading-relaxed text-justify">
                  {post.description}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-blue-50 text-[#002060] px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Imagem de destaque (direita) */}
            <div className="md:w-[45%] shrink-0 order-1 md:order-2">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-neutral-200">
                <Image
                  src={heroImage}
                  alt={post.imageAlt || post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 45vw"
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div
          className="prose prose-neutral prose-headings:text-[#002060] prose-a:text-[#002060] max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* CTA */}
        <div className="blog-cta-box mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <p className="text-sm text-neutral-700 mb-3">
            Quer testar a triagem de metanol agora?
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#002060] text-white rounded-lg font-medium text-sm hover:bg-[#001040]"
          >
            Acessar o AlcoLab
          </Link>
        </div>

        {/* Back */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link href="/blog/pt" className="text-sm text-[#002060] hover:underline">
            ← Voltar ao Blog
          </Link>
        </div>
      </article>
    </>
  );
}
