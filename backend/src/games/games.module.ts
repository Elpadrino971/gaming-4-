import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GamesScheduler } from './games.scheduler';
import { BingoGateway } from './bingo.gateway';
import { BingoEngine } from './bingo.engine';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  controllers: [GamesController],
  providers: [GamesService, GamesScheduler, BingoGateway, BingoEngine],
  exports: [GamesService],
})
export class GamesModule {}
