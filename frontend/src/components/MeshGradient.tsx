'use client'

import { motion } from 'framer-motion'

interface MeshGradientProps {
  colors?: string[]
  className?: string
}

export default function MeshGradient({
  colors = [
    'rgba(99, 102, 241, 0.3)',
    'rgba(168, 85, 247, 0.3)',
    'rgba(236, 72, 153, 0.3)',
    'rgba(14, 165, 233, 0.3)',
  ],
  className = ''
}: MeshGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`
        }}
        animate={{
          x: ['-10%', '110%', '-10%'],
          y: ['-10%', '110%', '-10%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors[1]}, transparent 70%)`
        }}
        animate={{
          x: ['110%', '-10%', '110%'],
          y: ['110%', '-10%', '110%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors[2]}, transparent 70%)`
        }}
        animate={{
          x: ['50%', '-10%', '110%', '50%'],
          y: ['-10%', '50%', '110%', '-10%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors[3]}, transparent 70%)`
        }}
        animate={{
          x: ['110%', '50%', '-10%', '110%'],
          y: ['50%', '110%', '50%', '-10%'],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
