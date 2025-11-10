import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattlePassService {
  constructor(private prisma: PrismaService) {}

  async getCurrentBattlePass() {
    return this.prisma.battlePass.findFirst({
      where: { status: 'ACTIVE' },
      include: { rewards: { orderBy: { tier: 'asc' } } },
    });
  }

  async getUserProgress(userId: string) {
    const battlePass = await this.getCurrentBattlePass();
    if (!battlePass) return null;

    let userProgress = await this.prisma.userBattlePass.findUnique({
      where: {
        userId_battlePassId: { userId, battlePassId: battlePass.id },
      },
    });

    if (!userProgress) {
      userProgress = await this.prisma.userBattlePass.create({
        data: {
          userId,
          battlePassId: battlePass.id,
        },
      });
    }

    return {
      ...userProgress,
      battlePass,
      percentComplete: (userProgress.currentTier / battlePass.maxTier) * 100,
    };
  }

  async purchasePremium(userId: string) {
    const progress = await this.getUserProgress(userId);

    await this.prisma.userBattlePass.update({
      where: { id: progress.id },
      data: { hasPremium: true, purchasedAt: new Date() },
    });

    return { success: true };
  }

  async claimReward(userId: string, tier: number) {
    const progress = await this.getUserProgress(userId);

    if (tier > progress.currentTier) {
      throw new Error('Tier not reached');
    }

    if (progress.claimedTiers.includes(tier)) {
      throw new Error('Reward already claimed');
    }

    const reward = await this.prisma.battlePassReward.findFirst({
      where: {
        battlePassId: progress.battlePassId,
        tier,
        OR: [{ isFree: true }, { isPremium: progress.hasPremium }],
      },
    });

    if (!reward) {
      throw new Error('No reward available');
    }

    // Give reward (implement based on rewardType)

    await this.prisma.userBattlePass.update({
      where: { id: progress.id },
      data: { claimedTiers: { push: tier } },
    });

    return { success: true, reward };
  }

  async addXP(userId: string, xp: number) {
    const progress = await this.getUserProgress(userId);

    const newXP = progress.currentXP + xp;
    const tiersGained = Math.floor(newXP / progress.xpPerTier);
    const newTier = Math.min(
      progress.currentTier + tiersGained,
      progress.battlePass.maxTier,
    );
    const remainingXP = newXP % progress.xpPerTier;

    await this.prisma.userBattlePass.update({
      where: { id: progress.id },
      data: {
        currentXP: remainingXP,
        currentTier: newTier,
      },
    });

    return { newTier, xpGained: xp };
  }
}
