import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { Prisma } from '@prisma/client';
import { TransactionType } from '../types/prisma-enums';

// ============================================
// GAME CONFIGURATIONS
// ============================================

interface FlashGameConfig {
  entryFeeCredits: number;
  prizeCredits: number;
  rake: number;
  minPlayers: number;
  maxPlayers: number;
  autoStartInterval: number; // minutes
}

interface BigJackpotConfig {
  ticketPrice: number; // EUR
  prizeProductName: string;
  prizeProductValue: number; // EUR valeur retail
  prizeProductCost: number; // EUR coût Amazon
  rake: number;
  scheduledStart: Date;
  scheduledDraw: Date;
}

@Injectable()
export class GamesService {
  // Configuration FLASH (parties rapides)
  private readonly FLASH_CONFIG: FlashGameConfig = {
    entryFeeCredits: 100, // 1€ en crédits
    prizeCredits: 700, // 70% du pot
    rake: 30, // 30%
    minPlayers: 3,
    maxPlayers: 10,
    autoStartInterval: 5, // Toutes les 5 minutes
  };

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  // ============================================
  // FLASH GAMES (Parties Rapides)
  // ============================================

  /**
   * Créer une partie FLASH automatique
   */
  async createFlashGame() {
    const game = await this.prisma.game.create({
      data: {
        type: 'FLASH',
        status: 'WAITING',
        minPlayers: this.FLASH_CONFIG.minPlayers,
        maxPlayers: this.FLASH_CONFIG.maxPlayers,
        entryFeeCredits: this.FLASH_CONFIG.entryFeeCredits,
        prizeCredits: this.FLASH_CONFIG.prizeCredits,
        rake: this.FLASH_CONFIG.rake,
        drawnNumbers: [],
        scheduledStart: new Date(Date.now() + this.FLASH_CONFIG.autoStartInterval * 60 * 1000),
      },
    });

    console.log(`[FLASH] Nouvelle partie créée: ${game.id}`);
    return game;
  }

  /**
   * Rejoindre une partie FLASH
   */
  async joinFlashGame(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) {
      throw new NotFoundException('Partie introuvable');
    }

    if (game.type !== 'FLASH') {
      throw new BadRequestException('Ce n\'est pas une partie FLASH');
    }

    if (game.status !== 'WAITING') {
      throw new BadRequestException('La partie a déjà commencé');
    }

    if (game.participants.length >= game.maxPlayers) {
      throw new BadRequestException('Partie complète');
    }

