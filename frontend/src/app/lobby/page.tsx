'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { gamesAPI } from '@/lib/api'
import { Zap, Crown, Rocket, Gift, Users, Coins, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface GameType {
  id: string
  name: string
  description: string
  entryFee: number
  rake: number
  multipliers: string
  minPlayers: number
  maxPlayers: number
  icon: any
  color: string
  gradient: string
}

const GAME_TYPES: GameType[] = [
  {
    id: 'STANDARD',
    name: 'Bingo Standard',
    description: 'Partie classique, rake 30%, multiplicateurs équilibrés',
    entryFee: 100,
    rake: 30,
    multipliers: 'x1 (60%), x2 (30%), x5 (10%)',
    minPlayers: 3,
    maxPlayers: 12,
    icon: Zap,
    color: 'from-blue-500 to-blue-700',
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-700',
  },
  {
    id: 'PREMIUM',
    name: 'Bingo Premium',
    description: 'Gros gains, rake 25%, multiplicateurs jusqu\'à x10',
    entryFee: 500,
    rake: 25,
    multipliers: 'x1 à x10',
    minPlayers: 3,
    maxPlayers: 12,
    icon: Crown,
    color: 'from-purple-500 to-purple-700',
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-700',
  },
  {
    id: 'SPEED',
    name: 'Bingo Speed',
    description: 'Parties ultra-rapides, rake 35%, multiplicateurs limités',
    entryFee: 50,
    rake: 35,
    multipliers: 'x1 (80%), x2 (20%)',
    minPlayers: 3,
    maxPlayers: 8,
    icon: Rocket,
    color: 'from-orange-500 to-red-600',
    gradient: 'bg-gradient-to-r from-orange-500 to-red-600',
  },
  {
    id: 'FREE',
    name: 'Bingo Gratuit',
    description: '1 partie gratuite par jour, gains limités',
    entryFee: 0,
    rake: 0,
    multipliers: 'x1 uniquement',
    minPlayers: 3,
    maxPlayers: 12,
    icon: Gift,
    color: 'from-green-500 to-green-700',
    gradient: 'bg-gradient-to-r from-green-500 to-green-700',
  },
]

export default function LobbyPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadGames()
    // Refresh every 5 seconds
    const interval = setInterval(loadGames, 5000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const loadGames = async () => {
    try {
      const response = await gamesAPI.getAvailableGames()
      setGames(response.data)
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGame = async (gameType: string) => {
    setCreating(gameType)
    try {
      const response = await gamesAPI.createGame({ gameType })
      toast.success('Partie créée ! Redirection...')
      // Redirect to game room
      router.push(`/game/${response.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création')
      setCreating(null)
    }
  }

  const joinGame = async (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎮 Lobby de Jeux</h1>
              <p className="text-lg opacity-90">
                Choisis ton type de partie et amuse-toi !
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-sm opacity-80">Tes crédits</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  {Number(user?.credits || 0).toLocaleString()}
                </div>
              </div>
              <Link
                href="/dashboard"
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Game Types */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {GAME_TYPES.map((type) => {
            const Icon = type.icon
            const typeGames = games.filter((g) => g.type === `MINI_BINGO_${type.id}`)

            return (
              <div
                key={type.id}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className={`${type.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-10 h-10" />
                      <div>
                        <h2 className="text-2xl font-bold">{type.name}</h2>
                        <p className="opacity-90 text-sm">{type.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="opacity-80">Entry Fee</div>
                      <div className="font-bold text-lg">
                        {type.entryFee > 0 ? `${type.entryFee} cr` : 'GRATUIT'}
                      </div>
                    </div>
                    <div>
                      <div className="opacity-80">Rake</div>
                      <div className="font-bold text-lg">{type.rake}%</div>
                    </div>
                    <div>
                      <div className="opacity-80">Joueurs</div>
                      <div className="font-bold text-lg">
                        {type.minPlayers}-{type.maxPlayers}
                      </div>
                    </div>
                    <div>
                      <div className="opacity-80">Multiplicateurs</div>
                      <div className="font-bold text-sm">{type.multipliers}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Active Games */}
                  {typeGames.length > 0 ? (
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-700 mb-3">
                        Parties en attente ({typeGames.length})
                      </h3>
                      <div className="space-y-2">
                        {typeGames.slice(0, 3).map((game) => (
                          <div
                            key={game.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-gray-500" />
                              <div>
                                <div className="font-semibold text-sm">
                                  {game.participants?.length || 0}/{game.maxPlayers}{' '}
                                  joueurs
                                </div>
                                <div className="text-xs text-gray-500">
                                  Prize: {Number(game.finalPrizePool).toLocaleString()} cr
                                  {game.multiplier > 1 && ` (x${game.multiplier})`}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => joinGame(game.id)}
                              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                            >
                              Rejoindre
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucune partie en attente
                    </div>
                  )}

                  {/* Create Game Button */}
                  <button
                    onClick={() => createGame(type.id)}
                    disabled={creating === type.id || (type.id === 'FREE' && user?.credits === 0)}
                    className={`w-full ${type.gradient} text-white py-3 rounded-lg font-bold text-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {creating === type.id
                      ? 'Création...'
                      : type.id === 'FREE'
                      ? 'Créer une partie gratuite'
                      : `Créer une partie (${type.entryFee} cr)`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">ℹ️ Comment jouer ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-2">1️⃣</div>
              <h3 className="font-bold mb-2">Choisis ton type de partie</h3>
              <p className="text-sm opacity-90">
                Standard pour l'équilibre, Premium pour les gros gains, Speed pour la
                rapidité, ou Gratuit pour tester !
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">2️⃣</div>
              <h3 className="font-bold mb-2">Rejoins ou crée une partie</h3>
              <p className="text-sm opacity-90">
                Attends que le minimum de joueurs soit atteint pour que la partie
                commence.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">3️⃣</div>
              <h3 className="font-bold mb-2">Gagne et empoche tes crédits !</h3>
              <p className="text-sm opacity-90">
                Sois le premier à faire BINGO pour remporter le prize pool ! Les VIP
                gagnent +20% de bonus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
