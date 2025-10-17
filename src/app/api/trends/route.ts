import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = 'nodejs';

// Cache trends data for 1 hour
let trendsCache: any = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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
    platforms: ['twitter', 'linkedin'],
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
    platforms: ['linkedin', 'twitter'],
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
    platforms: ['linkedin', 'twitter', 'email'],
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
    platforms: ['instagram', 'twitter'],
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
    platforms: ['twitter', 'linkedin'],
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
    platforms: ['linkedin', 'twitter'],
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
    platforms: ['linkedin', 'twitter', 'email'],
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
    platforms: ['instagram', 'linkedin', 'twitter'],
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
    platforms: ['twitter', 'linkedin', 'email'],
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
    platforms: ['linkedin', 'twitter', 'email'],
    category: 'education',
    engagement: 76,
  },
];

// Platform-specific hashtags
const PLATFORM_HASHTAGS = {
  twitter: [
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

    // Fetch fresh data (in production, this would call external APIs)
    const trendsData = {
      topics: TRENDING_TOPICS,
      hashtags: PLATFORM_HASHTAGS,
      analytics: {
        totalViews: '8.7M',
        avgGrowth: '+156%',
        topCategory: 'Technology',
        lastUpdated: new Date().toISOString(),
      },
      performance: {
        twitter: { engagement: 15, growth: 12 },
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