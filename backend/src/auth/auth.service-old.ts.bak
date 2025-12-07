import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { BetaService } from '../beta/beta.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private betaService: BetaService,
  ) {}

  async register(dto: RegisterDto) {
    // Validate beta code if beta mode is enabled
    if (this.betaService.isBetaModeEnabled()) {
      if (!dto.betaCode) {
        throw new BadRequestException(
          'Beta code required. BingoShop is currently in closed beta.',
        );
      }

      const isBetaCodeValid = await this.betaService.checkBetaCode(
        dto.betaCode,
      );

      if (!isBetaCodeValid) {
        throw new BadRequestException('Invalid or expired beta code');
      }
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with referral code
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        referredBy: dto.referralCode || undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        credits: true,
        level: true,
        createdAt: true,
      },
    });

    // Mark beta code as used (if provided and beta mode is enabled)
    if (dto.betaCode && this.betaService.isBetaModeEnabled()) {
      await this.betaService.validateAndUseBetaCode(dto.betaCode, user.id);
    }

    // If referred, give bonus to both users
    if (dto.referralCode) {
      await this.handleReferralBonus(user.id, dto.referralCode);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Handle login streak
    const streakInfo = await this.updateLoginStreak(user.id);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        credits: user.credits,
        level: user.level,
        isVip: user.isVip,
        loginStreak: streakInfo.currentStreak,
        maxStreak: streakInfo.maxStreak,
      },
      streakBonus: streakInfo.bonusEarned,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or banned');
    }

    return user;
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        status: true,
        level: true,
        credits: true,
        xp: true,
        totalGamesPlayed: true,
        totalWins: true,
        referralCode: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async handleReferralBonus(newUserId: string, referralCode: string) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      return;
    }

    // Give bonus to referrer (500 credits)
    const bonusAmount = 500;

    await this.prisma.$transaction([
      // Update referrer credits
      this.prisma.user.update({
        where: { id: referrer.id },
        data: { credits: { increment: bonusAmount } },
      }),
      // Create transaction record
      this.prisma.creditTransaction.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL_BONUS',
          amount: bonusAmount,
          balanceBefore: referrer.credits,
          balanceAfter: Number(referrer.credits) + bonusAmount,
          description: `Referral bonus for inviting user`,
        },
      }),
    ]);

    // Give welcome bonus to new user (100 credits)
    const welcomeBonus = 100;
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: newUserId },
        data: { credits: welcomeBonus },
      }),
      this.prisma.creditTransaction.create({
        data: {
          userId: newUserId,
          type: 'REFERRAL_BONUS',
          amount: welcomeBonus,
          balanceBefore: 0,
          balanceAfter: welcomeBonus,
          description: 'Welcome bonus for using referral code',
        },
      }),
    ]);
  }

  /**
   * Update login streak and give bonuses
   */
  private async updateLoginStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { currentStreak: 0, maxStreak: 0, bonusEarned: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.lastLoginDate
      ? new Date(user.lastLoginDate)
      : null;

    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    let newStreak = 1;
    let bonusEarned = 0;

    if (lastLogin) {
      const daysDiff = Math.floor(
        (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 0) {
        // Already logged in today
        return {
          currentStreak: user.loginStreak,
          maxStreak: user.maxStreak,
          bonusEarned: 0,
        };
      } else if (daysDiff === 1) {
        // Consecutive day
        newStreak = user.loginStreak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
    }

    // Calculate bonus based on streak
    const streakBonuses = {
      1: 10,
      2: 20,
      3: 30,
      7: 100, // Week streak
      14: 250, // 2 weeks
      30: 1000, // Month streak
    };

    bonusEarned = streakBonuses[newStreak] || newStreak * 10;

    const newMaxStreak = Math.max(newStreak, user.maxStreak);

    // Update user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginStreak: newStreak,
        lastLoginDate: new Date(),
        maxStreak: newMaxStreak,
        credits: { increment: bonusEarned },
      },
    });

    // Create credit transaction
    if (bonusEarned > 0) {
      await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: 'STREAK_BONUS',
          amount: bonusEarned,
          balanceBefore: user.credits,
          balanceAfter: Number(user.credits) + bonusEarned,
          description: `Daily login streak bonus (Day ${newStreak})`,
        },
      });
    }

    return {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      bonusEarned,
    };
  }
}
