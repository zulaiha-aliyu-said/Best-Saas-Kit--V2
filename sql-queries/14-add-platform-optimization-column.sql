-- ============================================================================
-- ADD PLATFORM OPTIMIZATION COLUMN TO USER PREFERENCES
-- ============================================================================
-- This migration adds the platform_optimization_enabled column to existing databases

-- Add platform_optimization_enabled column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'platform_optimization_enabled'
    ) THEN
        ALTER TABLE user_preferences 
        ADD COLUMN platform_optimization_enabled BOOLEAN DEFAULT false;
        
        RAISE NOTICE '✅ Added platform_optimization_enabled column to user_preferences';
    ELSE
        RAISE NOTICE 'ℹ️  Column platform_optimization_enabled already exists';
    END IF;
END $$;

-- Update any existing NULL values to false
UPDATE user_preferences 
SET platform_optimization_enabled = false 
WHERE platform_optimization_enabled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_preferences.platform_optimization_enabled IS 'Enable platform-specific content optimization (character limits, hashtags, threads, formatting)';

DO $$
BEGIN
    RAISE NOTICE '✅ Platform optimization column migration completed successfully';
END $$;






