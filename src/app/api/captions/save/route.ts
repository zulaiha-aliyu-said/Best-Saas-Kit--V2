import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, platform, hashtags, tags, location } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Mock saving caption - in a real app, this would save to a database
    const savedCaption = {
      id: `cap_${Date.now()}`,
      content,
      platform: platform || 'all',
      hashtags: hashtags || [],
      tags: tags || [],
      location: location || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      caption: savedCaption,
      message: 'Caption saved successfully'
    });

  } catch (error) {
    console.error('Error saving caption:', error);
    return NextResponse.json(
      { error: 'Failed to save caption' },
      { status: 500 }
    );
  }
}