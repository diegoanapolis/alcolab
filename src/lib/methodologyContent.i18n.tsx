// Methodology content — Language-aware wrapper
// Selects PT or EN version based on current i18n language setting

"use client"
import React from "react"
import { useLang } from "@/lib/i18n"

// PT imports (original)
import {
  MethodologyTipoSolucao as PT_TipoSolucao,
  MethodologyDadosAmostra as PT_DadosAmostra,
  MethodologyMassaDensidade as PT_MassaDensidade,
  MethodologyTemperatura as PT_Temperatura,
  MethodologyEscoamento as PT_Escoamento,
  MethodologyRevisao as PT_Revisao,
  MethodologyRelatorio as PT_Relatorio,
  MethodologyComplete as PT_Complete,
  TooltipComposicoesEquivalentes as PT_TooltipEquiv,
  TooltipTeoresBaixos as PT_TooltipBaixos,
  TooltipMonteCarlo as PT_TooltipMC,
} from "@/lib/methodologyContent"

// EN imports
import {
  MethodologyTipoSolucao_EN as EN_TipoSolucao,
  MethodologyDadosAmostra_EN as EN_DadosAmostra,
  MethodologyMassaDensidade_EN as EN_MassaDensidade,
  MethodologyTemperatura_EN as EN_Temperatura,
  MethodologyEscoamento_EN as EN_Escoamento,
  MethodologyRevisao_EN as EN_Revisao,
  MethodologyRelatorio_EN as EN_Relatorio,
  MethodologyComplete_EN as EN_Complete,
  TooltipComposicoesEquivalentes_EN as EN_TooltipEquiv,
  TooltipTeoresBaixos_EN as EN_TooltipBaixos,
  TooltipMonteCarlo_EN as EN_TooltipMC,
} from "@/lib/methodologyContent.en"

// ─── Wrapper components ───
export const MethodologyTipoSolucaoI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_TipoSolucao /> : <EN_TipoSolucao />
}

export const MethodologyDadosAmostraI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_DadosAmostra /> : <EN_DadosAmostra />
}

export const MethodologyMassaDensidadeI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_MassaDensidade /> : <EN_MassaDensidade />
}

export const MethodologyTemperaturaI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_Temperatura /> : <EN_Temperatura />
}

export const MethodologyEscoamentoI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_Escoamento /> : <EN_Escoamento />
}

export const MethodologyRevisaoI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_Revisao /> : <EN_Revisao />
}

export const MethodologyRelatorioI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_Relatorio /> : <EN_Relatorio />
}

export const MethodologyCompleteI18n = () => {
  const lang = useLang()
  return lang === "pt" ? <PT_Complete /> : <EN_Complete />
}

// ─── Tooltip hooks ───
export function useTooltipEquivalentes(): string {
  const lang = useLang()
  return lang === "pt" ? PT_TooltipEquiv : EN_TooltipEquiv
}

export function useTooltipTeoresBaixos(): string {
  const lang = useLang()
  return lang === "pt" ? PT_TooltipBaixos : EN_TooltipBaixos
}

export function useTooltipMonteCarlo(): string {
  const lang = useLang()
  return lang === "pt" ? PT_TooltipMC : EN_TooltipMC
}
