import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const runtime = 'edge';

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

    // Mock data for saved captions - in a real app, this would come from a database
    const mockSavedCaptions = [
      {
        id: 'cap1',
        content: 'Excited to share our new product launch! Check it out now. #productlaunch #innovation',
        platform: 'instagram',
        hashtags: ['productlaunch', 'innovation'],
        tags: [],
        location: null,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'cap2',
        content: 'A quick tip for boosting your productivity this week: prioritize your top 3 tasks. #productivity #worklife',
        platform: 'linkedin',
        hashtags: ['productivity', 'worklife'],
        tags: [],
        location: null,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
      },
      {
        id: 'cap3',
        content: 'Behind the scenes of our latest project! So much hard work goes into this. #bts #creativeprocess',
        platform: 'x',
        hashtags: ['bts', 'creativeprocess'],
        tags: [],
        location: null,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
      },
      {
        id: 'cap4',
        content: 'Weekly newsletter: AI trends and insights for content creators. Don\'t miss out on the latest updates! #newsletter #aitrends',
        platform: 'email',
        hashtags: ['newsletter', 'aitrends'],
        tags: [],
        location: null,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      },
      {
        id: 'cap5',
        content: 'Quick tip: Use AI to generate engaging captions for your social media posts. Save time and boost engagement! #aitips #socialmedia',
        platform: 'x',
        hashtags: ['aitips', 'socialmedia'],
        tags: [],
        location: null,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
      }
    ];

    return NextResponse.json({
      success: true,
      captions: mockSavedCaptions
    });

  } catch (error) {
    console.error('Error loading captions:', error);
    return NextResponse.json(
      { error: 'Failed to load captions' },
      { status: 500 }
    );
  }
}
