/**
 * Tier-Based Feature Usage Tracking
 * Helper functions for tracking monthly usage limits
 */

import { pool } from './database';

/**
 * Get current month-year string (e.g., '2025-10')
 */
function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * SCHEDULING USAGE (Tier 2+)
 * Tier 2: 30 posts/month
 * Tier 3: 100 posts/month
 * Tier 4: Unlimited
 */
export async function getMonthlySchedulingUsage(userId: string): Promise<number> {
  const monthYear = getCurrentMonthYear();
  const result = await pool.query(
    `SELECT scheduled_count FROM user_monthly_scheduling_usage 
     WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );
  return result.rows[0]?.scheduled_count || 0;
}

export async function incrementSchedulingUsage(userId: string): Promise<boolean> {
  const monthYear = getCurrentMonthYear();
  
  try {
    await pool.query(
      `INSERT INTO user_monthly_scheduling_usage (user_id, month_year, scheduled_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, month_year)
       DO UPDATE SET 
         scheduled_count = user_monthly_scheduling_usage.scheduled_count + 1,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, monthYear]
    );
    return true;
  } catch (error) {
    console.error('Error incrementing scheduling usage:', error);
    return false;
  }
}

export async function checkSchedulingLimit(userId: string, tier: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  reason?: string;
}> {
  // Tier 1: Not allowed
  if (tier < 2) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'Content Scheduling is a Tier 2+ feature',
    };
  }

  const current = await getMonthlySchedulingUsage(userId);
  
  // Tier 4: Unlimited
  if (tier >= 4) {
    return {
      allowed: true,
      current,
      limit: 'unlimited',
    };
  }

  // Tier 2: 30 posts/month, Tier 3: 100 posts/month
  const limit = tier === 3 ? 100 : 30;
  
  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `Monthly scheduling limit reached (${limit} posts/month for Tier ${tier})`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
  };
}

/**
 * AI CHAT USAGE (Tier 3+)
 * Tier 3: 200 messages/month
 * Tier 4: Unlimited
 */
export async function getMonthlyChatUsage(userId: string): Promise<number> {
  const monthYear = getCurrentMonthYear();
  const result = await pool.query(
    `SELECT message_count FROM user_monthly_chat_usage 
     WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );
  return result.rows[0]?.message_count || 0;
}

export async function incrementChatUsage(userId: string, messageCount: number = 1): Promise<boolean> {
  const monthYear = getCurrentMonthYear();
  
  try {
    await pool.query(
      `INSERT INTO user_monthly_chat_usage (user_id, month_year, message_count, conversation_count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (user_id, month_year)
       DO UPDATE SET 
         message_count = user_monthly_chat_usage.message_count + $3,
         conversation_count = user_monthly_chat_usage.conversation_count + 1,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, monthYear, messageCount]
    );
    return true;
  } catch (error) {
    console.error('Error incrementing chat usage:', error);
    return false;
  }
}

export async function checkChatLimit(userId: string, tier: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number | 'unlimited';
  reason?: string;
}> {
  // Tier 1-2: Not allowed
  if (tier < 3) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'AI Chat Assistant is a Tier 3+ feature',
    };
  }

  const current = await getMonthlyChatUsage(userId);
  
  // Tier 4: Unlimited
  if (tier >= 4) {
    return {
      allowed: true,
      current,
      limit: 'unlimited',
    };
  }

  // Tier 3: 200 messages/month
  const limit = 200;
  
  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `Monthly chat limit reached (${limit} messages/month for Tier ${tier})`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
  };
}

/**
 * API USAGE (Tier 4 only)
 * Tier 4: 2,500 calls/month
 */
export async function getMonthlyAPIUsage(userId: string): Promise<number> {
  const monthYear = getCurrentMonthYear();
  const result = await pool.query(
    `SELECT api_calls FROM api_usage 
     WHERE user_id = $1 AND month_year = $2`,
    [userId, monthYear]
  );
  return result.rows[0]?.api_calls || 0;
}

