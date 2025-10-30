/**
 * API Route: Revenue Tracking & Forecasting
 * GET /api/admin/ltd/revenue - Get revenue data and projections
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

export const runtime = 'edge';

const TIER_PRICES = {
  1: 59,
  2: 139,
  3: 249,
  4: 449
};

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
      // Total revenue by tier
      const revenueByTierResult = await client.query(`
        SELECT 
          tier,
          COUNT(*) as redemptions,
          SUM(CASE 
            WHEN tier = 1 THEN 59
            WHEN tier = 2 THEN 139
            WHEN tier = 3 THEN 249
            WHEN tier = 4 THEN 449
            ELSE 0
          END) as total_revenue
        FROM ltd_redemptions
        GROUP BY tier
        ORDER BY tier
      `);

      // Monthly revenue trend
      const monthlyRevenueResult = await client.query(`
        SELECT 
          DATE_TRUNC('month', redeemed_at) as month,
          tier,
          COUNT(*) as redemptions,
          SUM(CASE 
            WHEN tier = 1 THEN 59
            WHEN tier = 2 THEN 139
            WHEN tier = 3 THEN 249
            WHEN tier = 4 THEN 449
            ELSE 0
          END) as revenue
        FROM ltd_redemptions
        WHERE redeemed_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', redeemed_at), tier
        ORDER BY month DESC, tier
      `);

      // Total lifetime revenue
      const totalRevenueResult = await client.query(`
        SELECT 
          COUNT(*) as total_redemptions,
          SUM(CASE 
            WHEN tier = 1 THEN 59
            WHEN tier = 2 THEN 139
            WHEN tier = 3 THEN 249
            WHEN tier = 4 THEN 449
            ELSE 0
          END) as total_revenue
        FROM ltd_redemptions
      `);

      // Active user value (MRR equivalent for LTD)
      const activeUserValueResult = await client.query(`
        SELECT 
          COUNT(*) as active_ltd_users,
          SUM(monthly_credit_limit) as total_monthly_credits,
          AVG(monthly_credit_limit) as avg_credits_per_user,
          SUM(credits) as total_current_credits
        FROM users
        WHERE plan_type = 'ltd'
      `);

      // Code utilization
      const codeUtilizationResult = await client.query(`
        SELECT 
          COUNT(*) as total_codes,
          SUM(CASE WHEN current_redemptions > 0 THEN 1 ELSE 0 END) as redeemed_codes,
          SUM(CASE WHEN current_redemptions >= max_redemptions THEN 1 ELSE 0 END) as fully_redeemed,
          SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive_codes,
          SUM(max_redemptions - current_redemptions) as remaining_redemptions
        FROM ltd_codes
      `);

      // Stacking revenue (additional revenue from code stacking)
      const stackingRevenueResult = await client.query(`
        SELECT 
          SUM(stacked_codes - 1) as additional_codes,
          SUM((stacked_codes - 1) * CASE 
            WHEN ltd_tier = 1 THEN 59
            WHEN ltd_tier = 2 THEN 139
            WHEN ltd_tier = 3 THEN 249
            WHEN ltd_tier = 4 THEN 449
            ELSE 0
          END) as stacking_revenue
        FROM users
        WHERE plan_type = 'ltd' AND stacked_codes > 1
      `);

      // Calculate projections
      const avgMonthlyRevenue = monthlyRevenueResult.rows
        .slice(0, 3)
        .reduce((sum, row) => sum + parseFloat(row.revenue), 0) / 3;

      const projections = {
        next_month: Math.round(avgMonthlyRevenue),
        next_quarter: Math.round(avgMonthlyRevenue * 3),
        next_year: Math.round(avgMonthlyRevenue * 12),
        growth_rate: calculateGrowthRate(monthlyRevenueResult.rows)
      };

      // Potential revenue (unredeemed codes)
      const potentialRevenueResult = await client.query(`
        SELECT 
          SUM((max_redemptions - current_redemptions) * CASE 
            WHEN tier = 1 THEN 59
            WHEN tier = 2 THEN 139
            WHEN tier = 3 THEN 249
            WHEN tier = 4 THEN 449
            ELSE 0
          END) as potential_revenue
        FROM ltd_codes
        WHERE is_active = true AND current_redemptions < max_redemptions
      `);

      return NextResponse.json({
        overview: {
          total_revenue: parseFloat(totalRevenueResult.rows[0].total_revenue) || 0,
          total_redemptions: parseInt(totalRevenueResult.rows[0].total_redemptions) || 0,
          active_users: parseInt(activeUserValueResult.rows[0].active_ltd_users) || 0,
          avg_revenue_per_user: totalRevenueResult.rows[0].total_revenue / totalRevenueResult.rows[0].total_redemptions || 0,
          stacking_revenue: parseFloat(stackingRevenueResult.rows[0]?.stacking_revenue) || 0,
          potential_revenue: parseFloat(potentialRevenueResult.rows[0]?.potential_revenue) || 0
        },
        revenue_by_tier: revenueByTierResult.rows,
        monthly_trend: monthlyRevenueResult.rows,
        projections,
        code_utilization: codeUtilizationResult.rows[0],
        active_user_metrics: activeUserValueResult.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Revenue tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}

function calculateGrowthRate(monthlyData: any[]): number {
  if (monthlyData.length < 2) return 0;
  
  const current = parseFloat(monthlyData[0]?.revenue || 0);
  const previous = parseFloat(monthlyData[1]?.revenue || 0);
  
  if (previous === 0) return 0;
  
  return Math.round(((current - previous) / previous) * 100);
}




