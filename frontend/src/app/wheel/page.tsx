'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { wheelAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import FloatingElement from '@/components/FloatingElement'
import ParticleExplosion from '@/components/ParticleExplosion'
import MeshGradient from '@/components/MeshGradient'
import InteractiveButton from '@/components/InteractiveButton'
import ConfettiCanvas from '@/components/ConfettiCanvas'
import CreditsRain from '@/components/CreditsRain'
import Starfield from '@/components/Starfield'
import { useHaptics } from '@/hooks/useHaptics'
import { useSound } from '@/hooks/useSound'
import { useSwipeNavigation } from '@/hooks/useGesture'
import { isDevelopment, DEV_USER } from '@/lib/dev'

export default function WheelPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [spinsRemaining, setSpinsRemaining] = useState(10)
  const [maxSpins, setMaxSpins] = useState(10)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [showParticles, setShowParticles] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCreditsRain, setShowCreditsRain] = useState(false)
  const [creditsAmount, setCreditsAmount] = useState(0)

  const { impact, notification, vibrate } = useHaptics()
  const { playSpin, playWin, playJackpot, playSuccess, playTick } = useSound()

  // Swipe navigation
  useSwipeNavigation({
    left: '/achievements',
    right: '/dashboard'
  })

  useEffect(() => {
    // AUTO-LOGIN - No auth required!
    if (!user) {
      setUser(DEV_USER)
    }
  }, [user, setUser])

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
      impact('heavy')
      return
    }

    setSpinning(true)
    setResult(null)
    setShowParticles(false)
    setShowConfetti(false)
    setShowCreditsRain(false)

    // Heavy haptic feedback on spin start
    impact('heavy')

    // Play spinning sound
    playSpin()

    // Ticking haptic feedback during spin
    const tickInterval = setInterval(() => {
      impact('light')
      playTick()
    }, 200)

    try {
      // Generate random reward (no API needed!)
      const rewards = [
        { type: 'JACKPOT', value: 1000, label: 'JACKPOT 1000 CRÉDITS!' },
        { type: 'CREDITS', value: 100, label: '100 Crédits' },
        { type: 'CREDITS', value: 50, label: '50 Crédits' },
        { type: 'CREDITS', value: 25, label: '25 Crédits' },
        { type: 'CREDITS', value: 10, label: '10 Crédits' },
        { type: 'FREE_GAME', value: 1, label: 'Partie Gratuite' },
        { type: 'VIP_DAY', value: 1, label: '1 Jour VIP' },
        { type: 'XP', value: 50, label: '50 XP' },
      ]
      const reward = rewards[Math.floor(Math.random() * rewards.length)]

      // Simulate spin animation
      setTimeout(() => {
        clearInterval(tickInterval)

        setResult(reward)
        setSpinning(false)
        setSpinsRemaining((prev) => prev - 1)

        // Different feedback based on reward type
        if (reward.type === 'JACKPOT') {
          // JACKPOT - Epic celebration! 🎰🎉
          vibrate(500) // Long vibration
          playJackpot()
          notification('success')
          setShowParticles(true)
          setShowConfetti(true)
          setShowCreditsRain(true)
          setCreditsAmount(reward.value)
          toast.success(`🎰 JACKPOT! ${reward.value} crédits!`, { duration: 5000 })
        } else if (reward.value >= 50) {
          // Big win - Confetti + Particles
          playWin()
          notification('success')
          setShowParticles(true)
          setShowConfetti(true)
          setShowCreditsRain(true)
          setCreditsAmount(reward.value)
          toast.success(`${reward.label} gagné !`, { duration: 5000 })
        } else if (reward.value >= 20) {
          // Medium win - Just confetti
          playSuccess()
          impact('medium')
          setShowConfetti(true)
          toast.success(`${reward.label} gagné !`, { duration: 5000 })
        } else {
          // Normal win - Minimal feedback
          playSuccess()
          impact('medium')
          toast.success(`${reward.label} gagné !`, { duration: 5000 })
        }

        loadData()
      }, 3000)
    } catch (error: any) {
      clearInterval(tickInterval)
      toast.error(error.response?.data?.message || 'Erreur lors du spin')
      notification('error')
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4 relative overflow-hidden">
      {/* Starfield background */}
      <Starfield starCount={150} speed={0.3} />

      {/* Animated mesh background */}
      <MeshGradient />

      {/* Confetti and effects */}
      <ConfettiCanvas trigger={showConfetti} duration={4000} particleCount={200} />
      <CreditsRain trigger={showCreditsRain} amount={creditsAmount} duration={2.5} />

      <div className="max-w-4xl mx-auto relative z-10">
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
        <GlassCard className="p-8 mb-6" hover={false} glow={spinning}>
          <div
            className="relative mx-auto w-80 h-80"
            style={{ perspective: '1000px' }}
          >
            {/* 3D Wheel Container */}
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                rotateY: spinning ? 360 : 0,
                rotateZ: spinning ? 1440 : 0,
              }}
              transition={{
                duration: 3,
                ease: 'easeOut',
                rotateY: { repeat: spinning ? Infinity : 0, duration: 3 },
                rotateZ: { duration: 3 }
              }}
            >
              {/* Wheel Circle with 3D depth */}
              <div
                className="absolute inset-0 rounded-full border-8 border-yellow-400 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-2xl"
                style={{
                  boxShadow: spinning
                    ? '0 0 60px rgba(234, 179, 8, 0.8), 0 0 100px rgba(234, 179, 8, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.5)'
                    : '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.3)',
                  transform: 'translateZ(20px)'
                }}
              >
                {/* Wheel segments */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 overflow-hidden">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="absolute inset-0"
                      style={{
                        background: i % 2 === 0
                          ? 'linear-gradient(to right, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3))'
                          : 'linear-gradient(to right, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3))',
                        transform: `rotate(${i * 45}deg)`,
                        clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)'
                      }}
                    />
                  ))}
                </div>

                {/* Center icon with float effect */}
                <FloatingElement className="absolute inset-0 flex items-center justify-center" duration={2}>
                  <motion.div
                    className="text-7xl"
                    animate={{
                      scale: spinning ? [1, 1.2, 1] : 1,
                      rotate: spinning ? [0, 10, -10, 0] : 0
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: spinning ? Infinity : 0
                    }}
                  >
                    {spinning ? '🎲' : '🎰'}
                  </motion.div>
                </FloatingElement>

                {/* Inner glow ring */}
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                    animation: spinning ? 'glow 1s ease-in-out infinite' : 'none'
                  }}
                />
              </div>

              {/* 3D depth rings */}
              <div
                className="absolute inset-0 rounded-full border-4 border-yellow-500/30"
                style={{ transform: 'translateZ(10px)' }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-yellow-600/20"
                style={{ transform: 'translateZ(5px)' }}
              />
            </motion.div>

            {/* Pointer with 3D effect */}
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20"
              animate={{
                y: spinning ? [0, 10, 0] : 0,
              }}
              transition={{
                duration: 0.3,
                repeat: spinning ? Infinity : 0
              }}
              style={{ transform: 'translateZ(50px)' }}
            >
              <div className="relative">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-transparent border-t-red-500 drop-shadow-2xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-transparent border-t-red-400" />
              </div>
            </motion.div>
          </div>

          {/* Particle explosion effect */}
          <ParticleExplosion
            trigger={showParticles}
            particleCount={100}
            duration={3}
            spread={400}
            colors={['#fbbf24', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#3b82f6']}
          />

          {/* Spin Button */}
          <div className="text-center mt-8">
            <InteractiveButton
              onClick={spin}
              disabled={spinning || spinsRemaining === 0}
              variant="primary"
              size="xl"
              hapticStyle="heavy"
              playSound={false}
            >
              {spinning ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Tournez, tournez...
                </span>
              ) : spinsRemaining === 0 ? (
                'Plus de tours aujourd\'hui'
              ) : (
                'TOURNER LA ROUE! 🎰'
              )}
            </InteractiveButton>
          </div>

          {/* Result Display */}
          {result && !spinning && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 relative"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-6 text-center relative overflow-hidden"
                animate={{
                  y: [0, -10, 0],
                  rotateX: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)'
                }}
              >
                {/* Confetti effect background */}
                <div className="absolute inset-0 opacity-20">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>

                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  {getRewardIcon(result.type)}
                </motion.div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {result.label}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {result.type === 'CREDITS' && `+${result.value} crédits ajoutés !`}
                  {result.type === 'FREE_GAME' && `Partie gratuite débloquée !`}
                  {result.type === 'VIP_DAY' && `1 jour de VIP offert !`}
                  {result.type === 'JACKPOT' && `🎰 JACKPOT MASSIF! ${result.value} crédits!`}
                  {result.type === 'XP' && `+${result.value} XP gagnés !`}
                </div>
              </motion.div>
            </motion.div>
          )}
        </GlassCard>

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
