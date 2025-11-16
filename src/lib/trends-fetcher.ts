// Trends data fetcher - integrates multiple sources
import axios from 'axios';

// Reddit API integration
export async function fetchRedditTrends() {
  try {
    console.log('🔴 [Reddit API] Starting fetch...');
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('⚠️ [Reddit API] Credentials not configured - skipping');
      return [];
    }

    // Get Reddit access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log('🔴 [Reddit API] Requesting access token...');
    
    const tokenResponse = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'repurposely/1.0',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log('🔴 [Reddit API] Access token obtained');

    // Fetch trending posts from popular subreddits
    const subreddits = ['technology', 'business', 'marketing', 'entrepreneur', 'startups'];
    const trends: any[] = [];

    for (const subreddit of subreddits) {
      const response = await axios.get(
        `https://oauth.reddit.com/r/${subreddit}/hot`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'repurposely/1.0',
          },
          params: { limit: 5 },
        }
      );

      const posts = response.data.data.children;
      for (const post of posts) {
        const data = post.data;
        trends.push({
          id: data.id,
          title: data.title,
          description: data.selftext?.slice(0, 200) || 'Trending discussion on Reddit',
          views: `${Math.floor(data.score / 1000)}K`,
          growth: `+${Math.floor(Math.random() * 200 + 50)}%`,
          badge: `r/${subreddit}`,
          badgeColor: 'bg-orange-500',
          tags: extractHashtags(data.title),
          platforms: ['x', 'linkedin'],
          category: getCategoryFromSubreddit(subreddit),
          engagement: Math.floor((data.score / data.num_comments) * 10),
          source: 'reddit',
        });
      }
    }

    const finalTrends = trends.slice(0, 10);
    console.log(`✅ [Reddit API] Successfully fetched ${finalTrends.length} trends`);
    return finalTrends;
  } catch (error: any) {
    console.error('❌ [Reddit API] Error:', error.message);
    if (error.response) {
      console.error('❌ [Reddit API] Response status:', error.response.status);
      console.error('❌ [Reddit API] Response data:', error.response.data);
    }
    return [];
  }
}

// News API integration
export async function fetchNewsTrends() {
  try {
    console.log('📰 [News API] Starting fetch...');
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ [News API] Key not configured - skipping');
      return [];
    }

    console.log('📰 [News API] Fetching headlines...');
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey,
        category: 'technology',
        language: 'en',
        pageSize: 10,
      },
      timeout: 10000, // 10 second timeout
    });
    
    console.log('📰 [News API] Response received:', response.data.status);

    const articles = response.data.articles;
    const trends: any[] = [];

    for (const article of articles) {
      trends.push({
        id: article.url,
        title: article.title,
        description: article.description || article.content?.slice(0, 200) || '',
        views: `${Math.floor(Math.random() * 500 + 100)}K`,
        growth: `+${Math.floor(Math.random() * 150 + 50)}%`,
        badge: '#News',
        badgeColor: 'bg-blue-600',
        tags: extractHashtags(article.title),
        platforms: ['x', 'linkedin', 'email'],
        category: 'tech',
        engagement: Math.floor(Math.random() * 30 + 60),
        source: 'news',
        imageUrl: article.urlToImage,
      });
    }

    console.log(`✅ [News API] Successfully fetched ${trends.length} trends`);
    return trends;
  } catch (error: any) {
    console.error('❌ [News API] Error:', error.message);
    return [];
  }
}

// Google Trends integration (using google-trends-api package)
export async function fetchGoogleTrends() {
  try {
    console.log('🔍 [Google Trends] Skipped: google-trends-api is not Edge-friendly');
    return [];
  } catch (error: any) {
    return [];
  }
}

