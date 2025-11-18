'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { achievementsAPI } from '@/lib/api'
import { Trophy, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Card3D from '@/components/Card3D'
import GlassCard from '@/components/GlassCard'
import MeshGradient from '@/components/MeshGradient'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'

export default function AchievementsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [unlocked, setUnlocked] = useState<any[]>([])
  const [inProgress, setInProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const { impact } = useHaptics()
  const { playSuccess } = useSound()

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4 relative overflow-hidden">
        <MeshGradient colors={[
          'rgba(99, 102, 241, 0.4)',
          'rgba(139, 92, 246, 0.4)',
          'rgba(168, 85, 247, 0.4)',
          'rgba(192, 132, 252, 0.4)',
        ]} />
        <div className="max-w-6xl mx-auto relative z-10 mt-20">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4 relative overflow-hidden">
      <MeshGradient colors={[
        'rgba(99, 102, 241, 0.4)',
        'rgba(139, 92, 246, 0.4)',
        'rgba(168, 85, 247, 0.4)',
        'rgba(192, 132, 252, 0.4)',
      ]} />
      <div className="max-w-6xl mx-auto relative z-10">
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
        <GlassCard className="p-6 mb-6" hover={false}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-7 h-7 text-yellow-500" />
            </motion.div>
            Débloqués
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {unlocked.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card3D
                  className="h-48"
                  onFlip={(flipped) => {
                    impact('light')
                    if (flipped) {
                      playSuccess()
                    }
                  }}
                  front={
                    <div className="h-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 border-4 border-yellow-300 p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      <motion.div
                        className="text-7xl mb-2 relative z-10"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {item.achievement.icon}
                      </motion.div>
                      <div className="font-bold text-2xl text-white text-center drop-shadow-lg relative z-10">
                        {item.achievement.name}
                      </div>
                      <div className="text-sm text-yellow-100 mt-2 relative z-10">
                        Clique pour voir les détails
                      </div>
                    </div>
                  }
                  back={
                    <div className="h-full bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-4 border-yellow-400 p-6 rounded-2xl shadow-2xl flex flex-col justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                          {item.achievement.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {item.achievement.description}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Débloqué le {new Date(item.unlockedAt).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex gap-2">
                          {item.achievement.creditsReward > 0 && (
                            <span className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                              +{item.achievement.creditsReward} cr
                            </span>
                          )}
                          {item.achievement.xpReward > 0 && (
                            <span className="bg-blue-300 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                              +{item.achievement.xpReward} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* In Progress */}
        <GlassCard className="p-6" hover={false}>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-7 h-7 text-gray-400" />
            </motion.div>
            En cours
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {inProgress.map((item: any, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  {/* Progress glow */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20"
                    style={{ width: `${(item.progress / item.target) * 100}%` }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="text-4xl grayscale"
                        animate={{
                          filter: [`grayscale(100%)`, `grayscale(${100 - (item.progress / item.target) * 100}%)`]
                        }}
                      >
                        {item.achievement.icon}
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white">
                          {item.achievement.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {item.achievement.description}
                        </div>
                      </div>
                    </div>

                    {/* Animated progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.progress / item.target) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
                      >
                        {/* Progress shine */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {item.progress} / {item.target}
                      </div>
                      <div className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {Math.round((item.progress / item.target) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
