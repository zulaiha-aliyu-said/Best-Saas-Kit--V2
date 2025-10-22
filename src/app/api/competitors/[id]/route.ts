import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/competitors/[id]
 * Get full competitor details including posts and content gaps
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get competitor details
    const competitorQuery = `
      SELECT *
      FROM competitors
      WHERE id = $1 AND user_id = $2;
    `;

    const competitorResult = await pool.query(competitorQuery, [id, userId]);

    if (competitorResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    const competitor = competitorResult.rows[0];

    // Get recent stats (last 30 days)
    const statsQuery = `
      SELECT *
      FROM competitor_stats
      WHERE competitor_id = $1
      ORDER BY stat_date DESC
      LIMIT 30;
    `;

    const statsResult = await pool.query(statsQuery, [id]);

    // Get recent posts
    const postsQuery = `
      SELECT *
      FROM competitor_posts
      WHERE competitor_id = $1
      ORDER BY posted_at DESC
      LIMIT 50;
    `;

    const postsResult = await pool.query(postsQuery, [id]);

    // Get content gaps
    const gapsQuery = `
      SELECT *
      FROM content_gaps
      WHERE competitor_id = $1 AND status = 'active'
      ORDER BY potential_score DESC;
    `;

    const gapsResult = await pool.query(gapsQuery, [id]);

    // Calculate aggregated metrics
    const posts = postsResult.rows;
    const totalEngagement = posts.reduce(
      (sum, post) => sum + post.likes_count + post.comments_count + post.shares_count,
      0
    );

    const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0;

    // Group posts by content type
    const contentBreakdown = posts.reduce((acc, post) => {
      const type = post.media_type || 'text';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get posting patterns (posts per day of week)
    const postingPatterns = posts.reduce((acc, post) => {
      const date = new Date(post.posted_at);
      const dayOfWeek = date.getDay();
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top performing posts
    const topPosts = posts
      .sort((a, b) => {
        const aEngagement = a.likes_count + a.comments_count + a.shares_count;
        const bEngagement = b.likes_count + b.comments_count + b.shares_count;
        return bEngagement - aEngagement;
      })
      .slice(0, 10);

    // Format response
    return NextResponse.json({
      success: true,
      competitor,
      analytics: {
        overview: {
          totalPosts: posts.length,
          totalEngagement,
          avgEngagement: Math.round(avgEngagement),
          engagementRate: competitor.engagement_rate,
          postingFrequency: statsResult.rows[0]?.posting_frequency || 0,
        },
        contentBreakdown,
        postingPatterns,
        recentStats: statsResult.rows,
      },
      posts: postsResult.rows,
      topPosts,
      contentGaps: gapsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching competitor details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/competitors/[id]
 * Delete a specific competitor
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const verifyQuery = 'SELECT id FROM competitors WHERE id = $1 AND user_id = $2';
    const verifyResult = await pool.query(verifyQuery, [id, userId]);

    if (verifyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found or access denied' },
        { status: 404 }
      );
    }

    // Delete competitor (cascade will handle related records)
    const deleteQuery = 'DELETE FROM competitors WHERE id = $1';
    await pool.query(deleteQuery, [id]);

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


