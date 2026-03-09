import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlcoLab — Accessible Methanol Screening in Beverages and Hydroalcoholic Solutions",
  description:
    "Free, open-source tool for methanol screening in beverages and hydroalcoholic solutions. Uses density and viscosity analysis with a syringe and scale. Works offline, no lab required.",
  keywords: [
    "methanol detection",
    "methanol screening",
    "methanol in alcohol",
    "alcoholic beverage safety",
    "methanol detection app",
    "methanol alcohol test",
    "how to detect methanol",
    "food safety",
    "public health",
    "hydroalcoholic analysis",
    "relative density",
    "relative viscosity",
    "free methanol test",
    "AlcoLab",
  ],
  alternates: {
    canonical: "https://alcolab.org/en",
    languages: {
      "pt-BR": "https://alcolab.org/pt",
      "en": "https://alcolab.org/en",
    },
  },
  openGraph: {
    title: "AlcoLab — Accessible Methanol Screening",
    description:
      "Free tool for methanol screening in beverages. No lab required. Open source.",
    url: "https://alcolab.org/en",
    siteName: "AlcoLab",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlcoLab — Accessible Methanol Screening",
    description:
      "Free tool for methanol screening in beverages. No lab required.",
  },
};

export default function ENLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
