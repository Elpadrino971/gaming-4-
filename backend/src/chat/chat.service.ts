import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Bad words filter
  private readonly BAD_WORDS = [
    'badword1',
    'badword2',
    // Add more as needed
  ];

  async saveMessage(
    userId: string,
    username: string,
    message: string,
    gameId?: string,
  ) {
    // Filter bad words
    const cleanMessage = this.filterBadWords(message);

    return this.prisma.chatMessage.create({
      data: {
        userId,
        username,
        message: cleanMessage,
        gameId,
      },
    });
  }

  async getGameMessages(gameId: string, limit: number = 50) {
    return this.prisma.chatMessage.findMany({
      where: {
        gameId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getGlobalMessages(limit: number = 50) {
    return this.prisma.chatMessage.findMany({
      where: {
        gameId: null,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async deleteMessage(messageId: string, adminId: string, reason: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedBy: adminId,
        deletedReason: reason,
      },
    });
  }

  private filterBadWords(message: string): string {
    let filtered = message;
    for (const word of this.BAD_WORDS) {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '***');
    }
    return filtered;
  }
}
