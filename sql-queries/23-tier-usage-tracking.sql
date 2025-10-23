-- Tier-Based Feature Usage Tracking Tables
-- Track monthly limits for tier-locked features

-- Track scheduled posts count per user per month (Tier 2+)
CREATE TABLE IF NOT EXISTS user_monthly_scheduling_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM' e.g. '2025-10'
  scheduled_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month_year)
);

-- Track AI chat messages per user per month (Tier 3+)
CREATE TABLE IF NOT EXISTS user_monthly_chat_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  message_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month_year)
);

-- Track team members (Tier 4 only)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  owner_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_email VARCHAR(255) NOT NULL,
  member_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  permissions JSONB DEFAULT '{}',
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  last_activity TIMESTAMP,
  UNIQUE(owner_user_id, member_email)
);

-- Track API usage (Tier 4 only)
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  api_calls INTEGER DEFAULT 0,
  endpoints JSONB DEFAULT '{}', -- Track calls per endpoint
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month_year)
);

-- Track writing style profiles (Tier 3: 1 profile, Tier 4: 3 profiles)
CREATE TABLE IF NOT EXISTS user_writing_styles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_name VARCHAR(255) NOT NULL,
  style_profile JSONB NOT NULL, -- AI-learned writing style
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  training_samples_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, profile_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduling_usage_user_month ON user_monthly_scheduling_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_chat_usage_user_month ON user_monthly_chat_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(member_email);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_month ON api_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_writing_styles_user ON user_writing_styles(user_id);

-- Comments
COMMENT ON TABLE user_monthly_scheduling_usage IS 'Track scheduled posts per month for tier limits (Tier 2: 30, Tier 3: 100, Tier 4: unlimited)';
COMMENT ON TABLE user_monthly_chat_usage IS 'Track AI chat messages per month for tier limits (Tier 3: 200, Tier 4: unlimited)';
COMMENT ON TABLE team_members IS 'Team collaboration members (Tier 4: up to 3 members)';
COMMENT ON TABLE api_usage IS 'API call tracking (Tier 4: 2,500 calls/month)';
COMMENT ON TABLE user_writing_styles IS 'User writing style profiles (Tier 3: 1 profile, Tier 4: 3 profiles)';

