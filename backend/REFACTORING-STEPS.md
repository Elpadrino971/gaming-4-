# 🔧 REFACTORING ÉTAPES - Backend Simplifié

## ✅ COMPLÉTÉ

1. ✅ Nouveau schema Prisma (schema-new.prisma)
2. ✅ Suppression modules inutiles (achievements, battle-pass, etc.)
3. ✅ Mise à jour app.module.ts
4. ✅ Nouveau games.service.ts (games.service-new.ts)
5. ✅ Scheduler automatique (games.scheduler.ts)

---

## 🔄 PROCHAINES ÉTAPES MANUELLES

### Étape 1 : Appliquer le Nouveau Schema

```bash
cd backend

# Backup de l'ancien schema
cp prisma/schema.prisma prisma/schema-old-backup.prisma

# Remplacer par le nouveau
cp prisma/schema-new.prisma prisma/schema.prisma

# Générer la migration
npx prisma migrate dev --name simplify_mvp

# Ou reset complet (ATTENTION: perte de données)
npx prisma migrate reset
npx prisma db push
npx prisma generate
```

### Étape 2 : Activer le Nouveau Games Service

```bash
# Backup de l'ancien service
mv src/games/games.service.ts src/games/games.service-old.ts

# Activer le nouveau
mv src/games/games.service-new.ts src/games/games.service.ts
```

### Étape 3 : Mettre à Jour games.module.ts

```typescript
// backend/src/games/games.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // NOUVEAU
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesScheduler } from './games.scheduler'; // NOUVEAU
import { BingoGateway } from './bingo.gateway';
import { BingoEngine } from './bingo.engine';
import { CreditsModule } from '../credits/credits.module';
import { PrizesModule } from '../prizes/prizes.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // NOUVEAU: Activer les cron jobs
    CreditsModule,
    PrizesModule,
  ],
  controllers: [GamesController],
  providers: [
    GamesService,
    GamesScheduler, // NOUVEAU: Scheduler auto
    BingoGateway,
    BingoEngine,
  ],
  exports: [GamesService],
})
export class GamesModule {}
```

### Étape 4 : Installer @nestjs/schedule

```bash
cd backend
npm install @nestjs/schedule
```

### Étape 5 : Mettre à Jour games.controller.ts

Le controller doit exposer les nouveaux endpoints :

```typescript
// backend/src/games/games.controller.ts

import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  // ============================================
  // FLASH GAMES
  // ============================================

  @Get('flash/available')
  async getAvailableFlashGames() {
    return this.gamesService.getAvailableFlashGames();
  }

  @Post('flash/:id/join')
  @UseGuards(JwtAuthGuard)
  async joinFlashGame(@Param('id') gameId: string, @Req() req) {
    return this.gamesService.joinFlashGame(gameId, req.user.id);
  }

  // ============================================
  // BIG JACKPOT
  // ============================================

  @Get('jackpot/active')
  async getActiveJackpots() {
    return this.gamesService.getActiveBigJackpots();
  }

  @Post('jackpot/:id/buy-ticket')
  @UseGuards(JwtAuthGuard)
  async buyJackpotTicket(@Param('id') gameId: string, @Req() req) {
    // Note: Le paiement Stripe doit être fait AVANT dans payments.service.ts
    return this.gamesService.buyBigJackpotTicket(gameId, req.user.id);
  }

  // ============================================
  // ADMIN: Créer un BIG JACKPOT
  // ============================================

  @Post('jackpot/create')
  @UseGuards(JwtAuthGuard) // TODO: Add RolesGuard(ADMIN)
  async createJackpot(@Body() body) {
    return this.gamesService.createBigJackpot({
      ticketPrice: body.ticketPrice,
      prizeProductName: body.prizeProductName,
      prizeProductValue: body.prizeProductValue,
      prizeProductCost: body.prizeProductCost,
      rake: 30,
      scheduledStart: new Date(body.scheduledStart),
      scheduledDraw: new Date(body.scheduledDraw),
    });
  }

  // ============================================
  // COMMUN
  // ============================================

  @Get(':id')
  async getGame(@Param('id') id: string) {
    return this.gamesService.getGameById(id);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  async getUserGames(@Req() req) {
    return this.gamesService.getUserGames(req.user.id);
  }
}
```

---

## 📦 NOUVEAUX PACKAGES REQUIS

```bash
npm install @nestjs/schedule
```

---

## 🗂️ STRUCTURE FICHIERS

```
backend/src/games/
├── games.module.ts          ← À mettre à jour
├── games.controller.ts      ← À mettre à jour
├── games.service.ts         ← NOUVEAU (remplace l'ancien)
├── games.scheduler.ts       ← NOUVEAU
├── bingo.gateway.ts         ← Garder (WebSocket)
├── bingo.engine.ts          ← Garder (logique bingo)
└── games.service-old.ts     ← Backup
```

---

## 🧪 TESTER

### 1. Vérifier que le Scheduler Fonctionne

```bash
# Démarrer le backend
npm run start:dev

# Observer les logs
# Tu devrais voir toutes les 5 minutes:
# [FLASH] ✅ Nouvelle partie créée: clxxxx
```

### 2. Tester FLASH via API

```bash
# Obtenir les parties disponibles
curl http://localhost:3001/games/flash/available

# Rejoindre une partie (avec token JWT)
curl -X POST http://localhost:3001/games/flash/{gameId}/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Tester BIG JACKPOT (Admin)

```bash
# Créer un jackpot (admin uniquement)
curl -X POST http://localhost:3001/games/jackpot/create \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketPrice": 5.00,
    "prizeProductName": "AirPods Pro",
    "prizeProductValue": 279.00,
    "prizeProductCost": 220.00,
    "scheduledStart": "2024-01-15T00:00:00Z",
    "scheduledDraw": "2024-01-21T20:00:00Z"
  }'

# Voir les jackpots actifs
curl http://localhost:3001/games/jackpot/active
```

---

## ⚠️ POINTS D'ATTENTION

### 1. Paiements BIG JACKPOT

Le service actuel ne gère pas encore le paiement Stripe pour les tickets.
Il faut :

1. User clique "Acheter ticket"
2. Frontend appelle `POST /payments/create-intent` avec `gameId`
3. Stripe Payment Intent créé
4. User paye
5. Webhook Stripe confirme → appelle `buyBigJackpotTicket()`

### 2. Attribution Lot Physique

Quand un BIG JACKPOT est gagné, il faut automatiquement :

1. Créer une Order dans la DB
2. Envoyer email au gagnant pour confirmer adresse
3. Commander sur Amazon
4. Mettre à jour le tracking

Actuellement marqué `// TODO` dans `endGame()`

### 3. WebSocket (Bingo en temps réel)

Les fichiers `bingo.gateway.ts` et `bingo.engine.ts` gèrent le jeu en temps réel.
Ils doivent être mis à jour pour supporter les nouveaux types de parties.

---

## 🎯 RÉSUMÉ

**Ce qui a changé :**
- ✅ Schema simplifié (9 tables au lieu de 27)
- ✅ Modules inutiles supprimés
- ✅ Nouveau service games (FLASH + BIG)
- ✅ Scheduler automatique

**Ce qui reste à faire :**
- [ ] Appliquer migration Prisma
- [ ] Installer @nestjs/schedule
- [ ] Mettre à jour games.module.ts
- [ ] Mettre à jour games.controller.ts
- [ ] Tester le système
- [ ] Intégrer paiements Stripe pour BIG
- [ ] Automatiser création commandes lots physiques

**Temps estimé :** 2-3 heures
