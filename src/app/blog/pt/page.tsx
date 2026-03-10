import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Triagem de Metanol, Saúde Pública e Segurança Alimentar",
  description: "Artigos sobre triagem de metanol em bebidas, segurança alimentar, saúde pública e uso do AlcoLab. Informações confiáveis para proteção do consumidor.",
  alternates: {
    canonical: "https://alcolab.org/blog/pt",
    languages: { "pt-BR": "/blog/pt", en: "/blog/en" },
  },
};

export default function BlogListPT() {
  const posts = getPosts("pt");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002060]">Blog AlcoLab</h1>
        <p className="text-neutral-600 mt-1">
          Triagem de metanol, saúde pública e segurança alimentar.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">Nenhum artigo publicado ainda.</p>
          <Link href="/app" className="text-[#002060] underline text-sm mt-2 inline-block">
            Acessar o AlcoLab
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/pt/${post.slug}`}
              className="group border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col sm:flex-row"
            >
              {post.image && (
                <div className="sm:w-64 h-48 sm:h-auto relative shrink-0">
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 256px"
                  />
                </div>
              )}
              <div className="p-4 flex-1">
                <p className="text-xs text-neutral-400 mb-1">
                  {new Date(post.date + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {post.author}
                </p>
                <h2 className="text-lg font-semibold text-[#002060] group-hover:underline">
                  {post.title}
                </h2>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] bg-blue-50 text-[#002060] px-2 py-0.5 rounded-full">
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
    </div>
  );
}
