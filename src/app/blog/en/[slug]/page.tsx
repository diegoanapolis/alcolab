import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs } from "@/lib/blog";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs("en").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost("en", params.slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://alcolab.org/blog/en/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image, alt: post.imageAlt }] : [],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default function BlogPostEN({ params }: PageProps) {
  const post = getPost("en", params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image ? `https://alcolab.org${post.image}` : undefined,
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
    mainEntityOfPage: `https://alcolab.org/blog/en/${post.slug}`,
    keywords: post.tags.join(", "),
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-neutral-400 mb-4">
          <Link href="/blog/en" className="hover:text-[#002060]">
            ← Blog
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#002060] leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-neutral-500">
            <span>{post.author}</span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-[#002060] px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured image */}
        {post.image && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="prose prose-neutral prose-headings:text-[#002060] prose-a:text-[#002060] prose-img:rounded-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* CTA */}
        <div className="mt-12 p-6 bg-blue-50 rounded-xl text-center">
          <p className="text-sm text-neutral-700 mb-3">
            Want to test methanol screening now?
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#002060] text-white rounded-lg font-medium text-sm hover:bg-[#001040]"
          >
            Access AlcoLab
          </Link>
        </div>

        {/* Back */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link href="/blog/en" className="text-sm text-[#002060] hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}
