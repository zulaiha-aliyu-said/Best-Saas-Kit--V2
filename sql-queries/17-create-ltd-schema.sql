-- ============================================================================
-- LIFETIME DEAL (LTD) PRICING SYSTEM
-- ============================================================================
-- This schema handles AppSumo LTD pricing tiers with feature gating
-- Execute this after the base users table is created

-- ============================================================================
-- STEP 1: ALTER USERS TABLE FOR LTD SUPPORT
-- ============================================================================

-- Add LTD-related columns to users table
DO $$ 
BEGIN
    -- Add plan_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='plan_type') THEN
        ALTER TABLE users ADD COLUMN plan_type VARCHAR(50) DEFAULT 'subscription' NOT NULL
            CHECK (plan_type IN ('subscription', 'ltd'));
        RAISE NOTICE '✅ Added plan_type column';
    END IF;

    -- Add ltd_tier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='ltd_tier') THEN
        ALTER TABLE users ADD COLUMN ltd_tier INTEGER DEFAULT NULL
            CHECK (ltd_tier >= 1 AND ltd_tier <= 4);
        RAISE NOTICE '✅ Added ltd_tier column';
    END IF;

    -- Add monthly_credit_limit column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='monthly_credit_limit') THEN
        ALTER TABLE users ADD COLUMN monthly_credit_limit INTEGER DEFAULT 25 NOT NULL;
        RAISE NOTICE '✅ Added monthly_credit_limit column';
    END IF;

    -- Add credit_reset_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='credit_reset_date') THEN
        ALTER TABLE users ADD COLUMN credit_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE '✅ Added credit_reset_date column';
    END IF;

    -- Add rollover_credits column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='rollover_credits') THEN
        ALTER TABLE users ADD COLUMN rollover_credits INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE '✅ Added rollover_credits column';
    END IF;

    -- Add stacked_codes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='stacked_codes') THEN
        ALTER TABLE users ADD COLUMN stacked_codes INTEGER DEFAULT 1 NOT NULL;
        RAISE NOTICE '✅ Added stacked_codes column';
    END IF;

    -- Update subscription_status to include LTD tiers
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_subscription_status_check;
    ALTER TABLE users ADD CONSTRAINT users_subscription_status_check 
        CHECK (subscription_status IN ('free', 'starter', 'pro', 'enterprise', 'ltd_tier_1', 'ltd_tier_2', 'ltd_tier_3', 'ltd_tier_4'));
    RAISE NOTICE '✅ Updated subscription_status constraints';
END $$;

