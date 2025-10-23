/**
 * API Route: LTD Analytics
 * GET /api/admin/ltd/analytics - Get comprehensive LTD analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const client = await pool.connect();
    try {
      // Revenue by tier - with better error handling
      let revenueResult;
      try {
        revenueResult = await client.query(`
          SELECT
            tier,
            COUNT(*) as code_count,
            SUM(CASE 
              WHEN tier = 1 THEN 59
              WHEN tier = 2 THEN 139
              WHEN tier = 3 THEN 249
              WHEN tier = 4 THEN 449
              ELSE 0
            END) as revenue
          FROM ltd_codes
          WHERE current_redemptions > 0
          GROUP BY tier
          ORDER BY tier
        `);
      } catch (err) {
        console.error('Revenue query error:', err);
        revenueResult = { rows: [] };
      }

      // User growth over time (last 12 months)
      let userGrowthResult;
      try {
        userGrowthResult = await client.query(`
          SELECT
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as new_users,
            COALESCE(ltd_tier, 1) as ltd_tier
          FROM users
          WHERE plan_type = 'ltd'
            AND created_at >= NOW() - INTERVAL '12 months'
          GROUP BY DATE_TRUNC('month', created_at), ltd_tier
          ORDER BY month DESC
        `);
      } catch (err) {
        console.error('User growth query error:', err);
        userGrowthResult = { rows: [] };
      }

      // Redemption trends (last 30 days)
      let redemptionTrendResult;
      try {
        redemptionTrendResult = await client.query(`
          SELECT
            DATE(redeemed_at) as date,
            COUNT(*) as redemptions
          FROM ltd_redemptions
          WHERE redeemed_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(redeemed_at)
          ORDER BY date
        `);
      } catch (err) {
        console.error('Redemption trend query error:', err);
        redemptionTrendResult = { rows: [] };
      }

      // Credit usage by action type
      let creditUsageResult;
      try {
        creditUsageResult = await client.query(`
          SELECT
            action_type,
            COUNT(*) as usage_count,
            SUM(credits_used) as total_credits
          FROM credit_usage_log
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY action_type
          ORDER BY total_credits DESC
        `);
      } catch (err) {
        console.error('Credit usage query error:', err);
        creditUsageResult = { rows: [] };
      }

      // Top users by credit usage
      let topUsersResult;
      try {
        topUsersResult = await client.query(`
          SELECT
            u.id,
            u.email,
            u.name,
            COALESCE(u.ltd_tier, 1) as ltd_tier,
            COALESCE(SUM(cul.credits_used), 0) as total_credits_used
          FROM users u
          LEFT JOIN credit_usage_log cul ON u.id = cul.user_id AND cul.created_at >= NOW() - INTERVAL '30 days'
          WHERE u.plan_type = 'ltd'
          GROUP BY u.id, u.email, u.name, u.ltd_tier
          HAVING SUM(cul.credits_used) > 0
          ORDER BY total_credits_used DESC
          LIMIT 10
        `);
      } catch (err) {
        console.error('Top users query error:', err);
        topUsersResult = { rows: [] };
      }

      // Overall stats
      let statsResult;
      try {
        statsResult = await client.query(`
          SELECT
            (SELECT COUNT(*) FROM users WHERE plan_type = 'ltd') as total_users,
            (SELECT COUNT(*) FROM ltd_codes) as total_codes,
            (SELECT COUNT(*) FROM ltd_codes WHERE current_redemptions > 0) as redeemed_codes,
            (SELECT COALESCE(SUM(credits), 0) FROM users WHERE plan_type = 'ltd') as total_active_credits,
            (SELECT COUNT(*) FROM ltd_redemptions) as total_redemptions
        `);
      } catch (err) {
        console.error('Stats query error:', err);
        statsResult = { 
          rows: [{
            total_users: '0',
            total_codes: '0',
            redeemed_codes: '0',
            total_active_credits: '0',
            total_redemptions: '0'
          }]
        };
      }

      // Tier distribution
      let tierDistResult;
      try {
        tierDistResult = await client.query(`
          SELECT
            COALESCE(ltd_tier, 1) as ltd_tier,
            COUNT(*) as user_count
          FROM users
          WHERE plan_type = 'ltd'
          GROUP BY ltd_tier
          ORDER BY ltd_tier
        `);
      } catch (err) {
        console.error('Tier distribution query error:', err);
        tierDistResult = { rows: [] };
      }

      return NextResponse.json({
        success: true,
        revenue: revenueResult.rows || [],
        userGrowth: userGrowthResult.rows || [],
        redemptionTrend: redemptionTrendResult.rows || [],
        creditUsage: creditUsageResult.rows || [],
        topUsers: topUsersResult.rows || [],
        stats: statsResult.rows[0] || {
          total_users: '0',
          total_codes: '0',
          redeemed_codes: '0',
          total_active_credits: '0',
          total_redemptions: '0'
        },
        tierDistribution: tierDistResult.rows || [],
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

