import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  async getActiveTournaments() {
    return this.tournamentsService.getActiveTournaments();
  }

  @Post(':id/register')
  async register(@Param('id') tournamentId: string, @Request() req) {
    return this.tournamentsService.registerForTournament(
      tournamentId,
      req.user.userId,
    );
  }

  @Get(':id/leaderboard')
  async getLeaderboard(@Param('id') tournamentId: string) {
    return this.tournamentsService.getLeaderboard(tournamentId);
  }
}
