"use client"
import React, { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [animationPhase, setAnimationPhase] = useState<'large' | 'shrinking' | 'complete'>('large')

  useEffect(() => {
    // Fase 1: Mostrar logo grande por 1.5s
    const phase1Timer = setTimeout(() => {
      setAnimationPhase('shrinking')
    }, 1500)

    // Fase 2: Encolher e mover para cima por 0.8s
    const phase2Timer = setTimeout(() => {
      setAnimationPhase('complete')
      onComplete()
    }, 2300) // 1500 + 800

    return () => {
      clearTimeout(phase1Timer)
      clearTimeout(phase2Timer)
    }
  }, [onComplete])

  if (animationPhase === 'complete') {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#002060] flex items-center justify-center">
      <div 
        className={`text-white font-bold transition-all duration-800 ease-in-out ${
          animationPhase === 'large' 
            ? 'text-6xl translate-y-0' 
            : 'text-2xl -translate-y-32'
        }`}
      >
        AlcoLab
      </div>
    </div>
  )
}
