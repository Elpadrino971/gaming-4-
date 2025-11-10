'use client'

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride'
import { useAuthStore } from '@/lib/store'

const steps: Step[] = [
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-2">👋 Bienvenue sur BingoShop!</h2>
        <p>Découvre comment jouer et gagner des crédits</p>
      </div>
    ),
    placement: 'center',
  },
  {
    target: '[data-tour="wheel"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🎰 Roue Quotidienne</h3>
        <p>Tourne la roue chaque jour pour gagner des crédits!</p>
        <ul className="list-disc ml-4 mt-2">
          <li>1 spin gratuit/jour</li>
          <li>2 spins si VIP</li>
          <li>Jusqu'à 1000 crédits!</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="referral"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🎁 Parrainage</h3>
        <p>Partage ton code de parrainage:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>500cr par filleul</li>
          <li>5% de leurs gains à vie!</li>
          <li>Gains illimités</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="play"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🎮 Jouer</h3>
        <p>Choisis ton type de partie:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>Standard (1€ = 100cr)</li>
          <li>Premium (5€ = 500cr)</li>
          <li>Speed (0.50€ = 50cr)</li>
          <li>FREE (gratuit!)</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="missions"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">🏆 Missions</h3>
        <p>Complète des missions pour gagner des crédits et XP!</p>
        <ul className="list-disc ml-4 mt-2">
          <li>Quotidiennes</li>
          <li>Hebdomadaires</li>
          <li>Mensuelles</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="vip"]',
    content: (
      <div>
        <h3 className="text-xl font-bold mb-2">👑 VIP</h3>
        <p>Deviens VIP pour 9.99€/mois:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>+20% sur tous les gains</li>
          <li>+1 spin roue/jour</li>
          <li>Badge exclusif</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: 'body',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-2">🎉 C'est Parti!</h2>
        <p>Tu es prêt à jouer et gagner!</p>
        <p className="mt-2 text-sm text-gray-600">
          Tu peux refaire ce tutoriel depuis les paramètres.
        </p>
      </div>
    ),
    placement: 'center',
  },
]

export default function Onboarding() {
  const { user } = useAuthStore()
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding && user) {
      // Delay to let page load
      setTimeout(() => setRun(true), 1000)
    }
  }, [user])

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      localStorage.setItem('hasSeenOnboarding', 'true')
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#6366f1',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#6366f1',
          borderRadius: 8,
          padding: '10px 20px',
        },
        buttonBack: {
          color: '#6b7280',
        },
        buttonSkip: {
          color: '#9ca3af',
        },
      }}
      locale={{
        back: 'Retour',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        open: 'Ouvrir',
        skip: 'Passer',
      }}
    />
  )
}
