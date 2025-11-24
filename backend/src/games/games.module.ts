import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { BingoGateway } from './bingo.gateway';
import { BingoEngine } from './bingo.engine';
import { CreditsModule } from '../credits/credits.module';
import { PrizesModule } from '../prizes/prizes.module';

@Module({
  imports: [CreditsModule, PrizesModule],
  controllers: [GamesController],
  providers: [GamesService, BingoGateway, BingoEngine],
  exports: [GamesService],
})
export class GamesModule {}
