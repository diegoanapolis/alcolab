"use client"
import React, { useState, useRef, useEffect } from "react"
import { Info } from "lucide-react"

interface InfoTooltipProps {
  text: string
  children?: React.ReactNode
  className?: string
}

export default function InfoTooltip({ text, children, className = "" }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside as any)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside as any)
    }
  }, [isOpen])

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`}>
      {children}
      <span
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help inline-flex items-center"
        aria-label="Informação"
      >
        <Info className="w-4 h-4 text-[#002060]" />
      </span>
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[90vw] 
                     bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700
                     animate-in fade-in-0 zoom-in-95 duration-150"
          role="tooltip"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-white" />
          </div>
        </div>
      )}
    </span>
  )
}

// Versão inline para termos destacados
export function InlineTooltip({ term, tooltip, className = "" }: { term: string; tooltip: string; className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <span className={`relative inline ${className}`}>
      <span
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b border-dashed border-[#002060] text-[#002060]"
      >
        {term}
        <Info className="w-3 h-3 inline ml-0.5 mb-0.5" />
      </span>
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-0 mb-2 w-64 max-w-[90vw] 
                     bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700
                     animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {tooltip}
        </div>
      )}
    </span>
  )
}
