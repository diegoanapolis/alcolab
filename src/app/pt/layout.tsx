import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlcoLab — Triagem Acessível de Metanol em Bebidas e Soluções Hidroalcoólicas",
  description:
    "Ferramenta gratuita e de código aberto para triagem de metanol em bebidas e soluções hidroalcoólicas. Usa análise de densidade e viscosidade com seringa e balança. Funciona offline, sem laboratório.",
  keywords: [
    "metanol",
    "triagem metanol",
    "bebida adulterada",
    "como identificar metanol em bebida",
    "metanol em bebida",
    "detecção de metanol",
    "screening metanol",
    "segurança alimentar",
    "saúde pública",
    "solução hidroalcoólica",
    "densidade relativa",
    "viscosidade relativa",
    "app gratuito metanol",
    "AlcoLab",
  ],
  alternates: {
    canonical: "https://alcolab.org/pt",
    languages: {
      "pt-BR": "https://alcolab.org/pt",
      "en": "https://alcolab.org/en",
    },
  },
  openGraph: {
    title: "AlcoLab — Triagem Acessível de Metanol",
    description:
      "Ferramenta gratuita para triagem de metanol em bebidas. Sem laboratório. Código aberto.",
    url: "https://alcolab.org/pt",
    siteName: "AlcoLab",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlcoLab — Triagem Acessível de Metanol",
    description:
      "Ferramenta gratuita para triagem de metanol em bebidas. Sem laboratório.",
  },
};

export default function PTLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
