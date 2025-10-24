import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import pool from '@/lib/db';
import { isAdminEmail } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = `
      SELECT 
        f.*,
        u.name as user_name,
        u.email as user_email
      FROM user_feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (status !== 'all') {
      paramCount++;
      query += ` AND f.status = $${paramCount}`;
      params.push(status);
    }

    if (category !== 'all') {
      paramCount++;
      query += ` AND f.category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM user_feedback WHERE 1=1';
    const countParams: any[] = [];
    let countParamCount = 0;

    if (status !== 'all') {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (category !== 'all') {
      countParamCount++;
      countQuery += ` AND category = $${countParamCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Get summary stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_feedback,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'in_review') as in_review_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_rating,
        COUNT(*) FILTER (WHERE category = 'bug') as bugs,
        COUNT(*) FILTER (WHERE category = 'feature') as features,
        COUNT(*) FILTER (WHERE category = 'improvement') as improvements
      FROM user_feedback
    `);

    return NextResponse.json({
      success: true,
      feedback: result.rows,
      total,
      stats: statsResult.rows[0],
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}



