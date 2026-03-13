"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'large' | 'shrinking' | 'logo' | 'complete'>('large')

  useEffect(() => {
    // Fase 1: Mostrar "AlcoLab" grande por 1.5s
    const phase1Timer = setTimeout(() => {
      setAnimationPhase('shrinking')
    }, 1500)

    // Fase 2: Texto encolhe e sobe por 0.8s, depois logo aparece
    const phase2Timer = setTimeout(() => {
      setAnimationPhase('logo')
    }, 2300) // 1500 + 800

    // Fase 3: Logo visível por 1.2s, depois completa
    const phase3Timer = setTimeout(() => {
      setAnimationPhase('complete')
      onComplete()
    }, 3500) // 2300 + 1200

    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
      clearTimeout(phase3Timer)
    }
  }, [onComplete])

  if (animationPhase === 'complete') {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#002060] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Texto AlcoLab */}
        <div 
          className={`text-white font-bold transition-all duration-800 ease-in-out ${
            animationPhase === 'large' 
              ? 'text-6xl translate-y-0' 
              : 'text-2xl -translate-y-8'
          }`}
        >
          AlcoLab
        </div>

        {/* Logo com fade-in */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            animationPhase === 'logo'
              ? 'opacity-100 scale-100 translate-y-0'
              : animationPhase === 'shrinking'
              ? 'opacity-0 scale-75 translate-y-4'
              : 'opacity-0 scale-75 translate-y-4'
          }`}
        >
          {(animationPhase === 'shrinking' || animationPhase === 'logo') && (
            <Image
              src="/images/logo_alcolab.png"
              alt="AlcoLab logo"
              width={120}
              height={120}
              className="drop-shadow-2xl"
              priority
            />
          )}
        </div>
      </div>
    </div>
  )
}
