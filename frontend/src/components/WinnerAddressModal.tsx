'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AddressForm from './AddressForm'

interface Address {
  id: string
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
  phoneNumber: string
  isDefault: boolean
}

interface WinnerAddressModalProps {
  isOpen: boolean
  onClose: () => void
  prizeDescription: string
  prizeValue: number
  onAddressSubmitted?: () => void
}

export default function WinnerAddressModal({
  isOpen,
  onClose,
  prizeDescription,
  prizeValue,
  onAddressSubmitted,
}: WinnerAddressModalProps) {
  const [step, setStep] = useState<'congratulations' | 'address' | 'confirmation'>('congratulations')
  const [existingAddress, setExistingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [useExisting, setUseExisting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setStep('congratulations')
      setUseExisting(false)
      // Check if user has default address
      fetchDefaultAddress()
    }
  }, [isOpen])

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch('/api/addresses/default', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const address = await response.json()
        setExistingAddress(address)
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    }
  }

  const handleContinue = () => {
    setStep('address')
  }

  const handleUseExisting = async () => {
    setIsLoading(true)
    try {
      // You can add an API call here to confirm the address for this win
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setStep('confirmation')
      setTimeout(() => {
        onAddressSubmitted?.()
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save address')
      }

      setStep('confirmation')
      setTimeout(() => {
        onAddressSubmitted?.()
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Erreur lors de l\'enregistrement de l\'adresse. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30"
        >
          {/* Congratulations Step */}
          {step === 'congratulations' && (
            <div className="p-8 text-center">
              {/* Confetti Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4"
              >
                FÉLICITATIONS !
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-white mb-2"
              >
                Vous avez gagné :
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-8 py-4 mb-6"
              >
                <p className="text-3xl font-bold text-white">{prizeDescription}</p>
                <p className="text-lg text-purple-200">Valeur : {prizeValue.toFixed(2)}€</p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-300 mb-8"
              >
                Pour recevoir votre lot, nous avons besoin de votre adresse de livraison
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xl font-bold rounded-lg transition-all shadow-lg"
              >
                Continuer
              </motion.button>
            </div>
          )}

          {/* Address Step */}
          {step === 'address' && (
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-2">Adresse de livraison</h2>
              <p className="text-gray-400 mb-6">Veuillez indiquer où vous souhaitez recevoir votre lot</p>

              {existingAddress && !useExisting && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg"
                >
                  <p className="text-sm text-gray-300 mb-3">Vous avez déjà une adresse enregistrée :</p>
                  <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                    <p className="text-white font-semibold">{existingAddress.fullName}</p>
                    <p className="text-gray-300 text-sm">{existingAddress.addressLine1}</p>
                    {existingAddress.addressLine2 && (
                      <p className="text-gray-300 text-sm">{existingAddress.addressLine2}</p>
                    )}
                    <p className="text-gray-300 text-sm">
                      {existingAddress.postalCode} {existingAddress.city}
                    </p>
                    <p className="text-gray-300 text-sm">{existingAddress.phoneNumber}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUseExisting}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Confirmation...' : 'Utiliser cette adresse'}
                    </button>
                    <button
                      onClick={() => setUseExisting(true)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Nouvelle adresse
                    </button>
                  </div>
                </motion.div>
              )}

              {(!existingAddress || useExisting) && (
                <AddressForm
                  onSubmit={handleAddressSubmit}
                  onCancel={() => {
                    if (existingAddress) {
                      setUseExisting(false)
                    } else {
                      onClose()
                    }
                  }}
                  submitLabel="Confirmer et recevoir mon lot"
                  isLoading={isLoading}
                />
              )}
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 0.6 }}
                className="text-8xl mb-6"
              >
                ✅
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-4">C'est confirmé !</h2>
              <p className="text-gray-300 mb-2">Votre adresse a été enregistrée avec succès</p>
              <p className="text-purple-400 font-semibold mb-8">
                Votre lot sera expédié dans les 48h ouvrées
              </p>

              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-6">
                <p className="text-sm text-gray-400 mb-2">Vous recevrez un email de confirmation avec :</p>
                <ul className="text-left text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Numéro de suivi Colissimo
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Délai de livraison estimé
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Récapitulatif de votre commande
                  </li>
                </ul>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-gray-500 mt-6"
              >
                Fermeture automatique dans 3 secondes...
              </motion.p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
