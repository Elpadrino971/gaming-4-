'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { achievementsAPI } from '@/lib/api'
import { Trophy, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AchievementsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [unlocked, setUnlocked] = useState<any[]>([])
  const [inProgress, setInProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadAchievements()
  }, [isAuthenticated])

  const loadAchievements = async () => {
    try {
      const response = await achievementsAPI.getMy()
      setUnlocked(response.data.unlocked)
      setInProgress(response.data.inProgress)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🏆 Achievements</h1>
              <p className="text-lg">
                {unlocked.length} / {unlocked.length + inProgress.length} débloqués
              </p>
            </div>
            <Link href="/dashboard" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold">
              ← Retour
            </Link>
          </div>
        </div>

        {/* Unlocked */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Débloqués
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {unlocked.map((item: any) => (
              <div key={item.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl">{item.achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{item.achievement.name}</div>
                    <div className="text-sm text-gray-600">{item.achievement.description}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Débloqué le {new Date(item.unlockedAt).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex gap-2 mt-2">
                  {item.achievement.creditsReward > 0 && (
                    <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                      +{item.achievement.creditsReward} cr
                    </span>
                  )}
                  {item.achievement.xpReward > 0 && (
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      +{item.achievement.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-7 h-7 text-gray-400" />
            En cours
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {inProgress.map((item: any) => (
              <div key={item.id} className="bg-gray-50 border-2 border-gray-300 p-4 rounded-lg opacity-75">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl grayscale">{item.achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{item.achievement.name}</div>
                    <div className="text-sm text-gray-600">{item.achievement.description}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full"
                    style={{ width: `${(item.progress / item.target) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {item.progress} / {item.target}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
