'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CreditPackage {
  id: string
  credits: number
  price: number
  pricePerCredit: string
  bonus: string | null
}

export default function BuyCreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/stripe/packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const handleSelectPackage = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ packageId: pkg.id }),
      })

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      alert('Erreur lors de la création du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedPackage(null)
    setClientSecret(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4"
          >
            💰 Acheter des Crédits
          </motion.h1>
          <p className="text-gray-300 text-lg">
            Rechargez votre compte et jouez à plus de parties de bingo !
          </p>
        </div>

        {/* Package Selection */}
        {!selectedPackage && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleSelectPackage(pkg)}
                className={`relative cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${
                  pkg.id === 'POPULAR'
                    ? 'border-yellow-500 ring-4 ring-yellow-500/30'
                    : 'border-purple-500/50'
                } rounded-xl p-6 text-center hover:border-purple-400 transition-all`}
              >
                {pkg.id === 'POPULAR' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    ⭐ POPULAIRE
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-5xl font-bold text-white mb-2">{pkg.credits}</p>
                  <p className="text-gray-400 text-sm">Crédits</p>
                </div>

                {pkg.bonus && (
                  <div className="mb-3 bg-green-900/30 border border-green-500/50 rounded-lg py-2 px-3">
                    <p className="text-green-400 text-xs font-semibold">🎁 {pkg.bonus}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-400">{pkg.price.toFixed(2)}€</p>
                  <p className="text-gray-500 text-xs mt-1">{pkg.pricePerCredit}€ / crédit</p>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all">
                  Acheter
                </button>

                {pkg.id === 'STARTER' && (
                  <p className="text-gray-500 text-xs mt-3">Parfait pour commencer</p>
                )}
                {pkg.id === 'MEGA' && (
                  <p className="text-yellow-400 text-xs mt-3 font-semibold">Meilleure valeur !</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Payment Form */}
        {selectedPackage && clientSecret && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gray-800/50 border border-purple-500/30 rounded-2xl p-8"
          >
            <button
              onClick={handleBack}
              className="mb-6 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              ← Retour aux packages
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedPackage.credits} Crédits
              </h2>
              <p className="text-3xl font-bold text-purple-400">{selectedPackage.price.toFixed(2)}€</p>
              {selectedPackage.bonus && (
                <p className="text-green-400 text-sm mt-2">🎁 {selectedPackage.bonus}</p>
              )}
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#a855f7',
                    colorBackground: '#1f2937',
                    colorText: '#ffffff',
                    colorDanger: '#ef4444',
                  },
                },
              }}
            >
              <CheckoutForm
                amount={selectedPackage.price}
                credits={selectedPackage.credits}
              />
            </Elements>
          </motion.div>
        )}

        {/* Secure Payment Badges */}
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center gap-6 mb-4">
            <div className="text-gray-400 text-sm">🔒 Paiement 100% sécurisé</div>
            <div className="text-gray-400 text-sm">💳 3D Secure</div>
            <div className="text-gray-400 text-sm">⚡ Crédits instantanés</div>
          </div>
          <div className="flex justify-center items-center gap-4">
            <span className="text-gray-500 text-xs">Powered by</span>
            <span className="text-purple-400 font-bold">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Checkout Form Component
function CheckoutForm({ amount, credits }: { amount: number; credits: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/credits/success`,
      },
    })

    if (error) {
      setErrorMessage(error.message || 'Une erreur est survenue')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement en cours...
          </span>
        ) : (
          `Payer ${amount.toFixed(2)}€ et recevoir ${credits} crédits`
        )}
      </button>

      <p className="text-gray-500 text-xs text-center">
        En cliquant sur "Payer", vous acceptez nos conditions générales de vente.
        Votre paiement est sécurisé par Stripe (3D Secure).
      </p>
    </form>
  )
}
