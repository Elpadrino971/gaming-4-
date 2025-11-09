import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('missions')
@Controller('missions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MissionsController {
  constructor(private missionsService: MissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user active missions' })
  async getUserMissions(@Request() req) {
    return this.missionsService.getUserMissions(req.user.userId);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim mission reward' })
  async claimReward(@Request() req, @Param('id') id: string) {
    return this.missionsService.claimMissionReward(req.user.userId, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get mission statistics' })
  async getStats(@Request() req) {
    return this.missionsService.getUserMissionStats(req.user.userId);
  }
}
