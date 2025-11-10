import { Controller, Get, Post, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WheelService } from './wheel.service';

@Controller('wheel')
@UseGuards(JwtAuthGuard)
export class WheelController {
  constructor(private readonly wheelService: WheelService) {}

  @Get('can-spin')
  async canSpin(@Request() req) {
    return this.wheelService.getSpinsRemaining(req.user.userId);
  }

  @Post('spin')
  async spin(@Request() req) {
    return this.wheelService.spin(req.user.userId);
  }

  @Get('history')
  async getHistory(@Request() req, @Query('limit') limit?: string) {
    return this.wheelService.getHistory(
      req.user.userId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('config')
  async getConfig() {
    return this.wheelService.getWheelConfig();
  }
}
