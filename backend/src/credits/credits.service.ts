import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TransactionType } from '../types/prisma-enums';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add credits to a user (game win, purchase, bonus, etc.)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    options?: {
      gameId?: string;
      orderId?: string;
      paymentId?: string;
      description?: string;
      metadata?: any;
    },
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const balanceBefore = Number(user.credits);
    const balanceAfter = balanceBefore + amount;

    // Transaction atomique
    const [updatedUser, transaction] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          type,
          amount: amount,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          gameId: options?.gameId,
          orderId: options?.orderId,
          paymentId: options?.paymentId,
          description: options?.description,
          metadata: options?.metadata,
        },
      }),
    ]);

    return {
      transaction,
      newBalance: Number(updatedUser.credits),
    };
  }

  /**
   * Deduct credits from a user (shop purchase, game entry, etc.)
   */
  async deductCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    options?: {
      gameId?: string;
      orderId?: string;
      description?: string;
      metadata?: any;
    },
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const balanceBefore = Number(user.credits);

    if (balanceBefore < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    const balanceAfter = balanceBefore - amount;

    // Transaction atomique
    const [updatedUser, transaction] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId,
          type,
          amount: -amount, // Négatif pour débit
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          gameId: options?.gameId,
          orderId: options?.orderId,
          description: options?.description,
          metadata: options?.metadata,
        },
      }),
    ]);

    return {
      transaction,
      newBalance: Number(updatedUser.credits),
    };
  }

  /**
   * Get user's credit balance
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      credits: Number(user.credits),
      creditsInEur: Number(user.credits) * 0.01, // 1 crédit = 0.01€
    };
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: TransactionType;
    },
  ) {
    const where: any = { userId };

    if (options?.type) {
      where.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 20,
        skip: options?.offset || 0,
      }),
      this.prisma.creditTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return false;
    }

    return Number(user.credits) >= amount;
  }

  /**
   * Get statistics for a user
   */
  async getUserCreditStats(userId: string) {
    const transactions = await this.prisma.creditTransaction.findMany({
      where: { userId },
    });

    const totalEarned = transactions
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSpent = Math.abs(
      transactions
        .filter((t) => Number(t.amount) < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0),
    );

    const currentBalance = await this.getBalance(userId);

    return {
      totalEarned,
      totalSpent,
      currentBalance: currentBalance.credits,
      transactionCount: transactions.length,
    };
  }
}
