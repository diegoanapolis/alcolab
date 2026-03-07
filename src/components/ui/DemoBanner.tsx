"use client"
import React from "react"
import { useT } from "@/lib/i18n"

interface DemoBannerProps {
  text: string
  small?: boolean
}

export default function DemoBanner({ text, small }: DemoBannerProps) {
  const t = useT()
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className={`${small ? 'text-[11px]' : 'text-xs'} text-blue-800 leading-relaxed whitespace-pre-line text-justify`}>
        <span className="font-semibold">{t("Demo mode ")}</span>
        {t(text)}
      </div>
    </div>
  )
}
