import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Blog | AlcoLab",
    template: "%s | AlcoLab Blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white">
      {/* Tarja CTA superior (largura total da tela) */}
      <a href="/" className="cta-banner">
        Conheça o app AlcoLab — Triagem gratuita de metanol em minutos
      </a>
      {/* Blog header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#002060] hover:opacity-80">
            AlcoLab
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog/pt" className="text-neutral-600 hover:text-[#002060]">
              PT
            </Link>
            <Link href="/blog/en" className="text-neutral-600 hover:text-[#002060]">
              EN
            </Link>
            <Link href="/" className="text-neutral-600 hover:text-[#002060]">
              Home
            </Link>
            <Link href="/app" className="text-white bg-[#002060] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#001040]">
              App
            </Link>
          </nav>
        </div>
      </header>
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-neutral-400">
          © 2024–2026 AlcoLab · Open source under{" "}
          <a href="https://github.com/diegoanapolis/alcolab" className="underline" target="_blank" rel="noopener noreferrer">
            AGPL-3.0
          </a>
        </div>
      </footer>
    </div>
  );
}
