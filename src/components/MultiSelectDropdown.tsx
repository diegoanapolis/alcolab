"use client"
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface MultiSelectDropdownProps {
  options: readonly string[] | string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  label?: string
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  label
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(s => s !== option))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Campo principal com tags */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[42px] border rounded-lg p-2 bg-white cursor-pointer flex flex-wrap gap-1 items-center"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        ) : (
          <>
            {selected.map(option => (
              <span
                key={option}
                className="inline-flex items-center gap-1 bg-[#002060] text-white text-xs px-2 py-1 rounded-full"
              >
                <span className="max-w-[100px] truncate">{option}</span>
                <button
                  onClick={(e) => removeOption(option, e)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </>
        )}
        
        {/* Botões de controle */}
        <div className="ml-auto flex items-center gap-1">
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown com opções */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-3 py-2 cursor-pointer text-sm flex items-center gap-2 hover:bg-gray-50 ${
                selected.includes(option) ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                selected.includes(option) ? 'bg-[#002060] border-[#002060]' : 'border-gray-300'
              }`}>
                {selected.includes(option) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={selected.includes(option) ? 'font-medium' : ''}>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
