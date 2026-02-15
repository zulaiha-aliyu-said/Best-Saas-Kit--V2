import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchAllTrends } from "@/lib/trends-fetcher";

// Use Node runtime so REDDIT_* and NEWS_API_KEY env vars and Buffer (Reddit auth) work in production.
export const runtime = 'nodejs';

// Cache trends data for 30 minutes (more frequent updates for real data)
let trendsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Mock YouTube videos for testing (when API is not configured) - 5 categories, 2 videos each
const MOCK_YOUTUBE_VIDEOS = [
  // Science & Technology
  {
    id: 'youtube-mock-1',
    title: 'The Future of AI in Content Creation - Complete Guide 2024',
    description: 'Learn how AI is revolutionizing content creation with practical examples and tools.',
    views: '1.2M',
    growth: '+250%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#AI', '#ContentCreation', '#Tutorial'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'tech',
    engagement: 92,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Tech Insights',
    youtubeCategory: 'Science & Technology',
    youtubeCategoryEmoji: '💻',
  },
  {
    id: 'youtube-mock-2',
    title: 'Top 10 Tech Gadgets You Need in 2024',
    description: 'Discover the latest tech gadgets that will change your life.',
    views: '945K',
    growth: '+220%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#Tech', '#Gadgets', '#Review'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'tech',
    engagement: 89,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Gadget Guru',
    youtubeCategory: 'Science & Technology',
    youtubeCategoryEmoji: '💻',
  },
  // People & Blogs
  {
    id: 'youtube-mock-3',
    title: 'Building a Personal Brand in 2024 - Step by Step',
    description: 'Complete guide to building and growing your personal brand online.',
    views: '623K',
    growth: '+145%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#PersonalBrand', '#Business', '#Entrepreneur'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'business',
    engagement: 85,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Brand Builder',
    youtubeCategory: 'People & Blogs',
    youtubeCategoryEmoji: '👥',
  },
  {
    id: 'youtube-mock-4',
    title: 'My Morning Routine as a Content Creator',
    description: 'Follow along with my productive morning routine.',
    views: '512K',
    growth: '+130%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#Lifestyle', '#Routine', '#Productivity'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'lifestyle',
    engagement: 82,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Daily Vlogger',
    youtubeCategory: 'People & Blogs',
    youtubeCategoryEmoji: '👥',
  },
  // News & Politics
  {
    id: 'youtube-mock-5',
    title: 'Social Media Marketing Strategy That Actually Works',
    description: 'Proven strategies to grow your social media presence and engagement.',
    views: '856K',
    growth: '+180%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#Marketing', '#SocialMedia', '#Growth'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'marketing',
    engagement: 88,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Marketing Pro',
    youtubeCategory: 'News & Politics',
    youtubeCategoryEmoji: '📰',
  },
  {
    id: 'youtube-mock-6',
    title: 'Latest Tech Industry News and Updates',
    description: 'Stay updated with the latest happenings in the tech world.',
    views: '734K',
    growth: '+165%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#TechNews', '#Industry', '#Updates'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'business',
    engagement: 86,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Tech News Daily',
    youtubeCategory: 'News & Politics',
    youtubeCategoryEmoji: '📰',
  },
  // Entertainment
  {
    id: 'youtube-mock-7',
    title: 'Behind the Scenes: Creating Viral Content',
    description: 'See how viral content is made from start to finish.',
    views: '1.1M',
    growth: '+240%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#BehindTheScenes', '#Viral', '#Content'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'lifestyle',
    engagement: 91,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Creator Studio',
    youtubeCategory: 'Entertainment',
    youtubeCategoryEmoji: '🎬',
  },
  {
    id: 'youtube-mock-8',
    title: 'Top 10 Funniest Moments of 2024',
    description: 'Laugh out loud with these hilarious moments.',
    views: '892K',
    growth: '+195%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#Funny', '#Comedy', '#Entertainment'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'lifestyle',
    engagement: 87,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Comedy Central',
    youtubeCategory: 'Entertainment',
    youtubeCategoryEmoji: '🎬',
  },
  // Howto & Style
  {
    id: 'youtube-mock-9',
    title: 'Complete Guide to Video Editing for Beginners',
    description: 'Learn professional video editing from scratch.',
    views: '678K',
    growth: '+155%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#VideoEditing', '#Tutorial', '#Howto'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'education',
    engagement: 84,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Edit Master',
    youtubeCategory: 'Howto & Style',
    youtubeCategoryEmoji: '✨',
  },
  {
    id: 'youtube-mock-10',
    title: '10 Design Tips Every Creator Should Know',
    description: 'Elevate your content with these essential design principles.',
    views: '545K',
    growth: '+140%',
    badge: '🎥 YouTube',
    badgeColor: 'bg-red-500',
    tags: ['#Design', '#Tips', '#Creative'],
    platforms: ['x', 'linkedin', 'instagram'],
    category: 'education',
    engagement: 81,
    source: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelTitle: 'Design Academy',
    youtubeCategory: 'Howto & Style',
    youtubeCategoryEmoji: '✨',
  },
];

