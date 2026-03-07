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
