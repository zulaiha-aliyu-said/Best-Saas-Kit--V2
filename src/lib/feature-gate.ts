/**
 * Feature Gating System
 * Controls access to features based on user's LTD tier or subscription plan
 */

import { pool } from './database';
import {
  LTDTier,
  getLTDTierConfig,
  hasFeature as tierHasFeature,
  getFeatureValue as getTierFeatureValue,
  calculateCreditCost,
  getTierFromSubscriptionStatus,
  SubscriptionStatus,
} from './ltd-tiers';

export interface UserPlan {
  user_id: number;
  plan_type: 'subscription' | 'ltd';
  subscription_status: SubscriptionStatus;
  ltd_tier: LTDTier | null;
  credits: number;
  monthly_credit_limit: number;
  rollover_credits: number;
  stacked_codes: number;
  credit_reset_date: Date;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  reason?: string;
  limit?: number | string;
  current?: number;
  upgradeRequired?: LTDTier | 'pro' | 'enterprise';
}

/**
 * Get user's current plan details
 */
export async function getUserPlan(userId: string | number): Promise<UserPlan | null> {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        id as user_id,
        plan_type,
        subscription_status,
        ltd_tier,
        credits,
        monthly_credit_limit,
        rollover_credits,
        stacked_codes,
        credit_reset_date
      FROM users
      WHERE id = $1
    `;
    
    const result = await client.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0] as UserPlan;
  } finally {
    client.release();
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function checkFeatureAccess(
  userId: string | number,
  featurePath: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  
  if (!plan) {
    return {
      hasAccess: false,
      reason: 'User not found',
    };
  }
  
  // Handle LTD users
  if (plan.plan_type === 'ltd' && plan.ltd_tier) {
    const hasAccess = tierHasFeature(plan.ltd_tier, featurePath);
    
    if (!hasAccess) {
      // Find which tier has this feature
      const upgradeRequired = findMinimumTierForFeature(featurePath);
      
      return {
        hasAccess: false,
        reason: `Feature not available in Tier ${plan.ltd_tier}`,
        upgradeRequired: upgradeRequired || undefined,
      };
    }
    
    // Check for limits
    const featureValue = getTierFeatureValue(plan.ltd_tier, featurePath);
    
    return {
      hasAccess: true,
      limit: typeof featureValue === 'object' && featureValue !== null 
        ? JSON.stringify(featureValue) 
        : featureValue,
    };
  }
  
  // Handle subscription users (fallback to current logic)
  return checkSubscriptionFeatureAccess(plan.subscription_status, featurePath);
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCreditAccess(
  userId: string | number,
  action: string,
  creditsRequired?: number
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  
  if (!plan) {
    return {
      hasAccess: false,
      reason: 'User not found',
    };
  }
  
  // Calculate credit cost
  const cost = creditsRequired ?? calculateCreditCost(action, plan.ltd_tier ?? undefined);
  
  if (plan.credits < cost) {
    return {
      hasAccess: false,
      reason: 'Insufficient credits',
      current: plan.credits,
      limit: cost,
    };
  }
  
  return {
    hasAccess: true,
    current: plan.credits,
    limit: cost,
  };
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string | number,
  amount: number,
  action: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current credits with row lock
    const userQuery = `
      SELECT credits FROM users WHERE id = $1 FOR UPDATE
    `;
    const userResult = await client.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, remaining: 0, error: 'User not found' };
    }
    
    const currentCredits = userResult.rows[0].credits;
    
    if (currentCredits < amount) {
      await client.query('ROLLBACK');
      return { 
        success: false, 
        remaining: currentCredits, 
        error: `Insufficient credits. Required: ${amount}, Available: ${currentCredits}` 
      };
    }
    
    // Deduct credits
    const updateQuery = `
      UPDATE users 
      SET credits = credits - $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `;
    const updateResult = await client.query(updateQuery, [amount, userId]);
    const newCredits = updateResult.rows[0].credits;
    
    // Log the usage
    const logQuery = `
      INSERT INTO credit_usage_log (user_id, action_type, credits_used, credits_remaining, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(logQuery, [
      userId,
      action,
      amount,
      newCredits,
      metadata ? JSON.stringify(metadata) : null,
    ]);
    
    await client.query('COMMIT');
    
    return { success: true, remaining: newCredits };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deducting credits:', error);
    return { 
      success: false, 
      remaining: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  } finally {
    client.release();
  }
}

/**
 * Add credits to user account (for refunds or bonuses)
 */
export async function addCredits(
  userId: string | number,
  amount: number,
  reason: string
): Promise<{ success: boolean; newTotal: number }> {
  const client = await pool.connect();
  
  try {
    const query = `
      UPDATE users 
      SET credits = credits + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING credits
    `;
    
    const result = await client.query(query, [amount, userId]);
    
    if (result.rows.length === 0) {
      return { success: false, newTotal: 0 };
    }
    
    // Log the addition
    const logQuery = `
      INSERT INTO credit_usage_log (user_id, action_type, credits_used, credits_remaining, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(logQuery, [
      userId,
      'credit_addition',
      -amount, // Negative to indicate addition
      result.rows[0].credits,
      JSON.stringify({ reason }),
    ]);
    
    return { success: true, newTotal: result.rows[0].credits };
  } finally {
    client.release();
  }
}

/**
 * Get user's credit usage analytics
 */
export async function getCreditUsageAnalytics(userId: string | number, days: number = 30) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
        action_type,
        COUNT(*) as usage_count,
        SUM(credits_used) as total_credits_used,
        AVG(credits_used) as avg_credits_per_action,
        MAX(created_at) as last_used
      FROM credit_usage_log
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${days} days'
        AND credits_used > 0
      GROUP BY action_type
      ORDER BY total_credits_used DESC
    `;
    
    const result = await client.query(query, [userId]);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Check if credits need to be reset (monthly)
 */
export async function checkAndResetCredits(userId: string | number): Promise<boolean> {
  const client = await pool.connect();
  
  try {
    const plan = await getUserPlan(userId);
    
    if (!plan || plan.plan_type !== 'ltd') {
      return false;
    }
    
    const now = new Date();
    const resetDate = new Date(plan.credit_reset_date);
    
    // If reset date has passed
    if (now >= resetDate) {
      // Calculate rollover
      const currentCredits = plan.credits;
      const newRollover = Math.min(
        currentCredits + plan.rollover_credits,
        plan.monthly_credit_limit
      );
      
      // Reset credits
      const updateQuery = `
        UPDATE users
        SET 
          credits = $1 + LEAST($2, $3),
          rollover_credits = GREATEST(0, $2 - $3),
          credit_reset_date = credit_reset_date + INTERVAL '1 month',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `;
      
      await client.query(updateQuery, [
        plan.monthly_credit_limit,
        plan.rollover_credits,
        plan.monthly_credit_limit,
        userId,
      ]);
      
      return true;
    }
    
    return false;
  } finally {
    client.release();
  }
}

/**
 * Find minimum tier that has a specific feature
 */
function findMinimumTierForFeature(featurePath: string): LTDTier | null {
  for (let tier = 1; tier <= 4; tier++) {
    if (tierHasFeature(tier as LTDTier, featurePath)) {
      return tier as LTDTier;
    }
  }
  return null;
}

/**
 * Check subscription-based feature access (non-LTD users)
 */
function checkSubscriptionFeatureAccess(
  status: SubscriptionStatus,
  featurePath: string
): FeatureAccessResult {
  const accessMap: Record<string, string[]> = {
    free: [
      'content_repurposing',
      'trending_topics',
    ],
    starter: [
      'content_repurposing',
      'trending_topics',
      'analytics',
    ],
    pro: [
      'content_repurposing',
      'trending_topics',
      'analytics',
      'viral_hooks',
      'scheduling',
      'predictive_performance',
    ],
    enterprise: [
      'content_repurposing',
      'trending_topics',
      'analytics',
      'viral_hooks',
      'scheduling',
      'predictive_performance',
      'ai_chat',
      'style_training',
      'bulk_generation',
      'team_collaboration',
      'api_access',
    ],
  };
  
  const basePlan = status.startsWith('ltd_') 
    ? status 
    : status as keyof typeof accessMap;
  
  if (basePlan.startsWith('ltd_')) {
    return { hasAccess: true };
  }
  
  const allowedFeatures = accessMap[basePlan] || [];
  const baseFeature = featurePath.split('.')[0];
  
  const hasAccess = allowedFeatures.includes(baseFeature);
  
  return {
    hasAccess,
    reason: hasAccess ? undefined : `Feature requires ${basePlan === 'free' ? 'Pro' : 'Enterprise'} plan`,
    upgradeRequired: hasAccess ? undefined : (basePlan === 'free' ? 'pro' : 'enterprise'),
  };
}

/**
 * Get all features for a user
 */
export async function getUserFeatures(userId: string | number): Promise<Record<string, any> | null> {
  const plan = await getUserPlan(userId);
  
  if (!plan) {
    return null;
  }
  
  if (plan.plan_type === 'ltd' && plan.ltd_tier) {
    const config = getLTDTierConfig(plan.ltd_tier);
    return config.features;
  }
  
  // Return subscription-based features
  return getSubscriptionFeatures(plan.subscription_status);
}

/**
 * Get features for subscription plans
 */
function getSubscriptionFeatures(status: SubscriptionStatus): Record<string, any> {
  // Basic features for free/starter plans
  const basicFeatures = {
    content_repurposing: { enabled: true, platforms: 2 },
    trending_topics: { enabled: true, hashtags: 5 },
    analytics: { enabled: true, history_days: 7 },
  };
  
  const proFeatures = {
    ...basicFeatures,
    content_repurposing: { enabled: true, platforms: 4 },
    trending_topics: { enabled: true, hashtags: 'unlimited' },
    analytics: { enabled: true, history_days: 30 },
    viral_hooks: { enabled: true },
    scheduling: { enabled: true, posts_per_month: 50 },
    predictive_performance: { enabled: true },
  };
  
  const enterpriseFeatures = {
    ...proFeatures,
    analytics: { enabled: true, history_days: 'unlimited' },
    scheduling: { enabled: true, posts_per_month: 'unlimited' },
    ai_chat: { enabled: true },
    style_training: { enabled: true },
    bulk_generation: { enabled: true },
    team_collaboration: { enabled: true },
    api_access: { enabled: true },
  };
  
  switch (status) {
    case 'enterprise':
      return enterpriseFeatures;
    case 'pro':
      return proFeatures;
    case 'starter':
    case 'free':
    default:
      return basicFeatures;
  }
}

/**
 * Middleware helper to check feature access
 */
export async function requireFeature(userId: string | number, feature: string): Promise<void> {
  const access = await checkFeatureAccess(userId, feature);
  
  if (!access.hasAccess) {
    throw new Error(access.reason || 'Feature not accessible');
  }
}

/**
 * Middleware helper to check and deduct credits
 */
export async function requireCredits(
  userId: string | number,
  action: string,
  amount?: number
): Promise<number> {
  const access = await checkCreditAccess(userId, action, amount);
  
  if (!access.hasAccess) {
    throw new Error(access.reason || 'Insufficient credits');
  }
  
  const cost = amount ?? calculateCreditCost(action);
  const result = await deductCredits(userId, cost, action);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to deduct credits');
  }
  
  return result.remaining;
}

