# 🔄 MIGRATION VERS MVP SIMPLIFIÉ

## 📊 Résumé des Changements

### Avant
- **27 tables** complexes
- Battle Pass, Cosmétiques, Tournois, Achievements, Missions, VIP, etc.
- Multiplicateurs aléatoires
- 4 types de jeux (STANDARD, PREMIUM, SPEED, FREE)

### Après
- **9 tables** essentielles
- 2 types de jeux : FLASH + BIG_JACKPOT
- Rake fixe 30%
- Code 70% plus simple

---

## ✅ TABLES CONSERVÉES (9)

### Core Business
1. **User** (simplifié)
   - ❌ Supprimé : `level`, `xp`, `isVip`, `vipSince`, `loginStreak`, `referralCode`, etc.
   - ✅ Gardé : `id`, `email`, `username`, `password`, `credits`, `totalGamesPlayed`, `totalWins`

2. **Address** (identique)
   - Gardé tel quel pour livraisons

3. **Game** (refactorisé)
   - ❌ Supprimé : `seedHash`, `seed`, `multiplier`, `totalCollected`, `basePrizePool`
   - ✅ Ajouté : `type` (FLASH | BIG_JACKPOT), `ticketPrice`, `ticketsSold`, `prizeProductName`
   - ✅ Support des 2 modes dans 1 table

4. **GameParticipant** (simplifié)
   - ❌ Supprimé : `prizeWon` (Decimal)
   - ✅ Ajouté : `prizeWon` (String), `ticketNumber` (pour BIG)

5. **CreditTransaction** (simplifié)
   - ❌ Supprimé : types complexes
   - ✅ Gardé : types essentiels

6. **Product** (simplifié)
   - ❌ Supprimé : `status` enum, `priceInEur`
   - ✅ Gardé : `priceInCredits`, `amazonUrl`, `stock`

7. **Order** (simplifié)
   - ❌ Supprimé : `totalEur`, `paidAt`
   - ✅ Gardé : `totalCredits`, status workflow

8. **OrderItem** (identique)
   - Gardé tel quel

9. **Payment** (simplifié)
   - ❌ Supprimé : `PaymentType` enum
   - ✅ Ajouté : `creditsAmount`, `gameId` pour context

---

## ❌ TABLES SUPPRIMÉES (18)

### Gamification Avancée
- ❌ `BattlePass`
- ❌ `BattlePassReward`
- ❌ `UserBattlePass`
- ❌ `CosmeticItem`
- ❌ `UserCosmetic`
- ❌ `Achievement`
- ❌ `UserAchievement`
- ❌ `Mission`
- ❌ `UserMission`

### Features Non-MVP
- ❌ `Tournament`
- ❌ `TournamentParticipant`
- ❌ `DailyWheelSpin`
- ❌ `ReferralReward`
- ❌ `Subscription` (VIP)
- ❌ `Notification`
- ❌ `ChatMessage`
- ❌ `PushSubscription`
- ❌ `DailyStats`

---

## 🎮 NOUVEAU MODÈLE DE JEU

### FLASH (Parties Rapides)
```typescript
{
  type: "FLASH",
  maxPlayers: 10,
  entryFeeCredits: 100,
  prizeCredits: 700,
  rake: 30,
  status: "WAITING" → "STARTING" → "IN_PROGRESS" → "COMPLETED"
}
```

### BIG_JACKPOT (Concours Hebdo)
```typescript
{
  type: "BIG_JACKPOT",
  maxPlayers: null, // Illimité
  ticketPrice: 5.00, // EUR
  ticketsSold: 0,
  prizeProductName: "iPhone 15 Pro",
  prizeProductValue: 1199.00,
  prizeProductCost: 900.00,
  scheduledStart: "2024-01-15T00:00:00Z",
  scheduledDraw: "2024-01-21T20:00:00Z",
  status: "OPEN_FOR_TICKETS" → "IN_PROGRESS" → "COMPLETED"
}
```

---

## 🚀 PLAN DE MIGRATION

### Étape 1 : Backup
```bash
# Backup de la DB actuelle
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Étape 2 : Nouvelle Migration
```bash
# Remplacer l'ancien schema
mv prisma/schema.prisma prisma/schema-old.prisma
mv prisma/schema-new.prisma prisma/schema.prisma

# Générer la migration
npx prisma migrate dev --name simplify_to_mvp

# Ou reset complet (ATTENTION: perte de données)
npx prisma migrate reset
npx prisma migrate dev
```

### Étape 3 : Seed Initial
```bash
# Créer admin + produits de base
npx prisma db seed
```

---

## 📝 MODULES À SUPPRIMER

### Backend (src/)
```bash
rm -rf src/achievements/
rm -rf src/battle-pass/
rm -rf src/cosmetics/
rm -rf src/missions/
rm -rf src/tournaments/
rm -rf src/wheel/
rm -rf src/referrals/
rm -rf src/vip/
rm -rf src/chat/
```

### Garder
```
✅ src/auth/
✅ src/users/
✅ src/games/       # À refactoriser
✅ src/credits/
✅ src/shop/
✅ src/products/
✅ src/payments/
✅ src/admin/
✅ src/prisma/
```

---

## 🎯 PRODUITS STRIPE À CRÉER

### Packs de Crédits
```
1. Starter Pack
   - 1,000 Crédits → 9.99€
   - stripe_price_id: price_xxxxx

2. Popular Pack ⭐
   - 5,000 Crédits → 44.99€
   - stripe_price_id: price_xxxxx

3. Mega Pack
   - 10,000 Crédits → 79.99€
   - stripe_price_id: price_xxxxx
```

### Tickets BIG JACKPOT (À la volée)
```
# Créé dynamiquement pour chaque BIG
# Prix: 3-10€ selon le lot
```

---

## ✅ CHECKLIST

### Base de Données
- [ ] Backup DB actuelle
- [ ] Appliquer nouveau schema
- [ ] Seed admin user
- [ ] Seed 20 produits Amazon

### Backend
- [ ] Supprimer modules inutiles
- [ ] Refactoriser games.service.ts
- [ ] Créer scheduler (cron) pour FLASH auto
- [ ] Créer système BIG JACKPOT
- [ ] Tester endpoints

### Frontend
- [ ] Simplifier pages
- [ ] Lobby FLASH + BIG
- [ ] Page jeu (bingo grid)
- [ ] Boutique Amazon
- [ ] Mon compte / historique

### Business
- [ ] Créer compte Stripe
- [ ] Créer 3 produits crédits
- [ ] Liste 20 produits Amazon
- [ ] CGU/CGV
- [ ] Test end-to-end

---

## 🔥 PROCHAINES ÉTAPES

1. **Valider ce schema** ✅
2. **Appliquer migration**
3. **Refactoriser games.service.ts**
4. **Créer scheduler automatique**
5. **Simplifier frontend**
6. **Lancer beta test**

---

## 📞 Support

Si problème durant migration :
- Restaurer backup : `psql $DATABASE_URL < backup.sql`
- Rollback Prisma : `npx prisma migrate resolve --rolled-back <migration_name>`
