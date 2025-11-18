'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CreditsRainProps {
  trigger: boolean
  amount: number
  duration?: number
}

interface CreditDrop {
  id: number
  x: number
  delay: number
  duration: number
}

export default function CreditsRain({
  trigger,
  amount,
  duration = 2
}: CreditsRainProps) {
  const [drops, setDrops] = useState<CreditDrop[]>([])

  useEffect(() => {
    if (trigger) {
      const newDrops: CreditDrop[] = []
      const count = Math.min(50, Math.max(10, Math.floor(amount / 10)))

      for (let i = 0; i < count; i++) {
        newDrops.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: duration + Math.random() * 0.5
        })
      }

      setDrops(newDrops)

      setTimeout(() => setDrops([]), (duration + 0.5) * 1000)
    }
  }, [trigger, amount, duration])

  if (drops.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute text-4xl font-bold"
          style={{
            left: `${drop.x}%`,
            top: '-10%',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            filter: 'drop-shadow(0 0 10px #FFD700)'
          }}
          initial={{ y: 0, opacity: 1, scale: 0 }}
          animate={{
            y: '120vh',
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0.5],
            rotate: [0, 360]
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            ease: 'easeIn'
          }}
        >
          <span className="text-yellow-400">💰</span>
        </motion.div>
      ))}

      {/* Amount display */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 2 }}
      >
        <div className="text-8xl font-black text-yellow-400"
          style={{
            textShadow: '0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 215, 0, 0.8)',
            WebkitTextStroke: '2px #FF8C00'
          }}
        >
          +{amount}
        </div>
      </motion.div>
    </div>
  )
}
