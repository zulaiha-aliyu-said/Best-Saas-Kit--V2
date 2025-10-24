-- Create scheduling tables for content scheduling feature

-- Scheduled posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  media JSONB DEFAULT '[]'::jsonb,
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  options JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduling usage tracking (for monthly limits)
CREATE TABLE IF NOT EXISTS scheduling_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  posts_scheduled INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_status ON scheduled_posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduling_usage_user_month ON scheduling_usage(user_id, month_year);

-- Comments for documentation
COMMENT ON TABLE scheduled_posts IS 'Stores scheduled social media posts';
COMMENT ON TABLE scheduling_usage IS 'Tracks monthly scheduling usage per user for tier limits';
COMMENT ON COLUMN scheduled_posts.status IS 'Post status: scheduled, posted, failed, or cancelled';
COMMENT ON COLUMN scheduling_usage.month_year IS 'Month in YYYY-MM format for tracking monthly limits';

