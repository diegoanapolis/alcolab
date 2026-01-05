"use client"
import React from "react"

export default function CalculatingOverlay() {
  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-4">
      {/* Logo centralizado */}
      <div className="text-4xl font-bold text-[#002060] mb-8">
        AlcoLab
      </div>
      
      {/* Spinner/Loading animation */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#002060] rounded-full animate-spin"></div>
      </div>
      
      {/* Texto amigável */}
      <div className="text-center text-gray-700 max-w-sm">
        <p className="text-lg">Estamos calculando seus resultados.</p>
        <p className="text-md">É bem rapidinho!</p>
      </div>
    </div>
  )
}
