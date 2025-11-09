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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
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
      },
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
}