// Trending topics data with categories
const TRENDING_TOPICS = [
  {
    id: '1',
    title: 'AI Content Revolution',
    description: 'How artificial intelligence is transforming content creation and marketing strategies worldwide.',
    views: '2.3M',
    growth: '+347%',
    badge: '#1 Trending',
    badgeColor: 'bg-red-500',
    tags: ['#AIContent', '#ContentMarketing', '#AI'],
    platforms: ['x', 'linkedin'],
    category: 'tech',
    engagement: 94,
  },
  {
    id: '2',
    title: 'Remote Work Productivity',
    description: 'Best practices and tools for maintaining high productivity while working from home.',
    views: '1.8M',
    growth: '+289%',
    badge: '#2 Rising',
    badgeColor: 'bg-blue-500',
    tags: ['#RemoteWork', '#Productivity', '#WorkFromHome'],
    platforms: ['linkedin', 'x'],
    category: 'business',
    engagement: 87,
  },
  {
    id: '3',
    title: 'Sustainable Business',
    description: 'How companies are adopting eco-friendly practices and green technologies for better future.',
    views: '1.2M',
    growth: '+156%',
    badge: '#3 Popular',
    badgeColor: 'bg-green-500',
    tags: ['#Sustainability', '#GreenTech', '#EcoFriendly'],
    platforms: ['linkedin', 'x', 'email'],
    category: 'business',
    engagement: 78,
  },
  {
    id: '4',
    title: 'Mental Health Awareness',
    description: 'Breaking stigmas and promoting mental wellness in workplace and personal life.',
    views: '956K',
    growth: '+198%',
    badge: '#4 Viral',
    badgeColor: 'bg-purple-500',
    tags: ['#MentalHealth', '#Wellness', '#SelfCare'],
    platforms: ['instagram', 'x'],
    category: 'health',
    engagement: 92,
  },
  {
    id: '5',
    title: 'Crypto & Web3',
    description: 'Latest developments in cryptocurrency, blockchain, and decentralized technologies.',
    views: '743K',
    growth: '+134%',
    badge: '#5 Emerging',
    badgeColor: 'bg-yellow-500',
    tags: ['#Crypto', '#Web3', '#Blockchain'],
    platforms: ['x', 'linkedin'],
    category: 'tech',
    engagement: 85,
  },
  {
    id: '6',
    title: 'Future of Work',
    description: 'Exploring new work models, automation, and the changing landscape of employment.',
    views: '621K',
    growth: '+87%',
    badge: '#6 Innovation',
    badgeColor: 'bg-indigo-500',
    tags: ['#FutureOfWork', '#Automation', '#WorkTrends'],
    platforms: ['linkedin', 'x'],
    category: 'business',
    engagement: 79,
  },
  {
    id: '7',
    title: 'Digital Marketing Trends',
    description: 'Latest strategies and tools for effective digital marketing in 2024.',
    views: '589K',
    growth: '+112%',
    badge: '#7 Hot',
    badgeColor: 'bg-orange-500',
    tags: ['#DigitalMarketing', '#Marketing', '#SEO'],
    platforms: ['linkedin', 'x', 'email'],
    category: 'marketing',
    engagement: 81,
  },
  {
    id: '8',
    title: 'Personal Branding',
    description: 'Building and growing your personal brand on social media platforms.',
    views: '512K',
    growth: '+95%',
    badge: '#8 Growing',
    badgeColor: 'bg-pink-500',
    tags: ['#PersonalBrand', '#Branding', '#SocialMedia'],
    platforms: ['instagram', 'linkedin', 'x'],
    category: 'lifestyle',
    engagement: 88,
  },
  {
    id: '9',
    title: 'Financial Literacy',
    description: 'Essential financial knowledge and investment strategies for beginners.',
    views: '478K',
    growth: '+76%',
    badge: '#9 Rising',
    badgeColor: 'bg-teal-500',
    tags: ['#Finance', '#Investing', '#MoneyTips'],
    platforms: ['x', 'linkedin', 'email'],
    category: 'finance',
    engagement: 73,
  },
  {
    id: '10',
    title: 'Online Learning',
    description: 'Best platforms and strategies for effective online education and skill development.',
    views: '445K',
    growth: '+68%',
    badge: '#10 Steady',
    badgeColor: 'bg-blue-600',
    tags: ['#OnlineLearning', '#Education', '#SkillDevelopment'],
    platforms: ['linkedin', 'x', 'email'],
    category: 'education',
    engagement: 76,
  },
];

