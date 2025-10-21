import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/database';
import { isAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30'; // days

    // Overall statistics
    const overallStatsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_hooks_generated,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as total_hooks_copied,
        AVG(engagement_score) as avg_engagement_score,
        ROUND((SUM(CASE WHEN copied THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) as overall_copy_rate
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'`
    );

    // Platform performance
    const platformStatsResult = await pool.query(
      `SELECT 
        platform,
        COUNT(*) as hooks_generated,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as hooks_copied,
        AVG(engagement_score) as avg_engagement_score,
        COUNT(DISTINCT user_id) as unique_users,
        ROUND((SUM(CASE WHEN copied THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) as copy_rate
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'
       GROUP BY platform
       ORDER BY hooks_generated DESC`
    );

    // Niche performance
    const nicheStatsResult = await pool.query(
      `SELECT 
        platform,
        niche,
        COUNT(*) as hooks_generated,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as hooks_copied,
        AVG(engagement_score) as avg_engagement_score,
        COUNT(DISTINCT user_id) as unique_users
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'
       GROUP BY platform, niche
       ORDER BY hooks_generated DESC
       LIMIT 20`
    );

    // Category performance
    const categoryStatsResult = await pool.query(
      `SELECT 
        category,
        COUNT(*) as hooks_generated,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as hooks_copied,
        AVG(engagement_score) as avg_engagement_score,
        ROUND((SUM(CASE WHEN copied THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) as copy_rate
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'
       GROUP BY category
       ORDER BY avg_engagement_score DESC`
    );

    // Daily trend
    const dailyTrendResult = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as hooks_generated,
        SUM(CASE WHEN copied THEN 1 ELSE 0 END) as hooks_copied,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(engagement_score) as avg_engagement_score
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Top performing hooks
    const topHooksResult = await pool.query(
      `SELECT 
        generated_hook,
        engagement_score,
        platform,
        niche,
        category,
        viral_potential,
        topic,
        created_at
       FROM generated_hooks
       WHERE created_at >= NOW() - INTERVAL '${timeframe} days'
       ORDER BY engagement_score DESC
       LIMIT 10`
    );

    // Most active users
    const activeUsersResult = await pool.query(
      `SELECT 
        u.email,
        u.name,
        COUNT(gh.id) as hooks_generated,
        SUM(CASE WHEN gh.copied THEN 1 ELSE 0 END) as hooks_copied,
        AVG(gh.engagement_score) as avg_engagement_score
       FROM users u
       JOIN generated_hooks gh ON u.id = gh.user_id
       WHERE gh.created_at >= NOW() - INTERVAL '${timeframe} days'
       GROUP BY u.id, u.email, u.name
       ORDER BY hooks_generated DESC
       LIMIT 10`
    );

    // Pattern usage
    const patternUsageResult = await pool.query(
      `SELECT 
        hp.pattern,
        hp.platform,
        hp.niche,
        hp.category,
        COUNT(gh.id) as usage_count,
        AVG(gh.engagement_score) as avg_engagement_score
       FROM hook_patterns hp
       LEFT JOIN generated_hooks gh ON hp.id = gh.pattern_id
       WHERE gh.created_at >= NOW() - INTERVAL '${timeframe} days' OR gh.created_at IS NULL
       GROUP BY hp.id, hp.pattern, hp.platform, hp.niche, hp.category
       ORDER BY usage_count DESC
       LIMIT 20`
    );

    return NextResponse.json({
      overallStats: overallStatsResult.rows[0],
      platformStats: platformStatsResult.rows,
      nicheStats: nicheStatsResult.rows,
      categoryStats: categoryStatsResult.rows,
      dailyTrend: dailyTrendResult.rows,
      topHooks: topHooksResult.rows,
      activeUsers: activeUsersResult.rows,
      patternUsage: patternUsageResult.rows,
      timeframe: parseInt(timeframe),
    });
  } catch (error) {
    console.error('Error fetching admin hooks analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}





