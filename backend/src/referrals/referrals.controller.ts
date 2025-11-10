import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
@UseGuards(JwtAuthGuard)
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('my-code')
  async getMyReferralCode(@Request() req) {
    return this.referralsService.getReferralCode(req.user.userId);
  }

  @Get('stats')
  async getMyStats(@Request() req) {
    return this.referralsService.getReferralStats(req.user.userId);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.referralsService.getLeaderboard(
      limit ? parseInt(limit) : 10,
    );
  }
}
