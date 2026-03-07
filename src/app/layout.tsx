// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import type { Metadate } from "next";
import "./globals.css";

export const metadate: Metadate = {
  title: {
    default: "AlcoLab — Accessible Methanol Screening",
    template: "%s | AlcoLab",
  },
  description:
    "Free, open-source tool for methanol screening in beverages and hydroalcoholic solutions. Uses density and viscosity analysis with a syringe and scale. Works offline, no lab required.",
  keywords: [
    "methanol detection",
    "methanol screening",
    "alcoholic beverage safety",
    "food safety",
    "hydroalcoholic analysis",
    "metanol",
    "bebida adulterada",
    "screening metanol",
    "como identificar metanol em bebida",
    "methanol alcohol test",
    "methanol detection app",
  ],
  authors: [
    { name: "Diego Mendes de Souza" },
    { name: "Pedro Augusto de Oliveira Morais" },
    { name: "Nayara Ferreira Santos" },
  ],
  openGraph: {
    title: "AlcoLab — Accessible Methanol Screening",
    description:
      "Free tool for methanol screening in beverages. No lab required.",
    url: "https://alcolab.org",
    siteName: "AlcoLab",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AlcoLab — Accessible Methanol Screening",
    description:
      "Free tool for methanol screening in beverages. No lab required.",
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
