import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BetaService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Check if beta mode is enabled
   */
  isBetaModeEnabled(): boolean {
    return this.configService.get<string>('BETA_MODE') === 'true';
  }

  /**
   * Generate beta codes
   */
  async generateBetaCodes(
    adminId: string,
    count: number = 10,
    prefix: string = 'BINGO',
    expiresInDays?: number,
    notes?: string,
  ) {
    if (count < 1 || count > 100) {
      throw new BadRequestException('Count must be between 1 and 100');
    }

    const codes = [];
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    for (let i = 0; i < count; i++) {
      const randomSuffix = this.generateRandomString(4);
      const code = `${prefix}-${randomSuffix}`.toUpperCase();

      codes.push({
        code,
        createdBy: adminId,
        expiresAt,
        notes,
      });
    }

    // Create all codes in database
    const createdCodes = await this.prisma.$transaction(
      codes.map((codeData) =>
        this.prisma.betaCode.create({
          data: codeData,
        }),
      ),
    );

    return {
      count: createdCodes.length,
      codes: createdCodes.map((c) => ({
        id: c.id,
        code: c.code,
        expiresAt: c.expiresAt,
      })),
    };
  }

  /**
   * Validate beta code and mark as used
   */
  async validateAndUseBetaCode(code: string, userId: string): Promise<boolean> {
    // If beta mode is disabled, allow registration
    if (!this.isBetaModeEnabled()) {
      return true;
    }

    const betaCode = await this.prisma.betaCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!betaCode) {
      throw new BadRequestException('Invalid beta code');
    }

    if (betaCode.status === 'USED') {
      throw new BadRequestException('Beta code already used');
    }

    if (betaCode.status === 'EXPIRED') {
      throw new BadRequestException('Beta code has expired');
    }

    // Check expiration date
    if (betaCode.expiresAt && betaCode.expiresAt < new Date()) {
      await this.prisma.betaCode.update({
        where: { id: betaCode.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Beta code has expired');
    }

    // Mark code as used
    await this.prisma.betaCode.update({
      where: { id: betaCode.id },
      data: {
        status: 'USED',
        usedBy: userId,
        usedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Check if a beta code is valid (without marking as used)
   */
  async checkBetaCode(code: string): Promise<boolean> {
    // If beta mode is disabled, allow registration
    if (!this.isBetaModeEnabled()) {
      return true;
    }

    const betaCode = await this.prisma.betaCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!betaCode || betaCode.status !== 'AVAILABLE') {
      return false;
    }

    // Check expiration
    if (betaCode.expiresAt && betaCode.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get all beta codes (admin only)
   */
  async getAllBetaCodes(adminId: string) {
    const codes = await this.prisma.betaCode.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        usedBy: true,
        usedAt: true,
        expiresAt: true,
        createdBy: true,
        createdAt: true,
        notes: true,
      },
    });

    return codes;
  }

  /**
   * Get beta code statistics
   */
  async getBetaStats() {
    const total = await this.prisma.betaCode.count();
    const available = await this.prisma.betaCode.count({
      where: { status: 'AVAILABLE' },
    });
    const used = await this.prisma.betaCode.count({
      where: { status: 'USED' },
    });
    const expired = await this.prisma.betaCode.count({
      where: { status: 'EXPIRED' },
    });

    return {
      total,
      available,
      used,
      expired,
      usageRate: total > 0 ? ((used / total) * 100).toFixed(2) : '0.00',
      betaModeEnabled: this.isBetaModeEnabled(),
    };
  }

  /**
   * Delete/revoke beta codes
   */
  async deleteBetaCode(codeId: string, adminId: string) {
    const code = await this.prisma.betaCode.findUnique({
      where: { id: codeId },
    });

    if (!code) {
      throw new NotFoundException('Beta code not found');
    }

    await this.prisma.betaCode.delete({
      where: { id: codeId },
    });

    return { message: 'Beta code deleted successfully' };
  }

  /**
   * Generate random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
