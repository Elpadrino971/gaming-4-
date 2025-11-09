import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  async createGame(entryFee: number = 1) {
    // Generate provably fair seed
    const seed = randomBytes(32).toString('hex');
    const seedHash = createHash('sha256').update(seed).digest('hex');

    // Calculate multiplier (random: x1, x2, x5, x10)
    const multipliers = [1, 1, 1, 2, 2, 5, 10]; // Weighted random
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];

    const prizePool = entryFee * 10 * multiplier; // Base prize

    const game = await this.prisma.game.create({
      data: {
        type: 'MINI_BINGO_EXPRESS',
        status: 'WAITING',
        minPlayers: 3,
        maxPlayers: 12,
        entryFee,
        prizePool,
        seedHash,
        seed: null, // Will be revealed after game
        multiplier,
        drawnNumbers: [],
      },
    });

    // Store seed for later reveal (in production, use Redis or encrypted storage)
    await this.prisma.game.update({
      where: { id: game.id },
      data: { seed }, // Temporary - should be stored securely
    });

    return game;
  }

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

    // Check if already joined
    const alreadyJoined = game.participants.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Already joined this game');
    }

    // Check credits
    const hasEnough = await this.creditsService.hasEnoughCredits(
      userId,
      Number(game.entryFee),
    );

    if (!hasEnough) {
      throw new BadRequestException('Insufficient credits');
    }

    // Deduct entry fee
    await this.creditsService.deductCredits(
      userId,
      Number(game.entryFee),
      'GAME_ENTRY',
      {
        gameId,
        description: `Entry fee for game ${gameId}`,
      },
    );

    // Generate bingo grid for user
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

    return {
      participant,
      game: await this.getGameById(gameId),
    };
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
    const grid = participant.grid;

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

      // Shuffle and take 5
      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }

      grid.push(numbers.slice(0, 5));
    }

    return grid;
  }

  async endGame(gameId: string, winnerId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const prizeAmount = Number(game.prizePool);

    // Update game
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        winnerId,
        winnerPrize: prizeAmount,
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
        prizeWon: prizeAmount,
        finishedAt: new Date(),
      },
    });

    // Award credits to winner
    await this.creditsService.addCredits(winnerId, prizeAmount, 'GAME_WIN', {
      gameId,
      description: `Won game ${gameId}`,
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
    const participants = await this.prisma.gameParticipant.findMany({
      where: { gameId },
    });

    for (const participant of participants) {
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

    return this.getGameById(gameId);
  }
}
