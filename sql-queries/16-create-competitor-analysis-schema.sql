-- ============================================================================
-- COMPETITOR ANALYSIS SCHEMA
-- ============================================================================
-- This file creates tables and functions for competitor analysis feature
-- Execute this file after the basic setup

-- ============================================================================
-- COMPETITORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitors (
    -- Primary key
    id SERIAL PRIMARY KEY,

    -- User reference (use VARCHAR to match Google OAuth IDs)
    user_id VARCHAR(255) NOT NULL,

    -- Competitor profile data
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'linkedin')),
    avatar_url TEXT,
    bio TEXT,

    -- Metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Platform-specific data
    platform_user_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,

    -- Metadata
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(user_id, platform, username)
);

-- Add comments for documentation
COMMENT ON TABLE competitors IS 'Main competitors table storing profile and basic metrics';
COMMENT ON COLUMN competitors.user_id IS 'User ID from Google OAuth (string format)';
COMMENT ON COLUMN competitors.platform IS 'Social media platform: twitter, instagram, linkedin';
COMMENT ON COLUMN competitors.engagement_rate IS 'Calculated engagement rate as percentage';

-- ============================================================================
-- COMPETITOR STATS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitor_stats (
    -- Primary key
    id SERIAL PRIMARY KEY,

    -- Foreign key to competitors
    competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,

    -- Date for daily stats
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,

    -- Engagement metrics
    avg_likes DECIMAL(10,2) DEFAULT 0,
    avg_comments DECIMAL(10,2) DEFAULT 0,
    avg_shares DECIMAL(10,2) DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Posting patterns
    posting_frequency DECIMAL(3,2) DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(competitor_id, stat_date)
);

-- Add comments
COMMENT ON TABLE competitor_stats IS 'Daily statistics for each competitor';
COMMENT ON COLUMN competitor_stats.competitor_id IS 'Reference to competitors table';
COMMENT ON COLUMN competitor_stats.stat_date IS 'Date for these statistics';

-- ============================================================================
-- COMPETITOR POSTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS competitor_posts (
    -- Primary key
    id SERIAL PRIMARY KEY,

    -- Foreign key to competitors
    competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,

    -- Platform-specific post data
    platform_post_id VARCHAR(255) NOT NULL,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    media_type VARCHAR(50) DEFAULT 'text',

    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Post metadata
    post_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(competitor_id, platform_post_id)
);

-- Add comments
COMMENT ON TABLE competitor_posts IS 'Individual posts from competitors';
COMMENT ON COLUMN competitor_posts.platform_post_id IS 'Unique ID from the platform API';
COMMENT ON COLUMN competitor_posts.media_urls IS 'JSON array of media URLs';
COMMENT ON COLUMN competitor_posts.posted_at IS 'When the post was originally published';

-- ============================================================================
-- CONTENT GAPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_gaps (
    -- Primary key
    id SERIAL PRIMARY KEY,

    -- User and competitor references
    user_id VARCHAR(255) NOT NULL,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,

    -- Gap classification
    gap_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Topics and suggestions
    topics JSONB DEFAULT '[]'::jsonb,
    suggested_content JSONB DEFAULT '[]'::jsonb,

    -- Performance metrics
    potential_score INTEGER DEFAULT 0 CHECK (potential_score >= 0 AND potential_score <= 100),
    avg_engagement DECIMAL(10,2) DEFAULT 0,
    post_count INTEGER DEFAULT 0,

    -- Status field for filtering active/archived gaps
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'implemented')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(user_id, competitor_id, gap_type)
);

