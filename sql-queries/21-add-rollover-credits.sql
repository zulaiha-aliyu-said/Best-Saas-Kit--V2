-- Add rollover_credits column to users table
-- Tracks unused credits that carry over (up to 12 months worth)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rollover_credits INTEGER DEFAULT 0;

COMMENT ON COLUMN users.rollover_credits IS 'Unused credits from previous months (max 12 months worth)';

-- Update existing LTD users to have 0 rollover credits initially
UPDATE users 
SET rollover_credits = 0 
WHERE plan_type = 'ltd' AND rollover_credits IS NULL;

