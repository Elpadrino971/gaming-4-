'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface RecentNumbersProps {
  numbers: number[]
  maxDisplay?: number
}

const getLetterForNumber = (num: number): string => {
  if (num >= 1 && num <= 15) return 'B'
  if (num >= 16 && num <= 30) return 'I'
  if (num >= 31 && num <= 45) return 'N'
  if (num >= 46 && num <= 60) return 'G'
  if (num >= 61 && num <= 75) return 'O'
  return ''
}

const getColorForLetter = (letter: string) => {
  const colors = {
    B: { bg: 'from-blue-500 to-blue-700', text: 'text-white', glow: 'rgba(59, 130, 246, 0.8)' },
    I: { bg: 'from-red-500 to-red-700', text: 'text-white', glow: 'rgba(239, 68, 68, 0.8)' },
    N: { bg: 'from-purple-500 to-purple-700', text: 'text-white', glow: 'rgba(168, 85, 247, 0.8)' },
    G: { bg: 'from-green-500 to-green-700', text: 'text-white', glow: 'rgba(34, 197, 94, 0.8)' },
    O: { bg: 'from-yellow-500 to-yellow-700', text: 'text-black', glow: 'rgba(234, 179, 8, 0.8)' },
  }
  return colors[letter as keyof typeof colors] || colors.B
}

export default function RecentNumbers({ numbers, maxDisplay = 8 }: RecentNumbersProps) {
  const recentNumbers = numbers.slice(-maxDisplay).reverse()

  return (
    <div className="bg-black/50 backdrop-blur-sm px-6 py-4 border-y border-yellow-500/20">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {recentNumbers.map((num, index) => {
            const letter = getLetterForNumber(num)
            const colors = getColorForLetter(letter)

            return (
              <motion.div
                key={`${num}-${index}`}
                initial={{ scale: 0, x: -50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.05,
                }}
                className="relative flex-shrink-0"
              >
                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                  style={{ backgroundColor: colors.glow }}
                />

                {/* Number card */}
                <div
                  className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl px-6 py-3
                            border-2 border-white/30 flex items-center gap-2
                            shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}
                >
                  {/* Letter badge */}
                  <div className={`text-2xl font-black ${colors.text} opacity-60`}>
                    {letter}
                  </div>

                  {/* Number */}
                  <div className={`text-3xl font-black ${colors.text}`}
                       style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {num}
                  </div>
                </div>

                {/* Electric pulse for the most recent */}
                {index === 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-white"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {recentNumbers.length === 0 && (
          <div className="text-gray-500 text-center w-full py-4">
            En attente du premier numéro...
          </div>
        )}
      </div>
    </div>
  )
}
