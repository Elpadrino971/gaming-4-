import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { GamesService } from './games.service';
import { BingoEngine } from './bingo.engine';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/bingo',
})
export class BingoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private gamesService: GamesService,
    private bingoEngine: BingoEngine,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove from userSockets
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    return { success: true };
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() data: { gameId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.gamesService.joinFlashGame(data.gameId, data.userId);

      // Join socket room
      client.join(`game:${data.gameId}`);

      // Notify all players in the room
      this.server.to(`game:${data.gameId}`).emit('player_joined', {
        game: result.game,
        participant: result.participant,
      });

      // Check if game can start
      if (result.game.participants.length >= result.game.minPlayers) {
        await this.bingoEngine.startGameCountdown(data.gameId, this.server);
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('mark_cell')
  async handleMarkCell(
    @MessageBody() data: { gameId: string; userId: string; cellIndex: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Mark cell logic
      const participant = await this.prisma.gameParticipant.findFirst({
        where: {
          gameId: data.gameId,
          userId: data.userId,
        },
      });

      if (!participant) {
        return { success: false, error: 'Participant not found' };
      }

      const markedCells = participant.markedCells;
      markedCells[data.cellIndex] = true;

      await this.prisma.gameParticipant.update({
        where: { id: participant.id },
        data: { markedCells },
      });

      // Check for bingo
      const hasBingo = await this.gamesService.checkBingo(
        data.gameId,
        data.userId,
      );

      if (hasBingo) {
        await this.bingoEngine.handleBingo(data.gameId, data.userId, this.server);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper to access Prisma from gateway
  private get prisma() {
    return (this.gamesService as any).prisma;
  }
}
