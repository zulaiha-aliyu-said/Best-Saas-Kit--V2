import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, getUserWritingStyle } from '@/lib/database';

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

    // Get user from database
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's writing style
    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
    const styleData = await getUserWritingStyle(userId);

    return NextResponse.json({
      success: true,
      profile: styleData.profile,
      confidence_score: styleData.confidence_score,
      sample_count: styleData.sample_count,
      style_enabled: styleData.style_enabled,
      has_style: styleData.profile !== null,
      can_enable: styleData.confidence_score >= 60,
    });

  } catch (error) {
    console.error('Style profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch style profile' },
      { status: 500 }
    );
  }
}







