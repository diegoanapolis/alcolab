// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

"use client";

import { useState } from "react";
import {
  Heart,
  Lightbulb,
  Copy,
  Check,
  ExternalLink,
  Coffee,
  Mail,
} from "lucide-react";

const PIX_KEY = "alcolabapp@gmail.com";
const GITHUB_REPO = "https://github.com/diegoanapolis/alcolab";
const BUYME_COFFEE_URL = "https://buymeacoffee.com/alcolab"; // TODO: substituir pelo link real
const FORM_SUGESTAO_URL = "https://forms.gle/PLACEHOLDER"; // TODO: substituir pelo link real do Google Forms

const equipe = [
  {
    nome: "Diego Mendes de Souza",
    papel: "Desenvolvimento, experimentos e estatística",
    credenciais: "Dr. em Quimiometria · Químico Industrial · Perito Criminal Oficial · Professor de Química",
  },
  {
    nome: "Pedro Augusto de Oliveira Morais",
    papel: "Revisão científica, experimentos e estatística",
    credenciais: "PhD em Quimiometria · Químico Industrial · Professor de Química — UFMA",
  },
  {
    nome: "Nayara Ferreira Santos",
    papel: "Auditoria UX, cotitular e gestão administrativa",
    credenciais: "Administradora · Sócio-fundadora da Científica Concursos",
  },
  {
    nome: "Romério Rodrigues dos Santos Silva",
    papel: "Colaborador · Revisor UX · Experimentos",
    credenciais: "Dr. em Bioquímica · Biólogo",
  },
];

export default function SobrePage() {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores sem suporte a clipboard API
      const el = document.createElement("textarea");
      el.value = PIX_KEY;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto pb-20">
      {/* Título */}
      <h1 className="text-xl font-bold text-[#002060]">Sobre o AlcoLab</h1>

      {/* Missão */}
      <div className="space-y-2 text-sm text-neutral-700 text-justify">
        <p>
          Metanol pode matar. Detectar é demorado e exige laboratório. O{" "}
          <span className="font-semibold text-[#002060]">AlcoLab</span> torna
          essa triagem acessível a todos, usando apenas uma seringa, uma balança
          e um celular.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-neutral-400 italic">
        Ferramenta de triagem — não substitui análise laboratorial confirmatória.
      </p>

      {/* ── Apoie o projeto ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#002060] flex items-center gap-1.5">
          <Heart className="w-4 h-4" />
          Apoie o projeto
        </h2>

        <div className="text-sm text-neutral-700 space-y-2 text-justify">
          <p>
            O{" "}
            <span className="font-semibold text-[#002060]">AlcoLab</span> é um
            projeto científico open-source (
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002060] underline"
            >
              AGPL-3.0
            </a>
            ), disponibilizado online como ferramenta pública voltada à proteção
            da saúde e mantido por uma pequena equipe independente.
          </p>
          <p className="italic font-medium text-neutral-600">
            Se a ideia fizer sentido para você, considere apoiar o projeto.
          </p>
          <p>
            Apoios ajudam a financiar desenvolvimento, experimentos,
            infraestrutura e documentação.
          </p>
        </div>

        {/* Como apoiar */}
        <div className="space-y-3 pt-1">
          <h3 className="text-sm font-semibold text-[#002060]">Como apoiar</h3>

          {/* Brasil - PIX */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-neutral-700">
              🇧🇷 Brasil — Pix
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white border border-neutral-200 rounded px-2 py-1.5 text-neutral-700 truncate">
                {PIX_KEY}
              </code>
              <button
                onClick={handleCopyPix}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border border-[#002060] text-[#002060] hover:bg-blue-50 transition-colors shrink-0"
                aria-label="Copiar chave Pix"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Internacional - Buy Me a Coffee */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-neutral-700">
              🌍 Internacional
            </p>
            <a
              href={BUYME_COFFEE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-[#FFDD00] text-neutral-800 hover:bg-[#FFE94D] transition-colors"
            >
              <Coffee className="w-4 h-4" />
              Buy Me a Coffee
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Apoie com ideias ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#002060] flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" />
          Apoie também com ideias
        </h2>

        <div className="text-sm text-neutral-700 space-y-2 text-justify">
          <p>
            Sugestões de melhorias, novas funcionalidades ou ajustes são sempre
            bem-vindas.
          </p>
          <p>
            Todas as propostas são avaliadas pela equipe e acompanhadas
            publicamente quanto à sua viabilidade e implementação.
          </p>
        </div>

        <a
          href={FORM_SUGESTAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-[#002060] text-[#002060] hover:bg-blue-50 transition-colors"
        >
          Enviar sugestão
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </section>

      {/* ── Equipe ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#002060]">Equipe</h2>
        <ul className="space-y-3">
          {equipe.map((m) => (
            <li key={m.nome}>
              <p className="text-sm text-neutral-800">
                <span className="font-semibold">{m.nome}</span>
                <span className="text-neutral-500"> — </span>
                {m.papel}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {m.credenciais}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Contato e parcerias ── */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#002060] flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          Contato e parcerias
        </h2>

        <a
          href={`mailto:${PIX_KEY}`}
          className="text-sm font-medium text-[#002060] underline"
        >
          alcolabapp@gmail.com
        </a>

        <p className="text-sm text-neutral-700 text-justify">
          Instituições, organizações e empresas interessadas em apoio, parceria
          ou integração do AlcoLab em seus programas são bem-vindas a entrar em
          contato.
        </p>
      </section>

      {/* ── Licença (rodapé) ── */}
      <footer className="pt-2 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">
          Código aberto sob licença{" "}
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            AGPL-3.0
          </a>{" "}
          · © 2024–2026
        </p>
      </footer>
    </div>
  );
}
