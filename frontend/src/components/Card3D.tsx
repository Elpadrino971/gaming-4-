'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface Card3DProps {
  front: ReactNode
  back: ReactNode
  className?: string
  flipOnHover?: boolean
  flipOnClick?: boolean
  onFlip?: (isFlipped: boolean) => void
}

export default function Card3D({
  front,
  back,
  className = '',
  flipOnHover = false,
  flipOnClick = true,
  onFlip
}: Card3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (flipOnClick) {
      const newFlipState = !isFlipped
      setIsFlipped(newFlipState)
      onFlip?.(newFlipState)
    }
  }

  const handleHover = () => {
    if (flipOnHover) {
      setIsFlipped(true)
    }
  }

  const handleLeave = () => {
    if (flipOnHover) {
      setIsFlipped(false)
    }
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 100,
          damping: 15
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}
