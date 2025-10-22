import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/competitors
 * Get all competitors for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        c.*,
        (
          SELECT json_build_object(
            'total_posts', COUNT(*),
            'avg_likes', ROUND(AVG(likes_count)),
            'avg_comments', ROUND(AVG(comments_count)),
            'avg_engagement', ROUND(AVG(engagement_rate), 2)
          )
          FROM competitor_posts
          WHERE competitor_id = c.id
        ) as stats,
        (
          SELECT COUNT(*)
          FROM content_gaps
          WHERE competitor_id = c.id AND status = 'active'
        ) as content_gaps_count
      FROM competitors c
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    return NextResponse.json({
      success: true,
      competitors: result.rows,
    });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/competitors
 * Delete a competitor
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!competitorId || !userId) {
      return NextResponse.json(
        { error: 'Missing id or userId parameter' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const verifyQuery = 'SELECT id FROM competitors WHERE id = $1 AND user_id = $2';
    const verifyResult = await pool.query(verifyQuery, [competitorId, userId]);

    if (verifyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found or access denied' },
        { status: 404 }
      );
    }

    // Delete competitor (cascade will handle related records)
    const deleteQuery = 'DELETE FROM competitors WHERE id = $1 AND user_id = $2';
    await pool.query(deleteQuery, [competitorId, userId]);

    return NextResponse.json({
      success: true,
      message: 'Competitor deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


