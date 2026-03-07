// AlcoLab — Analytical Screening of Methanol in Hydroalcoholic Solutions
// Copyright (c) 2024-2026 Diego Mendes de Souza, Pedro Augusto de Oliveira Morais, Nayara Ferreira Santos
// SPDX-License-Identifier: AGPL-3.0-only
// See LICENSE file in the project root.

"use client"
import Link from "next/link"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Beaker, LineChart, BookOpen, Info, FlaskConical } from "lucide-react"
import { InlineTooltip } from "@/components/ui/InfoTooltip"
import { useT } from "@/lib/i18n"
import DemoModal from "@/components/ui/DemoModal"
import { getDemoScenario, DemoScenarioId, clearDemoMode } from "@/lib/demoScenarios"

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false)
  const router = useRouter()
  const t = useT()

  // Clear demo mode when arriving at Home (user left demo flow)
  React.useEffect(() => {
    clearDemoMode()
  }, [])

  const handleDemoSelect = (id: DemoScenarioId) => {
    const scenario = getDemoScenario(id)
    if (!scenario) return
    // Clear previous state before starting new demo
    try {
      localStorage.removeItem("wizardData")
      localStorage.removeItem("wizardStep")
      localStorage.removeItem("videoReplicasWater")
      localStorage.removeItem("videoReplicasSample")
      localStorage.removeItem("manualTimesWater")
      localStorage.removeItem("manualTimesSample")
    } catch {}
    localStorage.setItem("demoScenario", id)
    setShowDemoModal(false)
    // Hard navigation to ensure re-mount of measure
    window.location.href = "/app/measure"
  }

  const handleMedir = () => {
    // Clear demo state when navigating normally to Measure
    clearDemoMode()
    try {
      localStorage.removeItem("wizardData")
      localStorage.removeItem("wizardStep")
      localStorage.removeItem("videoReplicasWater")
      localStorage.removeItem("videoReplicasSample")
      localStorage.removeItem("manualTimesWater")
      localStorage.removeItem("manualTimesSample")
    } catch {}
    router.push("/app/measure")
  }

  return (
    <div className="p-4 space-y-5">
      {/* Título e subtítulo */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#002060]">
          {t("Hydroalcoholic solution screening")}
        </h1>
        <p className="text-sm font-bold text-[#002060]">
          {t("Estimation of water, ethanol and methanol (≥ 5%)")}
        </p>
      </div>

      {/* Camada 1: Texto mínimo obrigatório */}
      <div className="space-y-2 text-sm text-neutral-700 text-justify">
        <p>
          Dedicated to the{" "}
          <InlineTooltip 
            term="screening" 
            tooltip="Preventive and estimative analysis, not confirmatory."
          />{" "}
          of pure distilled beverages (\u201cdry\u201d); fuel ethanol; reagent methanol and{" "}
          <InlineTooltip 
            term="hydroalcoholic solutions" 
            tooltip="Mixtures composed predominantly of water, ethanol and/or methanol."
          />{" "}
          made of water, ethanol and methanol, as per options listed in{" "}
          <button onClick={handleMedir} className="underline text-[#002060] font-medium">Measure</button>.{" "}
          <span className="font-bold">{t("Does not replace confirmatory analysis.")}</span>
        </p>
        <p>
          {t("Developed to support public health protection and consumer safety.")}
        </p>
      </div>
      
      {/* Botões de navegação */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleMedir}
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Beaker className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">{t("Measure")}</span>
        </button>
        <Link 
          href="/app/results" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <LineChart className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">{t("Results")}</span>
        </Link>
        <Link 
          href="/app/methodology" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <BookOpen className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">{t("Materials & method")}</span>
        </Link>
        <Link 
          href="/app/about" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Info className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">{t("About")}</span>
        </Link>
      </div>
      
      {/* Link para demo — alinhado à esquerda, com ícone, sem itálico */}
      <div className="text-left">
        <button
          onClick={() => setShowDemoModal(true)}
          className="text-xs text-[#002060] underline hover:text-blue-700 transition-colors inline-flex items-center gap-1"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          {t("Try with real example data")}
        </button>
      </div>

      {/* Modal de seleção demo */}
      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onSelect={handleDemoSelect}
      />

      {/* Alerta de suspeita - destaque */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
        <p className="text-red-700 font-bold text-sm mb-2">
          🚨 {t("Suspected methanol contamination")}
        </p>
        <p className="text-red-700 text-sm">
          {t("Seek medical help immediately.")}<br />
          In Brazil, call Disque-Intoxicação: <span className="font-bold">0800 722 6001</span>.
        </p>
        <p className="text-red-600 text-xs mt-3 italic">
          In suspicious cases, report to: local health surveillance, Civil Police (197), PROCON and, when applicable, MAPA (Brazil).
        </p>
      </div>
    </div>
  )
}
