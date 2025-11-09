'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { shopAPI } from '@/lib/api'
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  totalCredits: number
  totalEur: number
  trackingNumber?: string
  createdAt: string
  items: {
    id: string
    quantity: number
    priceCredits: number
    priceEur: number
    product: {
      id: string
      name: string
      imageUrl: string
    }
  }[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadOrders()
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      const response = await shopAPI.getUserOrders()
      setOrders(response.data)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'PROCESSING':
        return <Package className="w-6 h-6 text-blue-500" />
      case 'SHIPPED':
        return <Truck className="w-6 h-6 text-purple-500" />
      case 'DELIVERED':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En traitement',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement de vos commandes...</div>
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
              <h1 className="text-4xl font-bold mb-2">📦 Mes Commandes</h1>
              <p className="text-lg opacity-90">
                Suivi de toutes tes commandes
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/shop"
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                ← Boutique
              </Link>
              <Link
                href="/dashboard"
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              Vous n'avez pas encore passé de commande
            </p>
            <Link
              href="/shop"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Visiter la boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-xl"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">
                          Commande #{order.id.slice(0, 8)}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Passée le{' '}
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-sm text-blue-600 mt-1">
                          Suivi: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total</div>
                    <div className="font-bold text-lg text-primary-600">
                      {order.totalCredits} cr + {order.totalEur.toFixed(2)}€
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg"
                    >
                      <img
                        src={item.product.imageUrl || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {item.priceCredits * item.quantity} cr
                        </div>
                        <div className="text-sm text-gray-600">
                          + {(item.priceEur * item.quantity).toFixed(2)}€
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
