"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ptTranslations } from "@/lib/translations"

export type Lang = "en" | "pt"

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (en: string) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
})

export function useI18n() {
  return useContext(I18nContext)
}

/** Shortcut: returns just the t() function */
export function useT() {
  return useContext(I18nContext).t
}

/** Shortcut: returns current language */
export function useLang() {
  return useContext(I18nContext).lang
}


/**
 * Localiza strings de relatório vindas do backend Python (que são canônicas
 * em PT) para exibição. O parsing/semáforo continua usando a string PT crua;
 * isto afeta APENAS o texto mostrado ao usuário.
 *  - lang "en": traduz frases/tokens PT -> EN.
 *  - lang "pt": traduz as poucas frases que o backend emite em EN -> PT.
 */
const REPORT_PT_EN: Array<[string, string]> = [
  // frases completas (mais específicas primeiro)
  ["Substância pura etanol ou de teor elevado (> 98%)", "Pure ethanol substance or high content (> 98%)"],
  ["Substância pura metanol ou de teor elevado (> 98%)", "Pure methanol substance or high content (> 98%)"],
  ["Etanol puro ou de teor elevado (> 98%)", "Pure ethanol or high content (> 98%)"],
  ["Metanol puro ou de teor elevado (> 98%)", "Pure methanol or high content (> 98%)"],
  ["ternário com presença de metanol em baixa concentração (≤ 5%)", "ternary with low methanol content (≤ 5%)"],
  ["ternário com presença de etanol em baixa concentração (≤ 5%)", "ternary with low ethanol content (≤ 5%)"],
  ["Provável mistura (etanol + metanol)", "Probable mixture (ethanol + methanol)"],
  ["Possível traço do outro álcool (hipótese de traço vence)", "Possible trace of the other alcohol (trace hypothesis prevails)"],
  ["Possível traço (baixa seletividade)", "Possible trace (low selectivity)"],
  ["Inconclusivo (baixa seletividade em w_alcool <= 0.20)", "Inconclusive (low selectivity at w_alcohol <= 0.20)"],
  ["Binário provável (resultado inicial confirmado)", "Probable binary (initial result confirmed)"],
  ["Inconclusivo (binário vs traço)", "Inconclusive (binary vs trace)"],
  ["Ternário provável", "Probable ternary"],
  ["Inconclusivo entre ", "Inconclusive between "],
  ["Ternária água-etanol-metanol", "Water-ethanol-methanol ternary"],
  ["Binária água-etanol", "Water-ethanol binary"],
  ["Binária água-metanol", "Water-methanol binary"],
  ["ternária água-etanol-metanol", "water-ethanol-methanol ternary"],
  ["binária água-etanol", "water-ethanol binary"],
  ["binária água-metanol", "water-methanol binary"],
  ["Inconclusivo", "Inconclusive"],
]

// Frases que o backend emite em EN e que precisam virar PT no modo "pt".
const REPORT_EN_PT: Array<[string, string]> = [
  ["Compatible with water or dilute aqueous solution", "Compatível com água ou solução aquosa diluída"],
  ["Compatible with pure Ethanol or high content (> 98%)", "Compatível com etanol puro ou de teor elevado (> 98%)"],
  ["Compatible with pure Methanol or high content (> 98%)", "Compatível com metanol puro ou de teor elevado (> 98%)"],
  ["Compatible with water-ethanol binary", "Compatível com binária água-etanol"],
  ["Compatible with water-methanol binary", "Compatível com binária água-metanol"],
]

export function localizeReport(text: unknown, lang: Lang): string {
  if (text == null) return ""
  let s = String(text)
  if (lang === "en") {
    for (const [pt, en] of REPORT_PT_EN) s = s.split(pt).join(en)
    // tokens (metanol antes de etanol; "; e " antes de " e ")
    s = s.split("; e ").join("; and ")
    s = s.split(" e ").join(" and ")
    s = s.split("Água").join("Water").split("água").join("water")
    s = s.split("metanol").join("methanol").split("etanol").join("ethanol")
  } else {
    for (const [en, pt] of REPORT_EN_PT) s = s.split(en).join(pt)
  }
  return s
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")
  const [ready, setReady] = useState(false)

  // On mount: read stored preference or detect browser language
  useEffect(() => {
    try {
      const stored = localStorage.getItem("alcolab_lang") as Lang | null
      if (stored === "pt" || stored === "en") {
        setLangState(stored)
      } else {
        // Detect from browser
        const browserLang = navigator.language || (navigator as any).languages?.[0] || "en"
        setLangState(browserLang.toLowerCase().startsWith("pt") ? "pt" : "en")
      }
    } catch {
      setLangState("en")
    }
    setReady(true)
  }, [])

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    try {
      localStorage.setItem("alcolab_lang", newLang)
    } catch {}
  }, [])

  const t = useCallback(
    (en: string): string => {
      if (lang === "en") return en
      return ptTranslations[en] ?? en
    },
    [lang]
  )

  // Prevent flash of wrong language
  if (!ready) return null

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
