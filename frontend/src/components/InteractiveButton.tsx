'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'

interface InteractiveButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  hapticStyle?: 'light' | 'medium' | 'heavy'
  playSound?: boolean
}

export default function InteractiveButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  hapticStyle = 'medium',
  playSound = true
}: InteractiveButtonProps) {
  const { impact } = useHaptics()
  const { playClick } = useSound()

  const handleClick = () => {
    if (disabled) return

    // Haptic feedback
    impact(hapticStyle)

    // Sound effect
    if (playSound) {
      playClick()
    }

    // Call original onClick
    onClick?.()
  }

  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-700 text-white',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-700 text-white',
    success: 'bg-gradient-to-r from-green-500 to-green-700 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-700 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-12 py-5 text-xl',
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-bold
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        shadow-lg
        ${className}
      `}
      whileHover={!disabled ? {
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)'
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  )
}
