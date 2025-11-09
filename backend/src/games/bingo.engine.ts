import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamesService } from './games.service';
import { Server } from 'socket.io';

@Injectable()
export class BingoEngine {
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private prisma: PrismaService,
    private gamesService: GamesService,
  ) {}

  async startGameCountdown(gameId: string, server: Server) {
    // Wait 10 seconds before starting
    setTimeout(async () => {
      await this.startGame(gameId, server);
    }, 10000);

    server.to(`game:${gameId}`).emit('game_starting', {
      countdown: 10,
      message: 'Game starting in 10 seconds...',
    });
  }

  async startGame(gameId: string, server: Server) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game || game.status !== 'WAITING') {
      return;
    }

    // Update game status
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    server.to(`game:${gameId}`).emit('game_started', {
      gameId,
      message: 'Game has started!',
    });

    // Start drawing numbers every 3 seconds
    this.startNumberDrawing(gameId, server);
  }

  private startNumberDrawing(gameId: string, server: Server) {
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const drawnNumbers: number[] = [];

    const drawInterval = setInterval(async () => {
      if (availableNumbers.length === 0) {
        clearInterval(drawInterval);
        return;
      }

      // Draw random number
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const drawnNumber = availableNumbers.splice(randomIndex, 1)[0];
      drawnNumbers.push(drawnNumber);

      // Update game
      await this.prisma.game.update({
        where: { id: gameId },
        data: { drawnNumbers },
      });

      // Emit to all players
      server.to(`game:${gameId}`).emit('number_drawn', {
        number: drawnNumber,
        drawnNumbers,
      });

      // Auto-mark cells for all participants
      await this.autoMarkCells(gameId, drawnNumber);
    }, 3000); // Draw every 3 seconds

    this.gameTimers.set(gameId, drawInterval);
  }

  private async autoMarkCells(gameId: string, drawnNumber: number) {
    const participants = await this.prisma.gameParticipant.findMany({
      where: { gameId },
    });

    for (const participant of participants) {
      const grid = participant.grid;
      const markedCells = participant.markedCells;

      // Find if number is in grid
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (grid[col][row] === drawnNumber) {
            const index = row * 5 + col;
            markedCells[index] = true;
          }
        }
      }

      await this.prisma.gameParticipant.update({
        where: { id: participant.id },
        data: { markedCells },
      });
    }
  }

  async handleBingo(gameId: string, userId: string, server: Server) {
    // Stop drawing numbers
    const timer = this.gameTimers.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.gameTimers.delete(gameId);
    }

    // End game
    const game = await this.gamesService.endGame(gameId, userId);

    // Notify all players
    server.to(`game:${gameId}`).emit('game_ended', {
      winnerId: userId,
      game,
      message: 'BINGO! We have a winner!',
    });
  }
}
