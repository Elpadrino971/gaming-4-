# 🎰 BingoShop - Plateforme de Bingo en Ligne

<div align="center">

![BingoShop](https://img.shields.io/badge/Status-Ready%20to%20Launch-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Private-red)

**La plateforme de bingo la plus excitante avec des lots physiques !**

[Installation](#installation) • [Features](#features) • [Documentation](#documentation) • [Support](#support)

</div>

---

## ✨ Features

### 🎮 Jeu
- ✅ **Bingo en temps réel** - Socket.io, parties multi-joueurs
- ✅ **4 types de parties** - FREE, SPEED (0.50€), STANDARD (1€), PREMIUM (5€)
- ✅ **Système de multiplicateurs** - x1, x2, x5, x10 (jusqu'à 10x vos gains!)
- ✅ **Roue quotidienne gratuite** - Tournez pour gagner des crédits
- ✅ **Auto-marking intelligent** - Les grilles se marquent automatiquement

### 💰 Économie
- ✅ **Stripe Payment** - Paiements sécurisés 3D Secure
- ✅ **5 packages de crédits** - De 4.99€ à 74.99€
- ✅ **Système de rake** - 25-35% selon le type de partie
- ✅ **Bonus VIP** - +20% sur tous les gains
- ✅ **Programme de parrainage** - 5% des gains de vos filleuls

### 🎁 Lots Physiques
- ✅ **Attribution automatique** - Matching intelligent produit/montant
- ✅ **Gestion stock** - Dashboard admin complet
- ✅ **Expédition Colissimo** - Tracking automatique
- ✅ **Notifications email** - Confirmations à chaque étape

### 🏆 Gamification
- ✅ **Système d'XP & Niveaux** - BRONZE → SILVER → GOLD → DIAMOND
- ✅ **Achievements** - 50+ achievements à débloquer
- ✅ **Daily Missions** - Missions quotidiennes/hebdomadaires/mensuelles
- ✅ **Streak System** - Bonus connexion quotidienne
- ✅ **Battle Pass** - Saisons avec récompenses progressives
- ✅ **Tournaments** - Compétitions hebdomadaires
- ✅ **Cosmetics** - Personnalisation grilles de bingo

### 🎨 UX/UI
- ✅ **Design 3D immersif** - Three.js, animations fluides
- ✅ **Effets premium** - Confetti, particles, haptics mobiles
- ✅ **Audio dynamique** - Sons synthétisés temps réel
- ✅ **Responsive** - Mobile, tablet, desktop
- ✅ **Dark theme** - Interface sombre optimisée

---

## 🏗️ Architecture

### Stack Technique

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js + React Three Fiber
- Zustand (state management)
- Socket.io Client

**Backend:**
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.io
- Stripe SDK
- SendGrid (emails)

**Infrastructure:**
- Docker
- Nginx
- PM2
- PostgreSQL 14+
- Redis (optionnel)

---

## 📦 Installation

### Quick Start (Développement)

```bash
# Cloner le repo
git clone <your-repo>
cd gaming-4-

# Backend
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos clés
npx prisma migrate dev
npx prisma generate
npm run start:dev

# Frontend (nouveau terminal)
cd frontend
npm install
cp .env.example .env.local
# Configurer .env.local
npm run dev
```

**Accès:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `npx prisma studio`

### 📚 Documentation Complète

Voir [SETUP.md](./SETUP.md) pour:
- Installation complète
- Configuration production
- Déploiement VPS/Cloud
- Sécurité
- Monitoring
- Troubleshooting

---

## 🎯 Modèle Économique

### Rake Plateforme

| Type | Mise | Rake | Distribution |
|------|------|------|--------------|
| FREE | 0€ | 0% | 100% |
| SPEED | 0.50€ | 35% | 65% |
| STANDARD | 1€ | 30% | 70% |
| PREMIUM | 5€ | 25% | 75% |

### Projections Financières

**An 1 (France) - Conservateur:**
- 500 users actifs/jour (mois 12)
- 250 parties/jour
- Rake: 11,250€/mois
- **Profit An 1: 58,000€**
- Break-even: Mois 4-5

**An 2+ (USA) - Optimiste:**
- 10,000 users actifs/jour
- 5,000 parties/jour
- Rake: 250,000€/mois
- **Profit An 2: 1,500,000€**

---

## ⚖️ Légal

### France (Phase 1)
- ✅ Max lot: 500€ (zone verte légale)
- ✅ Structure SASU recommandée
- ✅ Pas de licence ANJ nécessaire
- ⚠️ Déclarer lots > 300€ aux impôts

### USA (Phase 2)
- ✅ Modèle Sweepstakes 100% légal
- ✅ Gros lots possibles (voitures, 100k$)
- ✅ Marché 5x plus grand (330M personnes)

---

## 💳 Configuration Stripe

### Créer les produits:

1. Dashboard Stripe → Products → Create product
2. Créer 5 produits avec prix récurrents:

| Package | Crédits | Prix | Price ID |
|---------|---------|------|----------|
| STARTER | 500 | 4.99€ | price_... |
| BASIC | 1000 | 9.99€ | price_... |
| POPULAR | 2500 | 19.99€ | price_... |
| PREMIUM | 5000 | 39.99€ | price_... |
| MEGA | 10000 | 74.99€ | price_... |

3. Copier Price IDs dans `.env`

### Webhook:
- URL: `https://yourdomain.com/stripe/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## 📧 Configuration Email (SendGrid)

1. Créer compte: https://sendgrid.com
2. Créer API Key (Full Access)
3. Vérifier domaine d'envoi
4. Configurer `.env`:
```env
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"
```

**Templates email inclus:**
- ✅ Welcome
- ✅ Payment confirmation
- ✅ Prize won
- ✅ Shipping confirmation
- ✅ Delivery confirmation
- ✅ Beta invitation

---

## 🚀 Déploiement

### VPS (Recommandé pour contrôle total)

**Specs minimum:**
- 4GB RAM
- 2 vCPU
- 80GB SSD
- Ubuntu 22.04 LTS

**Coût:** ~10-20€/mois (Scaleway, OVH, DigitalOcean)

Voir [SETUP.md](./SETUP.md) section déploiement.

### Cloud (Plus simple)

**Frontend:** Vercel (gratuit)
**Backend:** Railway/Render (~7€/mois)
**Base de données:** Railway PostgreSQL (~10€/mois)

---

## 📊 Admin Dashboard

**Accès:** https://yourdomain.com/admin

**Features:**
- 📦 Gestion produits (CRUD)
- 🚚 Gestion expéditions (tracking Colissimo)
- 👥 Gestion utilisateurs
- 💰 Stats financières temps réel
- 🎮 Monitoring parties en cours
- 📧 Envoi invitations beta

---

## 🧪 Tests

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm run test
npm run build  # Vérifier pas d'erreurs build
```

---

## 📈 Roadmap

### ✅ Phase 1 (Terminée)
- Jeu bingo temps réel
- Système de crédits & paiements
- Attribution automatique lots
- Expédition Colissimo
- Gamification complète

### 🚧 Phase 2 (Q1 2025)
- [ ] Jackpot progressif
- [ ] Mode tournoi avancé
- [ ] Live chat in-game
- [ ] Application mobile (Capacitor)
- [ ] Programme VIP amélioré

### 📅 Phase 3 (Q2 2025)
- [ ] Expansion USA (Sweepstakes)
- [ ] Gros lots (voitures, 100k$)
- [ ] Partenariats marques
- [ ] API publique
- [ ] White-label solution

---

## 🤝 Contributing

Ce projet est privé. Pour contribuer:
1. Fork le repo
2. Créer branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir Pull Request

---

## 📝 License

Propriétaire - Tous droits réservés © 2024 BingoShop

---

## 📞 Support

- 📧 Email: support@bingoshop.fr
- 🌐 Website: https://bingoshop.fr
- 📖 Documentation: https://docs.bingoshop.fr
- 🐛 Issues: https://github.com/your-repo/issues

---

<div align="center">

**Développé avec ❤️ par l'équipe BingoShop**

[⬆ Retour en haut](#-bingoshop---plateforme-de-bingo-en-ligne)

</div>
