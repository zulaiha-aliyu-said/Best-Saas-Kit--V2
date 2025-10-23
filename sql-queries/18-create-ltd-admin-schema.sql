-- LTD Admin Dashboard Schema
-- Add admin role and management features

BEGIN;

-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Set admin user
UPDATE users SET role = 'admin' WHERE email = 'saasmamu@gmail.com';

-- Enhance ltd_codes table for admin management
ALTER TABLE ltd_codes ADD COLUMN IF NOT EXISTS created_by_admin_id VARCHAR(255);
ALTER TABLE ltd_codes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE ltd_codes ADD COLUMN IF NOT EXISTS batch_id VARCHAR(100);
ALTER TABLE ltd_codes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create admin actions log
CREATE TABLE IF NOT EXISTS admin_ltd_actions (
  id SERIAL PRIMARY KEY,
  admin_user_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- 'code_generated', 'code_edited', 'user_edited', etc.
  target_id VARCHAR(255), -- code_id or user_id
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_ltd_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_ltd_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_batch_id ON ltd_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_ltd_codes_is_active ON ltd_codes(is_active);

-- Verify admin setup
SELECT email, role FROM users WHERE role = 'admin';

COMMIT;

RAISE NOTICE '✅ LTD Admin schema created successfully';





