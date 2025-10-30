import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, toggleUserStyleEnabled } from '@/lib/database';

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

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled parameter must be a boolean' },
        { status: 400 }
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

    // Toggle style enabled status
    const userId = user.id; // Keep as string to avoid precision loss
    await toggleUserStyleEnabled(userId, enabled);

    return NextResponse.json({
      success: true,
      style_enabled: enabled,
      message: enabled 
        ? 'Writing style is now active for content generation' 
        : 'Writing style has been disabled'
    });

  } catch (error) {
    console.error('Style toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle writing style' },
      { status: 500 }
    );
  }
}







