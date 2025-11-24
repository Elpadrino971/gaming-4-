# 🚀 BingoShop - Guide de Configuration Complète

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn
- Compte Stripe
- Compte SendGrid (optionnel mais recommandé)

---

## ⚙️ INSTALLATION LOCALE

### 1. Clone & Install

```bash
git clone <your-repo>
cd gaming-4-

# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
```

### 2. Configuration Base de Données

```bash
cd backend

# Créer la base de données PostgreSQL
createdb bingoshop

# Configurer .env
DATABASE_URL="postgresql://user:password@localhost:5432/bingoshop"

# Lancer les migrations
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate

# (Optionnel) Seed initial data
npx prisma db seed
```

### 3. Configuration Stripe

1. Créer compte sur https://dashboard.stripe.com
2. Récupérer les clés API (mode test)
3. Créer 5 produits/prix dans Stripe Dashboard:
   - STARTER: 500 credits = 4.99€
   - BASIC: 1000 credits = 9.99€
   - POPULAR: 2500 credits = 19.99€
   - PREMIUM: 5000 credits = 39.99€
   - MEGA: 10000 credits = 74.99€

4. Configurer backend/.env:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_POPULAR="price_..."
STRIPE_PRICE_PREMIUM="price_..."
STRIPE_PRICE_MEGA="price_..."
```

5. Configurer Webhook:
   - URL: https://yourdomain.com/stripe/webhook
   - Events: payment_intent.succeeded, payment_intent.payment_failed
   - Copier webhook secret dans .env

### 4. Configuration Email (SendGrid)

1. Créer compte sur https://sendgrid.com
2. Créer API Key
3. Configurer backend/.env:
```env
SENDGRID_API_KEY="SG...."
EMAIL_FROM="noreply@yourdomain.com"
```

### 5. Lancer en Local

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev
# API disponible sur http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App disponible sur http://localhost:3000
```

---

## 🌍 DÉPLOIEMENT PRODUCTION

### Option 1: VPS (Scaleway, OVH, DigitalOcean)

**Specs recommandées:**
- 4GB RAM
- 2 vCPU
- 80GB SSD
- Ubuntu 22.04 LTS

**Installation:**

```bash
# SSH vers votre serveur
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Nginx
sudo apt-get install nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone projet
git clone <your-repo>
cd gaming-4-

# Backend
cd backend
npm install --production
cp .env.example .env
# Éditer .env avec vos vraies clés

# Build
npm run build

# Migrations
npx prisma migrate deploy
npx prisma generate

# Lancer avec PM2
pm2 start dist/main.js --name bingoshop-api
pm2 save
pm2 startup

# Frontend
cd ../frontend
npm install --production
npm run build

# Lancer avec PM2
pm2 start npm --name bingoshop-web -- start
pm2 save
```

**Configuration Nginx:**

```nginx
# /etc/nginx/sites-available/bingoshop
server {
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
}
```

**SSL Certificate (Let's Encrypt):**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Vercel (Frontend) + Railway/Render (Backend)

**Frontend sur Vercel:**
1. Connecter votre repo GitHub à Vercel
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Environment Variables: Configurer NEXT_PUBLIC_*

**Backend sur Railway:**
1. Connecter repo GitHub
2. Root Directory: `backend`
3. Start Command: `npm run start:prod`
4. Ajouter PostgreSQL plugin
5. Configurer variables d'environnement

---

## 🔐 SÉCURITÉ PRODUCTION

### Checklist Obligatoire:

- [ ] Changer JWT_SECRET (générer 32+ caractères aléatoires)
- [ ] Changer ADMIN_PASSWORD
- [ ] Activer HTTPS (SSL)
- [ ] Configurer CORS strictement
- [ ] Activer rate limiting
- [ ] Backups DB automatiques (quotidiens)
- [ ] Monitoring (Sentry, Datadog)
- [ ] Firewall (UFW ou cloud firewall)
- [ ] Fail2ban pour SSH

```bash
# Générer JWT_SECRET sécurisé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 MONITORING

### PM2 Logs & Status:

```bash
pm2 status
pm2 logs bingoshop-api
pm2 logs bingoshop-web
pm2 monit
```

### Database Backups:

```bash
# Créer backup
pg_dump bingoshop > backup_$(date +%Y%m%d).sql

# Restaurer backup
psql bingoshop < backup_20240101.sql

# Automatiser (crontab)
crontab -e
# Ajouter: 0 2 * * * pg_dump bingoshop > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 🧪 TESTS

```bash
# Backend
cd backend
npm run test
npm run test:e2e

# Frontend
cd frontend
npm run test
```

---

## 🚨 TROUBLESHOOTING

### Backend ne démarre pas:
- Vérifier DATABASE_URL
- Vérifier que PostgreSQL tourne: `sudo systemctl status postgresql`
- Vérifier les logs: `pm2 logs bingoshop-api`

### Payments Stripe ne marchent pas:
- Vérifier webhook secret
- Tester webhook avec Stripe CLI: `stripe listen --forward-to localhost:3001/stripe/webhook`
- Vérifier logs Stripe Dashboard

### Emails ne partent pas:
- Vérifier SendGrid API key
- Vérifier domaine vérifié dans SendGrid
- Checker logs: `pm2 logs bingoshop-api --lines 100`

---

## 📝 MAINTENANCE

### Mettre à jour l'app:

```bash
git pull
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart all
```

### Migrations DB:

```bash
cd backend
npx prisma migrate dev --name your_migration_name
npx prisma migrate deploy  # Production
```

---

## 📞 SUPPORT

- Documentation: https://docs.bingoshop.fr
- Email: support@bingoshop.fr
- GitHub Issues: https://github.com/your-repo/issues

