'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Order {
  id: string
  orderNumber: string
  status: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
  createdAt: string
  user: {
    id: string
    username: string
    email: string
  }
  address: {
    fullName: string
    addressLine1: string
    city: string
    postalCode: string
    country: string
  }
  items: Array<{
    product: {
      name: string
      imageUrl?: string
    }
    quantity: number
  }>
}

interface Stats {
  pending: number
  processing: number
  shipped: number
  delivered: number
  totalShipped: number
}

export default function AdminShippingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('PAID')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchShipments()
    fetchStats()
  }, [selectedStatus])

  const fetchShipments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/shipping?status=${selectedStatus}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching shipments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shipping/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleMarkProcessing = async (orderId: string) => {
    try {
      await fetch(`/api/shipping/${orderId}/processing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      fetchShipments()
      fetchStats()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleShip = (order: Order) => {
    setCurrentOrder(order)
    setShowTrackingModal(true)
  }

  const handleShipSubmit = async (trackingNumber: string) => {
    if (!currentOrder) return

    try {
      await fetch(`/api/shipping/${currentOrder.id}/ship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ trackingNumber, carrier: 'Colissimo' }),
      })
      setShowTrackingModal(false)
      setCurrentOrder(null)
      fetchShipments()
      fetchStats()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm('Confirmer que cette commande a été livrée ?')) return

    try {
      await fetch(`/api/shipping/${orderId}/delivered`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      fetchShipments()
      fetchStats()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleBatchShip = async () => {
    if (selectedOrders.length === 0) {
      alert('Sélectionnez au moins une commande')
      return
    }

    if (!confirm(`Expédier ${selectedOrders.length} commande(s) avec génération automatique des trackings ?`)) return

    try {
      const response = await fetch('/api/shipping/batch-ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ orderIds: selectedOrders }),
      })
      const results = await response.json()
      alert(`${results.filter((r: any) => r.success).length}/${results.length} commandes expédiées`)
      setSelectedOrders([])
      fetchShipments()
      fetchStats()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'PROCESSING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'SHIPPED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'DELIVERED':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PAID: 'À expédier',
      PROCESSING: 'En préparation',
      SHIPPED: 'Expédié',
      DELIVERED: 'Livré',
    }
    return labels[status] || status
  }

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📦 Gestion des Expéditions</h1>
          <p className="text-gray-400">Gérez les lots à expédier aux gagnants</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">À expédier</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="bg-gray-800/50 border border-blue-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">En préparation</p>
              <p className="text-3xl font-bold text-blue-400">{stats.processing}</p>
            </div>
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Expédiés</p>
              <p className="text-3xl font-bold text-purple-400">{stats.shipped}</p>
            </div>
            <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Livrés</p>
              <p className="text-3xl font-bold text-green-400">{stats.delivered}</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Total expédiés</p>
              <p className="text-3xl font-bold text-white">{stats.totalShipped}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'PAID', label: 'À expédier', count: stats?.pending },
            { key: 'PROCESSING', label: 'En préparation', count: stats?.processing },
            { key: 'SHIPPED', label: 'Expédiés', count: stats?.shipped },
            { key: 'DELIVERED', label: 'Livrés', count: stats?.delivered },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedStatus === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} {tab.count !== undefined && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Batch Actions */}
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 flex items-center justify-between"
          >
            <p className="text-white">
              <strong>{selectedOrders.length}</strong> commande(s) sélectionnée(s)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Désélectionner
              </button>
              <button
                onClick={handleBatchShip}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all"
              >
                🚚 Expédier en masse
              </button>
            </div>
          </motion.div>
        )}

        {/* Orders Table */}
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Aucune commande dans ce statut</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length}
                        onChange={(e) => setSelectedOrders(e.target.checked ? orders.map(o => o.id) : [])}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Commande</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Produit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Adresse</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tracking</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id])
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order.id))
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">#{order.orderNumber}</p>
                        <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{order.user.username}</p>
                        <p className="text-gray-400 text-sm">{order.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-white text-sm">
                            {item.product.name} x{item.quantity}
                          </p>
                        ))}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm">{order.address.fullName}</p>
                        <p className="text-gray-400 text-xs">{order.address.addressLine1}</p>
                        <p className="text-gray-400 text-xs">{order.address.postalCode} {order.address.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.trackingNumber ? (
                          <div>
                            <code className="text-xs bg-gray-900 px-2 py-1 rounded text-purple-400">
                              {order.trackingNumber}
                            </code>
                            {order.trackingUrl && (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-blue-400 hover:underline mt-1"
                              >
                                Suivre →
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'PAID' && (
                            <>
                              <button
                                onClick={() => handleMarkProcessing(order.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                              >
                                Préparer
                              </button>
                              <button
                                onClick={() => handleShip(order)}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors"
                              >
                                Expédier
                              </button>
                            </>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button
                              onClick={() => handleShip(order)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors"
                            >
                              Expédier
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
                            >
                              Livré
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tracking Modal */}
        <AnimatePresence>
          {showTrackingModal && currentOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-purple-500/50"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Expédier la commande</h2>
                <p className="text-gray-400 mb-6">#{currentOrder.orderNumber}</p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleShipSubmit(formData.get('tracking') as string)
                  }}
                >
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Numéro de suivi Colissimo
                    </label>
                    <input
                      type="text"
                      name="tracking"
                      placeholder="RR123456789FR"
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Format : 2 lettres + 9 chiffres + 2 lettres (ex: RR123456789FR)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTrackingModal(false)
                        setCurrentOrder(null)
                      }}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all"
                    >
                      Expédier
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
