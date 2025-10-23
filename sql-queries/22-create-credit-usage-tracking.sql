-- Credit Usage Tracking Table
-- This table tracks every credit-consuming action by users

CREATE TABLE IF NOT EXISTS credit_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- 'content_repurposing', 'viral_hook', 'trend_generation', 'ai_chat', 'performance_prediction', etc.
  credits_used INTEGER NOT NULL DEFAULT 1,
  metadata JSONB, -- Additional context (platform, content_type, etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_usage_user ON credit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_action ON credit_usage(action_type);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created ON credit_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_created ON credit_usage(user_id, created_at DESC);

-- Comments
COMMENT ON TABLE credit_usage IS 'Tracks all credit-consuming operations by users';
COMMENT ON COLUMN credit_usage.action_type IS 'Type of action: content_repurposing, viral_hook, trend_generation, ai_chat, performance_prediction, etc.';
COMMENT ON COLUMN credit_usage.metadata IS 'JSON object with additional context (platform, content_type, success, etc.)';

