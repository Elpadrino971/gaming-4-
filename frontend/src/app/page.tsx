'use client'

import Link from 'next/link'
import { Sparkles, Trophy, ShoppingBag, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-600">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6 animate-bounce-slow">
            🎯 BingoShop
          </h1>
          <p className="text-3xl font-semibold mb-4">
            Joue. Gagne. Choisis ton cadeau.
          </p>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Participe à des mini-bingos rapides, accumule des crédits virtuels et
            dépense-les dans notre boutique pour obtenir de vraies récompenses !
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              Commencer à jouer
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 transition transform hover:scale-105"
            >
              Se connecter
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <Sparkles className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Mini-Bingos Express</h3>
              <p className="opacity-90">Parties rapides de 2-3 minutes, 3-12 joueurs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Multiplicateurs x10</h3>
              <p className="opacity-90">Gagne jusqu'à 10x ton investissement !</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Boutique Intégrée</h3>
              <p className="opacity-90">Produits réels livrés chez toi</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Parrainage</h3>
              <p className="opacity-90">Gagne 500 crédits par filleul !</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-20 bg-white/10 backdrop-blur-md p-10 rounded-2xl">
            <h2 className="text-3xl font-bold mb-8">Comment ça marche ?</h2>
            <div className="grid md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  1
                </div>
                <h4 className="font-bold mb-2">Inscris-toi</h4>
                <p className="text-sm opacity-90">
                  Crée ton compte en quelques secondes
                </p>
              </div>
              <div>
                <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  2
                </div>
                <h4 className="font-bold mb-2">Joue au Bingo</h4>
                <p className="text-sm opacity-90">
                  Participe à des parties rapides et amusantes
                </p>
              </div>
              <div>
                <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  3
                </div>
                <h4 className="font-bold mb-2">Gagne des crédits</h4>
                <p className="text-sm opacity-90">
                  Accumule des crédits virtuels
                </p>
              </div>
              <div>
                <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  4
                </div>
                <h4 className="font-bold mb-2">Choisis ton cadeau</h4>
                <p className="text-sm opacity-90">
                  Dépense tes crédits dans la boutique
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 opacity-80 text-sm">
            <p>© 2024 BingoShop. Tous droits réservés.</p>
            <p className="mt-2">
              Les crédits sont des récompenses promotionnelles non convertibles en argent.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
