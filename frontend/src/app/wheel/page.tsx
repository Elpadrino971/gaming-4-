'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { wheelAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function WheelPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [spinsRemaining, setSpinsRemaining] = useState(0)
  const [maxSpins, setMaxSpins] = useState(1)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [spinsRes, historyRes] = await Promise.all([
        wheelAPI.canSpin(),
        wheelAPI.getHistory(5),
      ])

      setSpinsRemaining(spinsRes.data.spinsRemaining)
      setMaxSpins(spinsRes.data.maxSpins)
      setHistory(historyRes.data)
    } catch (error) {
      console.error('Error loading wheel:', error)
      toast.error('Erreur lors du chargement')
    }
  }

  const spin = async () => {
    if (spinsRemaining === 0) {
      toast.error('Plus de tours disponibles aujourd\'hui!')
      return
    }

    setSpinning(true)
    setResult(null)

    try {
      const response = await wheelAPI.spin()
      const reward = response.data.reward

      // Simulate spin animation
      setTimeout(() => {
        setResult(reward)
        setSpinning(false)
        setSpinsRemaining((prev) => prev - 1)

        // Show reward toast
        const message =
          reward.type === 'JACKPOT'
            ? `🎰 JACKPOT! ${reward.value} crédits!`
            : `${reward.label} gagné !`

        toast.success(message, { duration: 5000 })

        loadData()
      }, 3000)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du spin')
      setSpinning(false)
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'CREDITS':
        return '💰'
      case 'FREE_GAME':
        return '🎟️'
      case 'VIP_DAY':
        return '👑'
      case 'JACKPOT':
        return '🎰'
      case 'XP':
        return '⭐'
      default:
        return '🎁'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎰 Roue de la Fortune</h1>
              <p className="text-lg opacity-90">
                Tente ta chance quotidienne !
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {/* Spins Info */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl text-center">
          <div className="text-sm text-gray-600 mb-2">Tours Disponibles</div>
          <div className="text-6xl font-bold text-primary-600 mb-4">
            {spinsRemaining}/{maxSpins}
          </div>
          {user?.isVip && (
            <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
              👑 VIP: +1 tour/jour
            </div>
          )}
        </div>

        {/* Wheel */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-xl">
          <div className="relative mx-auto w-80 h-80">
            {/* Wheel Circle */}
            <div
              className={`absolute inset-0 rounded-full border-8 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-2xl ${
                spinning ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '3s' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">{spinning ? '🎲' : '🎰'}</div>
              </div>
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-500"></div>
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center mt-8">
            <button
              onClick={spin}
              disabled={spinning || spinsRemaining === 0}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {spinning ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Tournez, tournez...
                </span>
              ) : spinsRemaining === 0 ? (
                'Plus de tours aujourd\'hui'
              ) : (
                'TOURNER LA ROUE! 🎰'
              )}
            </button>
          </div>

          {/* Result Display */}
          {result && !spinning && (
            <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 text-center animate-bounce">
              <div className="text-6xl mb-4">{getRewardIcon(result.type)}</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {result.label}
              </div>
              <div className="text-gray-600">
                {result.type === 'CREDITS' && `+${result.value} crédits ajoutés !`}
                {result.type === 'FREE_GAME' && `Partie gratuite débloquée !`}
                {result.type === 'VIP_DAY' && `1 jour de VIP offert !`}
                {result.type === 'JACKPOT' && `🎰 JACKPOT MASSIF! ${result.value} crédits!`}
                {result.type === 'XP' && `+${result.value} XP gagnés !`}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Historique Récent
            </h3>
            <div className="space-y-2">
              {history.map((spin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getRewardIcon(spin.rewardType)}</div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {spin.rewardType === 'CREDITS' && `${spin.rewardValue} Crédits`}
                        {spin.rewardType === 'FREE_GAME' && `Partie Gratuite`}
                        {spin.rewardType === 'VIP_DAY' && `1 Jour VIP`}
                        {spin.rewardType === 'JACKPOT' && `JACKPOT!`}
                        {spin.rewardType === 'XP' && `${spin.rewardValue} XP`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(spin.spunAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prizes Info */}
        <div className="bg-white rounded-2xl p-6 mt-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            🎁 Prix Disponibles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold text-gray-800">10-100 Crédits</div>
              <div className="text-sm text-gray-600">80% chance</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🎟️</div>
              <div className="font-bold text-gray-800">Partie Gratuite</div>
              <div className="text-sm text-gray-600">15% chance</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">👑</div>
              <div className="font-bold text-gray-800">1 Jour VIP</div>
              <div className="text-sm text-gray-600">4% chance</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center border-2 border-red-400">
              <div className="text-3xl mb-2">🎰</div>
              <div className="font-bold text-gray-800">JACKPOT 1000cr</div>
              <div className="text-sm text-gray-600">1% chance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
