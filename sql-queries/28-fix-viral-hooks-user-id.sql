-- Fix viral hooks tables to use VARCHAR for user_id (matching users table)

-- Drop existing tables and recreate with correct data type
DROP TABLE IF EXISTS generated_hooks CASCADE;
DROP TABLE IF EXISTS hook_analytics CASCADE;
DROP VIEW IF EXISTS user_hook_stats CASCADE;
DROP VIEW IF EXISTS admin_hook_analytics CASCADE;

-- Table for generated hooks (user history)
CREATE TABLE IF NOT EXISTS generated_hooks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pattern_id UUID REFERENCES hook_patterns(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    topic TEXT NOT NULL,
    generated_hook TEXT NOT NULL,
    engagement_score INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    viral_potential VARCHAR(50) NOT NULL,
    copied BOOLEAN DEFAULT FALSE,
    copied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for hook analytics
CREATE TABLE IF NOT EXISTS hook_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    niche VARCHAR(50) NOT NULL,
    total_generated INTEGER DEFAULT 0,
    total_copied INTEGER DEFAULT 0,
    avg_engagement_score DECIMAL(5,2),
    favorite_category VARCHAR(50),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform, niche, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_hooks_user ON generated_hooks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_hooks_platform ON generated_hooks(platform, niche);
CREATE INDEX IF NOT EXISTS idx_hook_analytics_user_date ON hook_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_hook_analytics_platform ON hook_analytics(platform, niche);

-- Function to update hook analytics
CREATE OR REPLACE FUNCTION update_hook_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO hook_analytics (user_id, platform, niche, date, total_generated, total_copied, avg_engagement_score)
    VALUES (
        NEW.user_id,
        NEW.platform,
        NEW.niche,
        CURRENT_DATE,
        1,
        CASE WHEN NEW.copied THEN 1 ELSE 0 END,
        NEW.engagement_score
    )
    ON CONFLICT (user_id, platform, niche, date)
    DO UPDATE SET
        total_generated = hook_analytics.total_generated + 1,
        total_copied = hook_analytics.total_copied + CASE WHEN NEW.copied THEN 1 ELSE 0 END,
        avg_engagement_score = (
            (hook_analytics.avg_engagement_score * hook_analytics.total_generated + NEW.engagement_score) /
            (hook_analytics.total_generated + 1)
        ),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics
DROP TRIGGER IF EXISTS trigger_update_hook_analytics ON generated_hooks;
CREATE TRIGGER trigger_update_hook_analytics
AFTER INSERT ON generated_hooks
FOR EACH ROW
EXECUTE FUNCTION update_hook_analytics();

-- Function to track hook copies
CREATE OR REPLACE FUNCTION track_hook_copy(hook_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE generated_hooks
    SET copied = TRUE, copied_at = NOW()
    WHERE id = hook_id AND copied = FALSE;
    
    -- Update analytics for copied hooks
    UPDATE hook_analytics ha
    SET total_copied = total_copied + 1,
        updated_at = NOW()
    FROM generated_hooks gh
    WHERE gh.id = hook_id
        AND ha.user_id = gh.user_id
        AND ha.platform = gh.platform
        AND ha.niche = gh.niche
        AND ha.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- View for admin analytics
CREATE OR REPLACE VIEW admin_hook_analytics AS
SELECT 
    platform,
    niche,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(total_generated) as total_hooks_generated,
    SUM(total_copied) as total_hooks_copied,
    AVG(avg_engagement_score) as avg_engagement_score,
    ROUND((SUM(total_copied)::DECIMAL / NULLIF(SUM(total_generated), 0) * 100), 2) as copy_rate_percentage,
    date
FROM hook_analytics
GROUP BY platform, niche, date
ORDER BY date DESC, total_hooks_generated DESC;

-- View for user analytics
CREATE OR REPLACE VIEW user_hook_stats AS
SELECT 
    user_id,
    platform,
    niche,
    SUM(total_generated) as total_generated,
    SUM(total_copied) as total_copied,
    AVG(avg_engagement_score) as avg_engagement_score,
    ROUND((SUM(total_copied)::DECIMAL / NULLIF(SUM(total_generated), 0) * 100), 2) as copy_rate
FROM hook_analytics
GROUP BY user_id, platform, niche;