// Helper functions
function extractHashtags(text: string): string[] {
  const words = text.split(' ').filter(w => w.length > 3);
  return words.slice(0, 3).map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`);
}

function getCategoryFromSubreddit(subreddit: string): string {
  const mapping: Record<string, string> = {
    technology: 'tech',
    business: 'business',
    marketing: 'marketing',
    entrepreneur: 'business',
    startups: 'business',
  };
  return mapping[subreddit] || 'tech';
}

// YouTube API integration
export async function fetchYouTubeTrends() {
  try {
    console.log('🎥 [YouTube API] Starting fetch...');
    const apiKey = process.env.YOUTUBE_API_KEY;
    console.log('🎥 [YouTube API] API Key exists:', !!apiKey);
    console.log('🎥 [YouTube API] API Key length:', apiKey?.length || 0);

    if (!apiKey) {
      console.warn('⚠️ [YouTube API] Key not configured - skipping');
      return [];
    }
    
    console.log('🎥 [YouTube API] API Key configured, proceeding with fetch...');

    // Fetch trending videos from multiple categories (5 categories, 3 videos each = 15 total)
    // Using mostPopular which works better with API restrictions
    const categories = [
      { id: '28', name: 'Science & Technology', emoji: '💻' },
      { id: '22', name: 'People & Blogs', emoji: '👥' },
      { id: '25', name: 'News & Politics', emoji: '📰' },
      { id: '24', name: 'Entertainment', emoji: '🎬' },
      { id: '10', name: 'Music', emoji: '🎵' },
    ];

    const trends: any[] = [];

    for (const category of categories) {
      try {
        console.log(`🎥 [YouTube API] Fetching category: ${category.name} (ID: ${category.id})`);
        
        // Use mostPopular which works better with API key restrictions
        const response = await axios.get(
          'https://www.googleapis.com/youtube/v3/videos',
          {
            params: {
              part: 'snippet,statistics,contentDetails',
              chart: 'mostPopular',
              regionCode: 'US',
              videoCategoryId: category.id,
              maxResults: 3,
              key: apiKey,
            },
            timeout: 10000,
          }
        );

        console.log(`🎥 [YouTube API] Received ${response.data.items?.length || 0} videos for ${category.name}`);

        for (const video of response.data.items) {
          const snippet = video.snippet;
          const stats = video.statistics;
          
          // Calculate engagement score
          const views = parseInt(stats.viewCount || '0');
          const likes = parseInt(stats.likeCount || '0');
          const comments = parseInt(stats.commentCount || '0');
          const engagement = Math.floor((likes + comments) / Math.max(views / 1000, 1));

          trends.push({
            id: `youtube-${video.id}`,
            title: snippet.title,
            description: snippet.description?.slice(0, 200) || 'Trending YouTube video',
            views: `${Math.floor(views / 1000)}K`,
            growth: `+${Math.floor(Math.random() * 200 + 50)}%`,
            badge: '🎥 YouTube',
            badgeColor: 'bg-red-500',
            tags: extractHashtags(snippet.title + ' ' + snippet.description),
            platforms: ['x', 'linkedin', 'instagram'],
            category: getCategoryFromYouTube(category.name),
            engagement: Math.min(engagement, 100),
            source: 'youtube',
            videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            channelTitle: snippet.channelTitle,
            youtubeCategory: category.name,
            youtubeCategoryEmoji: category.emoji,
          });
        }
      } catch (error: any) {
        console.error(`❌ [YouTube API] Failed to fetch category ${category.name}:`, error.message);
        if (error.response) {
          console.error('❌ [YouTube API] Response status:', error.response.status);
          console.error('❌ [YouTube API] Response data:', error.response.data);
        }
      }
    }

    console.log(`✅ [YouTube API] Successfully fetched ${trends.length} trends`);
    
    // If we got fewer than expected videos, log a warning
    if (trends.length < 15) {
      console.warn(`⚠️ [YouTube API] Expected 15 videos (3 per category × 5), but got ${trends.length}`);
      console.warn(`⚠️ [YouTube API] Some categories may not have enough trending videos`);
    }
    
    return trends;
  } catch (error: any) {
    console.error('❌ [YouTube API] Error:', error.message);
    if (error.response) {
      console.error('❌ [YouTube API] Response:', error.response.data);
    }
    return [];
  }
}

function getCategoryFromYouTube(categoryName: string): string {
  const mapping: Record<string, string> = {
    'Science & Technology': 'tech',
    'People & Blogs': 'lifestyle',
    'News & Politics': 'business',
    'Education': 'education',
    'Entertainment': 'lifestyle',
  };
  return mapping[categoryName] || 'tech';
}

// Combine all sources
export async function fetchAllTrends() {
  try {
    console.log('\n🚀 [Trends Fetcher] Starting to fetch from all sources...\n');
    
    const [redditTrends, newsTrends, googleTrends, youtubeTrends] = await Promise.allSettled([
      fetchRedditTrends(),
      fetchNewsTrends(),
      fetchGoogleTrends(),
      fetchYouTubeTrends(),
    ]);

    const allTrends: any[] = [];

    if (redditTrends.status === 'fulfilled') {
      allTrends.push(...redditTrends.value);
      console.log(`📊 [Summary] Reddit: ${redditTrends.value.length} trends`);
    } else {
      console.log('📊 [Summary] Reddit: Failed');
    }
    
    if (newsTrends.status === 'fulfilled') {
      allTrends.push(...newsTrends.value);
      console.log(`📊 [Summary] News: ${newsTrends.value.length} trends`);
    } else {
      console.log('📊 [Summary] News: Failed');
    }
    
    if (googleTrends.status === 'fulfilled') {
      allTrends.push(...googleTrends.value);
      console.log(`📊 [Summary] Google: ${googleTrends.value.length} trends`);
    } else {
      console.log('📊 [Summary] Google: Failed');
    }
    
    if (youtubeTrends.status === 'fulfilled') {
      allTrends.push(...youtubeTrends.value);
      console.log(`📊 [Summary] YouTube: ${youtubeTrends.value.length} trends`);
    } else {
      console.log('📊 [Summary] YouTube: Failed');
    }

    // Sort by source priority (YouTube first) then by engagement, return top 35
    const finalTrends = allTrends
      .sort((a, b) => {
        // Prioritize YouTube videos
        if (a.source === 'youtube' && b.source !== 'youtube') return -1;
        if (a.source !== 'youtube' && b.source === 'youtube') return 1;
        // Then sort by engagement
        return b.engagement - a.engagement;
      })
      .slice(0, 35); // Increased from 20 to 35 to include more videos
      
    console.log(`\n✨ [Trends Fetcher] Total: ${finalTrends.length} trends combined\n`);
    
    return finalTrends;
  } catch (error: any) {
    console.error('❌ [Trends Fetcher] Error:', error.message);
    return [];
  }
}
