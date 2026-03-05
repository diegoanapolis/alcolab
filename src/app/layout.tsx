// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ui/ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "AlcoLab — Methanol Screening Tool",
    template: "%s | AlcoLab",
  },
  description:
    "Free, open-source PWA for screening methanol contamination in alcoholic beverages and hydroalcoholic solutions. Uses density and viscosity analysis with a syringe and a scale. Works offline, no lab required.",
  keywords: [
    "methanol detection",
    "methanol screening",
    "alcoholic beverage safety",
    "food safety",
    "hydroalcoholic analysis",
    "metanol",
    "bebida adulterada",
    "triagem metanol",
  ],
  authors: [
    { name: "Diego Mendes de Souza" },
    { name: "Pedro Augusto de Oliveira Morais" },
    { name: "Nayara Ferreira Santos" },
  ],
  openGraph: {
    title: "AlcoLab — Methanol Screening Tool",
    description:
      "Free PWA for screening methanol in alcoholic beverages. No lab required.",
    url: "https://alcolab.org",
    siteName: "AlcoLab",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AlcoLab — Methanol Screening Tool",
    description:
      "Free PWA for screening methanol in alcoholic beverages. No lab required.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={"antialiased min-h-dvh bg-background text-foreground pt-12"}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
