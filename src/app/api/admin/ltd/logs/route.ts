/**
 * API Route: Admin Activity Logs
 * GET /api/admin/ltd/logs - Get all admin actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';

export const runtime = 'edge';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const actionType = searchParams.get('actionType');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    try {
      let whereClause = '';
      const values: any[] = [];
      let paramIndex = 1;

      if (actionType) {
        whereClause = `WHERE a.action_type = $${paramIndex}`;
        values.push(actionType);
        paramIndex++;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM admin_ltd_actions a ${whereClause}`,
        values
      );
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Get logs
      const result = await client.query(
        `SELECT 
          a.*,
          u.email as admin_email,
          u.name as admin_name
         FROM admin_ltd_actions a
         JOIN users u ON u.id = a.admin_user_id
         ${whereClause}
         ORDER BY a.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset]
      );

      return NextResponse.json({
        success: true,
        logs: result.rows,
        total,
        totalPages,
        page,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}




