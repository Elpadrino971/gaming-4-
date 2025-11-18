'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = false
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/10 dark:bg-white/5
        backdrop-blur-xl
        border border-white/20 dark:border-white/10
        shadow-xl
        ${glow ? 'animate-glow' : ''}
        ${className}
      `}
      whileHover={hover ? {
        scale: 1.05,
        y: -5,
        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)'
      } : {}}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