// Fallback hashtags (used if no real data available)
const FALLBACK_HASHTAGS = {
  x: [
    '#AIRevolution', '#TechTrends', '#Innovation', '#DigitalTransformation',
    '#StartupLife', '#ContentCreation', '#RemoteWork', '#Productivity',
    '#Entrepreneurship', '#TechNews', '#FutureOfWork', '#DigitalMarketing'
  ],
  linkedin: [
    '#Leadership', '#ProfessionalGrowth', '#BusinessStrategy', '#CareerDevelopment',
    '#Networking', '#ThoughtLeadership', '#Innovation', '#DigitalMarketing',
    '#WorkplaceCulture', '#CareerAdvice', '#BusinessTips', '#ProfessionalDevelopment'
  ],
  instagram: [
    '#CreativeLife', '#Inspiration', '#LifestyleBrand', '#ContentCreator',
    '#BehindTheScenes', '#Motivation', '#PersonalBrand', '#Entrepreneur',
    '#DailyInspiration', '#CreativeProcess', '#DigitalCreator', '#BrandBuilding'
  ],
  email: [
    'ExclusiveUpdate', 'WeeklyInsights', 'TrendAlert', 'IndustryNews',
    'ExpertTips', 'BehindScenes', 'SpecialOffer', 'CommunitySpotlight',
    'NewsletterExclusive', 'InsiderAccess', 'PremiumContent', 'SubscriberPerks'
  ],
};

