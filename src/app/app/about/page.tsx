// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n"
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
const BUYME_COFFEE_URL = "https://buymeacoffee.com/alcolab";
const FORM_SUGESTAO_URL = "https://forms.gle/PLACEHOLDER"; // TODO: substituir pelo link real do Google Forms

const team = [
  {
    name: "Diego Mendes de Souza",
    role: "Development, experiments & statistics",
    credentials: "PhD in Chemometrics · Industrial Chemist · Official Forensic Expert · Chemistry Professor",
  },
  {
    name: "Pedro Augusto de Oliveira Morais",
    role: "Scientific review, experiments & statistics",
    credentials: "PhD in Chemometrics · Industrial Chemist · Chemistry Professor — UFMA",
  },
  {
    name: "Nayara Ferreira Santos",
    role: "UX audit, co-holder & administrative management",
    credentials: "Business Administrator · Co-founder of Científica Concursos",
  },
  {
    name: "Romério Rodrigues dos Santos Silva",
    role: "Collaborator · UX Reviewer · Experiments",
    credentials: "PhD in Biochemistry · Biologist",
  },
];

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const t = useT();

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
      <h1 className="text-xl font-bold text-[#002060]">{t("About AlcoLab")}</h1>

      {/* Missão */}
      <div className="space-y-2 text-sm text-neutral-700 text-justify">
        <p>
          {t("Methanol can kill. Detection is time-consuming and requires a lab.")}{" "}
          <span className="font-semibold text-[#002060]">AlcoLab</span>{" "}
          {t("makes this screening accessible to everyone, using only a syringe, a scale and a phone.")}
        </p>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-neutral-400 italic">
        {t("Screening tool — does not replace confirmatory laboratory analysis.")}
      </p>

      {/* ── Apoie o projeto ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#002060] flex items-center gap-1.5">
          <Heart className="w-4 h-4" />
          {t("Support the project")}
        </h2>

        <div className="text-sm text-neutral-700 space-y-2 text-justify">
          <p>
            {t("AlcoLab is an open-source scientific project")}{" "}
            (<a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002060] underline"
            >
              AGPL-3.0
            </a>){t(", available online as a public tool aimed at health protection and maintained by a small independent team.")}
          </p>
          <p className="italic font-medium text-neutral-600">
            {t("If the idea resonates with you, consider supporting the project.")}
          </p>
          <p>
            {t("Support helps fund development, experiments, infrastructure and documentation.")}
          </p>
        </div>

        {/* Como apoiar */}
        <div className="space-y-3 pt-1">
          <h3 className="text-sm font-semibold text-[#002060]">{t("How to support")}</h3>

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
                aria-label={t("Copy Pix key")}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {t("Copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t("Copy")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Internacional - Buy Me a Coffee */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-neutral-700">
              🌍 {t("Other countries")}
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
          {t("Support with ideas too")}
        </h2>

        <div className="text-sm text-neutral-700 space-y-2 text-justify">
          <p>
            {t("Suggestions for improvements, new features or adjustments are always welcome.")}
          </p>
          <p>
            {t("All proposals are evaluated by the team and publicly tracked regarding their feasibility and implementation.")}
          </p>
        </div>

        <a
          href={FORM_SUGESTAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border-2 border-[#002060] text-[#002060] hover:bg-blue-50 transition-colors"
        >
          {t("Submit a suggestion")}
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>
      </section>

      {/* ── Equipe ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[#002060]">{t("Team")}</h2>
        <ul className="space-y-3">
          {team.map((m) => (
            <li key={m.name}>
              <p className="text-sm text-neutral-800">
                <span className="font-semibold">{m.name}</span>
                <span className="text-neutral-500"> — </span>
                {t(m.role)}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {t(m.credentials)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Contato e parcerias ── */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[#002060] flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          {t("Contact & partnerships")}
        </h2>

        <a
          href={`mailto:${PIX_KEY}`}
          className="text-sm font-medium text-[#002060] underline"
        >
          alcolabapp@gmail.com
        </a>

        <p className="text-sm text-neutral-700 text-justify">
          {t("Institutions, organizations and companies interested in supporting, partnering or integrating AlcoLab into their programs are welcome to get in touch.")}
        </p>
      </section>

      {/* ── Licença (rodapé) ── */}
      <footer className="pt-2 border-t border-neutral-100">
        <p className="text-xs text-neutral-400">
          {t("Open source under")}{" "}
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
