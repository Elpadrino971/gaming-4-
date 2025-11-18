import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useHaptics } from './useHaptics'

interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  enableHaptics?: boolean
}

export const useGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  enableHaptics = true
}: GestureOptions) => {
  const touchStartRef = useRef({ x: 0, y: 0 })
  const { impact } = useHaptics()

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }

      const deltaX = touchEnd.x - touchStartRef.current.x
      const deltaY = touchEnd.y - touchStartRef.current.y

      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Horizontal swipe
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        if (deltaX > 0) {
          if (enableHaptics) impact('light')
          onSwipeRight?.()
        } else {
          if (enableHaptics) impact('light')
          onSwipeLeft?.()
        }
      }
      // Vertical swipe
      else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        if (deltaY > 0) {
          if (enableHaptics) impact('light')
          onSwipeDown?.()
        } else {
          if (enableHaptics) impact('light')
          onSwipeUp?.()
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, enableHaptics, impact])
}

// Preset for navigation
export const useSwipeNavigation = (routes: {
  left?: string
  right?: string
  up?: string
  down?: string
}) => {
  const router = useRouter()

  useGesture({
    onSwipeLeft: routes.left ? () => router.push(routes.left!) : undefined,
    onSwipeRight: routes.right ? () => router.push(routes.right!) : undefined,
    onSwipeUp: routes.up ? () => router.push(routes.up!) : undefined,
    onSwipeDown: routes.down ? () => router.push(routes.down!) : undefined,
    enableHaptics: true
  })
}
