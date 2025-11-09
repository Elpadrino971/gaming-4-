'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { adminAPI } from '@/lib/api'
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Gamepad2,
  Crown,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FinancialDashboard {
  summary: {
    totalRevenue: number
    rakeCollected: number
    vipRevenue: number
    shopRevenue: number
  }
  gamesByType: Array<{
    type: string
    count: number
    rakeCollected: number
    avgRake: string
  }>
  dailyChart: Array<{
    date: string
    revenue: number
    games: number
  }>
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalGames: number
  totalOrders: number
  pendingOrders: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [financialData, setFinancialData] = useState<FinancialDashboard | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Check if user is admin (you should have this in your user model)
    // For now, we'll just load the data
    loadDashboard()
  }, [isAuthenticated, timeRange])

  const loadDashboard = async () => {
    try {
      const [financial, dashStats] = await Promise.all([
        adminAPI.getFinancialDashboard(timeRange),
        adminAPI.getDashboard(),
      ])

      setFinancialData(financial.data)
      setStats(dashStats.data)
    } catch (error: any) {
      console.error('Error loading admin dashboard:', error)
      if (error.response?.status === 403) {
        toast.error('Accès refusé - Administrateur requis')
        router.push('/dashboard')
      } else {
        toast.error('Erreur lors du chargement du dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement du dashboard...</div>
      </div>
    )
  }

  if (!financialData || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-2xl">Erreur de chargement</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 Admin Dashboard</h1>
              <p className="text-lg opacity-90">
                Tableau de bord financier et statistiques
              </p>
            </div>
            <div className="flex gap-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold"
              >
                <option value={7}>7 jours</option>
                <option value={30}>30 jours</option>
                <option value={90}>90 jours</option>
              </select>

              <Link
                href="/dashboard"
                className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Revenu Total"
            value={`${financialData.summary.totalRevenue.toFixed(2)}€`}
            icon={<DollarSign className="w-8 h-8" />}
            color="from-green-500 to-green-700"
          />
          <StatCard
            title="Rake Collecté"
            value={`${financialData.summary.rakeCollected.toFixed(2)}€`}
            icon={<Gamepad2 className="w-8 h-8" />}
            color="from-blue-500 to-blue-700"
          />
          <StatCard
            title="Abonnements VIP"
            value={`${financialData.summary.vipRevenue.toFixed(2)}€`}
            icon={<Crown className="w-8 h-8" />}
            color="from-yellow-500 to-yellow-700"
          />
          <StatCard
            title="Boutique"
            value={`${financialData.summary.shopRevenue.toFixed(2)}€`}
            icon={<ShoppingBag className="w-8 h-8" />}
            color="from-purple-500 to-purple-700"
          />
        </div>

        {/* Platform Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers.toString()}
            subtitle={`${stats.activeUsers} actifs`}
            icon={<Users className="w-8 h-8" />}
            color="from-indigo-500 to-indigo-700"
          />
          <StatCard
            title="Parties jouées"
            value={stats.totalGames.toString()}
            icon={<Gamepad2 className="w-8 h-8" />}
            color="from-pink-500 to-pink-700"
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders.toString()}
            subtitle={`${stats.pendingOrders} en attente`}
            icon={<Package className="w-8 h-8" />}
            color="from-orange-500 to-orange-700"
          />
          <StatCard
            title="Revenus/Utilisateur"
            value={`${(financialData.summary.totalRevenue / stats.totalUsers).toFixed(2)}€`}
            icon={<TrendingUp className="w-8 h-8" />}
            color="from-teal-500 to-teal-700"
          />
        </div>

        {/* Game Types Breakdown */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Revenus par Type de Partie
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialData.gamesByType.map((gameType) => (
              <div
                key={gameType.type}
                className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
              >
                <div className="text-sm text-gray-600 mb-1">
                  {gameType.type.replace('MINI_BINGO_', '')}
                </div>
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {gameType.rakeCollected.toFixed(2)}€
                </div>
                <div className="text-sm text-gray-500">
                  {gameType.count} parties
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Moy: {gameType.avgRake}€/partie
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Revenus Quotidiens ({timeRange} derniers jours)
          </h2>
          <div className="space-y-2">
            {financialData.dailyChart.slice(-14).map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('fr-FR', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 h-full flex items-center justify-end px-3 text-white text-sm font-semibold"
                        style={{
                          width: `${Math.min(
                            (day.revenue /
                              Math.max(
                                ...financialData.dailyChart.map((d) => d.revenue)
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        {day.revenue > 0 && `${day.revenue.toFixed(2)}€`}
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-500 text-right">
                      {day.games} parties
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Link
            href="/admin/users"
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition"
          >
            <Users className="w-12 h-12 text-indigo-500 mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Gestion des Utilisateurs
            </h3>
            <p className="text-gray-600">
              Voir et gérer tous les utilisateurs
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition"
          >
            <Package className="w-12 h-12 text-orange-500 mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Gestion des Commandes
            </h3>
            <p className="text-gray-600">
              {stats.pendingOrders} commandes en attente
            </p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition"
          >
            <ShoppingBag className="w-12 h-12 text-purple-500 mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Gestion des Produits
            </h3>
            <p className="text-gray-600">
              Ajouter et modifier des produits
            </p>
          </Link>
        </div>

        {/* Key Metrics & Insights */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Insights Clés</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-bold text-lg">Revenu Moyen par Jour</h3>
              </div>
              <div className="text-3xl font-bold">
                {(
                  financialData.summary.totalRevenue /
                  Math.max(financialData.dailyChart.length, 1)
                ).toFixed(2)}
                €
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="w-6 h-6" />
                <h3 className="font-bold text-lg">Parties par Jour</h3>
              </div>
              <div className="text-3xl font-bold">
                {Math.round(
                  financialData.dailyChart.reduce((sum, d) => sum + d.games, 0) /
                    Math.max(financialData.dailyChart.length, 1)
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h3 className="font-bold text-lg">Revenu VIP Mensuel Projeté</h3>
              </div>
              <div className="text-3xl font-bold">
                {((financialData.summary.vipRevenue / timeRange) * 30).toFixed(2)}€
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6" />
                <h3 className="font-bold text-lg">Marge Totale</h3>
              </div>
              <div className="text-3xl font-bold">
                {(
                  (financialData.summary.rakeCollected /
                    financialData.summary.totalRevenue) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className={`bg-gradient-to-r ${color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
    </div>
  )
}