// Extract hashtags from trending topics
function extractHashtagsFromTopics(topics: any[]) {
  const platformHashtags: Record<string, string[]> = {
    x: [],
    linkedin: [],
    instagram: [],
    email: [],
  };

  // Collect all tags from topics
  const allTags = new Set<string>();
  topics.forEach(topic => {
    if (topic.tags && Array.isArray(topic.tags)) {
      topic.tags.forEach((tag: string) => {
        if (tag.startsWith('#')) {
          allTags.add(tag);
        }
      });
    }
  });

  const tagsArray = Array.from(allTags);

  // If we have real tags, distribute them across platforms
  if (tagsArray.length > 0) {
    // X/Twitter gets all tags (most hashtag-friendly)
    platformHashtags.x = tagsArray.slice(0, 12);
    
    // LinkedIn gets professional/business tags
    platformHashtags.linkedin = tagsArray
      .filter(tag => 
        tag.toLowerCase().includes('business') ||
        tag.toLowerCase().includes('professional') ||
        tag.toLowerCase().includes('career') ||
        tag.toLowerCase().includes('leadership') ||
        tag.toLowerCase().includes('tech') ||
        tag.toLowerCase().includes('innovation')
      )
      .slice(0, 12);
    
    // If not enough professional tags, fill with general ones
    if (platformHashtags.linkedin.length < 8) {
      const remaining = tagsArray.filter(t => !platformHashtags.linkedin.includes(t));
      platformHashtags.linkedin = [...platformHashtags.linkedin, ...remaining].slice(0, 12);
    }
    
    // Instagram gets creative/lifestyle tags
    platformHashtags.instagram = tagsArray
      .filter(tag => 
        tag.toLowerCase().includes('creative') ||
        tag.toLowerCase().includes('inspiration') ||
        tag.toLowerCase().includes('lifestyle') ||
        tag.toLowerCase().includes('content') ||
        tag.toLowerCase().includes('brand')
      )
      .slice(0, 12);
    
    // If not enough creative tags, fill with general ones
    if (platformHashtags.instagram.length < 8) {
      const remaining = tagsArray.filter(t => !platformHashtags.instagram.includes(t));
      platformHashtags.instagram = [...platformHashtags.instagram, ...remaining].slice(0, 12);
    }
    
    // Email gets keywords without # symbol
    platformHashtags.email = tagsArray
      .map(tag => tag.replace('#', ''))
      .slice(0, 12);
  } else {
    // No real tags found, use fallback
    return FALLBACK_HASHTAGS;
  }

  return platformHashtags;
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform') || 'all';
    const category = searchParams.get('category') || 'all';
    const timeRange = searchParams.get('timeRange') || '24';

    // Check cache
    const now = Date.now();
    if (trendsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(filterTrends(trendsCache, platform, category));
    }

    // Fetch real trends from APIs
    console.log('Fetching fresh trends from APIs...');
    let realTrends = await fetchAllTrends();

    // If no real trends or API failed, use fallback data
    if (!realTrends || realTrends.length === 0) {
      console.log('Using fallback mock data (including mock YouTube videos)');
      realTrends = [...TRENDING_TOPICS, ...MOCK_YOUTUBE_VIDEOS];
    } else {
      console.log(`Fetched ${realTrends.length} real trends`);
      
      // Log YouTube video count (no mock supplementing - only real data)
      const youtubeVideos = realTrends.filter((t: any) => t.source === 'youtube');
      console.log(`Found ${youtubeVideos.length} real YouTube videos from API`);
    }

    // Extract hashtags from real trending topics
    const dynamicHashtags = extractHashtagsFromTopics(realTrends);
    console.log(`📊 [Hashtags] Extracted ${Object.values(dynamicHashtags).flat().length} total hashtags from trends`);
    
    // Prepare trends data
    const trendsData = {
      topics: realTrends,
      hashtags: dynamicHashtags,
      analytics: {
        totalViews: calculateTotalViews(realTrends),
        avgGrowth: calculateAvgGrowth(realTrends),
        topCategory: getTopCategory(realTrends),
        lastUpdated: new Date().toISOString(),
      },
      performance: {
        x: { engagement: 15, growth: 12 },
        linkedin: { engagement: 13, growth: 10 },
        instagram: { engagement: 7, growth: 6 },
        email: { engagement: 16, growth: 14 },
      },
    };

    // Update cache
    trendsCache = trendsData;
    cacheTimestamp = now;

    // Filter and return
    return NextResponse.json(filterTrends(trendsData, platform, category));
  } catch (error: any) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}

function filterTrends(data: any, platform: string, category: string) {
  let filteredTopics = [...data.topics];

  // Filter by platform
  if (platform !== 'all') {
    filteredTopics = filteredTopics.filter(topic =>
      topic.platforms.includes(platform)
    );
  }

  // Filter by category
  if (category !== 'all') {
    filteredTopics = filteredTopics.filter(topic =>
      topic.category === category
    );
  }

  return {
    topics: filteredTopics,
    hashtags: data.hashtags,
    analytics: data.analytics,
    performance: data.performance,
  };
}

// Helper function to calculate total views
function calculateTotalViews(trends: any[]): string {
  let total = 0;
  for (const trend of trends) {
    const views = trend.views.replace(/[KM]/g, '');
    const multiplier = trend.views.includes('M') ? 1000000 : trend.views.includes('K') ? 1000 : 1;
    total += parseFloat(views) * multiplier;
  }
  
  if (total >= 1000000) {
    return `${(total / 1000000).toFixed(1)}M`;
  }
  return `${(total / 1000).toFixed(0)}K`;
}

// Helper function to calculate average growth
function calculateAvgGrowth(trends: any[]): string {
  let total = 0;
  for (const trend of trends) {
    const growth = parseFloat(trend.growth.replace(/[+%]/g, ''));
    total += growth;
  }
  return `+${Math.floor(total / trends.length)}%`;
}

// Helper function to get top category
function getTopCategory(trends: any[]): string {
  const categories: Record<string, number> = {};
  for (const trend of trends) {
    categories[trend.category] = (categories[trend.category] || 0) + 1;
  }
  
  let topCategory = 'Technology';
  let maxCount = 0;
  for (const [category, count] of Object.entries(categories)) {
    if (count > maxCount) {
      maxCount = count;
      topCategory = category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  return topCategory;
}