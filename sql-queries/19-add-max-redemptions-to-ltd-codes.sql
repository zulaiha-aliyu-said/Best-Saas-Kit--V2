-- Add max_redemptions and current_redemptions to ltd_codes table
-- This allows codes to be used multiple times if needed

BEGIN;

-- Add max_redemptions column (default 1 for single use)
ALTER TABLE ltd_codes 
ADD COLUMN IF NOT EXISTS max_redemptions INTEGER DEFAULT 1 NOT NULL;

-- Add current_redemptions column (tracks how many times redeemed)
ALTER TABLE ltd_codes 
ADD COLUMN IF NOT EXISTS current_redemptions INTEGER DEFAULT 0 NOT NULL;

-- Update existing codes: if is_redeemed = true, set current_redemptions = 1
UPDATE ltd_codes 
SET current_redemptions = 1 
WHERE is_redeemed = TRUE AND current_redemptions = 0;

-- Add check constraint
ALTER TABLE ltd_codes 
ADD CONSTRAINT IF NOT EXISTS check_redemptions 
CHECK (current_redemptions <= max_redemptions);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_ltd_codes_current_redemptions 
ON ltd_codes(current_redemptions);

-- Comments
COMMENT ON COLUMN ltd_codes.max_redemptions IS 'Maximum number of times this code can be redeemed';
COMMENT ON COLUMN ltd_codes.current_redemptions IS 'Current number of times this code has been redeemed';

COMMIT;

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ltd_codes' 
  AND column_name IN ('max_redemptions', 'current_redemptions', 'is_redeemed')
ORDER BY column_name;





