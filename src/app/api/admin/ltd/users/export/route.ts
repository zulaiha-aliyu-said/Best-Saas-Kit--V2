/**
 * API Route: Export LTD Users to CSV
 * GET /api/admin/ltd/users/export - Download all LTD users as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess, logAdminAction } from '@/lib/admin-auth';
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
      // Get all LTD users with their stats
      const result = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.ltd_tier,
          u.plan_type,
          u.credits,
          u.monthly_credit_limit,
          u.rollover_credits,
          u.stacked_codes,
          u.subscription_status,
          u.credit_reset_date,
          u.created_at,
          u.last_login,
          (
            SELECT COUNT(*)
            FROM credit_usage cu
            WHERE cu.user_id = u.id
          ) as total_operations,
          (
            SELECT COALESCE(SUM(credits_used), 0)
            FROM credit_usage cu
            WHERE cu.user_id = u.id
          ) as total_credits_used,
          (
            SELECT COUNT(*)
            FROM ltd_redemptions lr
            WHERE lr.user_id = u.id
          ) as total_redemptions
        FROM users u
        WHERE u.plan_type = 'ltd'
        ORDER BY u.created_at DESC
      `);

      const users = result.rows;

      // Generate CSV
      const headers = [
        'User ID',
        'Email',
        'Name',
        'Tier',
        'Credits',
        'Monthly Limit',
        'Rollover Credits',
        'Stacked Codes',
        'Status',
        'Reset Date',
        'Created At',
        'Last Login',
        'Total Operations',
        'Total Credits Used',
        'Total Redemptions',
      ];

      const csvRows = [
        headers.join(','),
        ...users.map((user) => [
          user.id,
          `"${user.email}"`,
          `"${user.name || ''}"`,
          user.ltd_tier,
          user.credits,
          user.monthly_credit_limit,
          user.rollover_credits || 0,
          user.stacked_codes,
          user.subscription_status,
          user.credit_reset_date ? new Date(user.credit_reset_date).toISOString() : '',
          new Date(user.created_at).toISOString(),
          user.last_login ? new Date(user.last_login).toISOString() : '',
          user.total_operations,
          user.total_credits_used,
          user.total_redemptions,
        ].join(','))
      ];

      const csv = csvRows.join('\n');

      // Log admin action
      if (authResult.admin?.id) {
        await logAdminAction(
          authResult.admin.id,
          'export_users',
          undefined,
          { count: users.length }
        );
      }

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ltd-users-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export users' },
      { status: 500 }
    );
  }
}
