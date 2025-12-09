// Temporary enum definitions to work around Prisma client generation issues
// These match the enums defined in prisma/schema.prisma

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum GameType {
  FLASH = 'FLASH',
  BIG_JACKPOT = 'BIG_JACKPOT',
}

export enum GameStatus {
  WAITING = 'WAITING',
  OPEN_FOR_TICKETS = 'OPEN_FOR_TICKETS',
  STARTING = 'STARTING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  CREDIT_PURCHASE = 'CREDIT_PURCHASE',
  GAME_ENTRY = 'GAME_ENTRY',
  GAME_WIN = 'GAME_WIN',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
  TICKET_PURCHASE = 'TICKET_PURCHASE',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  REFUND = 'REFUND',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
