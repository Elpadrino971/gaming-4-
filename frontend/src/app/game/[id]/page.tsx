'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { gamesAPI } from '@/lib/api'
import { io, Socket } from 'socket.io-client'
import { Crown, Users, Coins, Trophy, Zap, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface BingoCell {
  number: number
  marked: boolean
}

interface Player {
  id: string
  username: string
  isVip: boolean
  ready: boolean
}

interface GameState {
  id: string
  type: string
  status: string
  currentNumber?: number
  drawnNumbers: number[]
  participants: Player[]
  maxPlayers: number
  finalPrizePool: number
  multiplier: number
  winner?: {
    id: string
    username: string
  }
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function GameRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const gameId = params.id as string

  const [socket, setSocket] = useState<Socket | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [bingoCard, setBingoCard] = useState<BingoCell[][]>([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [canClaim, setCanClaim] = useState(false)

  // Initialize Socket.io connection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const token = localStorage.getItem('token')
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to game server')
      newSocket.emit('joinGame', { gameId })
    })

    newSocket.on('gameState', (gameState: GameState) => {
      console.log('Game state updated:', gameState)
      setGame(gameState)
      setLoading(false)
    })

    newSocket.on('bingoCard', (card: number[][]) => {
      console.log('Received bingo card:', card)
      const formattedCard = card.map((row) =>
        row.map((num) => ({ number: num, marked: false }))
      )
      setBingoCard(formattedCard)
    })

    newSocket.on('gameStarting', (seconds: number) => {
      toast.success(`La partie commence dans ${seconds} secondes !`)
      setCountdown(seconds)
    })

    newSocket.on('numberDrawn', ({ number }: { number: number }) => {
      console.log('Number drawn:', number)
      // Auto-mark the number if it's on the card
      setBingoCard((prev) =>
        prev.map((row) =>
          row.map((cell) =>
            cell.number === number ? { ...cell, marked: true } : cell
          )
        )
      )
      toast.success(`Numéro tiré: ${number}`, {
        icon: '🎲',
        duration: 2000,
      })
    })

    newSocket.on('gameEnded', ({ winner, prize }: any) => {
      const isWinner = winner.id === user?.id
      if (isWinner) {
        toast.success(`🎉 BINGO! Tu as gagné ${prize} crédits !`, {
          duration: 10000,
        })
      } else {
        toast(`${winner.username} a gagné la partie !`, {
          icon: '🏆',
          duration: 5000,
        })
      }

      setTimeout(() => {
        router.push('/lobby')
      }, 5000)
    })

    newSocket.on('error', (error: any) => {
      toast.error(error.message || 'Une erreur est survenue')
      console.error('Socket error:', error)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from game server')
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [gameId, isAuthenticated, router, user?.id])

  // Countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Check for BINGO
  useEffect(() => {
    if (bingoCard.length === 0) return

    const hasBingo = checkBingo(bingoCard)
    setCanClaim(hasBingo)
  }, [bingoCard])

  const checkBingo = (card: BingoCell[][]): boolean => {
    // Check rows
    for (let i = 0; i < 5; i++) {
      if (card[i].every((cell) => cell.marked)) return true
    }

    // Check columns
    for (let i = 0; i < 5; i++) {
      if (card.every((row) => row[i].marked)) return true
    }

    // Check diagonals
    if (card.every((row, i) => row[i].marked)) return true
    if (card.every((row, i) => row[4 - i].marked)) return true

    return false
  }

  const handleCellClick = (rowIndex: number, cellIndex: number) => {
    // Manual marking (optional)
    setBingoCard((prev) =>
      prev.map((row, ri) =>
        ri === rowIndex
          ? row.map((cell, ci) =>
              ci === cellIndex ? { ...cell, marked: !cell.marked } : cell
            )
          : row
      )
    )
  }

  const claimBingo = () => {
    if (!socket || !canClaim) return

    socket.emit('claimBingo', { gameId })
    toast.loading('Vérification du BINGO...')
  }

  const leaveGame = () => {
    if (socket) {
      socket.emit('leaveGame', { gameId })
      socket.disconnect()
    }
    router.push('/lobby')
  }

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement de la partie...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {game.type.replace('MINI_BINGO_', '')} Bingo
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">
                    Prize Pool: {Number(game.finalPrizePool).toLocaleString()} cr
                  </span>
                  {game.multiplier > 1 && (
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-sm font-bold">
                      x{game.multiplier}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {game.participants.length}/{game.maxPlayers} joueurs
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={leaveGame}
              className="bg-red-500/80 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Quitter
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {/* Game Status */}
            {game.status === 'WAITING' && (
              <div className="bg-yellow-500 text-yellow-900 rounded-2xl p-6 mb-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">
                  En attente de joueurs...
                </h2>
                <p>
                  {game.participants.length}/{game.maxPlayers} joueurs présents
                </p>
              </div>
            )}

            {game.status === 'STARTING' && countdown !== null && (
              <div className="bg-orange-500 text-white rounded-2xl p-6 mb-6 text-center">
                <Zap className="w-12 h-12 mx-auto mb-3" />
                <h2 className="text-4xl font-bold mb-2">{countdown}</h2>
                <p className="text-xl">La partie commence...</p>
              </div>
            )}

            {game.status === 'IN_PROGRESS' && game.currentNumber && (
              <div className="bg-white rounded-2xl p-6 mb-6 text-center shadow-xl">
                <div className="text-sm text-gray-600 mb-2">Dernier numéro tiré</div>
                <div className="text-7xl font-bold text-primary-600 mb-2">
                  {game.currentNumber}
                </div>
                <div className="text-sm text-gray-500">
                  {game.drawnNumbers.length} numéros tirés
                </div>
              </div>
            )}

            {game.status === 'COMPLETED' && game.winner && (
              <div className="bg-green-500 text-white rounded-2xl p-6 mb-6 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-3" />
                <h2 className="text-3xl font-bold mb-2">
                  {game.winner.username} a gagné ! 🎉
                </h2>
                <p className="text-xl">
                  Prize: {Number(game.finalPrizePool).toLocaleString()} crédits
                </p>
              </div>
            )}

            {/* Bingo Card */}
            {bingoCard.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Ta Grille</h3>
                  {canClaim && game.status === 'IN_PROGRESS' && (
                    <button
                      onClick={claimBingo}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg animate-pulse hover:scale-105 transition"
                    >
                      🎉 BINGO! Réclamer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {/* Column Headers */}
                  {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                    <div
                      key={letter}
                      className="bg-primary-500 text-white font-bold text-2xl py-3 rounded-lg text-center"
                    >
                      {letter}
                    </div>
                  ))}

                  {/* Bingo Cells */}
                  {bingoCard.map((row, rowIndex) =>
                    row.map((cell, cellIndex) => (
                      <button
                        key={`${rowIndex}-${cellIndex}`}
                        onClick={() => handleCellClick(rowIndex, cellIndex)}
                        className={`aspect-square rounded-lg text-2xl font-bold transition ${
                          cell.marked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {cell.number}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Drawn Numbers History */}
            {game.drawnNumbers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 mt-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Numéros tirés ({game.drawnNumbers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.drawnNumbers.slice().reverse().map((num, idx) => (
                    <div
                      key={idx}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        idx === 0
                          ? 'bg-primary-500 text-white text-xl'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Players Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Joueurs ({game.participants.length}/{game.maxPlayers})
              </h3>

              <div className="space-y-3">
                {game.participants.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      player.id === user?.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {player.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {player.username}
                        </span>
                        {player.isVip && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {player.id === user?.id && (
                          <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                            Toi
                          </span>
                        )}
                      </div>
                    </div>
                    {player.ready && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Game Info */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prize Pool:</span>
                  <span className="font-bold text-primary-600">
                    {Number(game.finalPrizePool).toLocaleString()} cr
                  </span>
                </div>
                {game.multiplier > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Multiplicateur:</span>
                    <span className="font-bold text-yellow-600">x{game.multiplier}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-bold text-gray-800">
                    {game.status === 'WAITING' && 'En attente'}
                    {game.status === 'STARTING' && 'Démarrage'}
                    {game.status === 'IN_PROGRESS' && 'En cours'}
                    {game.status === 'COMPLETED' && 'Terminée'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