    const alreadyJoined = game.participants.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Vous avez déjà rejoint cette partie');
    }

    const entryFee = Number(game.entryFeeCredits);

    // Vérifier et débiter les crédits
    const hasEnough = await this.creditsService.hasEnoughCredits(userId, entryFee);
    if (!hasEnough) {
      throw new BadRequestException('Crédits insuffisants');
    }

    await this.creditsService.deductCredits(
      userId,
      entryFee,
      TransactionType.GAME_ENTRY,
      {
        gameId,
        description: `Entrée partie FLASH`,
      },
    );

    // Générer grille de bingo
    const grid = this.generateBingoGrid();
    const markedCells = new Array(25).fill(false);

    const participant = await this.prisma.gameParticipant.create({
      data: {
        gameId,
        userId,
        grid,
        markedCells,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Si partie complète, démarrer automatiquement
    const updatedGame = await this.getGameById(gameId);
    if (updatedGame.participants.length >= game.maxPlayers) {
      await this.startGame(gameId);
    }

    return {
      participant,
      game: updatedGame,
    };
  }

  // ============================================
  // BIG JACKPOT (Concours Hebdo)
  // ============================================

  /**
   * Créer un BIG JACKPOT (admin uniquement)
   */
  async createBigJackpot(config: BigJackpotConfig) {
    const game = await this.prisma.game.create({
      data: {
        type: 'BIG_JACKPOT',
        status: 'OPEN_FOR_TICKETS',
        minPlayers: 3, // Minimum pour lancer
        maxPlayers: null, // Illimité !
        ticketPrice: config.ticketPrice,
        ticketsSold: 0,
        prizeProductName: config.prizeProductName,
        prizeProductValue: config.prizeProductValue,
        prizeProductCost: config.prizeProductCost,
        rake: config.rake,
        drawnNumbers: [],
        scheduledStart: config.scheduledStart,
        scheduledDraw: config.scheduledDraw,
      },
    });

    console.log(`[BIG] Nouveau jackpot créé: ${game.id} - ${config.prizeProductName}`);
    return game;
  }

  /**
   * Acheter un ticket pour BIG JACKPOT
   * Note: Le paiement Stripe est géré dans payments.service.ts
   */
  async buyBigJackpotTicket(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) {
      throw new NotFoundException('Jackpot introuvable');
    }

    if (game.type !== 'BIG_JACKPOT') {
      throw new BadRequestException('Ce n\'est pas un BIG JACKPOT');
    }

    if (game.status !== 'OPEN_FOR_TICKETS') {
      throw new BadRequestException('La vente de tickets est fermée');
    }

    // Générer numéro de ticket unique
    const ticketNumber = game.ticketsSold + 1;

    // Générer grille de bingo (pour le concours)
    const grid = this.generateBingoGrid();
    const markedCells = new Array(25).fill(false);

    const participant = await this.prisma.gameParticipant.create({
      data: {
        gameId,
        userId,
        grid,
        markedCells,
        ticketNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Incrémenter le compteur de tickets
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        ticketsSold: { increment: 1 },
      },
    });

    console.log(`[BIG] Ticket #${ticketNumber} vendu à ${userId} pour ${game.prizeProductName}`);

    return {
      participant,
      ticketNumber,
      game: await this.getGameById(gameId),
    };
  }

  /**
   * Démarrer le tirage BIG JACKPOT
   * (appelé automatiquement par le scheduler à scheduledDraw)
   */
  async startBigJackpotDraw(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) {
      throw new NotFoundException('Jackpot introuvable');
    }

    if (game.participants.length < game.minPlayers) {
      // Pas assez de participants, annuler et rembourser
      await this.cancelBigJackpot(gameId);
      return;
    }

    // Lancer la partie normale (tous jouent en même temps)
    await this.startGame(gameId);

    console.log(`[BIG] Tirage lancé: ${game.id} - ${game.ticketsSold} tickets vendus`);
  }

  // ============================================
  // GAME LOGIC (Commun FLASH + BIG)
  // ============================================

  /**
   * Démarrer une partie
   */
  async startGame(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Partie introuvable');
    }

    if (game.status !== 'WAITING' && game.status !== 'OPEN_FOR_TICKETS') {
      throw new BadRequestException('La partie ne peut pas être démarrée');
    }

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'STARTING',
        startedAt: new Date(),
      },
    });

    // Dans un vrai système, ici on lance le timer et le tirage des numéros
    // Pour l'instant, on simule avec IN_PROGRESS direct
    setTimeout(async () => {
      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'IN_PROGRESS',
        },
      });
    }, 3000); // 3 secondes de countdown

    console.log(`[GAME] Partie démarrée: ${gameId}`);
  }

  /**
   * Terminer une partie et attribuer le gain
   */
  async endGame(gameId: string, winnerId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Partie introuvable');
    }

    const winner = game.participants.find((p) => p.userId === winnerId);
    if (!winner) {
      throw new NotFoundException('Gagnant introuvable');
    }

    let winnerPrize: string;

    if (game.type === 'FLASH') {
      // FLASH: Attribuer des crédits
      const prizeAmount = Number(game.prizeCredits);

      await this.creditsService.addCredits(winnerId, prizeAmount, TransactionType.GAME_WIN, {
        gameId,
        description: `Victoire partie FLASH`,
      });

      winnerPrize = `${prizeAmount} crédits`;

      // Mettre à jour le participant
      await this.prisma.gameParticipant.update({
        where: {
          gameId_userId: {
            gameId,
            userId: winnerId,
          },
        },
        data: {
          isWinner: true,
          prizeWon: winnerPrize,
          finishedAt: new Date(),
        },
      });
    } else if (game.type === 'BIG_JACKPOT') {
      // BIG: Lot physique
      winnerPrize = game.prizeProductName;

      // Mettre à jour le participant
      await this.prisma.gameParticipant.update({
        where: {
          gameId_userId: {
            gameId,
            userId: winnerId,
          },
        },
        data: {
          isWinner: true,
          prizeWon: winnerPrize,
          finishedAt: new Date(),
        },
      });

      // TODO: Créer automatiquement une commande pour le lot physique
      // via prizes.service.ts ou orders.service.ts
    }

    // Mettre à jour la partie
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        winnerId,
        winnerPrize,
        completedAt: new Date(),
      },
    });

    // Mettre à jour les stats utilisateur
    await this.prisma.user.update({
      where: { id: winnerId },
      data: {
        totalWins: { increment: 1 },
        totalGamesPlayed: { increment: 1 },
      },
    });

    // Autres participants
    for (const participant of game.participants) {
      if (participant.userId !== winnerId) {
        await this.prisma.user.update({
          where: { id: participant.userId },
          data: {
            totalGamesPlayed: { increment: 1 },
          },
        });
      }
    }

    console.log(`[GAME] Partie terminée: ${gameId} - Gagnant: ${winner.user.username}`);

    return this.getGameById(gameId);
  }

  /**
   * Annuler un BIG JACKPOT (pas assez de participants)
   */
  async cancelBigJackpot(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) {
      throw new NotFoundException('Jackpot introuvable');
    }

    // TODO: Rembourser tous les participants via Stripe
    // Pour l'instant, juste marquer comme annulé

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log(`[BIG] Jackpot annulé: ${gameId} - Pas assez de participants`);
  }

  /**
   * Vérifier si un joueur a fait BINGO
   */
  async checkBingo(gameId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.gameParticipant.findFirst({
      where: { gameId, userId },
    });

    if (!participant) {
      return false;
    }

    const markedCells = participant.markedCells;

    // Vérifier lignes
    for (let row = 0; row < 5; row++) {
      if (
        markedCells[row * 5] &&
        markedCells[row * 5 + 1] &&
        markedCells[row * 5 + 2] &&
        markedCells[row * 5 + 3] &&
        markedCells[row * 5 + 4]
      ) {
        return true;
      }
    }

    // Vérifier colonnes
    for (let col = 0; col < 5; col++) {
      if (
        markedCells[col] &&
        markedCells[col + 5] &&
        markedCells[col + 10] &&
        markedCells[col + 15] &&
        markedCells[col + 20]
      ) {
        return true;
      }
    }

    // Vérifier diagonales
    if (
      markedCells[0] &&
      markedCells[6] &&
      markedCells[12] &&
      markedCells[18] &&
      markedCells[24]
    ) {
      return true;
    }

    if (
      markedCells[4] &&
      markedCells[8] &&
      markedCells[12] &&
      markedCells[16] &&
      markedCells[20]
    ) {
      return true;
    }

    return false;
  }

  // ============================================
  // QUERIES
  // ============================================

  async getGameById(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Partie introuvable');
    }

    return game;
  }

  async getAvailableFlashGames() {
    return this.prisma.game.findMany({
      where: {
        type: 'FLASH',
        status: 'WAITING',
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getActiveBigJackpots() {
    return this.prisma.game.findMany({
      where: {
        type: 'BIG_JACKPOT',
        status: 'OPEN_FOR_TICKETS',
      },
      include: {
        participants: {
          select: {
            ticketNumber: true,
          },
        },
      },
      orderBy: { scheduledDraw: 'asc' },
    });
  }

  async getUserGames(userId: string) {
    return this.prisma.gameParticipant.findMany({
      where: { userId },
      include: {
        game: true,
      },
      orderBy: { joinedAt: 'desc' },
      take: 50,
    });
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Générer une grille de bingo 5x5
   */
  private generateBingoGrid(): number[][] {
    const grid: number[][] = [];

    for (let col = 0; col < 5; col++) {
      const column: number[] = [];
      const min = col * 15 + 1;
      const max = min + 14;

      const numbers = [];
      for (let i = min; i <= max; i++) {
        numbers.push(i);
      }

      // Shuffle Fisher-Yates
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      grid.push(numbers.slice(0, 5));
    }

    return grid;
  }
}
