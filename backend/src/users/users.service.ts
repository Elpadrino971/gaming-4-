import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        credits: true,
        totalGamesPlayed: true,
        totalWins: true,
        referralCode: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phoneNumber: true,
      },
    });
  }

  async getStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalGamesPlayed: true,
        totalWins: true,
      },
    });

    const winRate =
      user.totalGamesPlayed > 0
        ? (user.totalWins / user.totalGamesPlayed) * 100
        : 0;

    return {
      ...user,
      winRate: Math.round(winRate * 100) / 100,
    };
  }

  // DISABLED FOR MVP - referredBy field removed from schema
  async getReferrals(userId: string) {
    // const referrals = await this.prisma.user.findMany({
    //   where: { referredBy: userId },
    //   select: {
    //     id: true,
    //     username: true,
    //     createdAt: true,
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });
    const referrals = [];

    return {
      count: referrals.length,
      referrals,
    };
  }
}
