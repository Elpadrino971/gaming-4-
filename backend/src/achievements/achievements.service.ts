import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'GAMES' | 'WINS' | 'SOCIAL' | 'SPENDING' | 'SPECIAL';
  requirement: any;
  creditsReward: number;
  xpReward: number;
  isRare: boolean;
}

@Injectable()
export class AchievementsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  private readonly ACHIEVEMENTS: AchievementDefinition[] = [
    {
      key: 'FIRST_BLOOD',
      name: 'First Blood',
      description: 'Win your first game',
      icon: '🏆',
      category: 'WINS',
      requirement: { type: 'WINS', count: 1 },
      creditsReward: 50,
      xpReward: 100,
      isRare: false,
    },
    {
      key: 'ON_FIRE',
      name: 'On Fire',
      description: 'Win 5 games in a row',
      icon: '🔥',
      category: 'WINS',
      requirement: { type: 'WIN_STREAK', count: 5 },
      creditsReward: 250,
      xpReward: 500,
      isRare: true,
    },
    {
      key: 'VIP_FOUNDER',
      name: 'VIP Founder',
      description: 'Be VIP for 6 months',
      icon: '👑',
      category: 'SPECIAL',
      requirement: { type: 'VIP_DURATION', days: 180 },
      creditsReward: 1000,
      xpReward: 2000,
      isRare: true,
    },
    {
      key: 'SHARPSHOOTER',
      name: 'Sharpshooter',
      description: 'Win a bingo in less than 30 numbers',
      icon: '🎯',
      category: 'WINS',
      requirement: { type: 'FAST_WIN', maxNumbers: 30 },
      creditsReward: 100,
      xpReward: 200,
      isRare: false,
    },
    {
      key: 'WHALE',
      name: 'Whale',
      description: 'Spend 1000€ in the shop',
      icon: '🐋',
      category: 'SPENDING',
      requirement: { type: 'TOTAL_SPENT', amount: 1000 },
      creditsReward: 5000,
      xpReward: 10000,
      isRare: true,
    },
    {
      key: 'SOCIAL_BUTTERFLY',
      name: 'Social Butterfly',
      description: 'Refer 10 friends',
      icon: '🦋',
      category: 'SOCIAL',
      requirement: { type: 'REFERRALS', count: 10 },
      creditsReward: 500,
      xpReward: 1000,
      isRare: false,
    },
    {
      key: 'CENTURY',
      name: 'Century Club',
      description: 'Play 100 games',
      icon: '💯',
      category: 'GAMES',
      requirement: { type: 'GAMES_PLAYED', count: 100 },
      creditsReward: 200,
      xpReward: 400,
      isRare: false,
    },
    {
      key: 'LUCKY_SEVEN',
      name: 'Lucky Seven',
      description: 'Win 7 games on a Sunday',
      icon: '🍀',
      category: 'SPECIAL',
      requirement: { type: 'SUNDAY_WINS', count: 7 },
      creditsReward: 777,
      xpReward: 777,
      isRare: true,
    },
  ];

  async onModuleInit() {
    await this.initializeAchievements();
  }

  // Initialize default achievements
  private async initializeAchievements() {
    for (const achievement of this.ACHIEVEMENTS) {
      const existing = await this.prisma.achievement.findUnique({
        where: { key: achievement.key },
      });

      if (!existing) {
        await this.prisma.achievement.create({
          data: {
            key: achievement.key,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            requirement: achievement.requirement as Prisma.InputJsonValue,
            creditsReward: achievement.creditsReward,
            xpReward: achievement.xpReward,
            isRare: achievement.isRare,
          },
        });
      }
    }
  }

  // Get user's achievements
  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { createdAt: 'desc' },
    });

    const unlocked = userAchievements.filter((ua) => ua.isUnlocked);
    const inProgress = userAchievements.filter((ua) => !ua.isUnlocked);

    return {
      unlocked: unlocked.map((ua) => ({
        id: ua.id,
        achievement: ua.achievement,
        unlockedAt: ua.unlockedAt,
      })),
      inProgress: inProgress.map((ua) => ({
        id: ua.id,
        achievement: ua.achievement,
        progress: ua.progress,
        target: ua.target,
      })),
      totalUnlocked: unlocked.length,
      totalAchievements: this.ACHIEVEMENTS.length,
    };
  }

  // Check and unlock achievements for user
  async checkAchievements(userId: string, event: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { referrals: true },
    });

    if (!user) return;

    // Check each achievement
    for (const achievementDef of this.ACHIEVEMENTS) {
      const achievement = await this.prisma.achievement.findUnique({
        where: { key: achievementDef.key },
      });

      if (!achievement) continue;

      // Check if user already has this achievement
      const userAchievement = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (userAchievement?.isUnlocked) continue;

      // Check if achievement criteria met
      const { met, progress } = await this.checkCriteria(
        userId,
        achievementDef.requirement,
        data,
      );

      if (!userAchievement) {
        // Create new user achievement
        await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress,
            target: achievementDef.requirement.count || 1,
            isUnlocked: met,
            unlockedAt: met ? new Date() : null,
          },
        });
      } else {
        // Update progress
        await this.prisma.userAchievement.update({
          where: { id: userAchievement.id },
          data: {
            progress,
            isUnlocked: met,
            unlockedAt: met ? new Date() : null,
          },
        });
      }

      // If unlocked, give rewards
      if (met && !userAchievement?.isUnlocked) {
        await this.giveRewards(userId, achievement);
      }
    }
  }

  // Check if criteria met
  private async checkCriteria(
    userId: string,
    requirement: any,
    eventData: any,
  ): Promise<{ met: boolean; progress: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { referrals: true },
    });

    switch (requirement.type) {
      case 'WINS':
        return {
          met: user.totalWins >= requirement.count,
          progress: user.totalWins,
        };

      case 'GAMES_PLAYED':
        return {
          met: user.totalGamesPlayed >= requirement.count,
          progress: user.totalGamesPlayed,
        };

      case 'REFERRALS':
        return {
          met: user.referrals.length >= requirement.count,
          progress: user.referrals.length,
        };

      case 'WIN_STREAK':
        // This would need to be tracked separately
        return { met: false, progress: 0 };

      case 'VIP_DURATION':
        if (!user.isVip || !user.vipSince) {
          return { met: false, progress: 0 };
        }
        const daysSinceVip = Math.floor(
          (Date.now() - user.vipSince.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          met: daysSinceVip >= requirement.days,
          progress: daysSinceVip,
        };

      case 'FAST_WIN':
        if (eventData?.drawnNumbers) {
          const met = eventData.drawnNumbers.length <= requirement.maxNumbers;
          return { met, progress: met ? 1 : 0 };
        }
        return { met: false, progress: 0 };

      default:
        return { met: false, progress: 0 };
    }
  }

  // Give rewards for unlocking achievement
  private async giveRewards(userId: string, achievement: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Give credits
    if (achievement.creditsReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: achievement.creditsReward } },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: 'MISSION_REWARD',
          amount: achievement.creditsReward,
          balanceBefore: user.credits,
          balanceAfter: new Prisma.Decimal(
            Number(user.credits) + achievement.creditsReward,
          ),
          description: `Achievement unlocked: ${achievement.name}`,
        },
      });
    }

    // Give XP
    if (achievement.xpReward > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: achievement.xpReward } },
      });
    }

    // Send notification
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: `🏆 Achievement Unlocked!`,
        message: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
      },
    });
  }

  // Get all achievements
  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { category: 'asc' },
    });
  }
}
