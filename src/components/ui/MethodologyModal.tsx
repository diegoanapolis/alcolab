"use client"
import { useT } from "@/lib/i18n"
import React, { useEffect } from "react"
import { X, Search } from "lucide-react"

interface MethodologyModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function MethodologyModal({ isOpen, onClose, title, children }: MethodologyModalProps) {
  const t = useT()
  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
    }
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white dark-modal flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-[#002060] text-white">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto space-y-4 text-sm leading-relaxed text-gray-800">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t bg-gray-50">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#002060] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#001040] transition-colors"
          >
            {t("Back")}
          </button>
        </div>
      </footer>
    </div>
  )
}

// Botão para abrir a metodologia da etapa
export function MethodologyButton({ onClick, className = "", compact = false }: { onClick: () => void; className?: string; compact?: boolean }) {
  const t = useT()
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 text-xs text-[#002060] hover:underline ${className}`}
      >
        <Search className="w-3.5 h-3.5" />
        <span>{t("Methodology")}</span>
      </button>
    )
  }
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm text-[#002060] hover:underline ${className}`}
    >
      <Search className="w-4 h-4" />
      <span>{t("Methodology")}</span>
    </button>
  )
}
