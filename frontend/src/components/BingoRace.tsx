'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Player {
  id: string
  username: string
  progress: number
  total: number
  isYou?: boolean
}

interface BingoRaceProps {
  players: Player[]
  currentUserId?: string
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4️⃣']

export default function BingoRace({ players, currentUserId }: BingoRaceProps) {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([])
  const [prevPositions, setPrevPositions] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    // Trier les joueurs par progression décroissante
    const sorted = [...players].sort((a, b) => {
      const progressA = (a.progress / a.total) * 100
      const progressB = (b.progress / b.total) * 100
      return progressB - progressA
    })

    // Sauvegarder les anciennes positions pour détecter les changements
    const newPositions = new Map<string, number>()
    sorted.forEach((player, index) => {
      newPositions.set(player.id, index)
    })

    setPrevPositions(newPositions)
    setSortedPlayers(sorted)
  }, [players])

  return (
    <div className="bg-black/60 backdrop-blur-md border-t-2 border-yellow-500/30 p-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h3
          className="text-3xl font-black text-yellow-400 tracking-wider mb-1"
          style={{ textShadow: '0 0 20px rgba(251,191,36,0.8)' }}
        >
          ⭐️ BINGO RACE ⭐️
        </h3>
        <p className="text-gray-400 text-sm">Temps réel - Course en direct</p>
      </motion.div>

      {/* Leaderboard */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.slice(0, 10).map((player, index) => {
            const progressPercent = (player.progress / player.total) * 100
            const isYou = player.id === currentUserId || player.isYou
            const prevPosition = prevPositions.get(player.id) ?? index
            const positionChange = prevPosition - index

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 30 },
                }}
                className={`relative overflow-hidden rounded-2xl border-2 ${
                  isYou
                    ? 'border-yellow-400 bg-gradient-to-r from-yellow-900/40 to-yellow-800/20'
                    : index === 0
                    ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-black/40'
                    : 'border-gray-700/50 bg-gradient-to-r from-gray-900/60 to-black/40'
                }`}
              >
                {/* Glow pour le joueur */}
                {isYou && (
                  <div className="absolute inset-0 bg-yellow-500/10 animate-pulse" />
                )}

                <div className="relative p-4 flex items-center gap-4">
                  {/* Position + Médaille */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-4xl mb-1">{MEDAL_EMOJIS[index] || `${index + 1}`}</div>
                    {positionChange > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-green-400 text-xs font-bold"
                      >
                        ↑ {positionChange}
                      </motion.div>
                    )}
                    {positionChange < 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs font-bold"
                      >
                        ↓ {Math.abs(positionChange)}
                      </motion.div>
                    )}
                  </div>

                  {/* Nom du joueur */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4
                        className={`font-bold truncate ${
                          isYou
                            ? 'text-yellow-400 text-lg'
                            : index === 0
                            ? 'text-yellow-500'
                            : 'text-white'
                        }`}
                      >
                        {player.username}
                        {isYou && (
                          <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </h4>
                    </div>

                    {/* Barre de progression */}
                    <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          isYou
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            : index === 0
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-700'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Nombre au centre */}
                      <div className="relative h-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold mix-blend-difference">
                          {player.progress}/{player.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score en grand */}
                  <div className="flex-shrink-0 text-right">
                    <div
                      className={`text-3xl font-black ${
                        isYou
                          ? 'text-yellow-400'
                          : index === 0
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {player.progress}/{player.total}
                    </div>
                    <div className="text-xs text-gray-500">numbers</div>
                  </div>
                </div>

                {/* Effet sparkle pour le premier */}
                {index === 0 && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(251,191,36,0.1) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 50%, rgba(251,191,36,0.1) 0%, transparent 50%)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Stats globales */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        {sortedPlayers.length} joueurs en course
      </div>
    </div>
  )
}
