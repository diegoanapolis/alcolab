// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alcolab.org"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
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
