"use client"
import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface NavigationButtonsProps {
  onBack?: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: string
  showNext?: boolean
  showBack?: boolean
}

export default function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel,
  showNext = true,
  showBack = true
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-6">
      {/* Botão Voltar */}
      {showBack && onBack ? (
        <button
          onClick={onBack}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[#002060] text-white hover:bg-[#001040] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-12 h-12" /> // Espaço vazio para manter alinhamento
      )}

      {/* Botão Próximo */}
      {showNext && onNext ? (
        nextLabel ? (
          // Botão "Calcular" (texto)
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              nextDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#002060] text-white hover:bg-[#001040]"
            }`}
          >
            {nextLabel}
          </button>
        ) : (
          // Botão seta circular
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              nextDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#002060] text-white hover:bg-[#001040]"
            }`}
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )
      ) : (
        <div className="w-12 h-12" />
      )}
    </div>
  )
}
