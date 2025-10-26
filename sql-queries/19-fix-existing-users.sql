-- ============================================================================
-- FIX EXISTING USERS - SET FREE TRIAL SYSTEM
-- ============================================================================
-- This script updates any existing users to the new free trial system
-- Free trial users get 10 credits and can only use the repurpose feature
-- They need to redeem an LTD code to get full access

-- Update existing FREE users to new free trial system
UPDATE users 
SET 
    credits = CASE 
        WHEN plan_type = 'ltd' THEN credits  -- Keep LTD users' credits as is
        WHEN subscription_status != 'free' THEN credits  -- Keep paid users' credits as is
        ELSE 10  -- Free trial users get 10 credits
    END,
    plan_type = COALESCE(plan_type, 'subscription'),
    subscription_status = COALESCE(subscription_status, 'free'),
    monthly_credit_limit = CASE 
        WHEN plan_type = 'ltd' THEN monthly_credit_limit  -- Keep LTD limits
        ELSE 10  -- Free trial limit is 10
    END,
    rollover_credits = CASE 
        WHEN plan_type = 'ltd' THEN rollover_credits  -- Keep LTD rollover
        ELSE 0  -- No rollover for free trial
    END,
    stacked_codes = CASE 
        WHEN plan_type = 'ltd' THEN stacked_codes  -- Keep LTD stacked codes
        ELSE 0  -- Free trial users haven't redeemed any codes
    END,
    credit_reset_date = CASE 
        WHEN plan_type = 'ltd' THEN credit_reset_date  -- Keep LTD reset date
        ELSE NULL  -- Free trial has no reset date
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    plan_type IS NULL 
    OR monthly_credit_limit IS NULL
    OR (plan_type = 'subscription' AND subscription_status = 'free' AND credits > 10);

-- Display results
DO $$
DECLARE
    updated_count INTEGER;
    free_trial_users INTEGER;
    ltd_users INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    SELECT COUNT(*) INTO free_trial_users 
    FROM users 
    WHERE plan_type = 'subscription' AND subscription_status = 'free';
    
    SELECT COUNT(*) INTO ltd_users 
    FROM users 
    WHERE plan_type = 'ltd';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FREE TRIAL SYSTEM ACTIVATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Updated % users', updated_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Free Trial Users: %', free_trial_users;
    RAISE NOTICE '  - 10 credits (one-time)';
    RAISE NOTICE '  - Access to repurpose feature only';
    RAISE NOTICE '  - Must redeem LTD code for full access';
    RAISE NOTICE '';
    RAISE NOTICE 'LTD Users: %', ltd_users;
    RAISE NOTICE '  - Monthly credits based on tier';
    RAISE NOTICE '  - Full feature access';
    RAISE NOTICE '========================================';
END $$;

-- Show updated user stats by plan type
SELECT 
    plan_type,
    subscription_status,
    COUNT(*) as user_count,
    AVG(credits)::INTEGER as avg_credits,
    MIN(credits) as min_credits,
    MAX(credits) as max_credits
FROM users
GROUP BY plan_type, subscription_status
ORDER BY plan_type, subscription_status;

