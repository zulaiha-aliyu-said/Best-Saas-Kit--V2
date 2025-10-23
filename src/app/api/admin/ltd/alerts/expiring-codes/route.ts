/**
 * API Route: Expiring Codes Alert
 * GET /api/admin/ltd/alerts/expiring-codes - Get codes expiring soon
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

    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('days') || '30');

    const client = await pool.connect();
    
    try {
      // Get codes expiring within specified days
      const expiringCodesResult = await client.query(
        `SELECT 
          c.*,
          (c.expires_at - CURRENT_TIMESTAMP) as time_until_expiry,
          c.max_redemptions - c.current_redemptions as remaining_redemptions
         FROM ltd_codes c
         WHERE c.expires_at IS NOT NULL
           AND c.is_active = true
           AND c.expires_at > CURRENT_TIMESTAMP
           AND c.expires_at <= CURRENT_TIMESTAMP + INTERVAL '1 day' * $1
           AND c.current_redemptions < c.max_redemptions
         ORDER BY c.expires_at ASC`,
        [daysAhead]
      );

      // Get already expired but still active codes
      const expiredCodesResult = await client.query(
        `SELECT 
          c.*,
          c.max_redemptions - c.current_redemptions as remaining_redemptions
         FROM ltd_codes c
         WHERE c.expires_at IS NOT NULL
           AND c.expires_at <= CURRENT_TIMESTAMP
           AND c.is_active = true
         ORDER BY c.expires_at DESC
         LIMIT 50`
      );

      // Get codes close to redemption limit
      const nearLimitCodesResult = await client.query(
        `SELECT 
          c.*,
          c.max_redemptions - c.current_redemptions as remaining_redemptions,
          ROUND((c.current_redemptions::DECIMAL / c.max_redemptions) * 100, 2) as usage_percentage
         FROM ltd_codes c
         WHERE c.is_active = true
           AND c.max_redemptions > 1
           AND c.current_redemptions >= (c.max_redemptions * 0.8)
           AND c.current_redemptions < c.max_redemptions
         ORDER BY usage_percentage DESC
         LIMIT 50`
      );

      // Calculate totals
      const stats = {
        expiring_soon: expiringCodesResult.rows.length,
        already_expired: expiredCodesResult.rows.length,
        near_limit: nearLimitCodesResult.rows.length,
        total_value_at_risk: expiringCodesResult.rows.reduce((sum, code) => {
          const tierConfigs = {
            1: 59,
            2: 139,
            3: 249,
            4: 449
          };
          const value = tierConfigs[code.tier as keyof typeof tierConfigs] || 0;
          return sum + (value * (code.max_redemptions - code.current_redemptions));
        }, 0)
      };

      return NextResponse.json({
        stats,
        expiring_soon: expiringCodesResult.rows,
        already_expired: expiredCodesResult.rows,
        near_limit: nearLimitCodesResult.rows
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Alerts error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}


