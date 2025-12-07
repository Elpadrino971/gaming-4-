import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get available FLASH games' })
  async getAvailableGames() {
    return this.gamesService.getAvailableFlashGames();
  }

  @Post('flash/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new FLASH game (MVP - auto games every 5min)' })
  async createFlashGame() {
    return this.gamesService.createFlashGame();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get game by ID' })
  async getGameById(@Param('id') id: string) {
    return this.gamesService.getGameById(id);
  }

  @Get('user/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user game history' })
  async getUserGames(@Request() req) {
    return this.gamesService.getUserGames(req.user.userId);
  }
}
