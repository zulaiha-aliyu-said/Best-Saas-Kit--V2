import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const niche = searchParams.get('niche');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        id,
        platform,
        niche,
        topic,
        generated_hook,
        engagement_score,
        category,
        viral_potential,
        copied,
        created_at
      FROM generated_hooks
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    let paramIndex = 2;

    if (platform) {
      query += ` AND platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }

    if (niche) {
      query += ` AND niche = $${paramIndex}`;
      params.push(niche);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM generated_hooks WHERE user_id = $1';
    const countParams: any[] = [userId];
    let countParamIndex = 2;

    if (platform) {
      countQuery += ` AND platform = $${countParamIndex}`;
      countParams.push(platform);
      countParamIndex++;
    }

    if (niche) {
      countQuery += ` AND niche = $${countParamIndex}`;
      countParams.push(niche);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      hooks: result.rows,
      total: totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching hook history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}





