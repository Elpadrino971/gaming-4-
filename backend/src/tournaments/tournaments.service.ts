import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  // Create weekly tournament (admin)
  async createTournament(data: {
    name: string;
    description: string;
    entryFee: number;
    basePrizePool: number;
    maxParticipants: number;
    startTime: Date;
  }) {
    const registrationStart = new Date(data.startTime);
    registrationStart.setDate(registrationStart.getDate() - 2); // 2 days before

    const registrationEnd = new Date(data.startTime);
    registrationEnd.setHours(registrationEnd.getHours() - 1); // 1 hour before

    return this.prisma.tournament.create({
      data: {
        ...data,
        totalPrizePool: data.basePrizePool,
        registrationStart,
        registrationEnd,
        status: 'UPCOMING',
      },
    });
  }

  // Get active tournaments
  async getActiveTournaments() {
    return this.prisma.tournament.findMany({
      where: {
        status: { in: ['UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS'] },
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Register for tournament
  async registerForTournament(tournamentId: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { participants: true } } },
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    if (tournament.status !== 'REGISTRATION_OPEN') {
      throw new BadRequestException('Registration is closed');
    }

    if (tournament._count.participants >= tournament.maxParticipants) {
      throw new BadRequestException('Tournament is full');
    }

    // Check if already registered
    const existing = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: { tournamentId, userId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already registered');
    }

    // Check user credits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (Number(user.credits) < Number(tournament.entryFee)) {
      throw new BadRequestException('Insufficient credits');
    }

    // Deduct entry fee
    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: Number(tournament.entryFee) } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type: 'GAME_ENTRY',
        amount: -Number(tournament.entryFee),
        balanceBefore: user.credits,
        balanceAfter: new Prisma.Decimal(
          Number(user.credits) - Number(tournament.entryFee),
        ),
        description: `Tournament entry: ${tournament.name}`,
      },
    });

    // Register participant
    await this.prisma.tournamentParticipant.create({
      data: { tournamentId, userId },
    });

    // Increase prize pool
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        totalPrizePool: {
          increment: Number(tournament.entryFee),
        },
      },
    });

    return { success: true };
  }

  // Get leaderboard
  async getLeaderboard(tournamentId: string) {
    const participants = await this.prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        tournament: true,
      },
      orderBy: [{ gamesWon: 'desc' }, { totalWinnings: 'desc' }],
    });

    // Get user details
    return Promise.all(
      participants.map(async (p, index) => {
        const user = await this.prisma.user.findUnique({
          where: { id: p.userId },
          select: { username: true, avatarUrl: true },
        });

        return {
          rank: index + 1,
          username: user.username,
          avatarUrl: user.avatarUrl,
          gamesPlayed: p.gamesPlayed,
          gamesWon: p.gamesWon,
          totalWinnings: Number(p.totalWinnings),
          prizeWon: p.prizeWon ? Number(p.prizeWon) : null,
        };
      }),
    );
  }

  // Update participant stats (called from games service)
  async updateParticipantStats(
    userId: string,
    tournamentId: string,
    isWin: boolean,
    winnings: number,
  ) {
    await this.prisma.tournamentParticipant.updateMany({
      where: { tournamentId, userId },
      data: {
        gamesPlayed: { increment: 1 },
        gamesWon: { increment: isWin ? 1 : 0 },
        totalWinnings: { increment: winnings },
      },
    });
  }

  // End tournament and distribute prizes
  async endTournament(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    const leaderboard = await this.getLeaderboard(tournamentId);

    if (leaderboard.length === 0) {
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED', endTime: new Date() },
      });
      return;
    }

    // Calculate prizes
    const totalPrize = Number(tournament.totalPrizePool);
    const firstPrize = (totalPrize * tournament.firstPlacePct) / 100;
    const secondPrize = (totalPrize * tournament.secondPlacePct) / 100;
    const thirdPrize = (totalPrize * tournament.thirdPlacePct) / 100;

    // Award prizes
    if (leaderboard[0]) {
      await this.awardPrize(
        tournamentId,
        leaderboard[0].username,
        firstPrize,
        1,
      );
    }
    if (leaderboard[1]) {
      await this.awardPrize(
        tournamentId,
        leaderboard[1].username,
        secondPrize,
        2,
      );
    }
    if (leaderboard[2]) {
      await this.awardPrize(
        tournamentId,
        leaderboard[2].username,
        thirdPrize,
        3,
      );
    }

    // Update tournament
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        firstPlaceId: leaderboard[0]?.username,
        secondPlaceId: leaderboard[1]?.username,
        thirdPlaceId: leaderboard[2]?.username,
      },
    });
  }

  private async awardPrize(
    tournamentId: string,
    username: string,
    amount: number,
    rank: number,
  ) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { credits: { increment: amount } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'GAME_WIN',
        amount,
        balanceBefore: user.credits,
        balanceAfter: new Prisma.Decimal(Number(user.credits) + amount),
        description: `Tournament ${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} Place Prize`,
      },
    });

    await this.prisma.tournamentParticipant.updateMany({
      where: { tournamentId, userId: user.id },
      data: { rank, prizeWon: amount },
    });
  }
}
