import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesScheduler {
  private readonly logger = new Logger(GamesScheduler.name);

  constructor(
    private gamesService: GamesService,
    private prisma: PrismaService,
  ) {}

  /**
   * FLASH: Créer automatiquement une partie toutes les 5 minutes
   * Cron: */5 * * * * = Toutes les 5 minutes
   */
  @Cron('*/5 * * * *')
  async createFlashGameEvery5Minutes() {
    try {
      // Vérifier s'il existe déjà une partie FLASH en attente
      const existingGame = await this.prisma.game.findFirst({
        where: {
          type: 'FLASH',
          status: 'WAITING',
        },
      });

      if (existingGame) {
        this.logger.log('[FLASH] Partie déjà en attente, skip création');
        return;
      }

      // Créer nouvelle partie FLASH
      const game = await this.gamesService.createFlashGame();
      this.logger.log(`[FLASH] ✅ Nouvelle partie créée: ${game.id}`);
    } catch (error) {
      this.logger.error('[FLASH] ❌ Erreur création partie:', error);
    }
  }

  /**
   * BIG JACKPOT: Vérifier les tirages à lancer
   * Cron: */1 * * * * = Toutes les 1 minute
   */
  @Cron('*/1 * * * *')
  async checkBigJackpotDraws() {
    try {
      const now = new Date();

      // Trouver les jackpots dont l'heure de tirage est passée
      const readyForDraw = await this.prisma.game.findMany({
        where: {
          type: 'BIG_JACKPOT',
          status: 'OPEN_FOR_TICKETS',
          scheduledDraw: {
            lte: now,
          },
        },
      });

      for (const game of readyForDraw) {
        this.logger.log(`[BIG] 🎰 Lancement tirage: ${game.id} - ${game.prizeProductName}`);
        await this.gamesService.startBigJackpotDraw(game.id);
      }
    } catch (error) {
      this.logger.error('[BIG] ❌ Erreur vérification tirages:', error);
    }
  }

  /**
   * Nettoyer les anciennes parties (optionnel)
   * Cron: 0 3 * * * = Tous les jours à 3h du matin
   */
  @Cron('0 3 * * *')
  async cleanupOldGames() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.prisma.game.deleteMany({
        where: {
          status: 'COMPLETED',
          completedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(`[CLEANUP] ✅ ${result.count} anciennes parties supprimées`);
    } catch (error) {
      this.logger.error('[CLEANUP] ❌ Erreur nettoyage:', error);
    }
  }

  /**
   * Statistiques quotidiennes (optionnel)
   * Cron: 0 0 * * * = Tous les jours à minuit
   */
  @Cron('0 0 * * *')
  async generateDailyStats() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Compter les parties jouées hier
      const gamesPlayed = await this.prisma.game.count({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      // Compter les nouveaux utilisateurs
      const newUsers = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      });

      this.logger.log(`[STATS] 📊 Hier: ${gamesPlayed} parties, ${newUsers} nouveaux users`);
    } catch (error) {
      this.logger.error('[STATS] ❌ Erreur stats:', error);
    }
  }
}
