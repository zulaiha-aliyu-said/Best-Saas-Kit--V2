-- Fix user_id column type to accept Google OAuth IDs (not UUIDs)
-- Run this migration to fix the "invalid input syntax for type uuid" error

-- Step 1: Update competitors table
ALTER TABLE competitors 
  ALTER COLUMN user_id TYPE VARCHAR(255);

-- Step 2: Update content_gaps table
ALTER TABLE content_gaps 
  ALTER COLUMN user_id TYPE VARCHAR(255);

-- Step 3: Verify the changes
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('competitors', 'content_gaps')
  AND column_name = 'user_id'
ORDER BY table_name;

-- Expected result:
-- table_name       | column_name | data_type        | character_maximum_length
-- -----------------+-------------+------------------+-------------------------
-- competitors      | user_id     | character varying| 255
-- content_gaps     | user_id     | character varying| 255

