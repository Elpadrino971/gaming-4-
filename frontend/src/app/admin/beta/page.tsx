'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface BetaCode {
  id: string
  code: string
  status: 'AVAILABLE' | 'USED' | 'EXPIRED'
  usedBy?: string
  usedAt?: string
  expiresAt?: string
  createdBy: string
  createdAt: string
  notes?: string
}

interface BetaStats {
  total: number
  available: number
  used: number
  expired: number
  usageRate: string
  betaModeEnabled: boolean
}

export default function AdminBetaPage() {
  const router = useRouter()
  const [codes, setCodes] = useState<BetaCode[]>([])
  const [stats, setStats] = useState<BetaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const [generateForm, setGenerateForm] = useState({
    count: 10,
    prefix: 'BINGO',
    expiresInDays: 30,
    notes: '',
  })

  useEffect(() => {
    fetchBetaCodes()
    fetchStats()
  }, [])

  const fetchBetaCodes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beta/codes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch codes')
      const data = await response.json()
      setCodes(data)
    } catch (error) {
      console.error('Error fetching codes:', error)
      toast.error('Erreur lors du chargement des codes')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beta/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beta/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(generateForm),
      })

      if (!response.ok) throw new Error('Failed to generate codes')
      const result = await response.json()

      toast.success(`${result.count} codes générés avec succès !`)
      fetchBetaCodes()
      fetchStats()

      // Reset form
      setGenerateForm({
        count: 10,
        prefix: 'BINGO',
        expiresInDays: 30,
        notes: '',
      })
    } catch (error) {
      console.error('Error generating codes:', error)
      toast.error('Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/beta/codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete code')

      toast.success('Code supprimé')
      fetchBetaCodes()
      fetchStats()
    } catch (error) {
      console.error('Error deleting code:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Code copié !')
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      AVAILABLE: 'bg-green-100 text-green-800',
      USED: 'bg-gray-100 text-gray-800',
      EXPIRED: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-primary-600 hover:underline mb-4 flex items-center gap-2"
          >
            ← Retour au dashboard admin
          </button>
          <h1 className="text-4xl font-bold text-gray-900">🔐 Gestion Beta</h1>
          <p className="text-gray-600 mt-2">Gérer les codes d'accès beta</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{stats.available}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-1">Utilisés</p>
              <p className="text-3xl font-bold text-blue-600">{stats.used}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-1">Expirés</p>
              <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-600 mb-1">Taux d'utilisation</p>
              <p className="text-3xl font-bold text-purple-600">{stats.usageRate}%</p>
            </motion.div>
          </div>
        )}

        {/* Beta Mode Status */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mb-8 p-4 rounded-lg ${stats.betaModeEnabled ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-green-50 border-2 border-green-300'}`}
          >
            <p className="font-semibold">
              {stats.betaModeEnabled ? '🔒 Mode Beta: ACTIVÉ' : '🔓 Mode Beta: DÉSACTIVÉ'}
            </p>
            <p className="text-sm mt-1">
              {stats.betaModeEnabled
                ? 'Les inscriptions nécessitent un code beta valide'
                : 'Les inscriptions sont ouvertes à tous (pas de code requis)'}
            </p>
          </motion.div>
        )}

        {/* Generate Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Générer des codes</h2>
          <form onSubmit={handleGenerateCodes} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Préfixe</label>
                <input
                  type="text"
                  value={generateForm.prefix}
                  onChange={(e) => setGenerateForm({ ...generateForm, prefix: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expiration (jours)</label>
                <input
                  type="number"
                  min="1"
                  value={generateForm.expiresInDays}
                  onChange={(e) => setGenerateForm({ ...generateForm, expiresInDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <input
                  type="text"
                  value={generateForm.notes}
                  onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Batch influenceurs"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {generating ? 'Génération...' : 'Générer les codes'}
            </button>
          </form>
        </motion.div>

        {/* Codes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Codes Beta ({codes.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisé par</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date d'utilisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="font-mono font-semibold text-primary-600 hover:underline"
                      >
                        {code.code}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(code.status)}`}>
                        {code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.usedBy ? code.usedBy.slice(0, 8) + '...' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.usedAt ? new Date(code.usedAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {code.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleDeleteCode(code.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
