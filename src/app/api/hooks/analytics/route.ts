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

    // Get user statistics
    const statsResult = await pool.query(
      `SELECT 
        platform,
        niche,
        total_generated,
        total_copied,
        avg_engagement_score,
        copy_rate
       FROM user_hook_stats
       WHERE user_id = $1
       ORDER BY total_generated DESC`,
      [userId]
    );

    // Get recent hooks
    const recentHooksResult = await pool.query(
      `SELECT 
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
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    // Get top performing hooks
    const topHooksResult = await pool.query(
      `SELECT 
        platform,
        niche,
        generated_hook,
        engagement_score,
        viral_potential,
        created_at
       FROM generated_hooks
       WHERE user_id = $1 AND engagement_score >= 85
       ORDER BY engagement_score DESC
       LIMIT 10`,
      [userId]
    );

    // Get platform distribution
    const platformDistResult = await pool.query(
      `SELECT 
        platform,
        COUNT(*) as count,
        AVG(engagement_score) as avg_score
       FROM generated_hooks
       WHERE user_id = $1
       GROUP BY platform
       ORDER BY count DESC`,
      [userId]
    );

    // Get category performance
    const categoryResult = await pool.query(
      `SELECT 
        category,
        COUNT(*) as count,
        AVG(engagement_score) as avg_score,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as copies
       FROM generated_hooks
       WHERE user_id = $1
       GROUP BY category
       ORDER BY avg_score DESC`,
      [userId]
    );

    // Calculate total stats
    const totalResult = await pool.query(
      `SELECT 
        COUNT(*) as total_hooks,
        COALESCE(SUM(CASE WHEN copied THEN 1 ELSE 0 END), 0) as total_copied,
        COALESCE(AVG(engagement_score), 0) as avg_engagement_score,
        COALESCE(MAX(engagement_score), 0) as max_score
       FROM generated_hooks
       WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      stats: statsResult.rows,
      recentHooks: recentHooksResult.rows,
      topHooks: topHooksResult.rows,
      platformDistribution: platformDistResult.rows,
      categoryPerformance: categoryResult.rows,
      totals: totalResult.rows[0] || {
        total_hooks: 0,
        total_copied: 0,
        avg_engagement_score: 0,
        max_score: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching hook analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}





