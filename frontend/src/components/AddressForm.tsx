'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddressFormData {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
  phoneNumber: string
  isDefault?: boolean
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  isLoading?: boolean
}

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: initialData?.fullName || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'FR',
    phoneNumber: initialData?.phoneNumber || '',
    isDefault: initialData?.isDefault || false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {}

    if (!formData.fullName || formData.fullName.length < 2) {
      newErrors.fullName = 'Le nom complet est requis (min. 2 caractères)'
    }

    if (!formData.addressLine1 || formData.addressLine1.length < 5) {
      newErrors.addressLine1 = 'L\'adresse est requise (min. 5 caractères)'
    }

    if (!formData.city || formData.city.length < 2) {
      newErrors.city = 'La ville est requise'
    }

    if (formData.country === 'FR') {
      if (!/^[0-9]{5}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'Code postal invalide (5 chiffres requis)'
      }
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis'
    } else if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Format invalide (ex: 06 12 34 56 78)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting address:', error)
    }
  }

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-1">
          Nom complet *
        </label>
        <input
          type="text"
          id="fullName"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className={`w-full px-4 py-2 bg-gray-700 border ${
            errors.fullName ? 'border-red-500' : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          placeholder="Jean Dupont"
          disabled={isLoading}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-200 mb-1">
          Adresse *
        </label>
        <input
          type="text"
          id="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => handleChange('addressLine1', e.target.value)}
          className={`w-full px-4 py-2 bg-gray-700 border ${
            errors.addressLine1 ? 'border-red-500' : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          placeholder="123 Rue de la République"
          disabled={isLoading}
        />
        {errors.addressLine1 && (
          <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 (Optional) */}
      <div>
        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-200 mb-1">
          Complément d'adresse (optionnel)
        </label>
        <input
          type="text"
          id="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => handleChange('addressLine2', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Appartement 12, Bâtiment B"
          disabled={isLoading}
        />
      </div>

      {/* City and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-200 mb-1">
            Code postal *
          </label>
          <input
            type="text"
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            maxLength={5}
            className={`w-full px-4 py-2 bg-gray-700 border ${
              errors.postalCode ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="75001"
            disabled={isLoading}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-1">
            Ville *
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border ${
              errors.city ? 'border-red-500' : 'border-gray-600'
            } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="Paris"
            disabled={isLoading}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-200 mb-1">
          Téléphone *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          className={`w-full px-4 py-2 bg-gray-700 border ${
            errors.phoneNumber ? 'border-red-500' : 'border-gray-600'
          } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
          placeholder="06 12 34 56 78"
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Country (Currently only France) */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-200 mb-1">
          Pays *
        </label>
        <select
          id="country"
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        >
          <option value="FR">France</option>
          <option value="BE">Belgique</option>
          <option value="CH">Suisse</option>
          <option value="LU">Luxembourg</option>
        </select>
      </div>

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => handleChange('isDefault', e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          disabled={isLoading}
        />
        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-200">
          Définir comme adresse par défaut
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
        )}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enregistrement...
            </span>
          ) : (
            submitLabel
          )}
        </motion.button>
      </div>
    </form>
  )
}
