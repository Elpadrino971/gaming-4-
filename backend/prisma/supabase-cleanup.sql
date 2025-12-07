-- ============================================
-- NETTOYAGE COMPLET AVANT CRÉATION
-- ============================================
-- Exécuter ça AVANT le schema principal
-- ============================================

-- Drop toutes les tables (si elles existent)
DROP TABLE IF EXISTS "admin_logs" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "credit_transactions" CASCADE;
DROP TABLE IF EXISTS "game_participants" CASCADE;
DROP TABLE IF EXISTS "games" CASCADE;
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop les anciennes tables (de l'ancien schema si elles existent)
DROP TABLE IF EXISTS "user_achievements" CASCADE;
DROP TABLE IF EXISTS "achievements" CASCADE;
DROP TABLE IF EXISTS "user_battle_passes" CASCADE;
DROP TABLE IF EXISTS "battle_pass_rewards" CASCADE;
DROP TABLE IF EXISTS "battle_passes" CASCADE;
DROP TABLE IF EXISTS "user_cosmetics" CASCADE;
DROP TABLE IF EXISTS "cosmetic_items" CASCADE;
DROP TABLE IF EXISTS "user_missions" CASCADE;
DROP TABLE IF EXISTS "missions" CASCADE;
DROP TABLE IF EXISTS "tournament_participants" CASCADE;
DROP TABLE IF EXISTS "tournaments" CASCADE;
DROP TABLE IF EXISTS "daily_wheel_spins" CASCADE;
DROP TABLE IF EXISTS "referral_rewards" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "chat_messages" CASCADE;
DROP TABLE IF EXISTS "push_subscriptions" CASCADE;
DROP TABLE IF EXISTS "daily_stats" CASCADE;
DROP TABLE IF EXISTS "beta_codes" CASCADE;

-- Drop tous les types ENUM (si ils existent)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "UserLevel" CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "GameType" CASCADE;
DROP TYPE IF EXISTS "GameStatus" CASCADE;
DROP TYPE IF EXISTS "TransactionType" CASCADE;
DROP TYPE IF EXISTS "TransactionStatus" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentType" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "AdminActionType" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "MissionType" CASCADE;
DROP TYPE IF EXISTS "MissionFrequency" CASCADE;
DROP TYPE IF EXISTS "MissionStatus" CASCADE;
DROP TYPE IF EXISTS "WheelRewardType" CASCADE;
DROP TYPE IF EXISTS "AchievementCategory" CASCADE;
DROP TYPE IF EXISTS "TournamentStatus" CASCADE;
DROP TYPE IF EXISTS "BattlePassStatus" CASCADE;
DROP TYPE IF EXISTS "CosmeticType" CASCADE;
DROP TYPE IF EXISTS "CosmeticRarity" CASCADE;
DROP TYPE IF EXISTS "BetaCodeStatus" CASCADE;

-- Drop fonctions (si elles existent)
DROP FUNCTION IF EXISTS generate_cuid() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirmation
DO $$
BEGIN
    RAISE NOTICE 'Nettoyage terminé! Vous pouvez maintenant exécuter le schema principal.';
END $$;
