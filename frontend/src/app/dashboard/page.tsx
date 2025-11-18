'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { usersAPI, creditsAPI, gamesAPI } from '@/lib/api'
import { Coins, Trophy, Flame, TrendingUp, Crown, Gift } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import ParallaxContainer from '@/components/ParallaxContainer'
import FloatingElement from '@/components/FloatingElement'
import MeshGradient from '@/components/MeshGradient'
import SkeletonLoader from '@/components/SkeletonLoader'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [creditStats, setCreditStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [userStats, credits] = await Promise.all([
        usersAPI.getStats(),
        creditsAPI.getStats(),
      ])

      setStats(userStats.data)
      setCreditStats(credits.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4 relative overflow-hidden">
        <MeshGradient />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-6 mb-6 mt-20">
            <SkeletonLoader variant="stat" />
            <SkeletonLoader variant="stat" />
            <SkeletonLoader variant="stat" />
            <SkeletonLoader variant="stat" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4 relative overflow-hidden">
      <MeshGradient />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bonjour, {user?.username || 'Joueur'} !
                {user?.isVip && <Crown className="inline ml-2 text-yellow-400" />}
              </h1>
              <p className="opacity-80">Bienvenue sur ton tableau de bord</p>
            </div>
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
            >
              Retour
            </Link>
          </div>
        </div>

        {/* Streak Display */}
        {user?.loginStreak && user.loginStreak > 0 && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Flame className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.loginStreak} jours consécutifs ! 🔥
                  </h2>
                  <p className="opacity-90">
                    Record personnel : {user.maxStreak || user.loginStreak} jours
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">+{getStreakBonus(user.loginStreak)} cr</div>
                <div className="text-sm opacity-80">Bonus demain</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          {/* Credits */}
          <ParallaxContainer speed={0.3}>
            <GlassCard className="p-6">
              <FloatingElement delay={0} duration={3}>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Coins className="w-8 h-8 text-yellow-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Crédits</h3>
                </div>
                <motion.div
                  className="text-3xl font-bold text-primary-600 dark:text-primary-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  {Number(user?.credits || 0).toLocaleString()}
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ≈ {(Number(user?.credits || 0) * 0.01).toFixed(2)}€
                </div>
              </FloatingElement>
            </GlassCard>
          </ParallaxContainer>

          {/* Games Played */}
          <ParallaxContainer speed={0.4}>
            <GlassCard className="p-6">
              <FloatingElement delay={0.1} duration={3.2}>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Parties</h3>
                </div>
                <motion.div
                  className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  {stats?.totalGamesPlayed || 0}
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats?.totalWins || 0} victoires
                </div>
              </FloatingElement>
            </GlassCard>
          </ParallaxContainer>

          {/* Win Rate */}
          <ParallaxContainer speed={0.5}>
            <GlassCard className="p-6">
              <FloatingElement delay={0.2} duration={3.4}>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Taux victoire</h3>
                </div>
                <motion.div
                  className="text-3xl font-bold text-green-600 dark:text-green-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                >
                  {stats?.winRate?.toFixed(1) || 0}%
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Performance</div>
              </FloatingElement>
            </GlassCard>
          </ParallaxContainer>

          {/* Level */}
          <ParallaxContainer speed={0.6}>
            <GlassCard className="p-6" glow>
              <FloatingElement delay={0.3} duration={3.6}>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Gift className="w-8 h-8 text-purple-500" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Niveau</h3>
                </div>
                <motion.div
                  className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                >
                  {user?.level || 'BRONZE'}
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.xp || 0} XP</div>
              </FloatingElement>
            </GlassCard>
          </ParallaxContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Link href="/lobby">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-primary-700 text-white p-8 rounded-2xl shadow-xl cursor-pointer relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: '0 25px 50px rgba(14, 165, 233, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-400/30 to-primary-600/30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">🎮 Jouer</h3>
                <p className="opacity-90">Rejoins une partie de bingo maintenant !</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/missions">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-orange-700 text-white p-8 rounded-2xl shadow-xl cursor-pointer relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: '0 25px 50px rgba(249, 115, 22, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-orange-600/30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 0.5
                }}
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">🎯 Missions</h3>
                <p className="opacity-90">Complète tes missions quotidiennes</p>
              </div>
            </motion.div>
          </Link>

          <Link href="/shop">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-8 rounded-2xl shadow-xl cursor-pointer relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: '0 25px 50px rgba(168, 85, 247, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-purple-600/30"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 1
                }}
              />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">🛍️ Boutique</h3>
                <p className="opacity-90">Dépense tes crédits maintenant</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* VIP Banner if not VIP */}
        {!user?.isVip && (
          <Link
            href="/vip"
            className="block bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 mb-6 text-center hover:shadow-2xl transition transform hover:scale-105"
          >
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-900" />
            <h2 className="text-3xl font-bold text-yellow-900 mb-2">
              Deviens VIP pour 9,99€/mois
            </h2>
            <p className="text-yellow-900 text-lg mb-4">
              +20% sur tous les gains, partie gratuite quotidienne, et plus !
            </p>
            <div className="inline-block bg-yellow-900 text-yellow-100 px-8 py-3 rounded-lg font-bold text-lg">
              Découvrir les avantages →
            </div>
          </Link>
        )}

        {/* Credit Stats */}
        {creditStats && (
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Statistiques de Crédits
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total gagné</div>
                <div className="text-2xl font-bold text-green-600">
                  {creditStats.totalEarned?.toLocaleString() || 0} cr
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total dépensé</div>
                <div className="text-2xl font-bold text-red-600">
                  {creditStats.totalSpent?.toLocaleString() || 0} cr
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Transactions</div>
                <div className="text-2xl font-bold text-blue-600">
                  {creditStats.transactionCount || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getStreakBonus(streak: number): number {
  const bonuses: Record<number, number> = {
    1: 10,
    2: 20,
    3: 30,
    7: 100,
    14: 250,
    30: 1000,
  }
  return bonuses[streak + 1] || (streak + 1) * 10
}
