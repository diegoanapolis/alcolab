"use client"
import React from "react"
import { DEMO_SCENARIOS, DemoScenarioId } from "@/lib/demoScenarios"
import { X, FlaskConical } from "lucide-react"
import { useT } from "@/lib/i18n"

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (id: DemoScenarioId) => void
}

export default function DemoModal({ isOpen, onClose, onSelect }: DemoModalProps) {
  const t = useT()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl mx-4 max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#002060] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            <h2 className="font-semibold text-sm text-white">{t("Select an example")}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="px-4 pt-3 text-xs text-gray-600">
          {t("Pre-filled real data for demonstration. Includes flow videos, masses and label information.")}
        </p>
        <div className="p-4 space-y-2">
          {DEMO_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario.id as DemoScenarioId)}
              className="w-full text-left border-2 border-gray-200 rounded-lg p-3 hover:border-[#002060] hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-sm text-[#002060]">
                {t(scenario.label)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {t(scenario.description)}
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 pb-3">
          <button onClick={onClose} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">
            {t("Cancel")}
          </button>
        </div>
      </div>
    </div>
  )
}
