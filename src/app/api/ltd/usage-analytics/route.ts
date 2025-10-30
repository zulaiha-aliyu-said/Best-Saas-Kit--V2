/**
 * API Route: Credit Usage Analytics
 * GET /api/ltd/usage-analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCreditUsageAnalytics, getUserPlan } from '@/lib/feature-gate';
import { pool } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Get user plan
    const plan = await getUserPlan(userId);
    
    if (!plan) {
      return NextResponse.json(
        { error: 'User plan not found' },
        { status: 404 }
      );
    }
    
    // Get usage analytics
    const usageByAction = await getCreditUsageAnalytics(userId, days);
    
    // Get daily usage trend
    const client = await pool.connect();
    try {
      const trendQuery = `
        SELECT 
          DATE(created_at) as date,
          SUM(credits_used) as credits_used,
          COUNT(*) as action_count
        FROM credit_usage_log
        WHERE user_id = $1 
          AND created_at >= NOW() - INTERVAL '${days} days'
          AND credits_used > 0
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      const trendResult = await client.query(trendQuery, [userId]);
      
      // Get total stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total_actions,
          SUM(credits_used) as total_credits_used,
          MIN(created_at) as first_action,
          MAX(created_at) as last_action
        FROM credit_usage_log
        WHERE user_id = $1 
          AND created_at >= NOW() - INTERVAL '${days} days'
          AND credits_used > 0
      `;
      
      const statsResult = await client.query(statsQuery, [userId]);
      
      return NextResponse.json({
        plan: {
          type: plan.plan_type,
          tier: plan.ltd_tier,
          current_credits: plan.credits,
          monthly_limit: plan.monthly_credit_limit,
          rollover: plan.rollover_credits,
        },
        usage_by_action: usageByAction,
        daily_trend: trendResult.rows,
        summary: statsResult.rows[0],
        period_days: days,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting usage analytics:', error);
    return NextResponse.json(
      { error: 'Failed to get usage analytics' },
      { status: 500 }
    );
  }
}
