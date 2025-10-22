/**
 * RapidAPI Integration for Competitor Analysis
 * Twitter API47 + Instagram Profile1
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '55a39700c8mshda32b5dd89a9c6ap15c1acjsn042265ed7d33';

// ========================================
// TWITTER API47
// ========================================

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  banner: string;
  verified: boolean;
  isBlueVerified: boolean;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  createdAt: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  author: TwitterUser;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  bookmarkCount: number;
  viewCount: number;
  media: any[];
  type: string;
  createdAt: string;
}

export interface TwitterResponse {
  data: TwitterTweet[];
  pagination?: {
    nextCursor: string;
    prevCursor: string;
  };
}

/**
 * Fetch Twitter user tweets and profile data
 */
export async function fetchTwitterCompetitor(userId: string): Promise<TwitterResponse | null> {
  try {
    console.log('🔍 Fetching Twitter data for user ID:', userId);
    console.log('🔑 Using API key:', RAPIDAPI_KEY ? 'SET' : 'NOT SET');
    
    const url = `https://twitter-api47.p.rapidapi.com/v3/user/tweets?userId=${userId}`;
    console.log('📡 API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'twitter-api47.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Twitter API error response:', errorText);
      throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Twitter data fetched successfully. Posts count:', data?.data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error fetching Twitter competitor:', error);
    return null;
  }
}

// ========================================
// INSTAGRAM PROFILE1
// ========================================

export interface InstagramUser {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  followers: number;
  following: number;
  is_verified: boolean;
  is_business: boolean;
  profile_pic_url: string;
  media_count: number;
}

export interface InstagramPost {
  id: string;
  shortcode: string;
  link_to_post: string;
  display_url: string;
  is_video: any[];
  caption: string;
  like: number;
  comment_count: number;
  timestamp: number;
  video_url?: string;
}

export interface InstagramResponse {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  followers: number;
  following: number;
  is_verified: boolean;
  is_business: boolean;
  profile_pic_url: string;
  media_count: number;
  lastMedia: {
    media: InstagramPost[];
  };
}

/**
 * Fetch Instagram user profile and recent posts
 */
export async function fetchInstagramCompetitor(username: string): Promise<InstagramResponse | null> {
  try {
    const response = await fetch(
      `https://instagram-profile1.p.rapidapi.com/getprofile/${username}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'instagram-profile1.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Instagram competitor:', error);
    return null;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Calculate engagement rate from social media metrics
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  followers: number
): number {
  if (followers === 0) return 0;
  const totalEngagement = likes + comments + shares;
  return Number(((totalEngagement / followers) * 100).toFixed(2));
}

/**
 * Estimate posting frequency from posts
 */
export function estimatePostingFrequency(posts: any[]): number {
  if (posts.length < 2) return 0;

  const timestamps = posts
    .map(post => {
      // Handle both Twitter and Instagram timestamp formats
      if (post.timestamp) return post.timestamp; // Instagram (milliseconds)
      if (post.createdAt) return new Date(post.createdAt).getTime(); // Twitter (ISO string)
      return 0;
    })
    .filter(t => t > 0)
    .sort((a, b) => b - a);

  if (timestamps.length < 2) return 0;

  const totalDays = (timestamps[0] - timestamps[timestamps.length - 1]) / (1000 * 60 * 60 * 24);
  return Number((posts.length / Math.max(totalDays, 1)).toFixed(2));
}

/**
 * Extract trending topics from posts
 */
export function extractTopics(posts: any[]): string[] {
  const topics = new Set<string>();

  posts.forEach(post => {
    const text = post.text || post.caption || '';
    
    // Extract hashtags
    const hashtags = text.match(/#\w+/g) || [];
    hashtags.forEach(tag => topics.add(tag.toLowerCase()));

    // Extract @mentions
    const mentions = text.match(/@\w+/g) || [];
    mentions.forEach(mention => topics.add(mention.toLowerCase()));
  });

  return Array.from(topics).slice(0, 20); // Limit to top 20
}

/**
 * Detect content format from post data
 */
export function detectContentFormat(post: any): 'text' | 'image' | 'video' | 'carousel' {
  if (post.is_video && post.is_video.length > 0) return 'video';
  if (post.media && post.media.length > 1) return 'carousel';
  if (post.media && post.media.length === 1) return 'image';
  return 'text';
}

/**
 * Get best performing posts by engagement
 */
export function getTopPosts(posts: any[], limit: number = 10): any[] {
  return posts
    .map(post => ({
      ...post,
      totalEngagement: (post.likeCount || post.like || 0) + 
                      (post.commentCount || post.comment_count || 0) + 
                      (post.retweetCount || 0)
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, limit);
}


