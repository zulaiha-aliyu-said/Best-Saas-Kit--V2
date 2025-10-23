import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/competitors
 * Get all competitors for a user
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('[Competitors API] Request received for userId:', userId);

    if (!userId) {
      console.error('[Competitors API] Missing userId parameter');
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error('[Competitors API] DATABASE_URL not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
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

    console.log('[Competitors API] Executing query for userId:', userId);
    
    const result = await pool.query(query, [userId]);
    
    const duration = Date.now() - startTime;
    console.log(`[Competitors API] Query successful - Found ${result.rows.length} competitors in ${duration}ms`);

    return NextResponse.json({
      success: true,
      competitors: result.rows,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Competitors API] Error after', duration, 'ms:', error);
    console.error('[Competitors API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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


