import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getBlogPosts } from "@/lib/blog"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog — AlcoLab | Methanol Screening and Food Safety",
  description: "Articles about methanol screening, alcoholic beverage safety, public health and methanol poisoning prevention.",
  alternates: {
    canonical: "https://alcolab.org/en/blog",
    languages: {
      "pt-BR": "https://alcolab.org/pt/blog",
      "en": "https://alcolab.org/en/blog",
    },
  },
}

export default function BlogListEN() {
  const posts = getBlogPosts("en")

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#002060] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/en" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-2xl font-bold">AlcoLab Blog</h1>
          <p className="text-blue-200 text-sm mt-1">Methanol screening, beverage safety and public health</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500">Articles coming soon.</p>
            <Link href="/en" className="text-[#002060] underline text-sm mt-2 inline-block">
              Back to home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/en/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-4 border rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                {post.image && (
                  <div className="sm:w-48 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      width={400}
                      height={210}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h2 className="text-lg font-semibold text-[#002060] group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{post.author}</span>
                    <span>·</span>
                    <time>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
