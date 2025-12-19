'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface BingoCardProps {
  grid: number[][]
  markedCells: boolean[][]
  drawnNumbers: number[]
  progress: { current: number; total: number }
  isActive?: boolean
  cardIndex?: number
}

export default function BingoCard({
  grid,
  markedCells,
  drawnNumbers,
  progress,
  isActive = true,
  cardIndex = 1,
}: BingoCardProps) {
  const [vibrate, setVibrate] = useState(false)

  const completionPercent = (progress.current / progress.total) * 100

  // Vérifier si on est proche du bingo (4/5 ou +)
  const isClose = progress.current >= progress.total - 1

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isActive ? 1 : 0.6,
        scale: isActive ? 1 : 0.95,
      }}
      className="w-full max-w-md mx-auto px-4"
    >
      {/* Header avec progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-yellow-400 font-bold text-xl">
            ••• BINGO •••
          </h3>
          <div className="text-right">
            <div className={`text-3xl font-black ${isClose ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
              {progress.current}/{progress.total}
            </div>
            <div className="text-xs text-gray-400">numbers</div>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-yellow-500/30">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${
              isClose
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {isClose && (
            <motion.div
              className="absolute inset-0 bg-yellow-400"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < progress.current
                  ? 'bg-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Grille de Bingo */}
      <motion.div
        animate={isClose ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.8, repeat: isClose ? Infinity : 0 }}
        className={`relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border-2 ${
          isClose ? 'border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'border-yellow-500/30'
        }`}
      >
        {/* Glow si proche du bingo */}
        {isClose && (
          <div className="absolute inset-0 bg-yellow-500/10 rounded-3xl animate-pulse" />
        )}

        {/* En-tête B-I-N-G-O */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
            <div
              key={letter}
              className="text-center text-2xl font-black text-yellow-400"
              style={{ textShadow: '0 0 10px rgba(251,191,36,0.8)' }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Grille 5x5 */}
        <div className="grid grid-cols-5 gap-2">
          {grid.map((row, rowIndex) =>
            row.map((num, colIndex) => {
              const isMarked = markedCells[rowIndex]?.[colIndex]
              const isFree = rowIndex === 2 && colIndex === 2
              const isDrawn = drawnNumbers.includes(num)

              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  initial={false}
                  animate={{
                    scale: isDrawn && !isMarked ? [1, 1.15, 1] : 1,
                    backgroundColor: isFree
                      ? '#eab308'
                      : isMarked
                      ? '#fbbf24'
                      : '#1f2937',
                  }}
                  transition={{ duration: 0.3 }}
                  className={`
                    relative aspect-square rounded-xl flex items-center justify-center
                    font-bold text-lg border-2
                    ${
                      isFree
                        ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                        : isMarked
                        ? 'bg-yellow-500 border-yellow-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                        : 'bg-gray-800 border-gray-700 text-white'
                    }
                  `}
                >
                  {isFree ? (
                    <span className="text-xs font-black">FREE</span>
                  ) : (
                    <span>{num}</span>
                  )}

                  {/* Effet de marquage */}
                  {isMarked && !isFree && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 rounded-xl bg-yellow-400 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
                        <div className="text-2xl">✓</div>
                      </div>
                    </motion.div>
                  )}

                  {/* Pulse si nouveau numéro tiré */}
                  {isDrawn && !isMarked && (
                    <motion.div
                      className="absolute inset-0 rounded-xl border-2 border-yellow-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{ duration: 1, repeat: 3 }}
                    />
                  )}
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Message "YOU ARE CLOSE" */}
      {isClose && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                '0 0 10px rgba(251,191,36,0.5)',
                '0 0 20px rgba(251,191,36,1)',
                '0 0 10px rgba(251,191,36,0.5)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-black text-yellow-400"
          >
            🔥 YOU ARE CLOSE... 🔥
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
