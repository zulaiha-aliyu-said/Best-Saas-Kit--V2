-- Add onboarding fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP;

-- Create user tips table for dismissible tips
CREATE TABLE IF NOT EXISTS user_tips (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  tip_id VARCHAR(100) NOT NULL,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tip_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tips_user_id ON user_tips(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tips_dismissed ON user_tips(user_id, dismissed);

