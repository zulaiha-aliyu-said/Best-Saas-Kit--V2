import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import {
  fetchTwitterCompetitor,
  fetchInstagramCompetitor,
  calculateEngagementRate,
  estimatePostingFrequency,
} from '@/lib/rapidapi';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const runtime = 'edge';

/**
 * POST /api/competitors/[id]/refresh
 * Refresh competitor data from social media APIs
 */
export async function POST(
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

    // Check if last analyzed within 1 hour (rate limiting)
    const lastAnalyzed = new Date(competitor.last_analyzed_at);
    const now = new Date();
    const hoursSinceLastAnalysis = (now.getTime() - lastAnalyzed.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastAnalysis < 1) {
      return NextResponse.json(
        { 
          error: 'Rate limit: Please wait at least 1 hour between refreshes',
          next_refresh_available: new Date(lastAnalyzed.getTime() + 60 * 60 * 1000).toISOString(),
        },
        { status: 429 }
      );
    }

    let posts: any[] = [];
    let profileData: any;

    // Fetch fresh data based on platform
    if (competitor.platform === 'twitter') {
      const twitterData = await fetchTwitterCompetitor(competitor.platform_user_id);
      
      if (!twitterData || !twitterData.data || twitterData.data.length === 0) {
        return NextResponse.json(
          { error: 'Failed to refresh Twitter data' },
          { status: 500 }
        );
      }

      profileData = twitterData.data[0].author;
      posts = twitterData.data;
    } else if (competitor.platform === 'instagram') {
      const instagramData = await fetchInstagramCompetitor(competitor.username);
      
      if (!instagramData) {
        return NextResponse.json(
          { error: 'Failed to refresh Instagram data' },
          { status: 500 }
        );
      }

      profileData = instagramData;
      posts = instagramData.lastMedia?.media || [];
    }

    // Calculate new metrics
    const avgLikes = posts.reduce((sum, post) => sum + (post.likeCount || post.like || 0), 0) / posts.length;
    const avgComments = posts.reduce((sum, post) => sum + (post.commentCount || post.comment_count || 0), 0) / posts.length;
    const avgShares = posts.reduce((sum, post) => sum + (post.retweetCount || 0), 0) / posts.length;
    
    const followerCount = profileData.followerCount || profileData.followers;
    const engagementRate = calculateEngagementRate(avgLikes, avgComments, avgShares, followerCount);
    const postingFrequency = estimatePostingFrequency(posts);

    // Update competitor
    const updateQuery = `
      UPDATE competitors
      SET 
        followers_count = $1,
        following_count = $2,
        posts_count = $3,
        engagement_rate = $4,
        last_analyzed_at = NOW(),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const updateResult = await pool.query(updateQuery, [
      followerCount,
      profileData.followingCount || profileData.following,
      profileData.tweetCount || profileData.media_count,
      engagementRate,
      id,
    ]);

    // Add new stats entry
    const statsQuery = `
      INSERT INTO competitor_stats (
        competitor_id, stat_date, followers_count, following_count, posts_count,
        avg_likes, avg_comments, avg_shares, engagement_rate, posting_frequency
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (competitor_id, stat_date)
      DO UPDATE SET
        followers_count = EXCLUDED.followers_count,
        engagement_rate = EXCLUDED.engagement_rate,
        posting_frequency = EXCLUDED.posting_frequency;
    `;

    await pool.query(statsQuery, [
      id,
      followerCount,
      profileData.followingCount || profileData.following,
      profileData.tweetCount || profileData.media_count,
      Math.round(avgLikes),
      Math.round(avgComments),
      Math.round(avgShares),
      engagementRate,
      postingFrequency,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Competitor data refreshed successfully',
      competitor: updateResult.rows[0],
      stats: {
        total_posts: posts.length,
        avg_likes: Math.round(avgLikes),
        avg_comments: Math.round(avgComments),
        engagement_rate: engagementRate,
        posting_frequency: postingFrequency,
      },
    });
  } catch (error) {
    console.error('Error refreshing competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


