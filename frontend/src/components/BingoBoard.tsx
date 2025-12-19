'use client'

import { motion } from 'framer-motion'

interface BingoBoardProps {
  drawnNumbers: number[]
  lastNumber?: number
}

export default function BingoBoard({ drawnNumbers, lastNumber }: BingoBoardProps) {
  // Générer tous les numéros de 1 à 75
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1)

  return (
    <div className="bg-gradient-to-b from-purple-950 via-black to-transparent p-4 rounded-b-3xl shadow-2xl border-b-2 border-yellow-500/30">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-400 tracking-widest"
            style={{ textShadow: '0 0 20px rgba(234, 179, 8, 0.8)' }}>
          ••••••• NUMBER BOARD •••••••
        </h2>
      </div>

      <div className="flex items-start gap-4">
        {/* Grille compacte de tous les numéros */}
        <div className="flex-1 grid grid-cols-15 gap-1">
          {allNumbers.map((num) => {
            const isDrawn = drawnNumbers.includes(num)
            return (
              <motion.div
                key={num}
                initial={false}
                animate={{
                  scale: isDrawn ? [1, 1.2, 1] : 1,
                  backgroundColor: isDrawn ? '#fbbf24' : '#1f2937',
                }}
                transition={{ duration: 0.3 }}
                className={`
                  relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${isDrawn
                    ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'bg-gray-800 text-gray-600'
                  }
                `}
              >
                {num}
                {isDrawn && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-yellow-400"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* LAST NUMBER - Zone sacrée */}
        {lastNumber && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-3xl opacity-50 animate-pulse" />

              {/* Main circle */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700
                            border-4 border-yellow-400 flex flex-col items-center justify-center
                            shadow-[0_0_40px_rgba(234,179,8,1)]">
                <div className="text-xs font-bold text-yellow-900 mb-1 tracking-wider">LAST</div>
                <div className="text-5xl font-black text-black"
                     style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  {lastNumber}
                </div>

                {/* Electric pulse animation */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-yellow-300"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
