import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BattlePassService } from './battle-pass.service';

@Controller('battle-pass')
@UseGuards(JwtAuthGuard)
export class BattlePassController {
  constructor(private readonly battlePassService: BattlePassService) {}

  @Get('current')
  async getCurrentBattlePass() {
    return this.battlePassService.getCurrentBattlePass();
  }

  @Get('my-progress')
  async getMyProgress(@Request() req) {
    return this.battlePassService.getUserProgress(req.user.userId);
  }

  @Post('purchase')
  async purchasePremium(@Request() req) {
    return this.battlePassService.purchasePremium(req.user.userId);
  }

  @Post('claim/:tier')
  async claimReward(@Request() req, @Param('tier') tier: string) {
    return this.battlePassService.claimReward(req.user.userId, parseInt(tier));
  }
}
