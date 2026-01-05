"use client"
import { useEffect, useRef } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export default function useSwipe(handlers: SwipeHandlers, enabled: boolean = true) {
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const { onSwipeLeft, onSwipeRight } = handlers

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return
      
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current
      
      // Verificar se é um swipe horizontal significativo (não vertical)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
        if (deltaX > 0 && onSwipeRight) {
          // Swipe direita
          onSwipeRight()
        } else if (deltaX < 0 && onSwipeLeft) {
          // Swipe esquerda
          onSwipeLeft()
        }
      }
    }

    // Adicionar listeners apenas na área principal (não em inputs, selects, etc.)
    const handleElement = document.body

    handleElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    handleElement.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      handleElement.removeEventListener('touchstart', handleTouchStart)
      handleElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, enabled])
}
