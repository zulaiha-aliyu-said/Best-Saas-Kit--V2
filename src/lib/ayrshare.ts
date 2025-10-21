import axios from 'axios';

export interface AyrshareConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  handle: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  ayrshareId?: string;
}

export interface PostData {
  platforms: string[];
  text: string;
  mediaUrls?: string[];
  scheduleDate?: string;
  timezone?: string;
  link?: string;
  shortLink?: boolean;
  autoHashtag?: boolean;
  autoHashtagPosition?: 'beginning' | 'end';
  hashtags?: string[];
  tags?: string[];
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface ScheduledPost {
  id: string;
  platforms: string[];
  text: string;
  mediaUrls?: string[];
  scheduleDate: string;
  status: 'scheduled' | 'published' | 'failed' | 'paused';
  createdAt: string;
  updatedAt: string;
  analytics?: any;
}

export interface AnalyticsData {
  postId: string;
  platform: string;
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    clicks?: number;
    impressions?: number;
  };
  date: string;
}

export class AyrshareClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AyrshareConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://app.ayrshare.com/api';
  }

  private async makeRequest(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error('Ayrshare API Error:', error.response?.data || error.message);
      console.error('API Key being used:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'No API key');
      throw new Error(error.response?.data?.message || 'Ayrshare API request failed');
    }
  }

  // Get connected social media accounts
  async getConnectedAccounts(): Promise<SocialAccount[]> {
    try {
      // Note: This endpoint requires Business Plan
      // For basic plan, we'll return mock data or handle differently
      const response = await this.makeRequest('GET', '/profiles');
      return response.profiles.map((profile: any) => ({
        id: profile.id,
        platform: profile.platform,
        username: profile.username,
        handle: profile.handle || `@${profile.username}`,
        name: profile.name || profile.username,
        avatar: profile.profilePictureUrl,
        isActive: profile.status === 'active',
        ayrshareId: profile.id,
      }));
    } catch (error: any) {
      console.error('Failed to fetch connected accounts:', error);
      
      // If it's a business plan error, return empty array and let UI handle it
      if (error.message.includes('Business Plan')) {
        console.log('Business Plan required for /profiles endpoint. Using fallback approach.');
        return [];
      }
      
      return [];
    }
  }

  // Schedule a post
  async schedulePost(postData: PostData): Promise<ScheduledPost> {
    try {
      const requestBody: any = {
        post: postData.text, // Ayrshare expects 'post' field
        platforms: postData.platforms,
      };

      // Add optional fields only if they exist
      if (postData.mediaUrls && postData.mediaUrls.length > 0) {
        requestBody.mediaUrls = postData.mediaUrls;
      }
      if (postData.scheduleDate) {
        requestBody.scheduleDate = postData.scheduleDate;
      }
      if (postData.timezone) {
        requestBody.timezone = postData.timezone;
      }
      if (postData.link) {
        requestBody.link = postData.link;
      }
      if (postData.shortLink !== undefined) {
        requestBody.shortLink = postData.shortLink;
      }
      if (postData.autoHashtag !== undefined) {
        requestBody.autoHashtag = postData.autoHashtag;
      }
      if (postData.autoHashtagPosition) {
        requestBody.autoHashtagPosition = postData.autoHashtagPosition;
      }
      if (postData.hashtags && postData.hashtags.length > 0) {
        requestBody.hashtags = postData.hashtags;
      }
      if (postData.tags && postData.tags.length > 0) {
        requestBody.tags = postData.tags;
      }
      if (postData.location) {
        requestBody.location = postData.location;
      }

      const response = await this.makeRequest('POST', '/post', requestBody);

      return {
        id: response.id,
        platforms: postData.platforms,
        text: postData.text,
        mediaUrls: postData.mediaUrls,
        scheduleDate: postData.scheduleDate || new Date().toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to schedule post:', error);
      throw error;
    }
  }

  // Post immediately
  async postNow(postData: Omit<PostData, 'scheduleDate'>): Promise<ScheduledPost> {
    try {
      const requestBody: any = {
        post: postData.text, // Ayrshare expects 'post' field
        platforms: postData.platforms,
      };

      // Add optional fields only if they exist
      if (postData.mediaUrls && postData.mediaUrls.length > 0) {
        requestBody.mediaUrls = postData.mediaUrls;
      }
      if (postData.link) {
        requestBody.link = postData.link;
      }
      if (postData.shortLink !== undefined) {
        requestBody.shortLink = postData.shortLink;
      }
      if (postData.autoHashtag !== undefined) {
        requestBody.autoHashtag = postData.autoHashtag;
      }
      if (postData.autoHashtagPosition) {
        requestBody.autoHashtagPosition = postData.autoHashtagPosition;
      }
      if (postData.hashtags && postData.hashtags.length > 0) {
        requestBody.hashtags = postData.hashtags;
      }
      if (postData.tags && postData.tags.length > 0) {
        requestBody.tags = postData.tags;
      }
      if (postData.location) {
        requestBody.location = postData.location;
      }

      const response = await this.makeRequest('POST', '/post', requestBody);

      return {
        id: response.id,
        platforms: postData.platforms,
        text: postData.text,
        mediaUrls: postData.mediaUrls,
        scheduleDate: new Date().toISOString(),
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to post immediately:', error);
      throw error;
    }
  }

  // Get scheduled posts
  async getScheduledPosts(): Promise<ScheduledPost[]> {
    try {
      const response = await this.makeRequest('GET', '/posts');
      return response.posts.map((post: any) => ({
        id: post.id,
        platforms: post.platforms,
        text: post.text,
        mediaUrls: post.mediaUrls,
        scheduleDate: post.scheduleDate,
        status: post.status,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        analytics: post.analytics,
      }));
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
      return [];
    }
  }

  // Get post analytics
  async getPostAnalytics(postId: string): Promise<AnalyticsData[]> {
    try {
      const response = await this.makeRequest('GET', `/analytics/post/${postId}`);
      return response.analytics.map((analytic: any) => ({
        postId: analytic.postId,
        platform: analytic.platform,
        metrics: {
          likes: analytic.likes,
          comments: analytic.comments,
          shares: analytic.shares,
          views: analytic.views,
          clicks: analytic.clicks,
          impressions: analytic.impressions,
        },
        date: analytic.date,
      }));
    } catch (error) {
      console.error('Failed to fetch post analytics:', error);
      return [];
    }
  }

  // Update a scheduled post
  async updateScheduledPost(postId: string, updates: Partial<PostData>): Promise<ScheduledPost> {
    try {
      const response = await this.makeRequest('PUT', `/post/${postId}`, updates);
      return {
        id: response.id,
        platforms: response.platforms,
        text: response.text,
        mediaUrls: response.mediaUrls,
        scheduleDate: response.scheduleDate,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      };
    } catch (error) {
      console.error('Failed to update scheduled post:', error);
      throw error;
    }
  }

  // Delete a scheduled post
  async deleteScheduledPost(postId: string): Promise<boolean> {
    try {
      await this.makeRequest('DELETE', `/post/${postId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete scheduled post:', error);
      return false;
    }
  }

  // Pause a scheduled post
  async pauseScheduledPost(postId: string): Promise<boolean> {
    try {
      await this.makeRequest('PUT', `/post/${postId}/pause`);
      return true;
    } catch (error) {
      console.error('Failed to pause scheduled post:', error);
      return false;
    }
  }

  // Resume a paused post
  async resumeScheduledPost(postId: string): Promise<boolean> {
    try {
      await this.makeRequest('PUT', `/post/${postId}/resume`);
      return true;
    } catch (error) {
      console.error('Failed to resume scheduled post:', error);
      return false;
    }
  }

  // Get hashtag suggestions
  async getHashtagSuggestions(keyword: string, platform?: string): Promise<string[]> {
    try {
      const response = await this.makeRequest('GET', `/hashtags/search?keyword=${encodeURIComponent(keyword)}&platform=${platform || 'all'}`);
      return response.hashtags.map((hashtag: any) => hashtag.text);
    } catch (error) {
      console.error('Failed to fetch hashtag suggestions:', error);
      return [];
    }
  }

  // Upload media
  async uploadMedia(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${this.baseUrl}/media/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error: any) {
      console.error('Failed to upload media:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Get account analytics
  async getAccountAnalytics(platform: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams({
        platform,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await this.makeRequest('GET', `/analytics/account?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch account analytics:', error);
      return null;
    }
  }
}

// Create a singleton instance
let ayrshareClient: AyrshareClient | null = null;

export function getAyrshareClient(): AyrshareClient {
  if (!ayrshareClient) {
    const apiKey = process.env.AYRSHARE_API_KEY;
    if (!apiKey) {
      console.error('AYRSHARE_API_KEY environment variable is not set');
      throw new Error('AYRSHARE_API_KEY environment variable is required. Please add it to your .env.local file.');
    }
    console.log('Initializing Ayrshare client with API key:', apiKey.substring(0, 10) + '...');
    ayrshareClient = new AyrshareClient({ apiKey });
  }
  return ayrshareClient;
}

// Platform mapping for Ayrshare
export const AYRSHARE_PLATFORMS = {
  facebook: 'facebook',
  instagram: 'instagram',
  linkedin: 'linkedin',
  twitter: 'twitter',
  x: 'twitter', // X is mapped to twitter in Ayrshare
  pinterest: 'pinterest',
  youtube: 'youtube',
  tiktok: 'tiktok',
  reddit: 'reddit',
  telegram: 'telegram',
  snapchat: 'snapchat',
  threads: 'threads',
  bluesky: 'bluesky',
  google_business: 'google_business',
} as const;

export type AyrsharePlatform = keyof typeof AYRSHARE_PLATFORMS;
