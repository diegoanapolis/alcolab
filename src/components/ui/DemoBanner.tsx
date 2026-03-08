"use client"
import React from "react"
import { useT } from "@/lib/i18n"

interface DemoBannerProps {
  text: string
  small?: boolean
}

export default function DemoBanner({ text, small }: DemoBannerProps) {
  const t = useT()
  // Split text on newlines to translate header separately from data lines
  const lines = text.split('\n')
  const header = lines[0]
  const dataLines = lines.slice(1)
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className={`${small ? 'text-[11px]' : 'text-xs'} text-blue-800 leading-relaxed whitespace-pre-line text-justify`}>
        <span className="font-semibold">{t("Demo mode ")}</span>
        {t(header)}
        {dataLines.length > 0 && '\n' + dataLines.map(l => {
          // Translate "Water:" and "Sample:" labels but keep numbers
          return l.replace(/^Water:/, t("Water:")).replace(/^Sample:/, t("Sample:"))
                  .replace(/ seconds$/, ' ' + t("seconds")).replace(/ and /, ' ' + t("and") + ' ')
        }).join('\n')}
      </div>
    </div>
  )
}
