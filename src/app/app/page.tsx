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
import DemoModal from "@/components/ui/DemoModal"
import { getDemoScenario, DemoScenarioId, clearDemoMode } from "@/lib/demoScenarios"

export default function Home() {
  const [showDemoModal, setShowDemoModal] = useState(false)
  const router = useRouter()

  // Limpar demo mode ao chegar na Home (usuário saiu do fluxo demo)
  React.useEffect(() => {
    clearDemoMode()
  }, [])

  const handleDemoSelect = (id: DemoScenarioId) => {
    const scenario = getDemoScenario(id)
    if (!scenario) return
    // Limpar estado anterior antes de iniciar novo demo
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
    // Hard navigation para garantir re-mount do medir
    window.location.href = "/app/medir"
  }

  const handleMedir = () => {
    // Limpar estado demo ao navegar normalmente para Medir
    clearDemoMode()
    try {
      localStorage.removeItem("wizardData")
      localStorage.removeItem("wizardStep")
      localStorage.removeItem("videoReplicasWater")
      localStorage.removeItem("videoReplicasSample")
      localStorage.removeItem("manualTimesWater")
      localStorage.removeItem("manualTimesSample")
    } catch {}
    router.push("/app/medir")
  }

  return (
    <div className="p-4 space-y-5">
      {/* Título e subtítulo */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[#002060]">
          Triagem soluções hidroalcoólicas
        </h1>
        <p className="text-sm font-bold text-[#002060]">
          Estimativa de água, etanol e metanol (≥ 5%)
        </p>
      </div>

      {/* Camada 1: Texto mínimo obrigatório */}
      <div className="space-y-2 text-sm text-neutral-700 text-justify">
        <p>
          Dedicado à{" "}
          <InlineTooltip 
            term="triagem" 
            tooltip="Análise preventiva e estimativa, não confirmatória."
          />{" "}
          de bebidas destiladas puras (&quot;secas&quot;); etanol combustível; metanol reagente e{" "}
          <InlineTooltip 
            term="soluções hidroalcoólicas" 
            tooltip="Misturas compostas predominantemente por água, etanol e/ou metanol."
          />{" "}
          compostas de água, etanol e metanol, conforme opções listadas em{" "}
          <button onClick={handleMedir} className="underline text-[#002060] font-medium">Medir</button>.{" "}
          <span className="font-bold">Não substitui exame confirmatório.</span>
        </p>
        <p>
          Desenvolvida para auxiliar na proteção da saúde pública e na defesa do consumidor.
        </p>
      </div>
      
      {/* Botões de navegação */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleMedir}
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Beaker className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Medir</span>
        </button>
        <Link 
          href="/app/resultados" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <LineChart className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Resultados</span>
        </Link>
        <Link 
          href="/app/metodologia" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <BookOpen className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Materiais e método</span>
        </Link>
        <Link 
          href="/app/sobre" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Info className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Sobre</span>
        </Link>
      </div>
      
      {/* Link para demo — alinhado à esquerda, com ícone, sem itálico */}
      <div className="text-left">
        <button
          onClick={() => setShowDemoModal(true)}
          className="text-xs text-[#002060] underline hover:text-blue-700 transition-colors inline-flex items-center gap-1"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Teste com dados de exemplos reais
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
          🚨 Suspeita de contaminação por metanol
        </p>
        <p className="text-red-700 text-sm">
          Procure serviço de saúde imediatamente.<br />
          Ligue para o Disque-Intoxicação: <span className="font-bold">0800 722 6001</span>.
        </p>
        <p className="text-red-600 text-xs mt-3 italic">
          Em casos suspeitos, denuncie: Vigilância Sanitária local, Polícia Civil (197), PROCON e, quando aplicável, MAPA.
        </p>
      </div>
    </div>
  )
}
