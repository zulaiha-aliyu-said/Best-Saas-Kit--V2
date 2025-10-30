import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPlan } from '@/lib/feature-gate';
import { pool } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user plan and check tier access
    const plan = await getUserPlan(session.user.id);
    
    // 🔒 TIER 2+ FEATURE - Check access
    if (plan?.plan_type === 'ltd') {
      if (!plan.ltd_tier || plan.ltd_tier < 2) {
        return NextResponse.json({
          error: 'Tier 2+ Required',
          message: 'YouTube Trending Videos is a Tier 2+ feature. Upgrade to unlock trending videos with thumbnails.',
          code: 'TIER_RESTRICTED',
          currentTier: plan.ltd_tier || 1,
          requiredTier: 2,
          upgradeUrl: '/redeem'
        }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const region = searchParams.get('region') || 'US';

    // In production, this would call the actual YouTube API
    // For now, we'll return mock data with realistic structure
    const trendingVideos = await getMockYouTubeTrending(category, region);

    return NextResponse.json({
      success: true,
      videos: trendingVideos,
      category,
      region,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching YouTube trending:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
      { status: 500 }
    );
  }
}

async function getMockYouTubeTrending(category: string, region: string) {
  // Mock trending videos data
  const categories = {
    all: 'All',
    tech: 'Technology',
    business: 'Business',
    education: 'Education',
    entertainment: 'Entertainment',
    gaming: 'Gaming'
  };

  const baseVideos = [
    {
      id: 'yt-trending-1',
      title: 'How AI is Transforming Content Marketing in 2025',
      channelName: 'Marketing Pro',
      channelId: 'UC-marketing-pro',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1280&h=720&fit=crop',
      views: 1250000,
      likes: 48500,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      duration: '12:45',
      description: 'Discover the latest AI-powered tools revolutionizing content marketing strategies. Learn how to 10x your output while maintaining quality.',
      tags: ['AI', 'Marketing', 'Content Creation', 'Automation'],
      category: 'tech',
      trending: true,
      trendingRank: 5,
      engagement: 3.88
    },
    {
      id: 'yt-trending-2',
      title: '7 Viral Content Hooks That Got 10M+ Views',
      channelName: 'Content Mastery',
      channelId: 'UC-content-mastery',
      thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=1280&h=720&fit=crop',
      views: 892000,
      likes: 35200,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      duration: '15:22',
      description: 'Proven viral hooks used by top creators to grab attention and boost engagement. Step-by-step breakdown with examples.',
      tags: ['Viral', 'Content Strategy', 'Social Media', 'Growth'],
      category: 'business',
      trending: true,
      trendingRank: 12,
      engagement: 3.95
    },
    {
      id: 'yt-trending-3',
      title: 'Building a $100K/Month Content Empire (Timeline)',
      channelName: 'Entrepreneur Daily',
      channelId: 'UC-entrepreneur',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1280&h=720&fit=crop',
      views: 654000,
      likes: 28900,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      duration: '18:30',
      description: 'From 0 to $100K/month through strategic content creation. Real timeline, real numbers, real strategies.',
      tags: ['Business', 'Entrepreneurship', 'Content Business', 'Case Study'],
      category: 'business',
      trending: true,
      trendingRank: 23,
      engagement: 4.42
    },
    {
      id: 'yt-trending-4',
      title: 'The Science Behind Viral Videos Explained',
      channelName: 'Digital Psychology',
      channelId: 'UC-psychology',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=720&fit=crop',
      views: 523000,
      likes: 21400,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      duration: '14:18',
      description: 'Understanding the psychological triggers that make content go viral. Backed by research and real examples.',
      tags: ['Psychology', 'Viral Content', 'Science', 'Marketing'],
      category: 'education',
      trending: true,
      trendingRank: 34,
      engagement: 4.09
    },
    {
      id: 'yt-trending-5',
      title: 'ChatGPT vs Claude: Best AI for Content Creation?',
      channelName: 'AI Tools Review',
      channelId: 'UC-ai-tools',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1280&h=720&fit=crop',
      views: 789000,
      likes: 32100,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      duration: '16:45',
      description: 'Comprehensive comparison of top AI tools for content creation. Real tests, honest results, clear winner.',
      tags: ['AI', 'ChatGPT', 'Claude', 'Content Tools', 'Review'],
      category: 'tech',
      trending: true,
      trendingRank: 8,
      engagement: 4.07
    },
    {
      id: 'yt-trending-6',
      title: 'Repurposing Content: 1 Video → 50+ Posts Strategy',
      channelName: 'Social Media Hacks',
      channelId: 'UC-social-hacks',
      thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=225&fit=crop',
      thumbnailHigh: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1280&h=720&fit=crop',
      views: 445000,
      likes: 19800,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      duration: '11:30',
      description: 'The exact system I use to turn one piece of content into 50+ social media posts. Works for any platform.',
      tags: ['Repurposing', 'Content Strategy', 'Social Media', 'Productivity'],
      category: 'business',
      trending: true,
      trendingRank: 18,
      engagement: 4.45
    }
  ];

  // Filter by category if specified
  let filteredVideos = baseVideos;
  if (category !== 'all') {
    filteredVideos = baseVideos.filter(v => v.category === category);
  }

  // Sort by trending rank
  filteredVideos.sort((a, b) => a.trendingRank - b.trendingRank);

  return filteredVideos.map(video => ({
    ...video,
    url: `https://youtube.com/watch?v=${video.id}`,
    channelUrl: `https://youtube.com/channel/${video.channelId}`,
    viewsFormatted: formatNumber(video.views),
    likesFormatted: formatNumber(video.likes),
    publishedRelative: getRelativeTime(video.publishedAt)
  }));
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
