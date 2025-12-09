import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { CreateOrderDto } from './dto';
import { TransactionType } from '../types/prisma-enums';

@Injectable()
export class ShopService {
  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  async getProducts(category?: string) {
    const where: any = { status: 'ACTIVE' };

    if (category) {
      where.category = category;
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    // Vérifier l'adresse
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });

    if (!address) {
      throw new BadRequestException('Invalid address');
    }

    // Calculer le total
    let totalCredits = 0;
    let totalEur = 0;

    const items = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Product ${item.productId} not available`,
        );
      }

      if (!product.unlimited && product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );
      }

      const itemTotalCredits = Number(product.priceInCredits) * item.quantity;
      const itemTotalEur = Number(product.priceInEur || 0) * item.quantity;

      totalCredits += itemTotalCredits;
      totalEur += itemTotalEur;

      items.push({
        productId: product.id,
        quantity: item.quantity,
        priceInCredits: product.priceInCredits,
        priceInEur: product.priceInEur || 0,
      });
    }

    // Vérifier le solde de crédits
    const hasEnough = await this.creditsService.hasEnoughCredits(
      userId,
      totalCredits,
    );

    if (!hasEnough) {
      throw new BadRequestException('Insufficient credits');
    }

    // Créer la commande
    const order = await this.prisma.$transaction(async (tx) => {
      // Créer l'order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId: dto.addressId,
          totalCredits,
          totalEur,
          status: 'PENDING',
          items: {
            create: items,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
      });

      // Déduire les crédits
      await this.creditsService.deductCredits(
        userId,
        totalCredits,
        TransactionType.SHOP_PURCHASE,
        {
          orderId: newOrder.id,
          description: `Order ${newOrder.orderNumber}`,
        },
      );

      // Décrémenter le stock
      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product.unlimited) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              totalSold: { increment: item.quantity },
            },
          });
        }
      }

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getCategories() {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { category: true },
      distinct: ['category'],
    });

    return products
      .map((p) => p.category)
      .filter((c) => c !== null)
      .sort();
  }
}
