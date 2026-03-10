import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Methanol Screening, Public Health and Food Safety",
  description: "Articles about methanol screening in beverages, food safety, public health and AlcoLab usage. Reliable information for consumer protection.",
  alternates: {
    canonical: "https://alcolab.org/blog/en",
    languages: { "pt-BR": "/blog/pt", en: "/blog/en" },
  },
};

export default function BlogListEN() {
  const posts = getPosts("en");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002060]">AlcoLab Blog</h1>
        <p className="text-neutral-600 mt-1">
          Methanol screening, public health and food safety.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-400 text-sm">No articles published yet.</p>
          <Link href="/app" className="text-[#002060] underline text-sm mt-2 inline-block">
            Access AlcoLab
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/en/${post.slug}`}
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
                  {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
                    day: "numeric",
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
