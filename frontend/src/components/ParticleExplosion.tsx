'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  velocityX: number
  velocityY: number
  rotation: number
}

interface ParticleExplosionProps {
  trigger: boolean
  particleCount?: number
  colors?: string[]
  duration?: number
  spread?: number
}

export default function ParticleExplosion({
  trigger,
  particleCount = 50,
  colors = ['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'],
  duration = 2,
  spread = 300
}: ParticleExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger) {
      const newParticles: Particle[] = []

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
        const velocity = spread * (0.5 + Math.random() * 0.5)

        newParticles.push({
          id: i,
          x: 0,
          y: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          velocityX: Math.cos(angle) * velocity,
          velocityY: Math.sin(angle) * velocity,
          rotation: Math.random() * 360
        })
      }

      setParticles(newParticles)

      // Clear particles after animation
      setTimeout(() => setParticles([]), duration * 1000)
    }
  }, [trigger, particleCount, colors, duration, spread])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 9999 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: particle.velocityX,
            y: particle.velocityY,
            opacity: 0,
            scale: [0, 1.5, 1, 0],
            rotate: particle.rotation
          }}
          transition={{
            duration,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      ))}
    </div>
  )
}
