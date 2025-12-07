import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddressesService } from '../addresses/addresses.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrizesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private addressesService: AddressesService,
  ) {}

  /**
   * Automatically create an order for a bingo winner with physical prize
   * This is called when someone wins a bingo game
   */
  async createPrizeOrderForWinner(userId: string, prizePoolInCredits: number, gameId: string) {
    // Step 1: Find best matching product
    const product = await this.productsService.findProductForPrizePool(prizePoolInCredits);

    if (!product) {
      // No physical product available - winner just gets credits
      return {
        type: 'CREDITS_ONLY',
        credits: prizePoolInCredits,
        message: 'No physical prize available for this amount',
      };
    }

    // Step 2: Check if user has a default address
    const defaultAddress = await this.addressesService.getDefaultAddress(userId);

    if (!defaultAddress) {
      // User needs to provide address before prize can be shipped
      return {
        type: 'ADDRESS_REQUIRED',
        product,
        credits: prizePoolInCredits,
        message: 'Please provide shipping address to receive your prize',
      };
    }

    // Step 3: Create order with the matched product
    const order = await this.createOrderFromPrize(
      userId,
      product.id,
      defaultAddress.id,
      prizePoolInCredits,
      gameId,
    );

    // Step 4: Mark product as sold
    await this.productsService.markAsSold(product.id, 1);

    return {
      type: 'PRIZE_ORDER_CREATED',
      order,
      product,
      address: defaultAddress,
      message: `Your prize (${product.name}) will be shipped soon!`,
    };
  }

  /**
   * Create order from a prize win
   */
  private async createOrderFromPrize(
    userId: string,
    productId: string,
    addressId: string,
    prizePoolInCredits: number,
    gameId: string,
  ) {
    const product = await this.productsService.getProduct(productId);

    // Create order with PAID status (no payment needed - it's a prize!)
    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        status: 'PAID', // Already "paid" via game win
        totalCredits: 0, // Winner pays nothing
        totalEur: 0,
        paidAt: new Date(),
        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              priceInCredits: 0, // Free for winner
              priceInEur: 0,
            },
          ],
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

    // Create notification for user
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'ORDER_SHIPPED',
        title: 'Félicitations ! Votre lot est en préparation',
        message: `Vous avez gagné ${product.name} ! Votre commande sera expédiée sous 48h.`,
        link: `/orders/${order.id}`,
      },
    });

    // Log in admin for tracking
    await this.prisma.adminLog.create({
      data: {
        adminId: 'SYSTEM',
        action: 'PRODUCT_CREATED',
        targetType: 'Order',
        targetId: order.id,
        description: `Prize order created for user ${userId} - Won ${product.name} (${prizePoolInCredits} credits) from game ${gameId}`,
        metadata: {
          gameId,
          productId: product.id,
          prizePoolInCredits,
        },
      },
    });

    return order;
  }

  /**
   * Handle prize when user adds address after winning
   */
  async completePrizeWithAddress(userId: string, prizePoolInCredits: number, gameId: string, addressId: string) {
    // Find best matching product
    const product = await this.productsService.findProductForPrizePool(prizePoolInCredits);

    if (!product) {
      throw new BadRequestException('No product available for this prize');
    }

    // Verify address belongs to user
    const address = await this.addressesService.getAddress(addressId, userId);

    // Create order
    const order = await this.createOrderFromPrize(
      userId,
      product.id,
      addressId,
      prizePoolInCredits,
      gameId,
    );

    // Mark product as sold
    await this.productsService.markAsSold(product.id, 1);

    return {
      order,
      product,
      address,
    };
  }

  /**
   * Get prize recommendation for a given amount
   * (useful for preview/testing)
   */
  async getPrizeRecommendation(prizePoolInCredits: number) {
    const product = await this.productsService.findProductForPrizePool(prizePoolInCredits);

    if (!product) {
      return {
        type: 'CREDITS_ONLY',
        credits: prizePoolInCredits,
        recommendation: null,
      };
    }

    return {
      type: 'PHYSICAL_PRIZE',
      credits: prizePoolInCredits,
      recommendation: {
        productId: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        value: Number(product.priceInCredits),
        valueDifference: Math.abs(Number(product.priceInCredits) - prizePoolInCredits),
        percentageMatch: (
          (1 - Math.abs(Number(product.priceInCredits) - prizePoolInCredits) / prizePoolInCredits) *
          100
        ).toFixed(1),
      },
    };
  }

  /**
   * Get all prize orders (ADMIN)
   */
  async getPrizeOrders(status?: string) {
    const where: any = {
      totalCredits: 0, // Prize orders have 0 cost
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update prize order status (ADMIN)
   */
  async updatePrizeOrderStatus(orderId: string, status: string, trackingNumber?: string, carrier?: string) {
    const updateData: any = { status };

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (carrier) updateData.carrier = carrier;
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Notify user
    if (status === 'SHIPPED') {
      await this.prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER_SHIPPED',
          title: 'Votre lot a été expédié !',
          message: `Votre commande #${order.orderNumber} est en route. Numéro de suivi : ${trackingNumber}`,
          link: `/orders/${order.id}`,
        },
      });
    }

    return order;
  }
}
