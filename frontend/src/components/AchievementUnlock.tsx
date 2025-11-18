'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import ConfettiCanvas from './ConfettiCanvas'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'

interface AchievementUnlockProps {
  achievement: {
    icon: string
    name: string
    description: string
    creditsReward?: number
    xpReward?: number
  } | null
  onClose: () => void
}

export default function AchievementUnlock({
  achievement,
  onClose
}: AchievementUnlockProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const { notification, vibrate } = useHaptics()
  const { playWin } = useSound()

  useEffect(() => {
    if (achievement) {
      // Epic feedback
      vibrate(300)
      notification('success')
      playWin()
      setShowConfetti(true)

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement, onClose, notification, vibrate, playWin])

  return (
    <AnimatePresence>
      {achievement && (
        <>
          <ConfettiCanvas trigger={showConfetti} duration={4000} particleCount={200} />

          <motion.div
            className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            {/* Achievement card */}
            <motion.div
              className="relative max-w-md w-full"
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, rotateY: -180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 blur-3xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />

              {/* Card content */}
              <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-8 text-center border-4 border-yellow-300 shadow-2xl">
                {/* Achievement unlocked label */}
                <motion.div
                  className="text-white text-sm font-bold uppercase tracking-wider mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  🏆 Achievement Débloqué ! 🏆
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="text-9xl mb-6"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: [0, 1.3, 1],
                    rotate: [- 180, 0]
                  }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 200
                  }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Name */}
                <motion.h2
                  className="text-4xl font-black text-white mb-3 drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {achievement.name}
                </motion.h2>

                {/* Description */}
                <motion.p
                  className="text-yellow-100 text-lg mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {achievement.description}
                </motion.p>

                {/* Rewards */}
                <motion.div
                  className="flex gap-4 justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {achievement.creditsReward && achievement.creditsReward > 0 && (
                    <div className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full">
                      <span className="text-white font-bold text-xl">
                        💰 +{achievement.creditsReward} cr
                      </span>
                    </div>
                  )}
                  {achievement.xpReward && achievement.xpReward > 0 && (
                    <div className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full">
                      <span className="text-white font-bold text-xl">
                        ⭐ +{achievement.xpReward} XP
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Tap to close hint */}
                <motion.div
                  className="text-yellow-100 text-sm mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  Tap pour fermer
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
