'use client'

import { useEffect, useRef } from 'react'

interface StarfieldProps {
  starCount?: number
  speed?: number
  className?: string
}

export default function Starfield({
  starCount = 200,
  speed = 0.5,
  className = ''
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Star {
      x: number
      y: number
      z: number
      prevX?: number
      prevY?: number
    }

    const stars: Star[] = []

    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width - canvas.width / 2,
        y: Math.random() * canvas.height - canvas.height / 2,
        z: Math.random() * canvas.width
      })
    }

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    let animationId: number

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        star.z -= speed

        if (star.z <= 0) {
          star.z = canvas.width
          star.x = Math.random() * canvas.width - canvas.width / 2
          star.y = Math.random() * canvas.height - canvas.height / 2
        }

        const k = 128.0 / star.z
        const px = star.x * k + centerX
        const py = star.y * k + centerY

        if (
          px >= 0 &&
          px <= canvas.width &&
          py >= 0 &&
          py <= canvas.height
        ) {
          const size = (1 - star.z / canvas.width) * 3
          const opacity = (1 - star.z / canvas.width)

          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()

          // Draw trail
          if (star.prevX !== undefined && star.prevY !== undefined) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`
            ctx.lineWidth = size / 2
            ctx.beginPath()
            ctx.moveTo(star.prevX, star.prevY)
            ctx.lineTo(px, py)
            ctx.stroke()
          }

          star.prevX = px
          star.prevY = py
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [starCount, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
