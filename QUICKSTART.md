# 🚀 Guide de Démarrage Rapide - BingoShop

## Prérequis

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

## Installation Rapide (avec Docker)

### 1. Cloner et configurer

```bash
# Cloner le repository
git clone <repo-url>
cd gaming-4-

# Copier les fichiers d'environnement
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Configurer les variables d'environnement

**Backend (.env)**
```env
# Laisser les valeurs par défaut pour le développement local
# Modifier uniquement si nécessaire
DATABASE_URL=postgresql://bingoshop:bingoshop_secret_2024@postgres:5432/bingoshop?schema=public
REDIS_HOST=redis
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe (à configurer avec vos clés)
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
```

### 3. Lancer avec Docker

```bash
# Lancer tous les services
docker-compose up -d

# Attendre que les services démarrent (30 secondes)
sleep 30

# Initialiser la base de données
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
```

### 4. Accéder à l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Installation Manuelle (sans Docker)

### 1. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer .env
cp .env.example .env
# Modifier DATABASE_URL, REDIS_HOST pour pointer vers vos instances locales

# Initialiser la base de données
npx prisma migrate dev
npx prisma db seed

# Lancer le backend
npm run start:dev
```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer .env.local
cp .env.example .env.local

# Lancer le frontend
npm run dev
```

### 3. Services externes requis

- PostgreSQL 15+
- Redis 7+

## Comptes de test

Après le seed de la base de données, vous pouvez utiliser :

**Admin**
- Email: `admin@bingoshop.com`
- Password: `Admin123!ChangeMe`

**Utilisateurs de démo**
- Email: `demo1@bingoshop.com` à `demo5@bingoshop.com`
- Password: `Demo123!`

## Fonctionnalités disponibles

### Phase 1 - MVP (Actuel)

✅ **Authentification**
- Inscription / Connexion
- JWT sécurisé
- Validation des formulaires

✅ **Mini Bingo Express**
- Parties rapides 2-3 min
- 3-12 joueurs
- Temps réel avec Socket.io
- Multiplicateurs aléatoires (x1, x2, x5, x10)

✅ **Système de Crédits**
- Crédits virtuels non convertibles
- Historique des transactions
- Statistiques utilisateur

✅ **Boutique**
- Catalogue de produits
- Paiement en crédits
- Paiement mixte (crédits + €)
- Gestion des commandes

✅ **Paiements Stripe**
- Achat de crédits
- Webhooks sécurisés
- Packs de crédits avec bonus

✅ **Admin Dashboard**
- Statistiques globales
- Gestion utilisateurs
- Gestion commandes
- Gestion produits
- Historique des jeux

### Phase 2 - À venir

🔜 Bingo à paliers progressifs (jauges)
🔜 Roue quotidienne gratuite
🔜 Système de parrainage multiniveaux
🔜 Points XP et classements
🔜 Badges de fidélité

### Phase 3 - Futur

📱 Application mobile React Native
🤝 Partenariats marques
🔔 Notifications push

## Architecture

```
┌─────────────┐         ┌─────────────┐
│   Frontend  │ ◄──────►│   Backend   │
│  (Next.js)  │  HTTP   │  (NestJS)   │
└─────────────┘ WebSocket└─────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
         │ PostgreSQL │ │  Redis  │ │  Stripe   │
         └────────────┘ └─────────┘ └───────────┘
```

## Développement

### Commandes utiles

**Backend**
```bash
# Tests
npm run test

# Build production
npm run build

# Migrations Prisma
npx prisma migrate dev
npx prisma studio  # GUI pour la base de données
```

**Frontend**
```bash
# Build production
npm run build

# Lancer en production
npm start

# Lint
npm run lint
```

### Structure des dossiers

```
gaming-4-/
├── backend/
│   ├── src/
│   │   ├── auth/        # Authentification
│   │   ├── users/       # Utilisateurs
│   │   ├── games/       # Jeux bingo
│   │   ├── credits/     # Crédits
│   │   ├── shop/        # Boutique
│   │   ├── payments/    # Stripe
│   │   └── admin/       # Admin
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   └── src/
│       ├── app/         # Pages Next.js
│       ├── components/  # Composants React
│       └── lib/         # Utilitaires
└── docker-compose.yml
```

## Déploiement

### Production

1. **Configurer les variables d'environnement de production**
2. **Build des images Docker**
```bash
docker-compose -f docker-compose.prod.yml build
```
3. **Lancer en production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### AWS (Recommandé)

- **Backend**: ECS Fargate
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Frontend**: Vercel ou Amplify
- **Storage**: S3 + CloudFront

## Support

Pour toute question :
- Documentation API: `/api/docs`
- Issues GitHub
- Email: support@bingoshop.com

## Sécurité

⚠️ **Important** :
- Changez tous les secrets en production
- Activez HTTPS
- Configurez CORS correctement
- Utilisez des variables d'environnement sécurisées
- Activez les backups réguliers de la base de données

## Licence

Propriétaire - Tous droits réservés

---

**Bon développement ! 🎯**
