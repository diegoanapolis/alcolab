import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return getAllBlogSlugs("pt").map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPost("pt", params.slug)
  if (!post) return {}
  
  return {
    title: post.title,
    description: post.description,
    keywords: [post.keyword, ...post.tags],
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://alcolab.org/pt/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      locale: "pt_BR",
      images: post.image ? [{ url: post.image, alt: post.imageAlt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  }
}

export default function BlogPostPT({ params }: Props) {
  const post = getBlogPost("pt", params.slug)
  if (!post) notFound()

  // JSON-LD structured data for Article
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
    mainEntityOfPage: `https://alcolab.org/pt/blog/${post.slug}`,
    keywords: [post.keyword, ...post.tags].join(", "),
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-[#002060] text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/pt/blog" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao blog
          </Link>
          <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-blue-200 mt-2">
            <span>{post.author}</span>
            <span>·</span>
            <time>{new Date(post.date).toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}</time>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {post.image && (
          <div className="rounded-xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={1200}
              height={630}
              quality={95}
              priority
              className="w-full h-auto"
            />
          </div>
        )}

        <article
          className="prose prose-neutral prose-headings:text-[#002060] prose-a:text-[#002060] prose-img:rounded-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />

        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-blue-50 text-[#002060] text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-neutral-500 mb-3">
            Quer testar o AlcoLab? É gratuito e funciona no navegador.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#002060] text-white rounded-lg font-medium hover:bg-[#001040] transition-colors"
          >
            Acessar o AlcoLab
          </Link>
        </div>
      </main>
    </div>
  )
}
