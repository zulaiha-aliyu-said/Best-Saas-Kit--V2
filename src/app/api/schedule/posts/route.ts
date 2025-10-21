import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock data for scheduled posts - in a real app, this would come from a database
    const mockScheduledPosts = [
      {
        id: 'post_1',
        accountId: '1',
        platform: 'x',
        platformName: 'X',
        platformIcon: '𝕏',
        content: 'Excited to share our latest AI insights! Check out how machine learning is transforming content creation.',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        media: [],
        hashtags: ['#AI', '#MachineLearning', '#ContentCreation'],
        options: {}
      },
      {
        id: 'post_2',
        accountId: '2',
        platform: 'linkedin',
        platformName: 'LinkedIn',
        platformIcon: '💼',
        content: 'New blog post: The Future of AI in Marketing. Learn how to leverage AI tools for better engagement.',
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4.5 * 60 * 60 * 1000).toISOString(), // 2 days + 4.5 hours
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        media: [],
        hashtags: ['#AI', '#Marketing', '#BlogPost'],
        options: {}
      },
      {
        id: 'post_3',
        accountId: '3',
        platform: 'instagram',
        platformName: 'Instagram',
        platformIcon: '📸',
        content: 'Behind the scenes of our content creation process! ✨ #ContentCreation #AI',
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 3 days + 6 hours
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        media: ['image1.jpg'],
        hashtags: ['#ContentCreation', '#AI', '#BehindTheScenes'],
        options: {}
      },
      {
        id: 'post_4',
        accountId: '4',
        platform: 'email',
        platformName: 'Email',
        platformIcon: '✉️',
        content: 'Weekly newsletter: AI trends and insights for content creators. Don\'t miss out on the latest updates!',
        scheduledTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // 4 days + 8 hours
        status: 'published',
        createdAt: new Date().toISOString(),
        media: [],
        hashtags: ['#Newsletter', '#AITrends'],
        options: {}
      },
      {
        id: 'post_5',
        accountId: '1',
        platform: 'x',
        platformName: 'X',
        platformIcon: '𝕏',
        content: 'Quick tip: Use AI to generate engaging captions for your social media posts. Save time and boost engagement!',
        scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(), // 5 days + 14 hours
        status: 'failed',
        createdAt: new Date().toISOString(),
        media: [],
        hashtags: ['#AITips', '#SocialMedia', '#ContentCreation'],
        options: {},
        errorMessage: 'Failed to authenticate with X API'
      }
    ];

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    let filteredPosts = mockScheduledPosts;

    // Filter by platform
    if (platform && platform !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.platform === platform);
    }

    // Filter by status
    if (status && status !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    }

    // Sort by scheduled time (ascending)
    filteredPosts.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

    return NextResponse.json({
      success: true,
      posts: filteredPosts,
      total: filteredPosts.length
    });

  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  }
}

