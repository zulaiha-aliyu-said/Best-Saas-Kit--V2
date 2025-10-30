-- ============================================================================
-- FIX NEW USER CREDITS ISSUE
-- ============================================================================
-- This script fixes users who registered but have 0 or insufficient credits
-- New users should get 10 free trial credits automatically

-- First, let's check the problematic user
SELECT 
    id, 
    email, 
    name,
    credits, 
    plan_type, 
    subscription_status, 
    monthly_credit_limit,
    created_at
FROM users 
WHERE id = 104799763406502560000;

-- Fix this specific user - give them initial 10 credits
UPDATE users 
SET 
    credits = 10,
    plan_type = 'subscription',
    subscription_status = 'free',
    monthly_credit_limit = 10,
    rollover_credits = 0,
    stacked_codes = 0,
    credit_reset_date = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 104799763406502560000 
  AND credits < 10
  AND (plan_type IS NULL OR plan_type = 'subscription')
  AND (subscription_status IS NULL OR subscription_status = 'free');

-- Fix ALL new users who might have the same issue
-- Only affects free trial users with less than 10 credits
UPDATE users 
SET 
    credits = 10,
    plan_type = COALESCE(plan_type, 'subscription'),
    subscription_status = COALESCE(subscription_status, 'free'),
    monthly_credit_limit = 10,
    rollover_credits = 0,
    stacked_codes = 0,
    credit_reset_date = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    (plan_type IS NULL OR plan_type = 'subscription')
    AND (subscription_status IS NULL OR subscription_status = 'free')
    AND credits < 10
    AND ltd_tier IS NULL;

-- Verify the fix
SELECT 
    id, 
    email, 
    name,
    credits, 
    plan_type, 
    subscription_status, 
    monthly_credit_limit,
    updated_at
FROM users 
WHERE id = 104799763406502560000;

-- Show all free trial users to verify
SELECT 
    id, 
    email, 
    credits, 
    plan_type, 
    subscription_status, 
    monthly_credit_limit
FROM users 
WHERE plan_type = 'subscription' AND subscription_status = 'free'
ORDER BY created_at DESC
LIMIT 10;


