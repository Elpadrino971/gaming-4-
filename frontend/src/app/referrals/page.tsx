'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { referralsAPI } from '@/lib/api'
import { Users, Copy, Trophy, Coins, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ReferralsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [code, setCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [codeRes, statsRes, leaderboardRes] = await Promise.all([
        referralsAPI.getMyCode(),
        referralsAPI.getStats(),
        referralsAPI.getLeaderboard(10),
      ])

      setCode(codeRes.data.code)
      setShareUrl(codeRes.data.shareUrl)
      setStats(statsRes.data)
      setLeaderboard(leaderboardRes.data)
    } catch (error) {
      console.error('Error loading referrals:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
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
              <h1 className="text-4xl font-bold mb-2">🎁 Parrainage</h1>
              <p className="text-lg opacity-90">
                Invite tes amis et gagne des crédits !
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
            >
              ← Retour
            </Link>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 w-16 h-16 rounded-xl flex items-center justify-center text-white">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Filleuls</div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats?.totalReferrals || 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {stats?.activeReferrals || 0} actifs
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-700 w-16 h-16 rounded-xl flex items-center justify-center text-white">
                <Coins className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Crédits Gagnés</div>
                <div className="text-3xl font-bold text-gray-800">
                  {stats?.totalEarned?.toLocaleString() || 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Bonus + 5% des gains
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 w-16 h-16 rounded-xl flex items-center justify-center text-white">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Potentiel</div>
                <div className="text-3xl font-bold text-gray-800">∞</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Gains illimités !
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ton Code de Parrainage
          </h2>

          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 mb-4">
            <div className="text-white text-center mb-4">
              <div className="text-sm opacity-80 mb-2">Ton code unique:</div>
              <div className="text-5xl font-bold tracking-wider">{code}</div>
            </div>
            <button
              onClick={() => copyToClipboard(code)}
              className="w-full bg-white text-primary-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copier le code
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Lien de partage:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">💰 Pour Toi</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 500 crédits par filleul</li>
                <li>• 5% de tous leurs gains (à vie!)</li>
                <li>• Gains illimités</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">🎁 Pour Eux</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 200 crédits de bienvenue</li>
                <li>• Accès immédiat aux jeux</li>
                <li>• Communauté sympa</li>
              </ul>
            </div>
          </div>
        </div>

        {/* My Referrals List */}
        {stats?.referrals && stats.referrals.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Mes Filleuls ({stats.referrals.length})
            </h2>
            <div className="space-y-3">
              {stats.referrals.map((ref: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                      {ref.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {ref.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        Inscrit le{' '}
                        {new Date(ref.joinedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {ref.gamesPlayed} parties
                    </div>
                    <div className="text-sm text-gray-500">
                      {ref.isActive ? '✅ Actif' : '⏸️ Inactif'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Top Parrains
          </h2>
          <div className="space-y-2">
            {leaderboard.map((leader, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-700 w-8">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {leader.username}
                    </div>
                    <div className="text-sm text-gray-600">
                      {leader.totalReferrals} filleuls
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary-600">
                    {leader.totalEarned.toLocaleString()} cr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
