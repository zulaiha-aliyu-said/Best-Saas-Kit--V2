import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';
import {
  fetchTwitterCompetitor,
  fetchInstagramCompetitor,
  calculateEngagementRate,
  estimatePostingFrequency,
  extractTopics,
  detectContentFormat,
  getTopPosts,
} from '@/lib/rapidapi';
import { competitorCache } from '@/lib/competitor-cache';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * POST /api/competitors/analyze
 * Analyze a competitor from Twitter or Instagram
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, identifier, userId } = body;

    if (!platform || !identifier || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, identifier, userId' },
        { status: 400 }
      );
    }

    if (!['twitter', 'instagram'].includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: 'Platform must be either "twitter" or "instagram"' },
        { status: 400 }
      );
    }

    let competitorData: any;
    let posts: any[] = [];
    let profileData: any;

    // Check cache first (7-day TTL)
    const cacheKey = `${platform}:${identifier}`;
    const cachedData = competitorCache.get(cacheKey);

    if (cachedData) {
      console.log(`Using cached data for ${cacheKey}`);
      return NextResponse.json(cachedData);
    }

    // Fetch data based on platform
    if (platform.toLowerCase() === 'twitter') {
      console.log('🐦 Analyzing Twitter competitor:', identifier);
      const twitterData = await fetchTwitterCompetitor(identifier);
      
      console.log('📦 Twitter API returned:', twitterData ? 'DATA' : 'NULL');
      
      if (!twitterData) {
        return NextResponse.json(
          { error: 'Failed to fetch data from Twitter API. Please check your RapidAPI key and subscription.' },
          { status: 500 }
        );
      }
      
      if (!twitterData.data || twitterData.data.length === 0) {
        return NextResponse.json(
          { error: 'Twitter user not found or has no tweets. Please verify the User ID is correct.' },
          { status: 404 }
        );
      }

      // Extract profile from first tweet's author
      profileData = twitterData.data[0].author;
      posts = twitterData.data;

      competitorData = {
        name: profileData.name,
        username: profileData.username,
        avatar_url: profileData.avatar,
        bio: profileData.bio || '',
        followers_count: profileData.followerCount,
        following_count: profileData.followingCount,
        posts_count: profileData.tweetCount,
        platform_user_id: profileData.id,
        is_verified: profileData.verified || profileData.isBlueVerified,
      };
    } else {
      // Instagram
      const instagramData = await fetchInstagramCompetitor(identifier);
      
      if (!instagramData) {
        return NextResponse.json(
          { error: 'Instagram user not found or API error' },
          { status: 404 }
        );
      }

      profileData = instagramData;
      posts = instagramData.lastMedia?.media || [];

      competitorData = {
        name: instagramData.full_name,
        username: instagramData.username,
        avatar_url: instagramData.profile_pic_url,
        bio: instagramData.bio || '',
        followers_count: instagramData.followers,
        following_count: instagramData.following,
        posts_count: instagramData.media_count,
        platform_user_id: instagramData.id,
        is_verified: instagramData.is_verified,
      };
    }

    // Calculate engagement rate
    const avgLikes = posts.reduce((sum, post) => sum + (post.likeCount || post.like || 0), 0) / posts.length;
    const avgComments = posts.reduce((sum, post) => sum + (post.commentCount || post.comment_count || 0), 0) / posts.length;
    const avgShares = posts.reduce((sum, post) => sum + (post.retweetCount || 0), 0) / posts.length;
    
    const engagementRate = calculateEngagementRate(
      avgLikes,
      avgComments,
      avgShares,
      competitorData.followers_count
    );

    // Store or update competitor in database
    const competitorQuery = `
      INSERT INTO competitors (
        user_id, name, username, platform, avatar_url, bio,
        followers_count, following_count, posts_count, engagement_rate,
        platform_user_id, is_verified, last_analyzed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (user_id, platform, username)
      DO UPDATE SET
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        bio = EXCLUDED.bio,
        followers_count = EXCLUDED.followers_count,
        following_count = EXCLUDED.following_count,
        posts_count = EXCLUDED.posts_count,
        engagement_rate = EXCLUDED.engagement_rate,
        is_verified = EXCLUDED.is_verified,
        last_analyzed_at = NOW(),
        updated_at = NOW()
      RETURNING id;
    `;

    const competitorResult = await pool.query(competitorQuery, [
      userId,
      competitorData.name,
      competitorData.username,
      platform.toLowerCase(),
      competitorData.avatar_url,
      competitorData.bio,
      competitorData.followers_count,
      competitorData.following_count,
      competitorData.posts_count,
      engagementRate,
      competitorData.platform_user_id,
      competitorData.is_verified,
    ]);

    const competitorId = competitorResult.rows[0].id;

    // Store competitor stats
    const statsQuery = `
      INSERT INTO competitor_stats (
        competitor_id, stat_date, followers_count, following_count, posts_count,
        avg_likes, avg_comments, avg_shares, engagement_rate, posting_frequency
      ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (competitor_id, stat_date)
      DO UPDATE SET
        followers_count = EXCLUDED.followers_count,
        following_count = EXCLUDED.following_count,
        posts_count = EXCLUDED.posts_count,
        avg_likes = EXCLUDED.avg_likes,
        avg_comments = EXCLUDED.avg_comments,
        avg_shares = EXCLUDED.avg_shares,
        engagement_rate = EXCLUDED.engagement_rate,
        posting_frequency = EXCLUDED.posting_frequency;
    `;

    const postingFrequency = estimatePostingFrequency(posts);

    await pool.query(statsQuery, [
      competitorId,
      competitorData.followers_count,
      competitorData.following_count,
      competitorData.posts_count,
      Math.round(avgLikes),
      Math.round(avgComments),
      Math.round(avgShares),
      engagementRate,
      postingFrequency,
    ]);

    // Store posts
    for (const post of posts) {
      const postQuery = `
        INSERT INTO competitor_posts (
          competitor_id, platform_post_id, content, media_urls, media_type,
          likes_count, comments_count, shares_count, views_count,
          engagement_rate, post_url, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (competitor_id, platform_post_id)
        DO UPDATE SET
          likes_count = EXCLUDED.likes_count,
          comments_count = EXCLUDED.comments_count,
          shares_count = EXCLUDED.shares_count,
          views_count = EXCLUDED.views_count,
          engagement_rate = EXCLUDED.engagement_rate;
      `;

      const mediaUrls = post.media?.map((m: any) => m.url || m.display_url) || [];
      const mediaType = detectContentFormat(post);
      const postUrl = post.link_to_post || `https://twitter.com/${competitorData.username}/status/${post.id}`;
      const postedAt = post.timestamp ? new Date(post.timestamp) : new Date(post.createdAt);

      const postEngagement = calculateEngagementRate(
        post.likeCount || post.like || 0,
        post.commentCount || post.comment_count || 0,
        post.retweetCount || 0,
        competitorData.followers_count
      );

      await pool.query(postQuery, [
        competitorId,
        post.id,
        post.text || post.caption || '',
        mediaUrls,
        mediaType,
        post.likeCount || post.like || 0,
        post.commentCount || post.comment_count || 0,
        post.retweetCount || 0,
        post.viewCount || 0,
        postEngagement,
        postUrl,
        postedAt,
      ]);
    }

    // Generate content gaps (AI-powered analysis)
    const topics = extractTopics(posts);
    const topPosts = getTopPosts(posts, 5);

    // Analyze content gaps
    const gaps = await analyzeContentGaps(competitorId, userId, posts, topics, topPosts);

    // Store content gaps
    for (const gap of gaps) {
      const gapQuery = `
        INSERT INTO content_gaps (
          user_id, competitor_id, gap_type, title, description,
          topics, suggested_content, potential_score, avg_engagement, post_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (user_id, competitor_id, gap_type)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          topics = EXCLUDED.topics,
          suggested_content = EXCLUDED.suggested_content,
          potential_score = EXCLUDED.potential_score,
          avg_engagement = EXCLUDED.avg_engagement,
          post_count = EXCLUDED.post_count,
          updated_at = NOW();
      `;

      await pool.query(gapQuery, [
        userId,
        competitorId,
        gap.type,
        gap.title,
        gap.description,
        gap.topics,
        gap.suggested_content,
        gap.potential_score,
        gap.avg_engagement,
        gap.post_count,
      ]);
    }

    // Prepare response
    const responseData = {
      success: true,
      competitor: {
        id: competitorId,
        ...competitorData,
        engagement_rate: engagementRate,
        posting_frequency: postingFrequency,
      },
      stats: {
        total_posts: posts.length,
        avg_likes: Math.round(avgLikes),
        avg_comments: Math.round(avgComments),
        engagement_rate: engagementRate,
        posting_frequency: postingFrequency,
      },
      content_gaps: gaps,
      message: 'Competitor analyzed successfully!',
    };

    // Cache the response (7-day TTL)
    competitorCache.set(platform.toLowerCase(), identifier, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error analyzing competitor:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Analyze content gaps using AI
 */
async function analyzeContentGaps(
  competitorId: string,
  userId: string,
  posts: any[],
  topics: string[],
  topPosts: any[]
): Promise<any[]> {
  const gaps: any[] = [];

  // Gap 1: High-performing content types
  const formatCounts = posts.reduce((acc, post) => {
    const format = detectContentFormat(post);
    acc[format] = (acc[format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0];
  
  if (mostUsedFormat) {
    const avgEngagement = topPosts
      .filter(p => detectContentFormat(p) === mostUsedFormat[0])
      .reduce((sum, p) => sum + (p.totalEngagement || 0), 0) / mostUsedFormat[1];

    gaps.push({
      type: `${mostUsedFormat[0]}_content`,
      title: `${mostUsedFormat[0].charAt(0).toUpperCase() + mostUsedFormat[0].slice(1)} Content Opportunity`,
      description: `Your competitor uses ${mostUsedFormat[0]} content ${mostUsedFormat[1]} times with high engagement.`,
      topics: topics.slice(0, 5),
      suggested_content: [
        `Create ${mostUsedFormat[0]} content about ${topics[0] || 'trending topics'}`,
        `Try ${mostUsedFormat[0]} format for your next post`,
        `Analyze why ${mostUsedFormat[0]} performs well for your audience`,
      ],
      potential_score: Math.min(95, Math.round(avgEngagement / 100)),
      avg_engagement: Math.round(avgEngagement),
      post_count: mostUsedFormat[1],
    });
  }

  // Gap 2: Trending topics
  if (topics.length > 0) {
    gaps.push({
      type: 'trending_topics',
      title: 'Trending Topics Gap',
      description: `Your competitor is leveraging ${topics.length} trending topics. You could tap into these conversations.`,
      topics: topics.slice(0, 10),
      suggested_content: [
        `Create content around ${topics[0]}`,
        `Join the conversation about ${topics[1] || 'popular topics'}`,
        `Share your unique perspective on ${topics[2] || 'trending topics'}`,
      ],
      potential_score: Math.min(90, topics.length * 5),
      avg_engagement: Math.round(topPosts.reduce((sum, p) => sum + (p.totalEngagement || 0), 0) / topPosts.length),
      post_count: topics.length,
    });
  }

  // Gap 3: Posting frequency
  const frequency = estimatePostingFrequency(posts);
  if (frequency > 0) {
    gaps.push({
      type: 'posting_frequency',
      title: 'Posting Frequency Opportunity',
      description: `Your competitor posts ${frequency.toFixed(1)} times per day. Consistent posting could boost your visibility.`,
      topics: ['consistency', 'engagement', 'growth'],
      suggested_content: [
        `Create a content calendar to match their frequency`,
        `Post at optimal times based on their schedule`,
        `Maintain consistency with quality content`,
      ],
      potential_score: Math.min(85, Math.round(frequency * 10)),
      avg_engagement: 0,
      post_count: Math.round(frequency * 7), // Weekly posts
    });
  }

  return gaps;
}

