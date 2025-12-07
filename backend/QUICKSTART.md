# 🚀 GUIDE DE LANCEMENT - BingoShop Backend

## ✅ Ce qui est DÉJÀ FAIT

- ✅ Code backend simplifié (9 tables au lieu de 27)
- ✅ Base de données Supabase configurée et créée
- ✅ .env avec toutes les clés (Supabase, Stripe)
- ✅ Schema Prisma prêt
- ✅ RLS désactivé sur Supabase

## 🎯 LANCER LE BACKEND (5 minutes)

### Étape 1 : Vérifier Node.js

```bash
node --version
# Doit être >= 18.x
```

Si pas installé : https://nodejs.org

---

### Étape 2 : Aller dans le dossier backend

```bash
cd backend
```

---

### Étape 3 : Installer les dépendances

```bash
npm install
```

Cela va installer :
- Prisma + @prisma/client
- NestJS
- Toutes les dépendances

**Temps : ~2 minutes**

---

### Étape 4 : Générer le Prisma Client

```bash
npx prisma generate
```

Cela va :
- Télécharger les binaires Prisma
- Générer le client TypeScript typé
- Se connecter à Supabase

**Temps : ~30 secondes**

---

### Étape 5 : Vérifier la connexion Supabase

```bash
npx prisma db pull
```

Tu devrais voir :
```
✔ Introspected 9 models and wrote them into prisma/schema.prisma
```

Si erreur de connexion :
- Vérifie le DATABASE_URL dans .env
- Vérifie que tu as bien exécuté les scripts SQL dans Supabase

---

### Étape 6 : Lancer le Backend 🚀

```bash
npm run start:dev
```

Tu devrais voir :
```
🎯 BingoShop Backend Started!
================================
🚀 Server running on: http://localhost:3001
📚 API Docs: http://localhost:3001/api/docs
🌍 Environment: development
================================

✅ Database connected
```

---

## 🧪 TESTER QUE ÇA MARCHE

### Test 1 : API Health Check

Ouvre ton navigateur :
```
http://localhost:3001
```

Tu devrais voir la doc Swagger.

---

### Test 2 : Créer un Utilisateur

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "Test123!"
  }'
```

Réponse attendue :
```json
{
  "user": {
    "id": "clxxx...",
    "email": "test@test.com",
    "username": "testuser"
  },
  "token": "eyJhbGc..."
}
```

---

### Test 3 : Vérifier dans Supabase

Va sur Supabase → Table Editor → Table "users"

Tu devrais voir ton utilisateur créé ! ✅

---

## 🔧 SI PROBLÈMES

### Erreur : "Failed to connect to database"

**Solution :**
1. Vérifie le DATABASE_URL dans .env
2. Vérifie que Supabase est accessible
3. Test : `npx prisma db pull`

---

### Erreur : "Port 3001 already in use"

**Solution :**
1. Change le PORT dans .env : `PORT=3002`
2. Ou kill le process : `lsof -ti:3001 | xargs kill`

---

### Erreur : "Cannot find module '@prisma/client'"

**Solution :**
```bash
npm install
npx prisma generate
```

---

### Erreur : "prisma command not found"

**Solution :**
```bash
npm install prisma --save-dev
npm install @prisma/client
```

---

## 📊 PROCHAINES ÉTAPES

Une fois le backend lancé :

### 1. Créer un Admin User

```bash
npx prisma studio
```

Ouvre http://localhost:5555
- Va dans la table "users"
- Crée un user avec role = "ADMIN"

---

### 2. Créer des Produits (Boutique)

Dans Prisma Studio :
- Table "products"
- Ajoute 5-10 produits avec :
  - name
  - description
  - priceInCredits (ex: 15000 pour AirPods)
  - amazonUrl
  - isActive = true

---

### 3. Tester les Endpoints

**Swagger UI :**
```
http://localhost:3001/api/docs
```

Tu peux tester tous les endpoints directement !

---

## 🎮 LANCER UNE PARTIE DE BINGO (Manuel)

### 1. Créer une partie FLASH

```bash
curl -X POST http://localhost:3001/games/create \
  -H "Content-Type: application/json"
```

### 2. Rejoindre la partie

```bash
curl -X POST http://localhost:3001/games/{gameId}/join \
  -H "Authorization: Bearer {your_token}"
```

---

## ✅ CHECKLIST FINALE

- [ ] Backend démarre sans erreur
- [ ] Connexion Supabase OK
- [ ] Création user fonctionne
- [ ] User visible dans Supabase
- [ ] Swagger UI accessible
- [ ] Produits créés dans la DB

**Si TOUT est ✅ → Backend MVP PRÊT !** 🎉

---

## 🚀 PROCHAINE ÉTAPE : Frontend

Une fois le backend qui tourne :
1. Lancer le frontend (Next.js)
2. Connecter au backend
3. Tester le flow complet
4. JOUER au bingo ! 🎲

---

## 💬 BESOIN D'AIDE ?

Si tu bloques :
1. Check les logs du backend
2. Check Supabase (tables créées ?)
3. Test avec Postman/Swagger

**Bon courage !** 🔥
