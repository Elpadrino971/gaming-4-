import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class MissionsService {
  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {
    // Initialize daily missions on startup
    this.initializeDailyMissions();
  }

  /**
   * Create default missions (runs once at startup)
   */
  private async initializeDailyMissions() {
    const dailyMissions = [
      {
        type: 'PLAY_GAMES',
        frequency: 'DAILY',
        title: 'Joue 3 parties',
        description: 'Participe à 3 parties de bingo aujourd\'hui',
        targetValue: 3,
        creditsReward: 50,
        xpReward: 20,
        priority: 1,
      },
      {
        type: 'WIN_GAMES',
        frequency: 'DAILY',
        title: 'Gagne une partie',
        description: 'Remporte au moins une partie de bingo',
        targetValue: 1,
        creditsReward: 100,
        xpReward: 50,
        priority: 2,
      },
      {
        type: 'DAILY_LOGIN',
        frequency: 'DAILY',
        title: 'Connexion quotidienne',
        description: 'Connecte-toi chaque jour pour gagner des bonus',
        targetValue: 1,
        creditsReward: 20,
        xpReward: 10,
        priority: 0,
      },
    ];

    const weeklyMissions = [
      {
        type: 'PLAY_GAMES',
        frequency: 'WEEKLY',
        title: 'Joue 20 parties cette semaine',
        description: 'Participe à 20 parties de bingo cette semaine',
        targetValue: 20,
        creditsReward: 500,
        xpReward: 200,
        priority: 1,
      },
      {
        type: 'SHOP_PURCHASE',
        frequency: 'WEEKLY',
        title: 'Achète dans la boutique',
        description: 'Effectue un achat dans la boutique cette semaine',
        targetValue: 1,
        creditsReward: 200,
        xpReward: 100,
        priority: 2,
      },
      {
        type: 'REFER_FRIEND',
        frequency: 'MONTHLY',
        title: 'Parraine un ami',
        description: 'Invite un ami à rejoindre BingoShop',
        targetValue: 1,
        creditsReward: 500,
        xpReward: 300,
        priority: 3,
      },
    ];

    for (const missionData of [...dailyMissions, ...weeklyMissions]) {
      const existing = await this.prisma.mission.findFirst({
        where: {
          type: missionData.type as any,
          frequency: missionData.frequency as any,
        },
      });

      if (!existing) {
        await this.prisma.mission.create({
          data: missionData as any,
        });
      }
    }
  }

  /**
   * Get user's active missions
   */
  async getUserMissions(userId: string) {
    await this.assignMissionsToUser(userId);

    const userMissions = await this.prisma.userMission.findMany({
      where: {
        userId,
        status: {
          in: ['AVAILABLE', 'IN_PROGRESS', 'COMPLETED'],
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        mission: true,
      },
      orderBy: {
        mission: {
          priority: 'asc',
        },
      },
    });

    return userMissions;
  }

  /**
   * Assign missions to user if they don't have them
   */
  private async assignMissionsToUser(userId: string) {
    const activeMissions = await this.prisma.mission.findMany({
      where: { isActive: true },
    });

    for (const mission of activeMissions) {
      const existing = await this.prisma.userMission.findFirst({
        where: {
          userId,
          missionId: mission.id,
          status: {
            not: 'CLAIMED',
          },
        },
      });

      if (!existing) {
        const expiresAt = this.calculateExpiryDate(mission.frequency as any);

        await this.prisma.userMission.create({
          data: {
            userId,
            missionId: mission.id,
            targetValue: mission.targetValue,
            expiresAt,
          },
        });
      }
    }
  }

  private calculateExpiryDate(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'DAILY':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;

      case 'WEEKLY':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;

      case 'MONTHLY':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;

      default:
        const farFuture = new Date(now);
        farFuture.setFullYear(farFuture.getFullYear() + 1);
        return farFuture;
    }
  }

  /**
   * Update mission progress
   */
  async updateMissionProgress(
    userId: string,
    missionType: string,
    increment: number = 1,
  ) {
    const userMissions = await this.prisma.userMission.findMany({
      where: {
        userId,
        mission: {
          type: missionType as any,
        },
        status: {
          in: ['AVAILABLE', 'IN_PROGRESS'],
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        mission: true,
      },
    });

    for (const userMission of userMissions) {
      const newValue = userMission.currentValue + increment;
      const isCompleted = newValue >= userMission.targetValue;

      await this.prisma.userMission.update({
        where: { id: userMission.id },
        data: {
          currentValue: newValue,
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          startedAt: userMission.startedAt || new Date(),
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }
  }

  /**
   * Claim mission reward
   */
  async claimMissionReward(userId: string, userMissionId: string) {
    const userMission = await this.prisma.userMission.findFirst({
      where: {
        id: userMissionId,
        userId,
      },
      include: {
        mission: true,
      },
    });

    if (!userMission) {
      throw new NotFoundException('Mission not found');
    }

    if (userMission.status !== 'COMPLETED') {
      throw new BadRequestException('Mission not completed yet');
    }

    if (userMission.status === 'CLAIMED') {
      throw new BadRequestException('Reward already claimed');
    }

    // Give credits
    if (userMission.mission.creditsReward > 0) {
      await this.creditsService.addCredits(
        userId,
        userMission.mission.creditsReward,
        'MISSION_REWARD',
        {
          description: `Completed mission: ${userMission.mission.title}`,
        },
      );
    }

    // Give XP
    if (userMission.mission.xpReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: userMission.mission.xpReward },
        },
      });
    }

    // Mark as claimed
    await this.prisma.userMission.update({
      where: { id: userMissionId },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    return {
      success: true,
      creditsEarned: userMission.mission.creditsReward,
      xpEarned: userMission.mission.xpReward,
    };
  }

  /**
   * Get mission statistics
   */
  async getUserMissionStats(userId: string) {
    const [completed, total, totalRewardsEarned] = await Promise.all([
      this.prisma.userMission.count({
        where: {
          userId,
          status: 'CLAIMED',
        },
      }),
      this.prisma.userMission.count({
        where: { userId },
      }),
      this.prisma.creditTransaction.aggregate({
        where: {
          userId,
          type: 'MISSION_REWARD',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      missionsCompleted: completed,
      totalMissions: total,
      totalCreditsEarned: Number(totalRewardsEarned._sum.amount || 0),
    };
  }
}
