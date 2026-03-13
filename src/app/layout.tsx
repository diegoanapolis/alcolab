// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alcolab.org"),

  title: {
    default: "AlcoLab — Methanol Screening | Triagem de Metanol",
    template: "%s | AlcoLab",
  },
  description:
    "Free, open-source tool for methanol screening in beverages and hydroalcoholic solutions. Ferramenta gratuita para triagem de metanol em bebidas. Uses density and viscosity with a syringe and scale. Works offline, no lab required.",
  keywords: [
    "methanol detection",
    "methanol screening",
    "methanol in alcohol",
    "alcoholic beverage safety",
    "food safety",
    "hydroalcoholic analysis",
    "methanol detection app",
    "how to detect methanol",
    "metanol",
    "triagem metanol",
    "bebida adulterada",
    "como identificar metanol em bebida",
    "metanol em bebida",
    "detecção de metanol",
    "segurança alimentar",
    "saúde pública",
    "AlcoLab",
  ],
  authors: [
    { name: "Diego Mendes de Souza" },
    { name: "Pedro Augusto de Oliveira Morais" },
    { name: "Nayara Ferreira Santos" },
  ],
  creator: "Diego Mendes de Souza",
  publisher: "AlcoLab",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://alcolab.org",
    languages: {
      "pt-BR": "https://alcolab.org/pt",
      "en": "https://alcolab.org/en",
    },
  },
  openGraph: {
    title: "AlcoLab — Methanol Screening | Triagem de Metanol",
    description:
      "Free tool for methanol screening in beverages. No lab required. Open source.",
    url: "https://alcolab.org",
    siteName: "AlcoLab",
    locale: "pt_BR",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/homepage/semaforo-vermelho.png",
        width: 1170,
        height: 2652,
        alt: "AlcoLab — Methanol Screening Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlcoLab — Methanol Screening | Triagem de Metanol",
    description:
      "Free tool for methanol screening in beverages. No lab required.",
    images: ["/images/homepage/semaforo-vermelho.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,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" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AlcoLab",
              applicationCategory: "HealthApplication",
              applicationSubCategory: "Methanol Screening",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "Free, open-source Progressive Web App for methanol screening in hydroalcoholic solutions using relative density and viscosity measurements with a commercial syringe.",
              url: "https://alcolab.org",
              author: [
                { "@type": "Person", name: "Diego Mendes de Souza" },
                { "@type": "Person", name: "Pedro Augusto de Oliveira Morais" },
                { "@type": "Person", name: "Nayara Ferreira Santos" },
              ],
              license: "https://www.gnu.org/licenses/agpl-3.0.html",
              isAccessibleForFree: true,
              inLanguage: ["pt-BR", "en"],
              keywords:
                "methanol, screening, hydroalcoholic, density, viscosity, public health, food safety",
            }),
          }}
        />
      </head>
      <body className="antialiased min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
