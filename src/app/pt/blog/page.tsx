import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getBlogPosts } from "@/lib/blog"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog — AlcoLab | Triagem de Metanol e Segurança Alimentar",
  description: "Artigos sobre triagem de metanol, segurança de bebidas alcoólicas, saúde pública e prevenção de envenenamento por metanol.",
  alternates: {
    canonical: "https://alcolab.org/pt/blog",
    languages: {
      "pt-BR": "https://alcolab.org/pt/blog",
      "en": "https://alcolab.org/en/blog",
    },
  },
}

export default function BlogListPT() {
  const posts = getBlogPosts("pt")

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#002060] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/pt" className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white mb-3">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>
          <h1 className="text-2xl font-bold">Blog AlcoLab</h1>
          <p className="text-blue-200 text-sm mt-1">Triagem de metanol, segurança de bebidas e saúde pública</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500">Artigos em breve.</p>
            <Link href="/pt" className="text-[#002060] underline text-sm mt-2 inline-block">
              Voltar ao início
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/pt/blog/${post.slug}`}
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
                    <time>{new Date(post.date).toLocaleDateString("pt-BR")}</time>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-50 text-[#002060] text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
