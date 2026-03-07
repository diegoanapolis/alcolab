"use client"
import React from "react"
import { useT } from "@/lib/i18n"

export default function CalculatingOverlay() {
  const t = useT()
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-4">
      <div className="text-4xl font-bold text-[#002060] mb-8">AlcoLab</div>
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#002060] rounded-full animate-spin"></div>
      </div>
      <div className="text-center text-gray-700 max-w-sm">
        <p className="text-lg">{t("Calculating your results.")}</p>
        <p className="text-md">{t("It will be quick!")}</p>
      </div>
    </div>
  )
}