export async function incrementAPIUsage(userId: string, endpoint: string): Promise<boolean> {
  const monthYear = getCurrentMonthYear();
  
  try {
    await pool.query(
      `INSERT INTO api_usage (user_id, month_year, api_calls, endpoints)
       VALUES ($1, $2, 1, jsonb_build_object($3, 1))
       ON CONFLICT (user_id, month_year)
       DO UPDATE SET 
         api_calls = api_usage.api_calls + 1,
         endpoints = jsonb_set(
           api_usage.endpoints,
           ARRAY[$3],
           (COALESCE((api_usage.endpoints->>$3)::integer, 0) + 1)::text::jsonb
         ),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, monthYear, endpoint]
    );
    return true;
  } catch (error) {
    console.error('Error incrementing API usage:', error);
    return false;
  }
}

export async function checkAPILimit(userId: string, tier: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  // Tier 1-3: Not allowed
  if (tier < 4) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'API Access is a Tier 4 feature',
    };
  }

  const current = await getMonthlyAPIUsage(userId);
  const limit = 2500; // Tier 4: 2,500 calls/month
  
  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `Monthly API limit reached (${limit} calls/month)`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
  };
}

/**
 * WRITING STYLE PROFILES (Tier 3+)
 * Tier 3: 1 profile
 * Tier 4: 3 profiles
 */
export async function getUserStyleProfileCount(userId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM user_writing_styles WHERE user_id = $1`,
    [userId]
  );
  return parseInt(result.rows[0]?.count || '0');
}

export async function checkStyleProfileLimit(userId: string, tier: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  // Tier 1-2: Not allowed
  if (tier < 3) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'Style Training is a Tier 3+ feature',
    };
  }

  const current = await getUserStyleProfileCount(userId);
  const limit = tier >= 4 ? 3 : 1; // Tier 3: 1 profile, Tier 4: 3 profiles
  
  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `Style profile limit reached (${limit} profile${limit > 1 ? 's' : ''} for Tier ${tier})`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
  };
}

/**
 * TEAM MEMBERS (Tier 4 only)
 * Tier 4: Up to 3 team members
 */
export async function getTeamMemberCount(userId: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM team_members 
     WHERE owner_user_id = $1 AND status IN ('invited', 'active')`,
    [userId]
  );
  return parseInt(result.rows[0]?.count || '0');
}

export async function checkTeamMemberLimit(userId: string, tier: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
}> {
  // Tier 1-3: Not allowed
  if (tier < 4) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'Team Collaboration is a Tier 4 feature',
    };
  }

  const current = await getTeamMemberCount(userId);
  const limit = 3; // Tier 4: Up to 3 team members
  
  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      reason: `Team member limit reached (${limit} members for Tier ${tier})`,
    };
  }

  return {
    allowed: true,
    current,
    limit,
  };
}

/**
 * Get all usage stats for a user
 */
export async function getUserUsageStats(userId: string, tier: number) {
  const monthYear = getCurrentMonthYear();
  
  const [scheduling, chat, api, styleProfiles, teamMembers] = await Promise.all([
    getMonthlySchedulingUsage(userId),
    getMonthlyChatUsage(userId),
    getMonthlyAPIUsage(userId),
    getUserStyleProfileCount(userId),
    getTeamMemberCount(userId),
  ]);

  return {
    month: monthYear,
    scheduling: {
      current: scheduling,
      limit: tier >= 4 ? 'unlimited' : tier === 3 ? 100 : tier === 2 ? 30 : 0,
      tier_required: 2,
    },
    chat: {
      current: chat,
      limit: tier >= 4 ? 'unlimited' : tier === 3 ? 200 : 0,
      tier_required: 3,
    },
    api: {
      current: api,
      limit: tier >= 4 ? 2500 : 0,
      tier_required: 4,
    },
    styleProfiles: {
      current: styleProfiles,
      limit: tier >= 4 ? 3 : tier === 3 ? 1 : 0,
      tier_required: 3,
    },
    teamMembers: {
      current: teamMembers,
      limit: tier >= 4 ? 3 : 0,
      tier_required: 4,
    },
  };
}

