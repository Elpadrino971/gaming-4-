-- ============================================
-- BINGOSHOP MVP - SCHEMA SQL POUR SUPABASE
-- ============================================
-- Généré depuis schema.prisma simplifié
-- 9 tables au lieu de 27
-- ============================================

-- ENUMS
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
CREATE TYPE "GameType" AS ENUM ('FLASH', 'BIG_JACKPOT');
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'OPEN_FOR_TICKETS', 'STARTING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "TransactionType" AS ENUM ('CREDIT_PURCHASE', 'GAME_ENTRY', 'GAME_WIN', 'SHOP_PURCHASE', 'TICKET_PURCHASE', 'ADMIN_ADJUSTMENT', 'REFUND');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- ============================================
-- USERS
-- ============================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,

    -- Profile
    "firstName" TEXT,
    "lastName" TEXT,
    "avatarUrl" TEXT,
    "phoneNumber" TEXT,

    -- Status & Role
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',

    -- Économie
    "credits" DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Stats
    "totalGamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP
);

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_username_idx" ON "users"("username");

-- ============================================
-- ADDRESSES
-- ============================================

CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "fullName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "phoneNumber" TEXT NOT NULL,

    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- ============================================
-- GAMES (FLASH + BIG JACKPOT)
-- ============================================

CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" "GameType" NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',

    -- Config
    "minPlayers" INTEGER NOT NULL DEFAULT 3,
    "maxPlayers" INTEGER,

    -- FLASH: Crédits
    "entryFeeCredits" DECIMAL(10,2),
    "prizeCredits" DECIMAL(10,2),
    "rake" DECIMAL(5,2) NOT NULL DEFAULT 30,

    -- BIG JACKPOT: Lot physique
    "ticketPrice" DECIMAL(10,2),
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "prizeProductName" TEXT,
    "prizeProductValue" DECIMAL(10,2),
    "prizeProductCost" DECIMAL(10,2),

    -- Game data
    "drawnNumbers" INTEGER[] NOT NULL DEFAULT '{}',
    "gridSize" INTEGER NOT NULL DEFAULT 5,

    -- Winner
    "winnerId" TEXT,
    "winnerPrize" TEXT,

    -- Timestamps
    "scheduledStart" TIMESTAMP,
    "scheduledDraw" TIMESTAMP,
    "startedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "games_status_idx" ON "games"("status");
CREATE INDEX "games_type_idx" ON "games"("type");
CREATE INDEX "games_scheduledDraw_idx" ON "games"("scheduledDraw");
CREATE INDEX "games_createdAt_idx" ON "games"("createdAt");

-- ============================================
-- GAME PARTICIPANTS
-- ============================================

CREATE TABLE "game_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL REFERENCES "games"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    -- Bingo grid (stored as JSONB for flexibility)
    "grid" JSONB NOT NULL,
    "markedCells" BOOLEAN[] NOT NULL,

    -- Results
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "prizeWon" TEXT,
    "finishedAt" TIMESTAMP,

    -- BIG JACKPOT ticket
    "ticketNumber" INTEGER,

    "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_participants_gameId_userId_key" UNIQUE ("gameId", "userId")
);

CREATE INDEX "game_participants_gameId_idx" ON "game_participants"("gameId");
CREATE INDEX "game_participants_userId_idx" ON "game_participants"("userId");

-- ============================================
-- CREDIT TRANSACTIONS
-- ============================================

CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balanceBefore" DECIMAL(10,2) NOT NULL,
    "balanceAfter" DECIMAL(10,2) NOT NULL,

    -- References
    "gameId" TEXT,
    "orderId" TEXT,
    "paymentId" TEXT,

    "description" TEXT,
    "metadata" JSONB,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "credit_transactions_userId_idx" ON "credit_transactions"("userId");
CREATE INDEX "credit_transactions_type_idx" ON "credit_transactions"("type");
CREATE INDEX "credit_transactions_createdAt_idx" ON "credit_transactions"("createdAt");

-- ============================================
-- PRODUCTS (Boutique Amazon)
-- ============================================

CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,

    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "images" TEXT[] NOT NULL DEFAULT '{}',

    -- Prix en crédits
    "priceInCredits" DECIMAL(10,2) NOT NULL,

    -- Stock
    "stock" INTEGER NOT NULL DEFAULT 999,
    "unlimited" BOOLEAN NOT NULL DEFAULT true,

    -- Amazon
    "amazonUrl" TEXT,
    "amazonASIN" TEXT,

    -- Catégorie
    "category" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT '{}',

    -- Stats
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL UNIQUE,

    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',

    "totalCredits" DECIMAL(10,2) NOT NULL,

    "addressId" TEXT NOT NULL REFERENCES "addresses"("id"),

    -- Tracking
    "trackingNumber" TEXT,
    "carrier" TEXT DEFAULT 'Amazon',

    "adminNotes" TEXT,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shippedAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP
);

CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "products"("id"),

    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceInCredits" DECIMAL(10,2) NOT NULL
);

CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- ============================================
-- PAYMENTS (Stripe)
-- ============================================

CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,

    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',

    -- Stripe
    "stripePaymentIntentId" TEXT UNIQUE,
    "stripeChargeId" TEXT,

    -- Montant
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',

    -- Type
    "creditsAmount" INTEGER,
    "gameId" TEXT,

    "metadata" JSONB,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "payments_userId_idx" ON "payments"("userId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");

-- ============================================
-- ADMIN LOGS
-- ============================================

CREATE TABLE "admin_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,

    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,

    "description" TEXT NOT NULL,
    "metadata" JSONB,

    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "admin_logs_adminId_idx" ON "admin_logs"("adminId");
CREATE INDEX "admin_logs_createdAt_idx" ON "admin_logs"("createdAt");

-- ============================================
-- FONCTION UTILITAIRE: Générer CUID
-- ============================================

CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
  timestamp_part TEXT;
  counter_part TEXT;
  random_part TEXT;
BEGIN
  timestamp_part := to_char(extract(epoch from now())::bigint, 'FM999999999999');
  counter_part := to_char(floor(random() * 1000)::int, 'FM000');
  random_part := substr(md5(random()::text), 1, 8);
  RETURN 'c' || substr(timestamp_part, 1, 12) || counter_part || random_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-update updatedAt
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON "addresses"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON "games"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "products"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON "orders"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON "payments"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIN DU SCHEMA
-- ============================================
