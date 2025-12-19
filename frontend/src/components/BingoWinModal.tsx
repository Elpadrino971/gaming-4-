'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

interface Winner {
  username: string
  position: number
  prize: string
  isYou?: boolean
}

interface BingoWinModalProps {
  isOpen: boolean
  winners: Winner[]
  onClose: () => void
}

export default function BingoWinModal({ isOpen, winners, onClose }: BingoWinModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const mainWinner = winners[0]

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Vibration si supporté
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400])
      }
    } else {
      setShowConfetti(false)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={typeof window !== 'undefined' ? window.innerWidth : 300}
              height={typeof window !== 'undefined' ? window.innerHeight : 600}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
              colors={['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e']}
            />
          )}

          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-500 rounded-3xl blur-3xl opacity-30 animate-pulse" />

              {/* Main modal */}
              <div className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-3xl border-4 border-yellow-500 p-8 shadow-2xl">
                {/* Titre BINGO WON */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <motion.h1
                    animate={{
                      scale: [1, 1.1, 1],
                      textShadow: [
                        '0 0 20px rgba(251,191,36,0.5)',
                        '0 0 40px rgba(251,191,36,1)',
                        '0 0 20px rgba(251,191,36,0.5)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-7xl font-black text-yellow-400 mb-4"
                  >
                    🎉 BINGO! 🎉
                  </motion.h1>

                  {mainWinner && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring' }}
                    >
                      <div className="text-3xl font-bold text-white mb-2">
                        {mainWinner.isYou ? (
                          <span className="text-yellow-400">🏆 VOUS AVEZ GAGNÉ ! 🏆</span>
                        ) : (
                          <>
                            🥇 <span className="text-yellow-400">{mainWinner.username}</span> a
                            gagné !
                          </>
                        )}
                      </div>
                      {mainWinner.prize && (
                        <div className="text-xl text-gray-300">
                          Prix: <span className="text-yellow-400 font-bold">{mainWinner.prize}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Podium */}
                {winners.length > 1 && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                  >
                    <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4">
                      🏅 Podium 🏅
                    </h3>

                    <div className="space-y-3">
                      {winners.map((winner, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 ${
                            winner.isYou
                              ? 'bg-yellow-900/40 border-yellow-400'
                              : index === 0
                              ? 'bg-yellow-800/20 border-yellow-500/50'
                              : 'bg-gray-800/40 border-gray-700'
                          }`}
                        >
                          {/* Medal */}
                          <div className="text-5xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div
                              className={`text-xl font-bold ${
                                winner.isYou ? 'text-yellow-400' : 'text-white'
                              }`}
                            >
                              {winner.username}
                              {winner.isYou && (
                                <span className="ml-2 text-sm bg-yellow-400 text-black px-2 py-1 rounded-full">
                                  VOUS
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {index === 0
                                ? '1er Bingo'
                                : index === 1
                                ? '2ème Bingo'
                                : '3ème Bingo'}
                            </div>
                          </div>

                          {/* Prize */}
                          {winner.prize && (
                            <div className="text-right">
                              <div className="text-yellow-400 font-bold">{winner.prize}</div>
                            </div>
                          )}

                          {/* Glow si c'est vous */}
                          {winner.isYou && (
                            <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl animate-pulse" />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Bouton fermer */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500
                           text-black font-bold text-xl py-4 rounded-2xl
                           shadow-[0_0_30px_rgba(251,191,36,0.5)]
                           transition-all duration-200"
                >
                  Continuer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
