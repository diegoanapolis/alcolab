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
