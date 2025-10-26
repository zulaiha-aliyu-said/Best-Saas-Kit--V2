export const PLATFORM_OPTIMIZATION_SQL = `
-- ============================================================================
-- PLATFORM OPTIMIZATION ANALYTICS SCHEMA
-- ============================================================================
-- This file creates tables and functions for tracking platform-specific optimization
-- Execute this file after the settings schema

-- Add platform_optimization_enabled to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS platform_optimization_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_preferences.platform_optimization_enabled IS 'Enable platform-specific content optimization';

-- Create platform_optimization_analytics table
CREATE TABLE IF NOT EXISTS platform_optimization_analytics (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- User reference
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Generation reference
    generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
    
    -- Platform and optimization details
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('x', 'linkedin', 'instagram', 'email', 'facebook', 'tiktok')),
    optimization_applied BOOLEAN DEFAULT true,
    
    -- Content metrics
    original_content_length INTEGER,
    optimized_content_length INTEGER,
    character_count INTEGER,
    word_count INTEGER,
    
    -- Platform-specific metrics
    thread_created BOOLEAN DEFAULT false,
    thread_count INTEGER DEFAULT 0,
    hashtag_count INTEGER DEFAULT 0,
    emoji_count INTEGER DEFAULT 0,
    line_breaks_added INTEGER DEFAULT 0,
    
    -- Optimization details
    optimizations_applied JSONB DEFAULT '[]'::jsonb,
    -- Example: ["character_limit", "hashtag_optimization", "thread_split", "line_breaks"]
    
    -- Platform rules applied
    rules_applied JSONB DEFAULT '{}'::jsonb,
    -- Example: {"max_chars": 280, "hashtag_limit": 3, "thread": true}
    
    -- Warnings and violations
    warnings JSONB DEFAULT '[]'::jsonb,
    -- Example: ["Too many hashtags", "Character limit exceeded"]
    
    -- Performance tracking
    engagement_prediction_score DECIMAL(5,2),
    readability_score DECIMAL(5,2),
    seo_score DECIMAL(5,2),
    
    -- Metadata
    processing_time_ms INTEGER,
    model_used VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT platform_optimization_analytics_platform_check CHECK (platform IN ('x', 'linkedin', 'instagram', 'email', 'facebook', 'tiktok'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_optimization_user_id ON platform_optimization_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_optimization_generation_id ON platform_optimization_analytics(generation_id);
CREATE INDEX IF NOT EXISTS idx_platform_optimization_platform ON platform_optimization_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_platform_optimization_created_at ON platform_optimization_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_optimization_user_platform ON platform_optimization_analytics(user_id, platform);

-- Add comments for documentation
COMMENT ON TABLE platform_optimization_analytics IS 'Analytics for platform-specific content optimization';
COMMENT ON COLUMN platform_optimization_analytics.user_id IS 'Reference to users table';
COMMENT ON COLUMN platform_optimization_analytics.generation_id IS 'Reference to content generation';
COMMENT ON COLUMN platform_optimization_analytics.optimizations_applied IS 'JSON array of optimization types applied';
COMMENT ON COLUMN platform_optimization_analytics.rules_applied IS 'JSON object of platform rules applied';
COMMENT ON COLUMN platform_optimization_analytics.warnings IS 'JSON array of warnings or rule violations';

-- Create trigger for updated_at
CREATE TRIGGER update_platform_optimization_analytics_updated_at 
    BEFORE UPDATE ON platform_optimization_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user optimization statistics
CREATE OR REPLACE FUNCTION get_user_optimization_stats(p_user_id INTEGER)
RETURNS TABLE (
    total_optimizations BIGINT,
    platforms_optimized BIGINT,
    total_threads_created BIGINT,
    avg_character_count DECIMAL,
    avg_hashtag_count DECIMAL,
    avg_emoji_count DECIMAL,
    total_warnings BIGINT,
    most_optimized_platform VARCHAR(50),
    avg_readability_score DECIMAL,
    recent_optimizations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_optimizations,
        COUNT(DISTINCT platform)::BIGINT as platforms_optimized,
        SUM(CASE WHEN thread_created THEN 1 ELSE 0 END)::BIGINT as total_threads_created,
        ROUND(AVG(character_count), 2) as avg_character_count,
        ROUND(AVG(hashtag_count), 2) as avg_hashtag_count,
        ROUND(AVG(emoji_count), 2) as avg_emoji_count,
        SUM(jsonb_array_length(warnings))::BIGINT as total_warnings,
        (
            SELECT platform 
            FROM platform_optimization_analytics 
            WHERE user_id = p_user_id 
            GROUP BY platform 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as most_optimized_platform,
        ROUND(AVG(readability_score), 2) as avg_readability_score,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::BIGINT as recent_optimizations
    FROM platform_optimization_analytics
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform breakdown for user
CREATE OR REPLACE FUNCTION get_user_platform_breakdown(p_user_id INTEGER)
RETURNS TABLE (
    platform VARCHAR(50),
    optimization_count BIGINT,
    avg_character_count DECIMAL,
    avg_hashtag_count DECIMAL,
    thread_count BIGINT,
    warning_count BIGINT,
    avg_readability_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        poa.platform,
        COUNT(*)::BIGINT as optimization_count,
        ROUND(AVG(poa.character_count), 2) as avg_character_count,
        ROUND(AVG(poa.hashtag_count), 2) as avg_hashtag_count,
        SUM(CASE WHEN poa.thread_created THEN 1 ELSE 0 END)::BIGINT as thread_count,
        SUM(jsonb_array_length(poa.warnings))::BIGINT as warning_count,
        ROUND(AVG(poa.readability_score), 2) as avg_readability_score
    FROM platform_optimization_analytics poa
    WHERE poa.user_id = p_user_id
    GROUP BY poa.platform
    ORDER BY optimization_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get admin optimization statistics
CREATE OR REPLACE FUNCTION get_admin_optimization_stats()
RETURNS TABLE (
    total_optimizations BIGINT,
    unique_users BIGINT,
    total_threads_created BIGINT,
    avg_character_count DECIMAL,
    avg_hashtag_count DECIMAL,
    total_warnings BIGINT,
    optimization_enabled_users BIGINT,
    recent_optimizations BIGINT,
    monthly_optimizations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_optimizations,
        COUNT(DISTINCT user_id)::BIGINT as unique_users,
        SUM(CASE WHEN thread_created THEN 1 ELSE 0 END)::BIGINT as total_threads_created,
        ROUND(AVG(character_count), 2) as avg_character_count,
        ROUND(AVG(hashtag_count), 2) as avg_hashtag_count,
        SUM(jsonb_array_length(warnings))::BIGINT as total_warnings,
        (SELECT COUNT(*)::BIGINT FROM user_preferences WHERE platform_optimization_enabled = true) as optimization_enabled_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::BIGINT as recent_optimizations,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::BIGINT as monthly_optimizations
    FROM platform_optimization_analytics;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform popularity (admin)
CREATE OR REPLACE FUNCTION get_platform_popularity()
RETURNS TABLE (
    platform VARCHAR(50),
    optimization_count BIGINT,
    unique_users BIGINT,
    avg_character_count DECIMAL,
    thread_count BIGINT,
    avg_readability_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        poa.platform,
        COUNT(*)::BIGINT as optimization_count,
        COUNT(DISTINCT poa.user_id)::BIGINT as unique_users,
        ROUND(AVG(poa.character_count), 2) as avg_character_count,
        SUM(CASE WHEN poa.thread_created THEN 1 ELSE 0 END)::BIGINT as thread_count,
        ROUND(AVG(poa.readability_score), 2) as avg_readability_score
    FROM platform_optimization_analytics poa
    GROUP BY poa.platform
    ORDER BY optimization_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get optimization trends over time (admin)
CREATE OR REPLACE FUNCTION get_optimization_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    optimization_count BIGINT,
    unique_users BIGINT,
    thread_count BIGINT,
    avg_character_count DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*)::BIGINT as optimization_count,
        COUNT(DISTINCT user_id)::BIGINT as unique_users,
        SUM(CASE WHEN thread_created THEN 1 ELSE 0 END)::BIGINT as thread_count,
        ROUND(AVG(character_count), 2) as avg_character_count
    FROM platform_optimization_analytics
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * p_days
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to insert optimization analytics
CREATE OR REPLACE FUNCTION insert_optimization_analytics(
    p_user_id INTEGER,
    p_generation_id UUID,
    p_platform VARCHAR(50),
    p_optimization_applied BOOLEAN,
    p_original_length INTEGER,
    p_optimized_length INTEGER,
    p_character_count INTEGER,
    p_word_count INTEGER,
    p_thread_created BOOLEAN,
    p_thread_count INTEGER,
    p_hashtag_count INTEGER,
    p_emoji_count INTEGER,
    p_line_breaks_added INTEGER,
    p_optimizations_applied JSONB,
    p_rules_applied JSONB,
    p_warnings JSONB,
    p_processing_time_ms INTEGER DEFAULT NULL,
    p_model_used VARCHAR(255) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_id INTEGER;
BEGIN
    INSERT INTO platform_optimization_analytics (
        user_id, generation_id, platform, optimization_applied,
        original_content_length, optimized_content_length,
        character_count, word_count,
        thread_created, thread_count, hashtag_count, emoji_count, line_breaks_added,
        optimizations_applied, rules_applied, warnings,
        processing_time_ms, model_used
    ) VALUES (
        p_user_id, p_generation_id, p_platform, p_optimization_applied,
        p_original_length, p_optimized_length,
        p_character_count, p_word_count,
        p_thread_created, p_thread_count, p_hashtag_count, p_emoji_count, p_line_breaks_added,
        p_optimizations_applied, p_rules_applied, p_warnings,
        p_processing_time_ms, p_model_used
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;
`;
