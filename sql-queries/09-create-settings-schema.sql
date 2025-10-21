-- ============================================================================
-- USER PREFERENCES & SYSTEM CONFIGURATION TABLES
-- ============================================================================
-- This file creates tables for user preferences and system configuration
-- Execute this file after the main database setup

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- User reference
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile Information
    name VARCHAR(255),
    email VARCHAR(255),
    bio TEXT,
    company VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- AI Preferences
    preferred_model VARCHAR(255) DEFAULT 'qwen/qwen3-235b-a22b-2507',
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0.1 AND temperature <= 1.0),
    max_tokens INTEGER DEFAULT 1000 CHECK (max_tokens >= 100 AND max_tokens <= 4000),
    
    -- Content Generation Defaults
    default_tone VARCHAR(50) DEFAULT 'professional',
    default_length VARCHAR(50) DEFAULT 'medium',
    default_platforms JSONB DEFAULT '["x", "linkedin", "instagram"]',
    include_hashtags BOOLEAN DEFAULT true,
    include_emojis BOOLEAN DEFAULT false,
    include_cta BOOLEAN DEFAULT false,
    custom_hook TEXT,
    custom_cta TEXT,
    
    -- Notification Preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT true,
    usage_alerts BOOLEAN DEFAULT true,
    
    -- Privacy & Security
    two_factor_enabled BOOLEAN DEFAULT false,
    data_export_enabled BOOLEAN DEFAULT true,
    
    -- Appearance Settings
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    compact_mode BOOLEAN DEFAULT false,
    
    -- Platform Optimization
    platform_optimization_enabled BOOLEAN DEFAULT false,
    
    -- API Access
    api_key VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_preferences_unique_user UNIQUE (user_id),
    CONSTRAINT user_preferences_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT user_preferences_tone_check CHECK (default_tone IN ('professional', 'casual', 'friendly', 'authoritative', 'conversational')),
    CONSTRAINT user_preferences_length_check CHECK (default_length IN ('short', 'medium', 'long', 'detailed'))
);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- API Configuration
    openrouter_api_key TEXT,
    groq_api_key TEXT,
    default_model VARCHAR(255) DEFAULT 'qwen/qwen3-235b-a22b-2507',
    fallback_model VARCHAR(255) DEFAULT 'groq/llama-3.1-8b-instant',
    max_tokens INTEGER DEFAULT 1000 CHECK (max_tokens >= 100 AND max_tokens <= 4000),
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0.1 AND temperature <= 1.0),
    
    -- Database Settings
    database_url TEXT,
    connection_pool_size INTEGER DEFAULT 10 CHECK (connection_pool_size >= 1 AND connection_pool_size <= 50),
    query_timeout INTEGER DEFAULT 30000 CHECK (query_timeout >= 1000 AND query_timeout <= 300000),
    
    -- System Limits
    free_user_credits INTEGER DEFAULT 10 CHECK (free_user_credits >= 0 AND free_user_credits <= 100),
    pro_user_credits INTEGER DEFAULT 1000 CHECK (pro_user_credits >= 100 AND pro_user_credits <= 10000),
    max_generations_per_day INTEGER DEFAULT 50 CHECK (max_generations_per_day >= 1 AND max_generations_per_day <= 1000),
    max_file_size INTEGER DEFAULT 10485760 CHECK (max_file_size >= 1048576 AND max_file_size <= 104857600), -- 1MB to 100MB
    
    -- Email Configuration
    resend_api_key TEXT,
    from_email VARCHAR(255) DEFAULT 'noreply@yoursaas.com',
    support_email VARCHAR(255) DEFAULT 'support@yoursaas.com',
    
    -- Security Settings
    session_timeout INTEGER DEFAULT 86400 CHECK (session_timeout >= 3600 AND session_timeout <= 604800), -- 1 hour to 1 week
    max_login_attempts INTEGER DEFAULT 5 CHECK (max_login_attempts >= 3 AND max_login_attempts <= 20),
    enable_2fa BOOLEAN DEFAULT false,
    allowed_domains JSONB DEFAULT '[]',
    
    -- Feature Flags
    enable_predictive_scoring BOOLEAN DEFAULT true,
    enable_trend_analysis BOOLEAN DEFAULT true,
    enable_scheduling BOOLEAN DEFAULT true,
    enable_templates BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    
    -- Analytics Configuration
    enable_analytics BOOLEAN DEFAULT true,
    analytics_provider VARCHAR(50) DEFAULT 'simple-analytics',
    tracking_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT system_config_email_check CHECK (from_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT system_config_support_email_check CHECK (support_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT system_config_analytics_provider_check CHECK (analytics_provider IN ('simple-analytics', 'google-analytics', 'posthog', 'mixpanel', 'custom'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_api_key ON user_preferences(api_key) WHERE api_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_config_created_at ON system_config(created_at);

-- Add comments to tables and columns for documentation
COMMENT ON TABLE user_preferences IS 'User preferences and settings for personalization';
COMMENT ON TABLE system_config IS 'System-wide configuration settings';

COMMENT ON COLUMN user_preferences.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_preferences.preferred_model IS 'Default AI model for content generation';
COMMENT ON COLUMN user_preferences.temperature IS 'AI creativity setting (0.1 = consistent, 1.0 = creative)';
COMMENT ON COLUMN user_preferences.max_tokens IS 'Maximum tokens for AI responses';
COMMENT ON COLUMN user_preferences.default_platforms IS 'JSON array of default platforms for content generation';
COMMENT ON COLUMN user_preferences.api_key IS 'User-specific API key for integrations';

COMMENT ON COLUMN system_config.default_model IS 'Default AI model for the system';
COMMENT ON COLUMN system_config.fallback_model IS 'Fallback AI model when default fails';
COMMENT ON COLUMN system_config.allowed_domains IS 'JSON array of allowed email domains';
COMMENT ON COLUMN system_config.maintenance_mode IS 'Enable/disable maintenance mode';

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system configuration
INSERT INTO system_config (
    openrouter_api_key,
    groq_api_key,
    default_model,
    fallback_model,
    max_tokens,
    temperature,
    database_url,
    connection_pool_size,
    query_timeout,
    free_user_credits,
    pro_user_credits,
    max_generations_per_day,
    max_file_size,
    resend_api_key,
    from_email,
    support_email,
    session_timeout,
    max_login_attempts,
    enable_2fa,
    allowed_domains,
    enable_predictive_scoring,
    enable_trend_analysis,
    enable_scheduling,
    enable_templates,
    maintenance_mode,
    enable_analytics,
    analytics_provider,
    tracking_id
) VALUES (
    '',
    '',
    'qwen/qwen3-235b-a22b-2507',
    'groq/llama-3.1-8b-instant',
    1000,
    0.7,
    '',
    10,
    30000,
    10,
    1000,
    50,
    10485760,
    '',
    'noreply@yoursaas.com',
    'support@yoursaas.com',
    86400,
    5,
    false,
    '[]',
    true,
    true,
    true,
    true,
    false,
    true,
    'simple-analytics',
    ''
) ON CONFLICT DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE '✅ User preferences and system configuration tables created successfully';
END $$;