-- Add comments
COMMENT ON TABLE content_gaps IS 'AI-identified content opportunities and gaps';
COMMENT ON COLUMN content_gaps.user_id IS 'User ID from Google OAuth (string format)';
COMMENT ON COLUMN content_gaps.competitor_id IS 'Reference to competitors table';
COMMENT ON COLUMN content_gaps.gap_type IS 'Type of gap (e.g., trending_topics, posting_frequency)';
COMMENT ON COLUMN content_gaps.potential_score IS 'AI-predicted success score 0-100';
COMMENT ON COLUMN content_gaps.status IS 'Status of the gap: active, archived, or implemented';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Competitors table indexes
CREATE INDEX IF NOT EXISTS idx_competitors_user_id ON competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_platform ON competitors(platform);
CREATE INDEX IF NOT EXISTS idx_competitors_user_platform ON competitors(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_competitors_created_at ON competitors(created_at);
CREATE INDEX IF NOT EXISTS idx_competitors_last_analyzed ON competitors(last_analyzed_at);

-- Competitor stats indexes
CREATE INDEX IF NOT EXISTS idx_competitor_stats_competitor_id ON competitor_stats(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_stats_date ON competitor_stats(stat_date);
CREATE INDEX IF NOT EXISTS idx_competitor_stats_competitor_date ON competitor_stats(competitor_id, stat_date);

-- Competitor posts indexes
CREATE INDEX IF NOT EXISTS idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_posted_at ON competitor_posts(posted_at);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_engagement ON competitor_posts(engagement_rate DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_media_type ON competitor_posts(media_type);

-- Content gaps indexes
CREATE INDEX IF NOT EXISTS idx_content_gaps_user_id ON content_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_content_gaps_competitor_id ON content_gaps(competitor_id);
CREATE INDEX IF NOT EXISTS idx_content_gaps_type ON content_gaps(gap_type);
CREATE INDEX IF NOT EXISTS idx_content_gaps_potential_score ON content_gaps(potential_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_gaps_user_competitor ON content_gaps(user_id, competitor_id);
CREATE INDEX IF NOT EXISTS idx_content_gaps_status ON content_gaps(status);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Competitors table trigger
CREATE TRIGGER update_competitors_updated_at
    BEFORE UPDATE ON competitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Competitor stats table trigger
CREATE TRIGGER update_competitor_stats_updated_at
    BEFORE UPDATE ON competitor_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Competitor posts table trigger
CREATE TRIGGER update_competitor_posts_updated_at
    BEFORE UPDATE ON competitor_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Content gaps table trigger
CREATE TRIGGER update_content_gaps_updated_at
    BEFORE UPDATE ON content_gaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get competitor analysis summary for a user
CREATE OR REPLACE FUNCTION get_user_competitor_summary(p_user_id VARCHAR(255))
RETURNS TABLE (
    total_competitors BIGINT,
    platforms_tracked BIGINT,
    total_posts_analyzed BIGINT,
    total_content_gaps BIGINT,
    avg_engagement_rate DECIMAL,
    most_recent_analysis TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT c.id)::BIGINT as total_competitors,
        COUNT(DISTINCT c.platform)::BIGINT as platforms_tracked,
        COUNT(cp.id)::BIGINT as total_posts_analyzed,
        COUNT(cg.id)::BIGINT as total_content_gaps,
        ROUND(AVG(c.engagement_rate), 2) as avg_engagement_rate,
        MAX(c.last_analyzed_at) as most_recent_analysis
    FROM competitors c
    LEFT JOIN competitor_posts cp ON c.id = cp.competitor_id
    LEFT JOIN content_gaps cg ON c.id = cg.competitor_id
    WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing competitors for a user
CREATE OR REPLACE FUNCTION get_top_competitors(p_user_id VARCHAR(255), p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    competitor_id INTEGER,
    name VARCHAR(255),
    username VARCHAR(255),
    platform VARCHAR(50),
    followers_count INTEGER,
    engagement_rate DECIMAL,
    posts_analyzed BIGINT,
    content_gaps_count BIGINT,
    last_analyzed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.username,
        c.platform,
        c.followers_count,
        c.engagement_rate,
        COUNT(cp.id)::BIGINT as posts_analyzed,
        COUNT(cg.id)::BIGINT as content_gaps_count,
        c.last_analyzed_at
    FROM competitors c
    LEFT JOIN competitor_posts cp ON c.id = cp.competitor_id
    LEFT JOIN content_gaps cg ON c.id = cg.competitor_id
    WHERE c.user_id = p_user_id
    GROUP BY c.id, c.name, c.username, c.platform, c.followers_count, c.engagement_rate, c.last_analyzed_at
    ORDER BY c.engagement_rate DESC, c.followers_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get content gaps for a user
CREATE OR REPLACE FUNCTION get_user_content_gaps(p_user_id VARCHAR(255))
RETURNS TABLE (
    gap_id INTEGER,
    competitor_name VARCHAR(255),
    competitor_username VARCHAR(255),
    platform VARCHAR(50),
    gap_type VARCHAR(100),
    title VARCHAR(500),
    potential_score INTEGER,
    avg_engagement DECIMAL,
    topics TEXT[],
    suggested_content TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cg.id,
        c.name,
        c.username,
        c.platform,
        cg.gap_type,
        cg.title,
        cg.potential_score,
        cg.avg_engagement,
        ARRAY(SELECT jsonb_array_elements_text(cg.topics)) as topics,
        ARRAY(SELECT jsonb_array_elements_text(cg.suggested_content)) as suggested_content
    FROM content_gaps cg
    JOIN competitors c ON cg.competitor_id = c.id
    WHERE cg.user_id = p_user_id
    ORDER BY cg.potential_score DESC, cg.avg_engagement DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to delete old competitor data (cleanup function)
CREATE OR REPLACE FUNCTION cleanup_old_competitor_data(p_days_old INTEGER DEFAULT 90)
RETURNS TABLE (
    deleted_competitors BIGINT,
    deleted_stats BIGINT,
    deleted_posts BIGINT,
    deleted_gaps BIGINT
) AS $$
DECLARE
    old_competitors BIGINT;
    old_stats BIGINT;
    old_posts BIGINT;
    old_gaps BIGINT;
BEGIN
    -- Delete old competitor stats
    DELETE FROM competitor_stats
    WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * p_days_old;

    GET DIAGNOSTICS old_stats = ROW_COUNT;

    -- Delete old competitor posts (keep only recent ones)
    DELETE FROM competitor_posts
    WHERE posted_at < CURRENT_DATE - INTERVAL '1 day' * p_days_old;

    GET DIAGNOSTICS old_posts = ROW_COUNT;

    -- Delete competitors with no recent activity (no posts or stats in last 30 days)
    DELETE FROM competitors
    WHERE last_analyzed_at < CURRENT_DATE - INTERVAL '1 day' * 30
    AND id NOT IN (
        SELECT DISTINCT competitor_id FROM competitor_posts
        UNION
        SELECT DISTINCT competitor_id FROM competitor_stats
        WHERE stat_date >= CURRENT_DATE - INTERVAL '1 day' * 30
    );

    GET DIAGNOSTICS old_competitors = ROW_COUNT;

    -- Delete orphaned content gaps
    DELETE FROM content_gaps
    WHERE competitor_id NOT IN (SELECT id FROM competitors);

    GET DIAGNOSTICS old_gaps = ROW_COUNT;

    RETURN QUERY SELECT old_competitors, old_stats, old_posts, old_gaps;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 COMPETITOR ANALYSIS SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tables Created:';
    RAISE NOTICE '   ✅ competitors - Main competitor profiles';
    RAISE NOTICE '   ✅ competitor_stats - Daily statistics';
    RAISE NOTICE '   ✅ competitor_posts - Individual posts';
    RAISE NOTICE '   ✅ content_gaps - AI opportunities';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Indexes Created:';
    RAISE NOTICE '   ✅ Performance indexes for all tables';
    RAISE NOTICE '   ✅ Composite indexes for common queries';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Functions Created:';
    RAISE NOTICE '   ✅ get_user_competitor_summary()';
    RAISE NOTICE '   ✅ get_top_competitors()';
    RAISE NOTICE '   ✅ get_user_content_gaps()';
    RAISE NOTICE '   ✅ cleanup_old_competitor_data()';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to analyze competitors!';
    RAISE NOTICE '';
END $$;
