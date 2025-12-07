-- ============================================
-- DÉSACTIVER RLS (Row Level Security)
-- ============================================
-- Pour le MVP/développement uniquement
-- En production, il faudra activer RLS avec des policies
-- ============================================

ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "games" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "game_participants" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "credit_transactions" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_logs" DISABLE ROW LEVEL SECURITY;

-- Confirmation
DO $$
BEGIN
    RAISE NOTICE 'RLS désactivé sur toutes les tables! Prêt pour le développement.';
END $$;
