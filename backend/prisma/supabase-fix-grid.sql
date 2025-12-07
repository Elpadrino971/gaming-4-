-- ============================================
-- FIX: Convert markedCells from BOOLEAN[] to JSONB
-- ============================================
-- This migration fixes the Prisma schema validation error
-- by changing markedCells to JSONB (supports 2D arrays)

ALTER TABLE "game_participants"
  ALTER COLUMN "markedCells" TYPE JSONB USING '[]'::jsonb;

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'game_participants'
  AND column_name IN ('grid', 'markedCells');
