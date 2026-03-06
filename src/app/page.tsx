// AlcoLab — Language Detection & Redirect
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language || navigator.languages?.[0] || "en";
    const isPt = lang.toLowerCase().startsWith("pt");
    router.replace(isPt ? "/pt" : "/en");
  }, [router]);

  // Tela mínima enquanto redireciona (< 100ms normalmente)
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-2xl font-extrabold text-[#002060]">AlcoLab</p>
        <p className="text-sm text-neutral-400">Redirecting...</p>
      </div>
    </div>
  );
}
