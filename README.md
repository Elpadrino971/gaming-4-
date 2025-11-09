# 🎯 BingoShop - Plateforme de Mini-Jeux et Boutique

## 📋 Vue d'ensemble

BingoShop est une plateforme de divertissement gamifiée où les utilisateurs participent à des mini-bingos et des tirages progressifs pour gagner des crédits virtuels utilisables dans une boutique intégrée.

**Vision**: Joue. Gagne. Choisis ton cadeau.

## ✨ Fonctionnalités principales

### 🎮 Phase 1 - MVP
- ✅ Authentification utilisateur (JWT + bcrypt)
- ✅ Mini Bingo Express (temps réel, 2-3 min, 3-12 joueurs)
- ✅ Système de crédits virtuels (non convertibles)
- ✅ Boutique intégrée avec produits réels
- ✅ Paiement Stripe
- ✅ Back-office administrateur

### 🚀 Phase 2 - Gamification (Future)
- Bingo à paliers progressifs (jauges)
- Roue quotidienne gratuite
- Système de parrainage
- Points XP + classements
- Badges de fidélité

### 📱 Phase 3 - Mobile & Marketplace (Future)
- Application React Native
- Partenariats marques
- Notifications push

## 🏗️ Architecture technique

### Stack
- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.io + Redis adapter
- **Cache/Queue**: Redis + BullMQ
- **Payments**: Stripe
- **Hosting**: Docker + Docker Compose (prêt pour AWS)

### Structure du projet
```
bingoshop/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Authentification JWT
│   │   ├── users/       # Gestion utilisateurs
│   │   ├── games/       # Logique bingo temps réel
│   │   ├── credits/     # Système de crédits
│   │   ├── shop/        # Boutique produits
│   │   ├── payments/    # Intégration Stripe
│   │   └── admin/       # Back-office
│   └── prisma/          # Schéma base de données
├── frontend/            # Interface Next.js
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # Composants React
│   │   └── lib/         # Utilitaires
└── docker-compose.yml   # Orchestration services
```

## 🚀 Installation et Lancement

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone <repo-url>
cd gaming-4-
```

2. **Configuration Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
```

3. **Configuration Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
```

4. **Lancer avec Docker**
```bash
# À la racine du projet
docker-compose up -d
```

5. **Initialiser la base de données**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Accès aux services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3000/admin
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📊 Modèle de données

### Utilisateurs
- Authentification sécurisée
- Niveaux de compte (Bronze → Diamant)
- Solde de crédits virtuels

### Jeux
- Mini Bingo Express (3-12 joueurs)
- Tirages temps réel
- Multiplicateurs de gain
- Historique des parties

### Crédits
- 1 crédit = 0,01 € équivalent boutique
- Non transférables, non convertibles
- Traçabilité complète des transactions

### Boutique
- Catalogue de produits
- Paiement mixte (crédits + carte)
- Gestion des commandes et livraisons

## 🔒 Sécurité et Conformité

- ✅ HTTPS obligatoire
- ✅ Chiffrement bcrypt des mots de passe
- ✅ Authentification JWT
- ✅ RGPD compliant (export/suppression données)
- ✅ Logs d'audit sur tous les tirages
- ✅ Système "Provably Fair" simplifié

## 💰 Modèle économique

**Sources de revenus**:
- Vente de tickets/packs pour mini-jeux
- Vente directe boutique
- Partenariats marques
- Boosts optionnels

**Cadre légal**:
- Crédits = récompenses promotionnelles (pas de monnaie)
- Participation gratuite possible
- Aucune conversion en argent réel
- Règlement complet publié

## 📈 KPIs

- Joueurs actifs quotidiens (DAU)
- Nombre de parties lancées/jour
- Taux de conversion boutique
- Rétention J+1, J+7, J+30
- Panier moyen boutique

## 🛠️ Commandes utiles

### Backend
```bash
# Développement
npm run start:dev

# Tests
npm run test

# Migrations
npx prisma migrate dev

# Générer client Prisma
npx prisma generate
```

### Frontend
```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer production
npm start
```

## 📝 Documentation API

Une fois le backend lancé, accéder à:
- Swagger UI: http://localhost:3001/api/docs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Propriétaire - Tous droits réservés

## 📧 Contact

Pour toute question ou support: contact@bingoshop.com

---

**Made with ❤️ by the BingoShop Team**
