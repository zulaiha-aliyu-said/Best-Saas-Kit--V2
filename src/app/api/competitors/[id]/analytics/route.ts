import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * GET /api/competitors/[id]/analytics
 * Get advanced analytics data formatted for charts and visualization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get all posts for analysis
    const postsQuery = `
      SELECT *
      FROM competitor_posts
      WHERE competitor_id = $1
      ORDER BY posted_at DESC;
    `;

    const postsResult = await pool.query(postsQuery, [id]);
    const posts = postsResult.rows;

    console.log(`[Analytics] Competitor ID: ${id}`);
    console.log(`[Analytics] Posts found: ${posts.length}`);

    if (posts.length === 0) {
      console.log('[Analytics] No posts found - returning null analytics');
      return NextResponse.json({
        success: true,
        message: 'No posts available for analysis',
        analytics: null,
      });
    }

    console.log(`[Analytics] Processing ${posts.length} posts for analytics...`);

    // 1. POSTING PATTERN BY DAY OF WEEK
    const postingPattern = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
      const dayPosts = posts.filter(post => {
        const date = new Date(post.posted_at);
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        return dayName === day;
      });

      const totalEngagement = dayPosts.reduce(
        (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
        0
      );

      return {
        day,
        posts: dayPosts.length,
        engagement: dayPosts.length > 0 ? Math.round(totalEngagement / dayPosts.length) : 0,
      };
    });

    // 2. CONTENT TYPE DISTRIBUTION
    const contentTypeCounts = posts.reduce((acc, post) => {
      const type = post.media_type || 'text';
      if (!acc[type]) {
        acc[type] = { count: 0, engagement: 0 };
      }
      acc[type].count++;
      acc[type].engagement += (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
      return acc;
    }, {} as Record<string, { count: number; engagement: number }>);

    const totalPosts = posts.length;
    const contentTypes = Object.entries(contentTypeCounts).map(([name, data]) => ({
      name: capitalizeFirst(name),
      value: Math.round((data.count / totalPosts) * 100),
      count: data.count,
      engagement: Math.round(data.engagement / data.count),
    }));

    // 3. ENGAGEMENT TREND (Last 4 weeks)
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekPosts = posts.filter(post => {
        const postDate = new Date(post.posted_at);
        return postDate >= weekStart && postDate < weekEnd;
      });

      const totalEngagement = weekPosts.reduce(
        (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
        0
      );

      weeks.push({
        week: `Week ${4 - i}`,
        engagement: weekPosts.length > 0 ? Math.round(totalEngagement / weekPosts.length) : 0,
        posts: weekPosts.length,
      });
    }

    // 4. BEST POSTING TIMES
    const timeSlots = [
      { slot: '6-9 AM', start: 6, end: 9 },
      { slot: '9-12 PM', start: 9, end: 12 },
      { slot: '12-3 PM', start: 12, end: 15 },
      { slot: '3-6 PM', start: 15, end: 18 },
      { slot: '6-9 PM', start: 18, end: 21 },
      { slot: '9-12 AM', start: 21, end: 24 },
    ];

    const bestTimes = timeSlots.map(({ slot, start, end }) => {
      const slotPosts = posts.filter(post => {
        const hour = new Date(post.posted_at).getHours();
        return hour >= start && hour < end;
      });

      const totalEngagement = slotPosts.reduce(
        (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
        0
      );

      return {
        time: slot,
        posts: slotPosts.length,
        engagement: slotPosts.length > 0 ? Math.round(totalEngagement / slotPosts.length) : 0,
      };
    });

    // 5. CALCULATE STATS
    const totalEngagement = posts.reduce(
      (sum, post) => sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0),
      0
    );

    const avgEngagement = Math.round(totalEngagement / posts.length);

    // Find peak day and time
    const peakDay = postingPattern.reduce((max, curr) => 
      curr.engagement > max.engagement ? curr : max
    , postingPattern[0]);

    const peakTime = bestTimes.reduce((max, curr) => 
      curr.engagement > max.engagement ? curr : max
    , bestTimes[0]);

    // Calculate trend percentage (compare last week to previous week)
    const lastWeekEng = weeks[3]?.engagement || 0;
    const prevWeekEng = weeks[2]?.engagement || 0;
    const trendPercentage = prevWeekEng > 0 
      ? Math.round(((lastWeekEng - prevWeekEng) / prevWeekEng) * 100)
      : 0;

    // 6. TOP PERFORMING POSTS
    const topPosts = posts
      .map(post => {
        const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
        return {
          id: post.id,
          content: post.content || '',
          type: post.media_type || 'text',
          metrics: {
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            saves: 0, // Not available from current API
            totalEngagement: engagement,
          },
          posted: formatRelativeTime(new Date(post.posted_at)),
          url: post.url,
          thumbnail: getContentEmoji(post.media_type),
          performanceScore: calculatePerformanceScore(engagement, avgEngagement),
        };
      })
      .sort((a, b) => b.metrics.totalEngagement - a.metrics.totalEngagement)
      .slice(0, 5);

    // 7. CONTENT GAPS
    const gapsQuery = `
      SELECT *
      FROM content_gaps
      WHERE competitor_id = $1 AND status = 'active'
      ORDER BY potential_score DESC
      LIMIT 5;
    `;

    const gapsResult = await pool.query(gapsQuery, [id]);
    const contentGaps = gapsResult.rows;

    // Return formatted analytics
    return NextResponse.json({
      success: true,
      analytics: {
        postingPattern,
        contentTypes,
        engagementTrend: weeks,
        bestTimes,
        stats: {
          avgEngagement,
          trendPercentage,
          totalPosts: posts.length,
          peakDay: peakDay.day,
          peakTime: peakTime.time,
        },
        topPosts,
        contentGaps,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getContentEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    photo: '📸',
    video: '🎥',
    carousel: '📱',
    text: '📝',
    link: '🔗',
  };
  return emojiMap[type] || '📄';
}

function calculatePerformanceScore(engagement: number, avgEngagement: number): number {
  if (avgEngagement === 0) return 0;
  const ratio = engagement / avgEngagement;
  return Math.min(100, Math.round(ratio * 50 + 50));
}

