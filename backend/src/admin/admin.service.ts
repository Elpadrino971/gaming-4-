import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      vipUsers,
      totalGames,
      totalOrders,
      totalRevenue,
      totalRakeCollected,
      activeGames,
      pendingOrders,
      todayStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isVip: true } }),
      this.prisma.game.count(),
      this.prisma.order.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      this.prisma.game.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { rakeAmount: true },
      }),
      this.prisma.game.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.getTodayStats(),
    ]);

    return {
      totalUsers,
      vipUsers,
      vipPercentage: totalUsers > 0 ? ((vipUsers / totalUsers) * 100).toFixed(2) : 0,
      totalGames,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalRakeCollected: Number(totalRakeCollected._sum.rakeAmount || 0),
      activeGames,
      pendingOrders,
      today: todayStats,
    };
  }

  /**
   * Today's stats
   */
  private async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await this.prisma.dailyStats.findUnique({
      where: { date: today },
    });

    if (stats) {
      return {
        newUsers: stats.newUsers,
        activeUsers: stats.activeUsers,
        gamesPlayed: stats.gamesPlayed,
        rakeCollected: Number(stats.rakeCollected),
        totalRevenue: Number(stats.totalRevenue),
      };
    }

    // Calculate on the fly
    const [newUsers, games] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.game.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: today },
        },
      }),
    ]);

    const rakeCollected = games.reduce(
      (sum, game) => sum + Number(game.rakeAmount),
      0,
    );

    return {
      newUsers,
      activeUsers: 0,
      gamesPlayed: games.length,
      rakeCollected,
      totalRevenue: rakeCollected,
    };
  }

  /**
   * Financial dashboard with detailed breakdown
   */
  async getFinancialDashboard(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Daily stats
    const dailyStats = await this.prisma.dailyStats.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    // Total rake
    const totalRake = await this.prisma.game.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      _sum: { rakeAmount: true },
    });

    // VIP revenue
    const vipRevenue = await this.prisma.payment.aggregate({
      where: {
        type: 'VIP_SUBSCRIPTION',
        status: 'SUCCEEDED',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
    });

    // Shop revenue
    const shopOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startDate },
      },
    });

    const shopRevenue = shopOrders.reduce(
      (sum, order) => sum + Number(order.totalEur),
      0,
    );

    // Game type breakdown
    const gamesByType = await this.prisma.game.groupBy({
      by: ['type'],
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      _count: true,
      _sum: {
        rakeAmount: true,
        totalCollected: true,
      },
    });

    const rakeTotal = Number(totalRake._sum.rakeAmount || 0);
    const vipTotal = Number(vipRevenue._sum.amount || 0);
    const totalRevenue = rakeTotal + vipTotal + shopRevenue;

    return {
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
      summary: {
        totalRevenue,
        rakeCollected: rakeTotal,
        rakePercentage: totalRevenue > 0 ? ((rakeTotal / totalRevenue) * 100).toFixed(2) : 0,
        vipRevenue: vipTotal,
        vipPercentage: totalRevenue > 0 ? ((vipTotal / totalRevenue) * 100).toFixed(2) : 0,
        shopRevenue,
        shopPercentage: totalRevenue > 0 ? ((shopRevenue / totalRevenue) * 100).toFixed(2) : 0,
      },
      gamesByType: gamesByType.map((g) => ({
        type: g.type,
        count: g._count,
        totalCollected: Number(g._sum.totalCollected || 0),
        rakeCollected: Number(g._sum.rakeAmount || 0),
        avgRake: g._count > 0 ? (Number(g._sum.rakeAmount || 0) / g._count).toFixed(2) : 0,
      })),
      dailyChart: dailyStats.map((s) => ({
        date: s.date,
        revenue: Number(s.totalRevenue),
        rake: Number(s.rakeCollected),
        gamesPlayed: s.gamesPlayed,
        activeUsers: s.activeUsers,
        vipRevenue: Number(s.vipRevenue),
      })),
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
          isVip: true,
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

  async updateOrderStatus(
    orderId: string,
    status: string,
    trackingNumber?: string,
  ) {
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
