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
 * Convert Twitter username to User ID
 */
export async function getTwitterUserId(username: string): Promise<string | null> {
  try {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    console.log('🔍 Converting Twitter username to ID:', cleanUsername);
    
    // Try the v2 endpoint first
    let url = `https://twitter-api47.p.rapidapi.com/v2/user/by-username?username=${cleanUsername}`;
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'twitter-api47.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    // If v2 endpoint fails, try alternative approach
    if (!response.ok) {
      console.log('⚠️ v2 endpoint not available, trying alternative...');
      
      // Try search endpoint as fallback
      url = `https://twitter-api47.p.rapidapi.com/v2/search?query=${cleanUsername}&type=users`;
      
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'twitter-api47.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      });
      
      if (!response.ok) {
        console.error('❌ Error getting Twitter user ID:', response.status);
        console.error('💡 Username-to-ID conversion not available. Please use numeric Twitter User ID.');
        return null;
      }
      
      const searchData = await response.json();
      const users = searchData?.data?.users || [];
      const matchedUser = users.find((u: any) => u.username?.toLowerCase() === cleanUsername.toLowerCase());
      
      if (matchedUser?.id) {
        console.log('✅ Converted @' + cleanUsername + ' → ID:', matchedUser.id);
        return matchedUser.id;
      }
      
      return null;
    }

    const data = await response.json();
    const userId = data?.data?.user?.result?.rest_id;
    
    if (userId) {
      console.log('✅ Converted @' + cleanUsername + ' → ID:', userId);
      return userId;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error converting username:', error);
    return null;
  }
}

/**
 * Fetch Twitter user tweets and profile data
 * Accepts either username or numeric user ID
 */
export async function fetchTwitterCompetitor(identifier: string): Promise<TwitterResponse | null> {
  try {
    console.log('🔍 Fetching Twitter data for identifier:', identifier);
    console.log('🔑 Using API key:', RAPIDAPI_KEY ? 'SET' : 'NOT SET');
    
    // Auto-detect: if identifier is not all digits, treat as username and convert to ID
    let userId = identifier;
    if (!/^\d+$/.test(identifier)) {
      console.log('🔄 Identifier is username, converting to ID...');
      const convertedId = await getTwitterUserId(identifier);
      if (!convertedId) {
        console.error('❌ Failed to convert username to ID');
        return null;
      }
      userId = convertedId;
    } else {
      console.log('✅ Identifier is numeric ID, using directly');
    }
    
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
 * Fetch Instagram user profile and recent posts (Primary API)
 * Using instagram-profile1.p.rapidapi.com
 */
async function fetchInstagramPrimary(username: string): Promise<InstagramResponse | null> {
  try {
    console.log('🔍 [PRIMARY] Fetching Instagram data for username:', username);
    
    const url = `https://instagram-profile1.p.rapidapi.com/getprofile/${username}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-profile1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.warn('⚠️ [PRIMARY] API failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Check if posts are included
    if (data.lastMedia && data.lastMedia.media && data.lastMedia.media.length > 0) {
      console.log('✅ [PRIMARY] Success! Posts count:', data.lastMedia.media.length);
      return data;
    }
    
    console.warn('⚠️ [PRIMARY] Profile fetched but no posts. Trying fallback...');
    return null;
  } catch (error) {
    console.error('❌ [PRIMARY] Error:', error);
    return null;
  }
}

/**
 * Fetch Instagram user profile and recent posts (Fallback API #2)
 * Using instagram-statistics-api.p.rapidapi.com
 */
async function fetchInstagramStatistics(username: string): Promise<InstagramResponse | null> {
  try {
    console.log('🔄 [STATISTICS] Fetching Instagram data for username:', username);
    
    // This API requires full Instagram URL
    const instagramUrl = `https://www.instagram.com/${username}/`;
    const url = `https://instagram-statistics-api.p.rapidapi.com/community?url=${encodeURIComponent(instagramUrl)}`;
    console.log('📡 [STATISTICS] API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.error('❌ [STATISTICS] API failed:', response.status);
      return null;
    }

    const rawData = await response.json();
    console.log('✅ [STATISTICS] Data fetched successfully!');
    
    // Extract data from the response
    const data = rawData.data || rawData;
    const posts = data.lastPosts || [];
    console.log('📊 [STATISTICS] Posts found:', posts.length);
    
    // Map to our expected format
    return {
      id: '', // Not provided by this API
      username: username, // Use the username we passed in
      full_name: data.name || username,
      bio: data.bio || '',
      followers: data.followersCount || data.followers || 0,
      following: data.followingCount || data.following || 0,
      is_verified: data.isVerified || data.verified || false,
      is_business: data.type === 'business',
      profile_pic_url: data.profilePicUrl || data.avatar || '',
      media_count: data.postsCount || posts.length || 0,
      lastMedia: {
        media: posts.map((post: any) => ({
          id: post.url?.split('/p/')[1]?.replace('/', '') || '',
          shortcode: post.url?.split('/p/')[1]?.replace('/', '') || '',
          link_to_post: post.url,
          display_url: post.image || '',
          is_video: post.type === 'video' || post.type === 'REELS' ? [true] : [],
          caption: post.text || '',
          like: post.likes || 0,
          comment_count: post.comments || 0,
          timestamp: post.date ? new Date(post.date).getTime() : Date.now(),
          video_url: post.video || null,
        }))
      }
    };
  } catch (error) {
    console.error('❌ [STATISTICS] Error:', error);
    return null;
  }
}

/**
 * Fetch Instagram user profile and recent posts (Fallback API)
 * Using instagram-social-api.p.rapidapi.com
 */
async function fetchInstagramFallback(username: string): Promise<InstagramResponse | null> {
  try {
    console.log('🔄 [FALLBACK] Fetching Instagram data for username:', username);
    
    // Step 1: Get profile info
    const profileUrl = `https://instagram-social-api.p.rapidapi.com/v1/user/info?username_or_id_or_url=${username}`;
    console.log('📡 [FALLBACK] Profile URL:', profileUrl);
    
    const profileResponse = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-social-api.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!profileResponse.ok) {
      console.error('❌ [FALLBACK] Profile fetch failed:', profileResponse.status);
      return null;
    }

    const profileData = await profileResponse.json();
    console.log('✅ [FALLBACK] Profile fetched');
    
    // Step 2: Get posts
    const postsUrl = `https://instagram-social-api.p.rapidapi.com/v1/posts?username_or_id_or_url=${username}`;
    console.log('📡 [FALLBACK] Posts URL:', postsUrl);
    
    const postsResponse = await fetch(postsUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-social-api.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!postsResponse.ok) {
      console.warn('⚠️ [FALLBACK] Posts fetch failed:', postsResponse.status);
      // Return profile without posts
      return {
        ...profileData.data,
        lastMedia: { media: [] }
      };
    }

    const postsData = await postsResponse.json();
    const posts = postsData.data?.items || [];
    console.log('✅ [FALLBACK] Posts fetched. Count:', posts.length);
    
    // Combine profile + posts in expected format
    return {
      id: profileData.data.id || profileData.data.instagram_pk,
      username: profileData.data.username,
      full_name: profileData.data.full_name,
      bio: profileData.data.biography,
      followers: profileData.data.follower_count,
      following: profileData.data.following_count,
      is_verified: profileData.data.is_verified,
      is_business: profileData.data.is_business || false,
      profile_pic_url: profileData.data.profile_pic_url,
      media_count: profileData.data.media_count,
      lastMedia: {
        media: posts.map((post: any) => ({
          id: post.id || post.pk,
          shortcode: post.code,
          link_to_post: `https://www.instagram.com/p/${post.code}/`,
          display_url: post.thumbnail_url || post.image_versions?.items?.[0]?.url,
          is_video: post.is_video ? [true] : [],
          caption: post.caption?.text || '',
          like: post.metrics?.like_count || 0,
          comment_count: post.metrics?.comment_count || 0,
          timestamp: post.taken_at_ts * 1000 || Date.now(),
          video_url: post.video_url || null,
        }))
      }
    };
  } catch (error) {
    console.error('❌ [FALLBACK] Error:', error);
    return null;
  }
}

/**
 * Fetch Instagram user profile and recent posts (with fallback)
 * Tries primary API first, then falls back to secondary API
 */
export async function fetchInstagramCompetitor(username: string): Promise<InstagramResponse | null> {
  try {
    // Clean username: remove @ symbol, spaces, and Instagram URLs
    let cleanUsername = username.trim();
    
    // Remove @ symbol if present
    if (cleanUsername.startsWith('@')) {
      cleanUsername = cleanUsername.substring(1);
    }
    
    // Extract username from Instagram URL if provided
    if (cleanUsername.includes('instagram.com/')) {
      const match = cleanUsername.match(/instagram\.com\/([^/?]+)/);
      if (match) {
        cleanUsername = match[1];
      }
    }
    
    console.log('🔍 Fetching Instagram data for username:', cleanUsername);
    if (cleanUsername !== username) {
      console.log('🧹 Cleaned username:', username, '→', cleanUsername);
    }
    console.log('🔑 Using API key:', RAPIDAPI_KEY ? 'SET' : 'NOT SET');
    
    // Try primary API first
    let data = await fetchInstagramPrimary(cleanUsername);
    
    if (data && data.lastMedia?.media?.length > 0) {
      console.log('✅ PRIMARY API SUCCESS! Using primary data.');
      return data;
    }
    
    // Fallback #1: instagram-social-api
    console.log('🔄 PRIMARY API failed or no posts. Trying FALLBACK #1...');
    data = await fetchInstagramFallback(cleanUsername);
    
    if (data && data.lastMedia?.media?.length > 0) {
      console.log('✅ FALLBACK #1 API SUCCESS! Using fallback data.');
      return data;
    }
    
    // Fallback #2: instagram-statistics-api
    console.log('🔄 FALLBACK #1 failed. Trying FALLBACK #2 (Statistics API)...');
    data = await fetchInstagramStatistics(cleanUsername);
    
    if (data && data.lastMedia?.media?.length > 0) {
      console.log('✅ FALLBACK #2 (STATISTICS) API SUCCESS! Using statistics data.');
      return data;
    }
    
    // All APIs failed or no posts
    console.error('❌ All 3 APIs failed or returned no posts');
    return null;
  } catch (error) {
    console.error('❌ Error fetching Instagram competitor:', error);
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


