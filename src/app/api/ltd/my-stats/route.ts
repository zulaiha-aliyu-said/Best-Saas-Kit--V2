/**
 * API Route: Get user's LTD statistics
 * GET /api/ltd/my-stats - Get usage stats, history, and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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
    const client = await pool.connect();
    
    try {
      // Get user data
      const userResult = await client.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0 || userResult.rows[0].plan_type !== 'ltd') {
        return NextResponse.json(
          { error: 'No LTD plan found' },
          { status: 404 }
        );
      }

      const user = userResult.rows[0];

      // Get credit usage history (last 30 days)
      const creditHistory = await client.query(
        `SELECT 
          DATE(created_at) as date,
          SUM(credits_used) as credits_used,
          COUNT(*) as operations
         FROM credit_usage
         WHERE user_id = $1 
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [userId]
      );

      // Get action breakdown
      const actionBreakdown = await client.query(
        `SELECT 
          action_type,
          COUNT(*) as count,
          SUM(credits_used) as total_credits
         FROM credit_usage
         WHERE user_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '30 days'
         GROUP BY action_type
         ORDER BY total_credits DESC`,
        [userId]
      );

      // Get recent activity
      const recentActivity = await client.query(
        `SELECT 
          action_type,
          credits_used,
          created_at,
          metadata
         FROM credit_usage
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      );

      // Get all-time stats
      const totalStats = await client.query(
        `SELECT 
          COUNT(*) as total_operations,
          SUM(credits_used) as total_credits_used,
          COUNT(DISTINCT DATE(created_at)) as active_days
         FROM credit_usage
         WHERE user_id = $1`,
        [userId]
      );

      // Get this month's stats
      const monthStats = await client.query(
        `SELECT 
          COUNT(*) as operations_this_month,
          SUM(credits_used) as credits_this_month
         FROM credit_usage
         WHERE user_id = $1
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      );

      // Get email stats
      const emailStats = await client.query(
        `SELECT 
          COUNT(*) as total_emails,
          COUNT(*) FILTER (WHERE opened = TRUE) as emails_opened
         FROM email_tracking
         WHERE user_id = $1`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        data: {
          user: {
            ltd_tier: user.ltd_tier,
            credits: user.credits,
            monthly_credit_limit: user.monthly_credit_limit,
            stacked_codes: user.stacked_codes,
            credit_reset_date: user.credit_reset_date,
          },
          creditHistory: creditHistory.rows,
          actionBreakdown: actionBreakdown.rows,
          recentActivity: recentActivity.rows,
          stats: {
            ...totalStats.rows[0],
            ...monthStats.rows[0],
            ...emailStats.rows[0],
            credits_remaining: user.credits,
            credit_percentage: ((user.credits / user.monthly_credit_limit) * 100).toFixed(1),
          },
        },
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error fetching LTD stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
