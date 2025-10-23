/**
 * API Route: User History
 * GET /api/admin/ltd/users/[id]/history - Get user's credit usage history
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const client = await pool.connect();
    try {
      // Get credit usage logs
      const usageResult = await client.query(
        `SELECT * FROM credit_usage_log
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [params.id, limit]
      );

      // Get redemption history
      const redemptionResult = await client.query(
        `SELECT lr.*, lc.code, lc.tier
         FROM ltd_redemptions lr
         JOIN ltd_codes lc ON lr.code_id = lc.id
         WHERE lr.user_id = $1
         ORDER BY lr.redeemed_at DESC`,
        [params.id]
      );

      // Get admin actions affecting this user
      const actionsResult = await client.query(
        `SELECT a.*, u.email as admin_email
         FROM admin_ltd_actions a
         JOIN users u ON u.id = a.admin_user_id
         WHERE a.target_id = $1
         ORDER BY a.created_at DESC
         LIMIT 20`,
        [params.id]
      );

      return NextResponse.json({
        success: true,
        creditUsage: usageResult.rows,
        redemptions: redemptionResult.rows,
        adminActions: actionsResult.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

