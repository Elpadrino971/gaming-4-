import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get('my')
  async getMyAchievements(@Request() req) {
    return this.achievementsService.getUserAchievements(req.user.userId);
  }

  @Get('all')
  async getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }
}
