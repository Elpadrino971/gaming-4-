import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CosmeticsService {
  constructor(private prisma: PrismaService) {}

  async getAllCosmetics(type?: string) {
    return this.prisma.cosmeticItem.findMany({
      where: {
        isAvailable: true,
        ...(type && { type: type as any }),
      },
      orderBy: [{ rarity: 'desc' }, { priceCredits: 'asc' }],
    });
  }

  async getUserCosmetics(userId: string) {
    const cosmetics = await this.prisma.userCosmetic.findMany({
      where: { userId },
      include: { cosmetic: true },
    });

    return {
      owned: cosmetics,
      equipped: cosmetics.filter((c) => c.isEquipped),
    };
  }

  async purchaseCosmetic(userId: string, cosmeticId: string) {
    // Check if already owned
    const existing = await this.prisma.userCosmetic.findUnique({
      where: {
        userId_cosmeticId: { userId, cosmeticId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already owned');
    }

    const cosmetic = await this.prisma.cosmeticItem.findUnique({
      where: { id: cosmeticId },
    });

    if (!cosmetic || !cosmetic.isAvailable) {
      throw new BadRequestException('Cosmetic not available');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (Number(user.credits) < cosmetic.priceCredits) {
      throw new BadRequestException('Insufficient credits');
    }

    // Deduct credits
    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cosmetic.priceCredits } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        type: 'SHOP_PURCHASE',
        amount: -cosmetic.priceCredits,
        balanceBefore: user.credits,
        balanceAfter: new Prisma.Decimal(
          Number(user.credits) - cosmetic.priceCredits,
        ),
        description: `Purchased cosmetic: ${cosmetic.name}`,
      },
    });

    // Grant cosmetic
    return this.prisma.userCosmetic.create({
      data: { userId, cosmeticId },
      include: { cosmetic: true },
    });
  }

  async equipCosmetic(userId: string, cosmeticId: string) {
    const userCosmetic = await this.prisma.userCosmetic.findUnique({
      where: {
        userId_cosmeticId: { userId, cosmeticId },
      },
      include: { cosmetic: true },
    });

    if (!userCosmetic) {
      throw new BadRequestException('Cosmetic not owned');
    }

    // Unequip all of same type
    await this.prisma.userCosmetic.updateMany({
      where: {
        userId,
        cosmetic: { type: userCosmetic.cosmetic.type },
      },
      data: { isEquipped: false },
    });

    // Equip this one
    return this.prisma.userCosmetic.update({
      where: { id: userCosmetic.id },
      data: { isEquipped: true },
    });
  }
}
