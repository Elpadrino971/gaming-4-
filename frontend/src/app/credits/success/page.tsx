'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ConfettiCanvas from '@/components/ConfettiCanvas'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
      <ConfettiCanvas />

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500/50 rounded-2xl shadow-2xl p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Paiement Réussi ! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-6"
        >
          Vos crédits ont été ajoutés à votre compte avec succès.
          Vous pouvez maintenant jouer à vos parties de bingo préférées !
        </motion.p>

        {/* Credits Received (if available) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 bg-purple-900/30 border border-purple-500/50 rounded-lg p-6"
        >
          <p className="text-purple-300 text-sm mb-2">Crédits reçus</p>
          <p className="text-5xl font-bold text-white">💰</p>
          <p className="text-gray-400 text-sm mt-2">
            Consultez votre solde dans votre tableau de bord
          </p>
        </motion.div>

        {/* Redirection Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <p className="text-gray-400 text-sm mb-4">
            Redirection vers le tableau de bord dans {countdown}s...
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all"
          >
            Tableau de bord
          </button>
          <button
            onClick={() => router.push('/bingo')}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Jouer maintenant
          </button>
        </div>

        {/* Email Confirmation Note */}
        <p className="text-gray-500 text-xs mt-6">
          Un email de confirmation vous a été envoyé avec le reçu de votre achat.
        </p>
      </motion.div>
    </div>
  )
}
