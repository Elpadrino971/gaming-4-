'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  description: string
  imageUrl?: string
  priceInCredits: number
  priceInEur?: number
  stock: number
  unlimited: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  amazonASIN?: string
  amazonUrl?: string
  category?: string
  totalSold: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?includeInactive=true')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        fetchProducts()
        fetchStats()
      } else {
        const error = await response.json()
        alert(error.message || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'OUT_OF_STOCK':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'INACTIVE':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif'
      case 'OUT_OF_STOCK':
        return 'Rupture'
      case 'INACTIVE':
        return 'Inactif'
      default:
        return status
    }
  }

  if (isLoading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestion des Produits</h1>
            <p className="text-gray-400">Gérez votre catalogue de lots à gagner</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateProduct}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-semibold"
          >
            + Nouveau Produit
          </motion.button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Total Produits</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Actifs</p>
              <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Rupture de stock</p>
              <p className="text-3xl font-bold text-orange-400">{stats.outOfStock}</p>
            </div>
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-1">Total Vendus</p>
              <p className="text-3xl font-bold text-purple-400">{stats.totalSold}</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Produit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Prix</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vendus</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-2xl">📦</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{product.name}</p>
                      <p className="text-gray-400 text-sm truncate max-w-xs">{product.description}</p>
                      {product.category && (
                        <span className="inline-block mt-1 text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{product.priceInCredits} cr</p>
                      {product.priceInEur && (
                        <p className="text-gray-400 text-sm">{product.priceInEur.toFixed(2)}€</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.unlimited ? (
                        <span className="text-green-400 font-semibold">∞ Illimité</span>
                      ) : (
                        <span className={`font-semibold ${product.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                          {product.stock} unités
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{product.totalSold}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">Aucun produit trouvé</p>
              <button
                onClick={handleCreateProduct}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold"
              >
                Créer votre premier produit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal (TODO: Implement ProductFormModal component) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
            <p className="text-gray-400 mb-4">
              Formulaire à implémenter (ProductFormModal)
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
