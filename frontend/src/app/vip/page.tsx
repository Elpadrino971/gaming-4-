'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { Crown, Check, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface VipBenefits {
  price: number
  currency: string
  interval: string
  benefits: {
    icon: string
    title: string
    description: string
  }[]
}

export default function VipPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [benefits, setBenefits] = useState<VipBenefits | null>(null)
  const [vipStatus, setVipStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [benefitsRes, statusRes] = await Promise.all([
        api.get('/vip/benefits'),
        api.get('/vip/status'),
      ])

      setBenefits(benefitsRes.data)
      setVipStatus(statusRes.data)
    } catch (error) {
      console.error('Error loading VIP data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    toast.error(
      'Intégration Stripe en cours. Contacte un admin pour activer ton abonnement VIP.',
      { duration: 5000 }
    )
    // TODO: Implement Stripe payment flow
  }

  const handleCancel = async () => {
    if (!confirm('Es-tu sûr de vouloir annuler ton abonnement VIP ?')) {
      return
    }

    try {
      await api.delete('/vip/cancel')
      toast.success('Abonnement annulé. Il restera actif jusqu\'à la fin de la période.')
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
        <div className="text-yellow-900 text-2xl font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-yellow-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/dashboard"
            className="inline-block mb-4 text-yellow-900 hover:text-yellow-800 font-semibold"
          >
            ← Retour au dashboard
          </Link>
          <Crown className="w-24 h-24 mx-auto mb-4 text-yellow-900" />
          <h1 className="text-5xl font-bold text-yellow-900 mb-4">
            Abonnement VIP
          </h1>
          <p className="text-xl text-yellow-800">
            Rejoins l'élite et profite d'avantages exclusifs !
          </p>
        </div>

        {/* Current Status */}
        {vipStatus?.isVip && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-16 h-16 text-yellow-500" />
                <div>
                  <h2 className="text-3xl font-bold text-yellow-600 mb-2">
                    Tu es VIP ! 👑
                  </h2>
                  <p className="text-gray-600">
                    Membre depuis :{' '}
                    {new Date(vipStatus.vipSince).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-gray-600">
                    Expire le :{' '}
                    {new Date(vipStatus.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Annuler l'abonnement
              </button>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        {!vipStatus?.isVip && (
          <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl border-4 border-yellow-400">
            <div className="text-center mb-8">
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold mb-4">
                OFFRE SPÉCIALE
              </div>
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {benefits?.price}€
                <span className="text-2xl text-gray-500">/{benefits?.interval}</span>
              </div>
              <p className="text-gray-600">Annule quand tu veux</p>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-yellow-900 text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:opacity-50"
            >
              {subscribing ? 'Traitement...' : 'Devenir VIP Maintenant 👑'}
            </button>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {benefits?.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition transform hover:scale-105"
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-yellow-400 to-yellow-600">
              <tr>
                <th className="py-4 px-6 text-left text-yellow-900 font-bold">
                  Fonctionnalité
                </th>
                <th className="py-4 px-6 text-center text-yellow-900 font-bold">
                  Gratuit
                </th>
                <th className="py-4 px-6 text-center text-yellow-900 font-bold">
                  VIP 👑
                </th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                feature="Bonus sur les gains"
                free="0%"
                vip="+20%"
                vipHighlight
              />
              <ComparisonRow
                feature="Parties gratuites/jour"
                free="1"
                vip="2"
                vipHighlight
              />
              <ComparisonRow
                feature="Badge exclusif"
                free={false}
                vip={true}
                vipHighlight
              />
              <ComparisonRow
                feature="Réduction boutique"
                free="0%"
                vip="-10%"
                vipHighlight
              />
              <ComparisonRow
                feature="Accès prioritaire"
                free={false}
                vip={true}
                vipHighlight
              />
              <ComparisonRow
                feature="Roue bonus améliorée"
                free={false}
                vip={true}
                vipHighlight
              />
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white/90 backdrop-blur-md rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            <FaqItem
              question="Puis-je annuler à tout moment ?"
              answer="Oui ! Tu peux annuler ton abonnement quand tu veux. Il restera actif jusqu'à la fin de ta période de facturation."
            />
            <FaqItem
              question="Comment fonctionne le bonus de 20% ?"
              answer="À chaque victoire, tu reçois automatiquement 20% de crédits supplémentaires. Si tu gagnes 1000 crédits, tu en recevras 1200 !"
            />
            <FaqItem
              question="Les crédits VIP sont-ils conservés si j'annule ?"
              answer="Oui, tous les crédits gagnés restent sur ton compte même après l'annulation de ton abonnement VIP."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ComparisonRow({
  feature,
  free,
  vip,
  vipHighlight = false,
}: {
  feature: string
  free: string | boolean
  vip: string | boolean
  vipHighlight?: boolean
}) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-4 px-6 text-gray-700 font-medium">{feature}</td>
      <td className="py-4 px-6 text-center">
        {typeof free === 'boolean' ? (
          free ? (
            <Check className="w-6 h-6 text-green-500 mx-auto" />
          ) : (
            <X className="w-6 h-6 text-red-500 mx-auto" />
          )
        ) : (
          <span className="text-gray-600">{free}</span>
        )}
      </td>
      <td className={`py-4 px-6 text-center ${vipHighlight ? 'bg-yellow-50' : ''}`}>
        {typeof vip === 'boolean' ? (
          vip ? (
            <Check className="w-6 h-6 text-yellow-500 mx-auto" />
          ) : (
            <X className="w-6 h-6 text-red-500 mx-auto" />
          )
        ) : (
          <span className="text-yellow-600 font-bold">{vip}</span>
        )}
      </td>
    </tr>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-l-4 border-yellow-500 pl-4">
      <h3 className="font-bold text-gray-800 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}
