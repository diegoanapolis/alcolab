// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AlcoLab — Triagem de Metanol Acessível a Todos",
    template: "%s | AlcoLab",
  },
  description:
    "Ferramenta gratuita e open-source para triagem de metanol em bebidas e soluções hidroalcoólicas. Usa análise de densidade e viscosidade com seringa e balança. Funciona offline, sem laboratório.",
  keywords: [
    "methanol detection",
    "methanol screening",
    "alcoholic beverage safety",
    "food safety",
    "hydroalcoholic analysis",
    "metanol",
    "bebida adulterada",
    "triagem metanol",
    "como identificar metanol em bebida",
    "teste metanol álcool",
    "methanol detection app",
  ],
  authors: [
    { name: "Diego Mendes de Souza" },
    { name: "Pedro Augusto de Oliveira Morais" },
    { name: "Nayara Ferreira Santos" },
  ],
  openGraph: {
    title: "AlcoLab — Triagem de Metanol Acessível a Todos",
    description:
      "Ferramenta gratuita para triagem de metanol em bebidas. Sem laboratório.",
    url: "https://alcolab.org",
    siteName: "AlcoLab",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AlcoLab — Triagem de Metanol Acessível a Todos",
    description:
      "Ferramenta gratuita para triagem de metanol em bebidas. Sem laboratório.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
