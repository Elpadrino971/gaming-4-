'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { shopAPI } from '@/lib/api'
import { ShoppingCart, Package, Tag, Coins, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  category: string
  priceCredits: number
  priceEur: number
  stock: number
  isActive: boolean
}

interface CartItem {
  product: Product
  quantity: number
}

export default function ShopPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [processingOrder, setProcessingOrder] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        shopAPI.getProducts(),
        shopAPI.getCategories(),
      ])

      setProducts(productsRes.data)
      setCategories(['all', ...categoriesRes.data])
    } catch (error) {
      console.error('Error loading shop:', error)
      toast.error('Erreur lors du chargement de la boutique')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((p) => p.category === selectedCategory)

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }

    toast.success(`${product.name} ajouté au panier !`)
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
    toast.success('Produit retiré du panier')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const cartTotal = cart.reduce(
    (acc, item) => ({
      credits: acc.credits + item.product.priceCredits * item.quantity,
      eur: acc.eur + item.product.priceEur * item.quantity,
    }),
    { credits: 0, eur: 0 }
  )

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    // Check if user has enough credits
    const userCredits = Number(user?.credits || 0)
    if (userCredits < cartTotal.credits) {
      toast.error(`Crédits insuffisants ! Il vous manque ${cartTotal.credits - userCredits} crédits`)
      return
    }

    setProcessingOrder(true)
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }

      const response = await shopAPI.createOrder(orderData)

      toast.success('Commande passée avec succès ! 🎉', {
        duration: 5000,
      })

      // Clear cart
      setCart([])
      setShowCart(false)

      // Optionally redirect to order history
      toast.loading('Redirection vers vos commandes...', { duration: 2000 })
      setTimeout(() => {
        router.push('/orders')
      }, 2000)

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la commande')
    } finally {
      setProcessingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement de la boutique...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🛍️ Boutique</h1>
              <p className="text-lg opacity-90">
                Dépense tes crédits pour des produits réels !
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <div className="text-sm opacity-80">Tes crédits</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Coins className="w-6 h-6" />
                  {Number(user?.credits || 0).toLocaleString()}
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Panier
                </div>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              <Link
                href="/dashboard"
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-gray-700" />
            <h3 className="font-bold text-gray-700">Catégories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Tous' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                userCredits={Number(user?.credits || 0)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Aucun produit disponible dans cette catégorie
            </p>
          </div>
        )}

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
            <div className="bg-white h-full w-full max-w-md p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Panier</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="border rounded-lg p-4 flex gap-4"
                      >
                        <img
                          src={item.product.imageUrl || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {item.product.name}
                          </h3>
                          <div className="text-sm text-gray-600 mb-2">
                            {item.product.priceCredits} cr + {item.product.priceEur}€
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded flex items-center justify-center"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="ml-auto text-red-500 hover:text-red-700 text-sm"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Crédits:</span>
                      <span className="font-bold">{cartTotal.credits} cr</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Euros:</span>
                      <span className="font-bold">{cartTotal.eur.toFixed(2)}€</span>
                    </div>

                    {/* Check if enough credits */}
                    {Number(user?.credits || 0) < cartTotal.credits && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mt-3">
                        ⚠️ Crédits insuffisants ! Il vous manque{' '}
                        {cartTotal.credits - Number(user?.credits || 0)} crédits
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={checkout}
                    disabled={
                      processingOrder ||
                      Number(user?.credits || 0) < cartTotal.credits
                    }
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingOrder
                      ? 'Traitement...'
                      : 'Passer la commande'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
  userCredits,
}: {
  product: Product
  onAddToCart: (product: Product) => void
  userCredits: number
}) {
  const canAfford = userCredits >= product.priceCredits
  const outOfStock = product.stock === 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.imageUrl || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Indisponible</span>
          </div>
        )}
        {outOfStock && product.isActive && (
          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Rupture de stock</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {product.category}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-700">
              {product.priceCredits}
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <span className="font-bold text-green-700">
              + {product.priceEur.toFixed(2)}€
            </span>
          </div>
        </div>

        {/* Stock Info */}
        <div className="text-sm text-gray-500 mb-3">
          Stock: {product.stock > 0 ? product.stock : 'Épuisé'}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!canAfford || outOfStock || !product.isActive}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!canAfford
            ? 'Crédits insuffisants'
            : outOfStock
            ? 'Rupture de stock'
            : !product.isActive
            ? 'Indisponible'
            : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}
