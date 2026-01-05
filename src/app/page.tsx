"use client"
import Link from "next/link"
import React from "react"
import { Beaker, LineChart, BookOpen, Info } from "lucide-react"
import { InlineTooltip } from "@/components/ui/InfoTooltip"

export default function Home() {
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
          de bebidas destiladas puras ("secas"); etanol combustível; metanol reagente e{" "}
          <InlineTooltip 
            term="soluções hidroalcoólicas" 
            tooltip="Misturas compostas predominantemente por água, etanol e/ou metanol."
          />{" "}
          compostas de água, etanol e metanol, conforme opções listadas em{" "}
          <Link href="/medir" className="underline text-[#002060] font-medium">Medir</Link>.{" "}
          <span className="font-bold">Não substitui exame confirmatório.</span>
        </p>
        <p>
          Desenvolvida para auxiliar na proteção da saúde pública e na defesa do consumidor.
        </p>
      </div>
      
      {/* Botões de navegação */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/medir" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Beaker className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Medir</span>
        </Link>
        <Link 
          href="/resultados" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <LineChart className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Resultados</span>
        </Link>
        <Link 
          href="/metodologia" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <BookOpen className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Materiais e método</span>
        </Link>
        <Link 
          href="/sobre" 
          className="border-2 border-[#002060] rounded-lg p-4 text-center flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          <Info className="w-8 h-8 text-[#002060]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#002060]">Sobre</span>
        </Link>
      </div>
      
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
