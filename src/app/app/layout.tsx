// AlcoLab — App Layout (with TopBar, BottomTabs, Splash, Terms)
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only

import type { Metadata } from "next";
import ClientLayout from "@/components/ui/ClientLayout";

export const metadata: Metadata = {
  title: {
    default: "AlcoLab — Methanol Screening Tool",
    template: "%s | AlcoLab",
  },
  description:
    "Free, open-source PWA for screening methanol contamination in alcoholic beverages and hydroalcoholic solutions. Uses density and viscosity analysis with a syringe and a scale. Works offline, no lab required.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
