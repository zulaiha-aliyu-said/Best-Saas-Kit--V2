-- ============================================================================
-- PREDICTIVE PERFORMANCE SCORE - DATABASE SCHEMA
-- ============================================================================
-- This file creates the database tables for storing AI performance predictions
-- Execute this file after the main database setup

-- Create performance_predictions table
CREATE TABLE IF NOT EXISTS performance_predictions (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- User reference
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content details
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('x', 'linkedin', 'instagram', 'facebook', 'tiktok', 'email')),
    tone VARCHAR(50) DEFAULT 'professional',
    content_type VARCHAR(50) DEFAULT 'post',
    
    -- Prediction results
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    breakdown JSONB NOT NULL DEFAULT '{}',
    insights TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    risk_factors TEXT[] DEFAULT '{}',
    predicted_metrics JSONB DEFAULT '{}',
    
    -- AI model information
    model_name VARCHAR(255),
    model_version VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT performance_predictions_content_check CHECK (LENGTH(content) > 0),
    CONSTRAINT performance_predictions_score_range CHECK (score >= 0 AND score <= 100)
);

-- Create performance_feedback table for tracking actual vs predicted performance
CREATE TABLE IF NOT EXISTS performance_feedback (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Reference to prediction
    prediction_id INTEGER NOT NULL REFERENCES performance_predictions(id) ON DELETE CASCADE,
    
    -- User reference
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Actual performance metrics (filled when user reports back)
    actual_likes INTEGER DEFAULT 0,
    actual_comments INTEGER DEFAULT 0,
    actual_shares INTEGER DEFAULT 0,
    actual_reach INTEGER DEFAULT 0,
    actual_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Feedback metadata
    feedback_notes TEXT,
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_predictions_user_id ON performance_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_platform ON performance_predictions(platform);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_score ON performance_predictions(score);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_created_at ON performance_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_predictions_user_platform ON performance_predictions(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_performance_feedback_prediction_id ON performance_feedback(prediction_id);
CREATE INDEX IF NOT EXISTS idx_performance_feedback_user_id ON performance_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_feedback_created_at ON performance_feedback(created_at);

-- Add table comments
COMMENT ON TABLE performance_predictions IS 'Stores AI-generated performance predictions for social media content';
COMMENT ON TABLE performance_feedback IS 'Stores user feedback on prediction accuracy and actual performance metrics';

COMMENT ON COLUMN performance_predictions.id IS 'Primary key - auto-incrementing prediction ID';
COMMENT ON COLUMN performance_predictions.user_id IS 'Reference to the user who requested the prediction';
COMMENT ON COLUMN performance_predictions.content IS 'The social media content that was analyzed';
COMMENT ON COLUMN performance_predictions.platform IS 'Social media platform (x, linkedin, instagram, facebook, tiktok, email)';
COMMENT ON COLUMN performance_predictions.tone IS 'Content tone (professional, casual, motivational, etc.)';
COMMENT ON COLUMN performance_predictions.content_type IS 'Type of content (post, story, thread, etc.)';
COMMENT ON COLUMN performance_predictions.score IS 'Overall performance score (0-100)';
COMMENT ON COLUMN performance_predictions.breakdown IS 'JSON object with detailed score breakdown';
COMMENT ON COLUMN performance_predictions.insights IS 'Array of key insights about the content';
COMMENT ON COLUMN performance_predictions.recommendations IS 'Array of improvement recommendations';
COMMENT ON COLUMN performance_predictions.risk_factors IS 'Array of potential risk factors';
COMMENT ON COLUMN performance_predictions.predicted_metrics IS 'JSON object with predicted engagement metrics';
COMMENT ON COLUMN performance_predictions.model_name IS 'AI model used for prediction';
COMMENT ON COLUMN performance_predictions.model_version IS 'Version of the AI model';
COMMENT ON COLUMN performance_predictions.tokens_used IS 'Number of tokens consumed for this prediction';

COMMENT ON COLUMN performance_feedback.id IS 'Primary key - auto-incrementing feedback ID';
COMMENT ON COLUMN performance_feedback.prediction_id IS 'Reference to the original prediction';
COMMENT ON COLUMN performance_feedback.user_id IS 'Reference to the user providing feedback';
COMMENT ON COLUMN performance_feedback.actual_likes IS 'Actual number of likes received';
COMMENT ON COLUMN performance_feedback.actual_comments IS 'Actual number of comments received';
COMMENT ON COLUMN performance_feedback.actual_shares IS 'Actual number of shares received';
COMMENT ON COLUMN performance_feedback.actual_reach IS 'Actual reach achieved';
COMMENT ON COLUMN performance_feedback.actual_engagement_rate IS 'Actual engagement rate percentage';
COMMENT ON COLUMN performance_feedback.feedback_notes IS 'Additional notes from the user';
COMMENT ON COLUMN performance_feedback.accuracy_rating IS 'User rating of prediction accuracy (1-5 stars)';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_performance_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_performance_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER trigger_performance_predictions_updated_at
    BEFORE UPDATE ON performance_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_performance_predictions_updated_at();

CREATE TRIGGER trigger_performance_feedback_updated_at
    BEFORE UPDATE ON performance_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_performance_feedback_updated_at();

-- Create function to get user prediction statistics
CREATE OR REPLACE FUNCTION get_user_prediction_stats(user_id_param INTEGER)
RETURNS TABLE (
    total_predictions BIGINT,
    average_score DECIMAL(5,2),
    highest_score INTEGER,
    lowest_score INTEGER,
    platform_breakdown JSONB,
    recent_predictions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_predictions,
        ROUND(AVG(pp.score), 2) as average_score,
        MAX(pp.score) as highest_score,
        MIN(pp.score) as lowest_score,
        jsonb_object_agg(pp.platform, platform_counts.count) as platform_breakdown,
        COUNT(CASE WHEN pp.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as recent_predictions
    FROM performance_predictions pp
    LEFT JOIN (
        SELECT platform, COUNT(*) as count
        FROM performance_predictions
        WHERE user_id = user_id_param
        GROUP BY platform
    ) platform_counts ON pp.platform = platform_counts.platform
    WHERE pp.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to get prediction accuracy analytics
CREATE OR REPLACE FUNCTION get_prediction_accuracy_stats()
RETURNS TABLE (
    total_predictions BIGINT,
    predictions_with_feedback BIGINT,
    average_accuracy_rating DECIMAL(3,2),
    model_performance JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(pp.id) as total_predictions,
        COUNT(pf.id) as predictions_with_feedback,
        ROUND(AVG(pf.accuracy_rating), 2) as average_accuracy_rating,
        jsonb_object_agg(
            COALESCE(pp.model_name, 'unknown'), 
            jsonb_build_object(
                'count', model_counts.count,
                'avg_score', ROUND(AVG(pp.score), 2),
                'avg_accuracy', ROUND(AVG(pf.accuracy_rating), 2)
            )
        ) as model_performance
    FROM performance_predictions pp
    LEFT JOIN performance_feedback pf ON pp.id = pf.prediction_id
    LEFT JOIN (
        SELECT model_name, COUNT(*) as count
        FROM performance_predictions
        GROUP BY model_name
    ) model_counts ON pp.model_name = model_counts.model_name
    GROUP BY pp.model_name;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (optional)
INSERT INTO performance_predictions (
    user_id, content, platform, tone, content_type, score, 
    breakdown, insights, recommendations, risk_factors, predicted_metrics,
    model_name, tokens_used
) VALUES (
    1, 
    '🚀 Excited to share our latest product update! This new feature will revolutionize how you manage your workflow. What do you think? #innovation #productivity',
    'x',
    'professional',
    'post',
    85,
    '{"contentQuality": 90, "engagementPotential": 80, "algorithmOptimization": 85, "timingTrends": 75, "audienceFit": 90}',
    ARRAY['Strong hook with emoji', 'Good use of relevant hashtags', 'Clear value proposition'],
    ARRAY['Post during peak hours (6-9 PM)', 'Add a call-to-action', 'Consider adding visual elements'],
    ARRAY['Content might be too promotional', 'Consider reducing hashtag count'],
    '{"likes": "500-800", "comments": "25-40", "shares": "15-25", "reach": "2000-3500"}',
    'qwen/qwen3-235b-a22b-2507',
    150
) ON CONFLICT DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE '✅ Predictive Performance Score database schema created successfully';
    RAISE NOTICE '📊 Tables created: performance_predictions, performance_feedback';
    RAISE NOTICE '🔍 Indexes created for optimal query performance';
    RAISE NOTICE '⚡ Functions created: get_user_prediction_stats, get_prediction_accuracy_stats';
    RAISE NOTICE '🔄 Triggers created for automatic timestamp updates';
END $$;