-- ============================================================================
-- STEP 2: CREATE LTD_CODES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ltd_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 4),
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    batch_id VARCHAR(100),
    
    -- Indexes
    CONSTRAINT ltd_codes_tier_check CHECK (tier IN (1, 2, 3, 4))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ltd_codes_code ON ltd_codes(code);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_is_redeemed ON ltd_codes(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_tier ON ltd_codes(tier);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_redeemed_by ON ltd_codes(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_batch_id ON ltd_codes(batch_id);

COMMENT ON TABLE ltd_codes IS 'Stores AppSumo LTD redemption codes';
COMMENT ON COLUMN ltd_codes.code IS 'Unique redemption code (e.g., APPSUMO-XXXXX)';
COMMENT ON COLUMN ltd_codes.tier IS 'LTD tier level (1-4)';
COMMENT ON COLUMN ltd_codes.is_redeemed IS 'Whether code has been used';
COMMENT ON COLUMN ltd_codes.batch_id IS 'Batch identifier for bulk code generation';

-- ============================================================================
-- STEP 3: CREATE LTD_REDEMPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ltd_redemptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_id INTEGER NOT NULL REFERENCES ltd_codes(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    credits_added INTEGER NOT NULL,
    previous_tier INTEGER,
    
    CONSTRAINT ltd_redemptions_unique_code UNIQUE(code_id)
);

CREATE INDEX IF NOT EXISTS idx_ltd_redemptions_user_id ON ltd_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ltd_redemptions_code_id ON ltd_redemptions(code_id);
CREATE INDEX IF NOT EXISTS idx_ltd_redemptions_redeemed_at ON ltd_redemptions(redeemed_at);

COMMENT ON TABLE ltd_redemptions IS 'History of LTD code redemptions';

-- ============================================================================
-- STEP 4: CREATE LTD_FEATURES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ltd_features (
    id SERIAL PRIMARY KEY,
    tier INTEGER NOT NULL CHECK (tier >= 1 AND tier <= 4),
    feature_key VARCHAR(100) NOT NULL,
    feature_value JSONB,
    enabled BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT ltd_features_unique_tier_key UNIQUE(tier, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_ltd_features_tier ON ltd_features(tier);
CREATE INDEX IF NOT EXISTS idx_ltd_features_key ON ltd_features(feature_key);

COMMENT ON TABLE ltd_features IS 'Feature flags and limits for each LTD tier';

-- ============================================================================
-- STEP 5: CREATE CREDIT_USAGE_LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_usage_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    credits_used INTEGER NOT NULL,
    credits_remaining INTEGER NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON credit_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created_at ON credit_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_usage_action_type ON credit_usage_log(action_type);

COMMENT ON TABLE credit_usage_log IS 'Logs all credit usage for analytics and debugging';

-- ============================================================================
-- STEP 6: INSERT DEFAULT LTD FEATURE CONFIGURATIONS
-- ============================================================================

-- Tier 1 Features ($59 - 100 credits/month)
INSERT INTO ltd_features (tier, feature_key, feature_value, enabled) VALUES
    (1, 'monthly_credits', '100', true),
    (1, 'content_repurposing', '{"platforms": 4, "input_methods": ["text", "url", "youtube"], "templates": 15}', true),
    (1, 'trending_topics', '{"enabled": true, "hashtags": 10, "sources": ["reddit", "news"]}', true),
    (1, 'analytics', '{"history_days": 30, "export": false}', true),
    (1, 'content_history_days', '90', true),
    (1, 'viral_hooks', '{"enabled": false}', false),
    (1, 'scheduling', '{"enabled": false}', false),
    (1, 'ai_chat', '{"enabled": false}', false),
    (1, 'predictive_performance', '{"enabled": false}', false),
    (1, 'style_training', '{"enabled": false}', false),
    (1, 'processing_speed', '1', true),
    (1, 'watermark', 'true', true),
    (1, 'support_tier', '"community"', true),
    (1, 'credit_rollover_months', '12', true)
ON CONFLICT (tier, feature_key) DO UPDATE 
    SET feature_value = EXCLUDED.feature_value, enabled = EXCLUDED.enabled;

-- Tier 2 Features ($139 - 300 credits/month)
INSERT INTO ltd_features (tier, feature_key, feature_value, enabled) VALUES
    (2, 'monthly_credits', '300', true),
    (2, 'content_repurposing', '{"platforms": 4, "input_methods": ["text", "url", "youtube"], "templates": 40, "custom_templates": 5}', true),
    (2, 'trending_topics', '{"enabled": true, "hashtags": "unlimited", "sources": ["reddit", "news", "google", "youtube"], "alerts": "weekly"}', true),
    (2, 'analytics', '{"history_days": 180, "export": true, "formats": ["pdf", "excel"]}', true),
    (2, 'content_history_days', '180', true),
    (2, 'viral_hooks', '{"enabled": true, "patterns": 50, "cost_credits": 2}', true),
    (2, 'scheduling', '{"enabled": true, "posts_per_month": 30, "cost_credits": 0.5}', true),
    (2, 'ai_chat', '{"enabled": false}', false),
    (2, 'predictive_performance', '{"enabled": false}', false),
    (2, 'style_training', '{"enabled": false}', false),
    (2, 'processing_speed', '2', true),
    (2, 'watermark', 'true', true),
    (2, 'support_tier', '"priority_48hr"', true),
    (2, 'credit_rollover_months', '12', true)
ON CONFLICT (tier, feature_key) DO UPDATE 
    SET feature_value = EXCLUDED.feature_value, enabled = EXCLUDED.enabled;

-- Tier 3 Features ($249 - 750 credits/month) - MOST POPULAR
INSERT INTO ltd_features (tier, feature_key, feature_value, enabled) VALUES
    (3, 'monthly_credits', '750', true),
    (3, 'content_repurposing', '{"platforms": 4, "input_methods": ["text", "url", "youtube"], "templates": 60, "custom_templates": "unlimited"}', true),
    (3, 'trending_topics', '{"enabled": true, "hashtags": "unlimited", "sources": ["reddit", "news", "google", "youtube"], "alerts": "weekly", "competitor_tracking": true}', true),
    (3, 'analytics', '{"history_days": "unlimited", "export": true, "formats": ["pdf", "excel", "csv"], "competitor_benchmarking": true}', true),
    (3, 'content_history_days', 'unlimited', true),
    (3, 'viral_hooks', '{"enabled": true, "patterns": 50, "cost_credits": 2}', true),
    (3, 'scheduling', '{"enabled": true, "posts_per_month": 100, "cost_credits": 0.5, "bulk": true}', true),
    (3, 'ai_chat', '{"enabled": true, "messages_per_month": 200, "model": "qwen3-235b", "cost_credits": 0.5}', true),
    (3, 'predictive_performance', '{"enabled": true, "cost_credits": 1, "optimization_tips": true}', true),
    (3, 'style_training', '{"enabled": true, "profiles": 1, "cost_credits": 5}', true),
    (3, 'bulk_generation', '{"enabled": true, "max_pieces": 5, "cost_credits": 0.9}', true),
    (3, 'processing_speed', '3', true),
    (3, 'watermark', 'false', true),
    (3, 'support_tier', '"priority_24hr"', true),
    (3, 'credit_rollover_months', '12', true),
    (3, 'early_access', 'true', true)
ON CONFLICT (tier, feature_key) DO UPDATE 
    SET feature_value = EXCLUDED.feature_value, enabled = EXCLUDED.enabled;

-- Tier 4 Features ($449 - 2000 credits/month)
INSERT INTO ltd_features (tier, feature_key, feature_value, enabled) VALUES
    (4, 'monthly_credits', '2000', true),
    (4, 'content_repurposing', '{"platforms": 4, "input_methods": ["text", "url", "youtube"], "templates": 60, "custom_templates": "unlimited"}', true),
    (4, 'trending_topics', '{"enabled": true, "hashtags": "unlimited", "sources": ["reddit", "news", "google", "youtube"], "alerts": "daily", "competitor_tracking": true}', true),
    (4, 'analytics', '{"history_days": "unlimited", "export": true, "formats": ["pdf", "excel", "csv"], "competitor_benchmarking": true, "team_dashboard": true}', true),
    (4, 'content_history_days', 'unlimited', true),
    (4, 'viral_hooks', '{"enabled": true, "patterns": 50, "cost_credits": 2, "ab_testing": true}', true),
    (4, 'scheduling', '{"enabled": true, "posts_per_month": "unlimited", "cost_credits": 0.5, "bulk": true, "auto_posting": true, "smart_suggestions": true}', true),
    (4, 'ai_chat', '{"enabled": true, "messages_per_month": "unlimited", "models": ["gpt-4o", "claude", "qwen"], "cost_credits": 0.3, "custom_prompts": true}', true),
    (4, 'predictive_performance', '{"enabled": true, "cost_credits": 1, "optimization_tips": true}', true),
    (4, 'style_training', '{"enabled": true, "profiles": 3, "cost_credits": 5, "team_sharing": true}', true),
    (4, 'bulk_generation', '{"enabled": true, "max_pieces": "unlimited", "cost_credits": 0.8}', true),
    (4, 'team_collaboration', '{"enabled": true, "team_members": 3, "role_based_permissions": true}', true),
    (4, 'api_access', '{"enabled": true, "calls_per_month": 2500}', true),
    (4, 'white_label', '{"enabled": true, "remove_branding": true}', true),
    (4, 'processing_speed', '5', true),
    (4, 'watermark', 'false', true),
    (4, 'support_tier', '"priority_chat_4hr"', true),
    (4, 'dedicated_manager', 'true', true),
    (4, 'credit_rollover_months', '12', true),
    (4, 'early_access', 'true', true)
ON CONFLICT (tier, feature_key) DO UPDATE 
    SET feature_value = EXCLUDED.feature_value, enabled = EXCLUDED.enabled;

-- ============================================================================
-- STEP 7: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to reset user credits monthly
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
    UPDATE users
    SET credits = monthly_credit_limit + LEAST(rollover_credits, monthly_credit_limit),
        rollover_credits = GREATEST(0, rollover_credits - monthly_credit_limit),
        credit_reset_date = credit_reset_date + INTERVAL '1 month'
    WHERE plan_type = 'ltd' 
        AND credit_reset_date <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_monthly_credits() IS 'Resets credits monthly for LTD users with rollover';

-- Function to get user's LTD features
CREATE OR REPLACE FUNCTION get_user_ltd_features(p_user_id INTEGER)
RETURNS TABLE (
    feature_key VARCHAR,
    feature_value JSONB,
    enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.feature_key,
        f.feature_value,
        f.enabled
    FROM users u
    JOIN ltd_features f ON f.tier = u.ltd_tier
    WHERE u.id = p_user_id AND u.plan_type = 'ltd';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_ltd_features(INTEGER) IS 'Returns all features available for a user based on their LTD tier';

-- Function to log credit usage
CREATE OR REPLACE FUNCTION log_credit_usage(
    p_user_id INTEGER,
    p_action_type VARCHAR,
    p_credits_used INTEGER,
    p_metadata JSONB DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_remaining INTEGER;
BEGIN
    -- Get current credits
    SELECT credits INTO v_remaining FROM users WHERE id = p_user_id;
    
    -- Insert log
    INSERT INTO credit_usage_log (user_id, action_type, credits_used, credits_remaining, metadata)
    VALUES (p_user_id, p_action_type, p_credits_used, v_remaining, p_metadata);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_credit_usage IS 'Logs credit usage for analytics';

-- ============================================================================
-- STEP 8: CREATE TRIGGERS
-- ============================================================================

-- Trigger to auto-log credit usage
CREATE OR REPLACE FUNCTION trigger_log_credit_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.credits <> NEW.credits AND NEW.credits < OLD.credits THEN
        PERFORM log_credit_usage(
            NEW.id,
            'auto_deduction',
            OLD.credits - NEW.credits,
            jsonb_build_object('old_credits', OLD.credits, 'new_credits', NEW.credits)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_credit_changes ON users;
CREATE TRIGGER log_credit_changes
    AFTER UPDATE OF credits ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_credit_usage();

-- ============================================================================
-- STEP 9: CREATE VIEWS FOR ANALYTICS
-- ============================================================================

-- View for LTD subscription stats
CREATE OR REPLACE VIEW v_ltd_stats AS
SELECT 
    ltd_tier,
    COUNT(*) as user_count,
    SUM(monthly_credit_limit * stacked_codes) as total_monthly_credits,
    AVG(credits) as avg_current_credits,
    COUNT(*) FILTER (WHERE credits < monthly_credit_limit * 0.2) as low_credit_users
FROM users
WHERE plan_type = 'ltd'
GROUP BY ltd_tier
ORDER BY ltd_tier;

-- View for credit usage analytics
CREATE OR REPLACE VIEW v_credit_usage_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    u.ltd_tier,
    u.monthly_credit_limit,
    u.credits as current_credits,
    u.rollover_credits,
    COUNT(cl.*) as total_actions,
    SUM(cl.credits_used) as total_credits_used,
    DATE_TRUNC('month', u.credit_reset_date) as billing_month
FROM users u
LEFT JOIN credit_usage_log cl ON u.id = cl.user_id
WHERE u.plan_type = 'ltd'
GROUP BY u.id, u.email, u.ltd_tier, u.monthly_credit_limit, u.credits, u.rollover_credits, u.credit_reset_date;

-- ============================================================================
-- FINAL NOTICE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ LTD PRICING SYSTEM INSTALLED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - ltd_codes (for code management)';
    RAISE NOTICE '  - ltd_redemptions (for redemption history)';
    RAISE NOTICE '  - ltd_features (for feature gating)';
    RAISE NOTICE '  - credit_usage_log (for usage tracking)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features configured for:';
    RAISE NOTICE '  - Tier 1: 100 credits/month';
    RAISE NOTICE '  - Tier 2: 300 credits/month';
    RAISE NOTICE '  - Tier 3: 750 credits/month (POPULAR)';
    RAISE NOTICE '  - Tier 4: 2000 credits/month';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Implement code redemption flow';
    RAISE NOTICE '  2. Update frontend feature gating';
    RAISE NOTICE '  3. Test credit rollover system';
    RAISE NOTICE '========================================';
END $$;







