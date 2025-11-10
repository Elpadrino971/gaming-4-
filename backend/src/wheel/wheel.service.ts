import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface WheelReward {
  type: 'CREDITS' | 'FREE_GAME' | 'VIP_DAY' | 'JACKPOT' | 'XP';
  value: number;
  probability: number; // 0-100
  label: string;
}

@Injectable()
export class WheelService {
  constructor(private prisma: PrismaService) {}

  private readonly WHEEL_REWARDS: WheelReward[] = [
    { type: 'CREDITS', value: 10, probability: 30, label: '10 Credits' },
    { type: 'CREDITS', value: 25, probability: 25, label: '25 Credits' },
    { type: 'CREDITS', value: 50, probability: 20, label: '50 Credits' },
    { type: 'CREDITS', value: 100, probability: 15, label: '100 Credits' },
    { type: 'FREE_GAME', value: 1, probability: 7, label: 'Free Game' },
    { type: 'VIP_DAY', value: 1, probability: 2, label: '1 Day VIP' },
    { type: 'JACKPOT', value: 1000, probability: 1, label: '🎰 JACKPOT 1000cr!' },
  ];

  // Check if user can spin today
  async canSpin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVip: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const spinsToday = await this.prisma.dailyWheelSpin.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const maxSpins = user.isVip ? 2 : 1;
    return spinsToday < maxSpins;
  }

  // Get spins remaining today
  async getSpinsRemaining(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVip: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const spinsToday = await this.prisma.dailyWheelSpin.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    const maxSpins = user.isVip ? 2 : 1;
    return {
      spinsRemaining: Math.max(0, maxSpins - spinsToday),
      maxSpins,
      isVip: user.isVip,
    };
  }

  // Spin the wheel
  async spin(userId: string) {
    // Check if can spin
    const canSpin = await this.canSpin(userId);
    if (!canSpin) {
      throw new BadRequestException('No spins remaining today');
    }

    // Select random reward based on probabilities
    const reward = this.selectReward();

    // Create spin record
    const spin = await this.prisma.dailyWheelSpin.create({
      data: {
        userId,
        rewardType: reward.type,
        rewardValue: reward.value,
      },
    });

    // Apply reward
    await this.applyReward(userId, reward);

    return {
      spinId: spin.id,
      reward: {
        type: reward.type,
        value: reward.value,
        label: reward.label,
      },
    };
  }

  // Select reward based on probabilities
  private selectReward(): WheelReward {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const reward of this.WHEEL_REWARDS) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }

    // Fallback (should never happen)
    return this.WHEEL_REWARDS[0];
  }

  // Apply reward to user
  private async applyReward(userId: string, reward: WheelReward) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    switch (reward.type) {
      case 'CREDITS':
        await this.prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: reward.value } },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId,
            type: 'DAILY_WHEEL',
            amount: reward.value,
            balanceBefore: user.credits,
            balanceAfter: new Prisma.Decimal(
              Number(user.credits) + reward.value,
            ),
            description: `Daily wheel reward: ${reward.value} credits`,
          },
        });
        break;

      case 'XP':
        await this.prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: reward.value } },
        });
        break;

      case 'VIP_DAY':
        // Give 1 day of VIP
        const vipExpiry = new Date();
        vipExpiry.setDate(vipExpiry.getDate() + 1);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            isVip: true,
            vipExpiresAt: vipExpiry,
          },
        });
        break;

      case 'FREE_GAME':
        // Add free game credits (100cr for standard game)
        await this.prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: 100 } },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId,
            type: 'DAILY_WHEEL',
            amount: 100,
            balanceBefore: user.credits,
            balanceAfter: new Prisma.Decimal(Number(user.credits) + 100),
            description: `Daily wheel reward: Free game ticket`,
          },
        });
        break;

      case 'JACKPOT':
        await this.prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: reward.value } },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId,
            type: 'DAILY_WHEEL',
            amount: reward.value,
            balanceBefore: user.credits,
            balanceAfter: new Prisma.Decimal(
              Number(user.credits) + reward.value,
            ),
            description: `🎰 JACKPOT! Daily wheel reward: ${reward.value} credits`,
          },
        });

        // Send notification
        await this.prisma.notification.create({
          data: {
            userId,
            type: 'CREDITS_RECEIVED',
            title: '🎰 JACKPOT!!!',
            message: `You won the JACKPOT on the daily wheel! ${reward.value} credits added to your account!`,
          },
        });
        break;
    }
  }

  // Get user's spin history
  async getHistory(userId: string, limit: number = 10) {
    const spins = await this.prisma.dailyWheelSpin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return spins.map((s) => ({
      id: s.id,
      rewardType: s.rewardType,
      rewardValue: s.rewardValue,
      spunAt: s.createdAt,
    }));
  }

  // Get wheel configuration (for frontend)
  getWheelConfig() {
    return {
      rewards: this.WHEEL_REWARDS.map((r) => ({
        type: r.type,
        value: r.value,
        label: r.label,
        probability: r.probability,
      })),
    };
  }
}
