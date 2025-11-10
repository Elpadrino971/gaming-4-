import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  // Generate unique referral code (shorter than cuid)
  private generateReferralCode(username: string): string {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userPart = username.substring(0, 4).toUpperCase();
    return `${userPart}${randomPart}`;
  }

  // Get referral code for user
  async getReferralCode(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, username: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      code: user.referralCode,
      shareUrl: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    };
  }

  // Apply referral code during registration
  async applyReferralCode(newUserId: string, referralCode: string) {
    // Find referrer by code
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    if (referrer.id === newUserId) {
      throw new BadRequestException('Cannot refer yourself');
    }

    // Update new user with referrer
    await this.prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id },
    });

    // Create referral reward tracking
    await this.prisma.referralReward.create({
      data: {
        referrerId: referrer.id,
        referredUserId: newUserId,
        creditsEarned: 500, // Initial bonus for referrer
        lifetimeEarned: 500,
      },
    });

    // Give bonus to referrer (500 cr)
    await this.prisma.user.update({
      where: { id: referrer.id },
      data: { credits: { increment: 500 } },
    });

    // Create transaction for referrer
    await this.prisma.creditTransaction.create({
      data: {
        userId: referrer.id,
        type: 'REFERRAL_BONUS',
        amount: 500,
        balanceBefore: referrer.credits,
        balanceAfter: new Prisma.Decimal(Number(referrer.credits) + 500),
        description: `Referral bonus for inviting a friend`,
        metadata: { referredUserId: newUserId },
      },
    });

    // Give bonus to new user (200 cr)
    await this.prisma.user.update({
      where: { id: newUserId },
      data: { credits: { increment: 200 } },
    });

    const newUser = await this.prisma.user.findUnique({
      where: { id: newUserId },
    });

    // Create transaction for new user
    await this.prisma.creditTransaction.create({
      data: {
        userId: newUserId,
        type: 'REFERRAL_BONUS',
        amount: 200,
        balanceBefore: 0,
        balanceAfter: 200,
        description: `Welcome bonus for joining via referral`,
        metadata: { referrerId: referrer.id },
      },
    });

    // Send notification to referrer
    await this.prisma.notification.create({
      data: {
        userId: referrer.id,
        type: 'REFERRAL_BONUS',
        title: '🎉 New Referral!',
        message: `${newUser.username} joined using your referral code! You earned 500 credits.`,
      },
    });

    return {
      referrerBonus: 500,
      newUserBonus: 200,
    };
  }

  // Get referral stats for user
  async getReferralStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            totalGamesPlayed: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get referral rewards
    const rewards = await this.prisma.referralReward.findMany({
      where: { referrerId: userId },
    });

    const totalEarned = rewards.reduce(
      (sum, r) => sum + Number(r.lifetimeEarned),
      0,
    );

    return {
      totalReferrals: user.referrals.length,
      activeReferrals: user.referrals.filter((r) => r.totalGamesPlayed > 0)
        .length,
      totalEarned,
      referrals: user.referrals.map((r) => ({
        username: r.username,
        joinedAt: r.createdAt,
        gamesPlayed: r.totalGamesPlayed,
        isActive: r.totalGamesPlayed > 0,
      })),
    };
  }

  // Award 5% of referral's winnings to referrer (called from game service)
  async awardReferralCommission(userId: string, winAmount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (!user || !user.referredBy) {
      return; // No referrer
    }

    const commission = winAmount * 0.05; // 5% of winnings

    // Update referral reward
    await this.prisma.referralReward.updateMany({
      where: {
        referrerId: user.referredBy,
        referredUserId: userId,
      },
      data: {
        creditsEarned: { increment: commission },
        lifetimeEarned: { increment: commission },
      },
    });

    // Give credits to referrer
    const referrer = await this.prisma.user.findUnique({
      where: { id: user.referredBy },
    });

    await this.prisma.user.update({
      where: { id: user.referredBy },
      data: { credits: { increment: commission } },
    });

    // Create transaction
    await this.prisma.creditTransaction.create({
      data: {
        userId: user.referredBy,
        type: 'REFERRAL_BONUS',
        amount: commission,
        balanceBefore: referrer.credits,
        balanceAfter: new Prisma.Decimal(Number(referrer.credits) + commission),
        description: `5% commission from referral's winnings`,
        metadata: { referredUserId: userId, winAmount },
      },
    });
  }

  // Get referral leaderboard
  async getLeaderboard(limit: number = 10) {
    const rewards = await this.prisma.referralReward.groupBy({
      by: ['referrerId'],
      _sum: {
        lifetimeEarned: true,
      },
      _count: {
        referredUserId: true,
      },
      orderBy: {
        _sum: {
          lifetimeEarned: 'desc',
        },
      },
      take: limit,
    });

    // Get user details
    const leaderboard = await Promise.all(
      rewards.map(async (r) => {
        const user = await this.prisma.user.findUnique({
          where: { id: r.referrerId },
          select: { username: true, avatarUrl: true },
        });

        return {
          username: user.username,
          avatarUrl: user.avatarUrl,
          totalReferrals: r._count.referredUserId,
          totalEarned: Number(r._sum.lifetimeEarned || 0),
        };
      }),
    );

    return leaderboard;
  }
}
