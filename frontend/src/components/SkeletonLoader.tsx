'use client'

import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'stat' | 'button'
  className?: string
}

export default function SkeletonLoader({
  variant = 'card',
  className = ''
}: SkeletonLoaderProps) {
  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }

  const baseClasses = `
    bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
    dark:from-gray-800 dark:via-gray-700 dark:to-gray-800
    animate-shimmer
    ${className}
  `

  const variants = {
    card: (
      <motion.div
        className={`${baseClasses} rounded-2xl h-48`}
        style={{
          backgroundSize: '200% 100%'
        }}
        {...shimmer}
      />
    ),
    text: (
      <motion.div
        className={`${baseClasses} rounded-lg h-4 w-full`}
        style={{
          backgroundSize: '200% 100%'
        }}
        {...shimmer}
      />
    ),
    circle: (
      <motion.div
        className={`${baseClasses} rounded-full w-12 h-12`}
        style={{
          backgroundSize: '200% 100%'
        }}
        {...shimmer}
      />
    ),
    stat: (
      <motion.div
        className={`${baseClasses} rounded-2xl p-6`}
        style={{
          backgroundSize: '200% 100%'
        }}
        {...shimmer}
      >
        <div className="space-y-3">
          <div className="h-8 bg-white/20 dark:bg-black/20 rounded w-1/3" />
          <div className="h-10 bg-white/20 dark:bg-black/20 rounded w-2/3" />
          <div className="h-4 bg-white/20 dark:bg-black/20 rounded w-1/2" />
        </div>
      </motion.div>
    ),
    button: (
      <motion.div
        className={`${baseClasses} rounded-xl h-14 w-48`}
        style={{
          backgroundSize: '200% 100%'
        }}
        {...shimmer}
      />
    )
  }

  return variants[variant]
}
