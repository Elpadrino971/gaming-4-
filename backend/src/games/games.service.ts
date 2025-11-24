import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { PrizesService } from '../prizes/prizes.service';
import { createHash, randomBytes } from 'crypto';
import { GameType, Prisma } from '@prisma/client';

interface GameConfig {
  type: GameType;
  entryFee: number;
  rakePercent: number;
  multipliers: number[];
  minPlayers: number;
  maxPlayers: number;
}

@Injectable()
export class GamesService {
  // Configurations pour chaque type de jeu
  private readonly gameConfigs: Record<string, GameConfig> = {
    STANDARD: {
      type: 'MINI_BINGO_STANDARD',
      entryFee: 100, // 1€ in credits
      rakePercent: 30,
      multipliers: [1, 1, 1, 2, 2, 2, 5, 5, 10], // 60% x1, 30% x2, 20% x5, 10% x10
      minPlayers: 3,
      maxPlayers: 12,
    },
    PREMIUM: {
      type: 'MINI_BINGO_PREMIUM',
      entryFee: 500, // 5€ in credits
      rakePercent: 25,
      multipliers: [1, 1, 2, 2, 2, 5, 5, 10, 10], // More chances for high multipliers
      minPlayers: 3,
      maxPlayers: 12,
    },
    SPEED: {
      type: 'MINI_BINGO_SPEED',
      entryFee: 50, // 0.50€ in credits
      rakePercent: 35,
      multipliers: [1, 1, 1, 1, 2, 2], // 80% x1, 20% x2
      minPlayers: 3,
      maxPlayers: 8,
    },
    FREE: {
      type: 'MINI_BINGO_FREE',
      entryFee: 0,
      rakePercent: 0,
      multipliers: [1], // Always x1
      minPlayers: 3,
      maxPlayers: 12,
    },
  };

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private prizesService: PrizesService,
  ) {}

  /**
   * Create a new game with proper economic model
   */
  async createGame(gameType: string = 'STANDARD') {
    const config = this.gameConfigs[gameType];
    if (!config) {
      throw new BadRequestException('Invalid game type');
    }

    // Generate provably fair seed
    const seed = randomBytes(32).toString('hex');
    const seedHash = createHash('sha256').update(seed).digest('hex');

    // Select random multiplier based on weighted probabilities
    const multiplier =
      config.multipliers[
        Math.floor(Math.random() * config.multipliers.length)
      ];

    const game = await this.prisma.game.create({
      data: {
        type: config.type,
        status: 'WAITING',
        minPlayers: config.minPlayers,
        maxPlayers: config.maxPlayers,
        entryFee: new Prisma.Decimal(config.entryFee),
        totalCollected: 0,
        rake: new Prisma.Decimal(config.rakePercent),
        rakeAmount: 0,
        basePrizePool: 0,
        finalPrizePool: 0,
        seedHash,
        seed, // In production, encrypt this
        multiplier,
        drawnNumbers: [],
      },
    });

    return game;
  }

  /**
   * Join a game with proper rake calculation
   */
  async joinGame(gameId: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.status !== 'WAITING') {
      throw new BadRequestException('Game already started');
    }

    if (game.participants.length >= game.maxPlayers) {
      throw new BadRequestException('Game is full');
    }

    const alreadyJoined = game.participants.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Already joined this game');
    }

    const entryFee = Number(game.entryFee);

    // FREE games don't require payment
    if (entryFee > 0) {
      // Check if user has enough credits
      const hasEnough = await this.creditsService.hasEnoughCredits(
        userId,
        entryFee,
      );

      if (!hasEnough) {
        throw new BadRequestException('Insufficient credits');
      }

      // Check daily free game limit
      if (game.type === 'MINI_BINGO_FREE') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const freeGamesToday = await this.prisma.gameParticipant.count({
          where: {
            userId,
            game: {
              type: 'MINI_BINGO_FREE',
            },
            joinedAt: {
              gte: today,
            },
          },
        });

        if (freeGamesToday >= 1) {
          throw new BadRequestException(
            'You have already played your free game today',
          );
        }
      }

      // Deduct entry fee
      await this.creditsService.deductCredits(
        userId,
        entryFee,
        'GAME_ENTRY',
        {
          gameId,
          description: `Entry fee for ${game.type} game`,
        },
      );
    }

    // Generate bingo grid
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
            isVip: true,
          },
        },
      },
    });

    // Update game economics
    await this.updateGameEconomics(gameId);

    return {
      participant,
      game: await this.getGameById(gameId),
    };
  }

  /**
   * Update game prize pool with proper rake calculation
   */
  private async updateGameEconomics(gameId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game) return;

    const entryFee = Number(game.entryFee);
    const playerCount = game.participants.length;
    const rakePercent = Number(game.rake);

    // Calculate economics
    const totalCollected = entryFee * playerCount;
    const rakeAmount = totalCollected * (rakePercent / 100);
    const basePrizePool = totalCollected - rakeAmount;
    const finalPrizePool = basePrizePool * game.multiplier;

    // Update game
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        totalCollected: new Prisma.Decimal(totalCollected),
        rakeAmount: new Prisma.Decimal(rakeAmount),
        basePrizePool: new Prisma.Decimal(basePrizePool),
        finalPrizePool: new Prisma.Decimal(finalPrizePool),
      },
    });
  }

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
                isVip: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async getAvailableGames() {
    return this.prisma.game.findMany({
      where: {
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
                isVip: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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

  async checkBingo(gameId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.gameParticipant.findFirst({
      where: { gameId, userId },
    });

    if (!participant) {
      return false;
    }

    const markedCells = participant.markedCells;

    // Check rows
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

    // Check columns
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

    // Check diagonals
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

      // Shuffle
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      grid.push(numbers.slice(0, 5));
    }

    return grid;
  }

  /**
   * End game with VIP bonus calculation
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
      throw new NotFoundException('Game not found');
    }

    const winner = game.participants.find((p) => p.userId === winnerId);
    if (!winner) {
      throw new NotFoundException('Winner not found in participants');
    }

    let basePrize = Number(game.finalPrizePool);

    // Apply VIP bonus (+20% on winnings)
    let vipBonus = 0;
    if (winner.user.isVip) {
      vipBonus = basePrize * 0.2;
      basePrize += vipBonus;
    }

    // Update game
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        winnerId,
        winnerPrize: new Prisma.Decimal(basePrize),
        completedAt: new Date(),
      },
    });

    // Update participant
    await this.prisma.gameParticipant.update({
      where: {
        gameId_userId: {
          gameId,
          userId: winnerId,
        },
      },
      data: {
        isWinner: true,
        prizeWon: new Prisma.Decimal(basePrize),
        finishedAt: new Date(),
      },
    });

    // Award credits to winner
    await this.creditsService.addCredits(winnerId, basePrize, 'GAME_WIN', {
      gameId,
      description: vipBonus > 0
        ? `Won ${game.type} (VIP bonus +${vipBonus.toFixed(0)} credits)`
        : `Won ${game.type}`,
      metadata: {
        baseWin: Number(game.finalPrizePool),
        vipBonus,
        totalWin: basePrize,
      },
    });

    // Update user stats
    await this.prisma.user.update({
      where: { id: winnerId },
      data: {
        totalWins: { increment: 1 },
        totalGamesPlayed: { increment: 1 },
        xp: { increment: 100 },
      },
    });

    // Update other participants' games played
    for (const participant of game.participants) {
      if (participant.userId !== winnerId) {
        await this.prisma.user.update({
          where: { id: participant.userId },
          data: {
            totalGamesPlayed: { increment: 1 },
            xp: { increment: 10 },
          },
        });
      }
    }

    // Track daily stats (for financial dashboard)
    await this.trackDailyStats(game);

    // 🎁 AUTOMATIC PRIZE ATTRIBUTION!
    // Attempt to create physical prize order for winner
    try {
      const prizeResult = await this.prizesService.createPrizeOrderForWinner(
        winnerId,
        basePrize,
        gameId,
      );

      // Log prize attribution result
      console.log(`[PRIZE] Game ${gameId} - Winner ${winnerId}:`, prizeResult.type);
    } catch (error) {
      console.error(`[PRIZE] Error creating prize for winner ${winnerId}:`, error);
      // Don't fail the game completion if prize attribution fails
    }

    return this.getGameById(gameId);
  }

  /**
   * Track daily statistics for financial dashboard
   */
  private async trackDailyStats(game: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await this.prisma.dailyStats.findUnique({
      where: { date: today },
    });

    const rakeCollected = Number(game.rakeAmount);

    if (stats) {
      await this.prisma.dailyStats.update({
        where: { date: today },
        data: {
          gamesPlayed: { increment: 1 },
          totalPlayers: { increment: game.participants.length },
          rakeCollected: { increment: rakeCollected },
          totalRevenue: { increment: rakeCollected },
        },
      });
    } else {
      await this.prisma.dailyStats.create({
        data: {
          date: today,
          gamesPlayed: 1,
          totalPlayers: game.participants.length,
          rakeCollected,
          totalRevenue: rakeCollected,
        },
      });
    }
  }
}
