/**
 * API Route: Bulk Code Operations
 * POST /api/admin/ltd/codes/bulk - Perform bulk operations on codes
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { pool } from '@/lib/database';
import { logAdminAction } from '@/lib/ltd-admin';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { operation, batch_id, code_ids } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      let result;
      
      switch (operation) {
        case 'activate':
          if (batch_id) {
            result = await client.query(
              'UPDATE ltd_codes SET is_active = true WHERE batch_id = $1 RETURNING *',
              [batch_id]
            );
          } else if (code_ids && code_ids.length > 0) {
            result = await client.query(
              'UPDATE ltd_codes SET is_active = true WHERE id = ANY($1) RETURNING *',
              [code_ids]
            );
          }
          break;

        case 'deactivate':
          if (batch_id) {
            result = await client.query(
              'UPDATE ltd_codes SET is_active = false WHERE batch_id = $1 RETURNING *',
              [batch_id]
            );
          } else if (code_ids && code_ids.length > 0) {
            result = await client.query(
              'UPDATE ltd_codes SET is_active = false WHERE id = ANY($1) RETURNING *',
              [code_ids]
            );
          }
          break;

        case 'delete_unredeemed':
          if (batch_id) {
            result = await client.query(
              'DELETE FROM ltd_codes WHERE batch_id = $1 AND current_redemptions = 0 RETURNING *',
              [batch_id]
            );
          } else if (code_ids && code_ids.length > 0) {
            result = await client.query(
              'DELETE FROM ltd_codes WHERE id = ANY($1) AND current_redemptions = 0 RETURNING *',
              [code_ids]
            );
          }
          break;

        default:
          return NextResponse.json(
            { error: 'Invalid operation' },
            { status: 400 }
          );
      }

      if (!result) {
        return NextResponse.json(
          { error: 'No target specified (batch_id or code_ids required)' },
          { status: 400 }
        );
      }

      // Log the bulk action
      await logAdminAction(
        authResult.user!.id!,
        `bulk_${operation}`,
        batch_id || 'multiple_codes',
        {
          operation,
          batch_id,
          code_ids,
          affected_count: result.rowCount,
        }
      );

      return NextResponse.json({
        success: true,
        affected_count: result.rowCount,
        codes: result.rows,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}





