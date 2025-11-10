import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CosmeticsService } from './cosmetics.service';

@Controller('cosmetics')
@UseGuards(JwtAuthGuard)
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  @Get()
  async getAllCosmetics(@Query('type') type?: string) {
    return this.cosmeticsService.getAllCosmetics(type);
  }

  @Get('my')
  async getMyCosmetics(@Request() req) {
    return this.cosmeticsService.getUserCosmetics(req.user.userId);
  }

  @Post(':id/purchase')
  async purchase(@Param('id') cosmeticId: string, @Request() req) {
    return this.cosmeticsService.purchaseCosmetic(req.user.userId, cosmeticId);
  }

  @Post(':id/equip')
  async equip(@Param('id') cosmeticId: string, @Request() req) {
    return this.cosmeticsService.equipCosmetic(req.user.userId, cosmeticId);
  }
}
