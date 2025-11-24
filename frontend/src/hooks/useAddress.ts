import { useState, useEffect } from 'react'

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
  createdAt: string
  updatedAt: string
}

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

export const useAddress = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  /**
   * Fetch all addresses for the current user
   */
  const fetchAddresses = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/addresses`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      setAddresses(data)

      // Set default address
      const defaultAddr = data.find((addr: Address) => addr.isDefault)
      setDefaultAddress(defaultAddr || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching addresses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fetch default address
   */
  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch(`${API_URL}/addresses/default`, {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setDefaultAddress(data)
        return data
      }

      return null
    } catch (err) {
      console.error('Error fetching default address:', err)
      return null
    }
  }

  /**
   * Create a new address
   */
  const createAddress = async (data: AddressFormData): Promise<Address> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create address')
      }

      const newAddress = await response.json()

      // Refresh addresses list
      await fetchAddresses()

      return newAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Update an existing address
   */
  const updateAddress = async (addressId: string, data: Partial<AddressFormData>): Promise<Address> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update address')
      }

      const updatedAddress = await response.json()

      // Refresh addresses list
      await fetchAddresses()

      return updatedAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Delete an address
   */
  const deleteAddress = async (addressId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      // Refresh addresses list
      await fetchAddresses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Set an address as default
   */
  const setAsDefault = async (addressId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/addresses/${addressId}/set-default`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to set default address')
      }

      // Refresh addresses list
      await fetchAddresses()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch addresses on mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    fetchAddresses,
    fetchDefaultAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
  }
}
