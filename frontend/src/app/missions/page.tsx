'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { CheckCircle, Circle, Gift, TrendingUp, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Mission {
  id: string
  mission: {
    id: string
    type: string
    frequency: string
    title: string
    description: string
    creditsReward: number
    xpReward: number
  }
  status: string
  currentValue: number
  targetValue: number
  expiresAt?: string
}

export default function MissionsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadMissions()
  }, [isAuthenticated])

  const loadMissions = async () => {
    try {
      const response = await api.get('/missions')
      setMissions(response.data)
    } catch (error) {
      console.error('Error loading missions:', error)
      toast.error('Erreur lors du chargement des missions')
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (missionId: string) => {
    try {
      const response = await api.post(`/missions/${missionId}/claim`)
      toast.success(
        `+${response.data.creditsEarned} crédits et +${response.data.xpEarned} XP !`,
        { icon: '🎉' }
      )
      loadMissions() // Reload to update status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la réclamation')
    }
  }

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'PLAY_GAMES':
        return '🎮'
      case 'WIN_GAMES':
        return '🏆'
      case 'DAILY_LOGIN':
        return '📅'
      case 'SPEND_CREDITS':
        return '💰'
      case 'REFER_FRIEND':
        return '👥'
      case 'SHOP_PURCHASE':
        return '🛍️'
      default:
        return '🎯'
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return 'bg-blue-500'
      case 'WEEKLY':
        return 'bg-purple-500'
      case 'MONTHLY':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const dailyMissions = missions.filter((m) => m.mission.frequency === 'DAILY')
  const weeklyMissions = missions.filter((m) => m.mission.frequency === 'WEEKLY')
  const otherMissions = missions.filter(
    (m) => !['DAILY', 'WEEKLY'].includes(m.mission.frequency)
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement des missions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎯 Missions</h1>
              <p className="text-lg opacity-90">
                Complète tes missions pour gagner des crédits et de l'XP !
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

        {/* Daily Missions */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-white" />
            <h2 className="text-3xl font-bold text-white">Missions Quotidiennes</h2>
          </div>
          <div className="grid gap-4">
            {dailyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={claimReward}
                icon={getMissionIcon(mission.mission.type)}
                frequencyColor={getFrequencyColor(mission.mission.frequency)}
              />
            ))}
          </div>
        </div>

        {/* Weekly Missions */}
        {weeklyMissions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Missions Hebdomadaires</h2>
            </div>
            <div className="grid gap-4">
              {weeklyMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onClaim={claimReward}
                  icon={getMissionIcon(mission.mission.type)}
                  frequencyColor={getFrequencyColor(mission.mission.frequency)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Missions */}
        {otherMissions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">Autres Missions</h2>
            </div>
            <div className="grid gap-4">
              {otherMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onClaim={claimReward}
                  icon={getMissionIcon(mission.mission.type)}
                  frequencyColor={getFrequencyColor(mission.mission.frequency)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MissionCard({
  mission,
  onClaim,
  icon,
  frequencyColor,
}: {
  mission: Mission
  onClaim: (id: string) => void
  icon: string
  frequencyColor: string
}) {
  const progress = (mission.currentValue / mission.targetValue) * 100

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl">{icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-800">
                {mission.mission.title}
              </h3>
              <span
                className={`${frequencyColor} text-white text-xs px-2 py-1 rounded-full`}
              >
                {mission.mission.frequency}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{mission.mission.description}</p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">
                  Progression: {mission.currentValue} / {mission.targetValue}
                </span>
                <span className="text-sm font-semibold text-primary-600">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">
                  {mission.mission.creditsReward} crédits
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="font-semibold">{mission.mission.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Icon & Button */}
        <div className="flex flex-col items-end gap-2">
          {mission.status === 'COMPLETED' && (
            <button
              onClick={() => onClaim(mission.id)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105"
            >
              Réclamer 🎁
            </button>
          )}
          {mission.status === 'CLAIMED' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-8 h-8" />
              <span className="font-semibold">Réclamé</span>
            </div>
          )}
          {mission.status === 'IN_PROGRESS' && (
            <Circle className="w-8 h-8 text-blue-500" />
          )}
          {mission.status === 'AVAILABLE' && (
            <Circle className="w-8 h-8 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  )
}
