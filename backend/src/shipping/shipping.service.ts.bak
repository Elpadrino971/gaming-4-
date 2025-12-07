import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShippingService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Shipping rates for France (Colissimo)
   */
  private readonly shippingRates = {
    FR: {
      LETTER: 4.99, // Lettre suivie (< 250g)
      SMALL: 6.99, // Colissimo (< 2kg)
      MEDIUM: 9.99, // Colissimo (2-5kg)
      LARGE: 14.99, // Colissimo (> 5kg)
    },
    EU: {
      SMALL: 8.99,
      MEDIUM: 14.99,
      LARGE: 19.99,
    },
    WORLD: {
      SMALL: 12.99,
      MEDIUM: 24.99,
      LARGE: 34.99,
    },
  };

  /**
   * Get pending prize orders that need shipping
   */
  async getPendingShipments() {
    return this.prisma.order.findMany({
      where: {
        status: 'PAID',
        totalCredits: 0, // Prize orders
      },
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
        paidAt: 'asc', // Oldest first
      },
    });
  }

  /**
   * Get all shipments with status filter
   */
  async getShipments(status?: string) {
    const where: any = {
      totalCredits: 0, // Prize orders only
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
   * Calculate shipping cost based on destination and weight
   */
  calculateShippingCost(country: string, weightKg: number) {
    const region = country === 'FR' ? 'FR' : country.match(/BE|CH|LU|DE|IT|ES/) ? 'EU' : 'WORLD';

    let size: 'SMALL' | 'MEDIUM' | 'LARGE' = 'SMALL';
    if (weightKg > 5) {
      size = 'LARGE';
    } else if (weightKg > 2) {
      size = 'MEDIUM';
    }

    const rates = this.shippingRates[region];
    return rates[size] || 9.99;
  }

  /**
   * Mark order as processing (preparing shipment)
   */
  async markAsProcessing(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PAID') {
      throw new BadRequestException('Order must be PAID to mark as processing');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_SHIPPED',
        title: '📦 Votre lot est en préparation',
        message: `Votre commande #${order.orderNumber} est en cours de préparation. Expédition prochaine !`,
        link: `/orders/${order.id}`,
      },
    });

    return updated;
  }

  /**
   * Ship an order with Colissimo tracking
   */
  async shipOrder(orderId: string, trackingNumber: string, carrier = 'Colissimo') {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!['PAID', 'PROCESSING'].includes(order.status)) {
      throw new BadRequestException('Order cannot be shipped in current status');
    }

    // Generate tracking URL
    const trackingUrl = this.generateColissimoTrackingUrl(trackingNumber);

    // Update order
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        trackingNumber,
        trackingUrl,
        carrier,
        shippedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_SHIPPED',
        title: '🚚 Votre lot a été expédié !',
        message: `Votre commande #${order.orderNumber} a été expédiée. Numéro de suivi : ${trackingNumber}`,
        link: trackingUrl,
      },
    });

    // TODO: Send email with tracking info
    // await this.emailService.sendShippingEmail(order.user.email, order, trackingUrl);

    return updated;
  }

  /**
   * Mark order as delivered
   */
  async markAsDelivered(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'SHIPPED') {
      throw new BadRequestException('Order must be SHIPPED to mark as delivered');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_SHIPPED',
        title: '✅ Votre lot a été livré !',
        message: `Votre commande #${order.orderNumber} a été livrée. Profitez de votre lot !`,
      },
    });

    return updated;
  }

  /**
   * Generate Colissimo tracking URL
   */
  private generateColissimoTrackingUrl(trackingNumber: string): string {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`;
  }

  /**
   * Generate Colissimo tracking number (mock for now)
   * In production, integrate with Colissimo API
   */
  generateTrackingNumber(): string {
    // Format: 2 letters + 9 digits + 2 letters (Colissimo format)
    const prefix = 'RR';
    const suffix = 'FR';
    const middle = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, '0');
    return `${prefix}${middle}${suffix}`;
  }

  /**
   * Get shipping statistics (ADMIN dashboard)
   */
  async getShippingStats() {
    const [pending, processing, shipped, delivered, totalShipped] = await Promise.all([
      this.prisma.order.count({
        where: { status: 'PAID', totalCredits: 0 },
      }),
      this.prisma.order.count({
        where: { status: 'PROCESSING', totalCredits: 0 },
      }),
      this.prisma.order.count({
        where: { status: 'SHIPPED', totalCredits: 0 },
      }),
      this.prisma.order.count({
        where: { status: 'DELIVERED', totalCredits: 0 },
      }),
      this.prisma.order.count({
        where: { status: { in: ['SHIPPED', 'DELIVERED'] }, totalCredits: 0 },
      }),
    ]);

    // Get recent shipments
    const recentShipments = await this.prisma.order.findMany({
      where: {
        status: { in: ['SHIPPED', 'DELIVERED'] },
        totalCredits: 0,
      },
      take: 10,
      orderBy: {
        shippedAt: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      pending,
      processing,
      shipped,
      delivered,
      totalShipped,
      recentShipments,
    };
  }

  /**
   * Get order tracking info (for user)
   */
  async getTrackingInfo(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      carrier: order.carrier,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      estimatedDelivery: order.shippedAt
        ? this.calculateEstimatedDelivery(order.shippedAt, order.address.country)
        : null,
    };
  }

  /**
   * Calculate estimated delivery date
   */
  private calculateEstimatedDelivery(shippedAt: Date, country: string): Date {
    const businessDays = country === 'FR' ? 2 : country.match(/BE|CH|LU|DE|IT|ES/) ? 5 : 10;

    const delivery = new Date(shippedAt);
    let addedDays = 0;

    while (addedDays < businessDays) {
      delivery.setDate(delivery.getDate() + 1);
      // Skip weekends
      if (delivery.getDay() !== 0 && delivery.getDay() !== 6) {
        addedDays++;
      }
    }

    return delivery;
  }

  /**
   * Batch ship multiple orders
   */
  async batchShipOrders(orderIds: string[]) {
    const results = [];

    for (const orderId of orderIds) {
      try {
        const trackingNumber = this.generateTrackingNumber();
        const shipped = await this.shipOrder(orderId, trackingNumber);
        results.push({ orderId, success: true, trackingNumber });
      } catch (error) {
        results.push({ orderId, success: false, error: error.message });
      }
    }

    return results;
  }
}
