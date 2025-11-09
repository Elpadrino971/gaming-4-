import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalGames,
      totalOrders,
      totalRevenue,
      activeGames,
      pendingOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.game.count(),
      this.prisma.order.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      this.prisma.game.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalUsers,
      totalGames,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      activeGames,
      pendingOrders,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          level: true,
          credits: true,
          totalGamesPlayed: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrders(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    const data: any = { status };

    if (status === 'SHIPPED') {
      data.shippedAt = new Date();
      if (trackingNumber) {
        data.trackingNumber = trackingNumber;
      }
    } else if (status === 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProduct(productId: string, data: any) {
    return this.prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async getGames(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.game.count(),
    ]);

    return {
      games,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
