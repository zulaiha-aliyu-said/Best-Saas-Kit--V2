import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, getUserScheduleAnalytics } from '@/lib/database';

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

    // Convert user ID to number for database function
    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

    // Get user schedule analytics
    const analytics = await getUserScheduleAnalytics(userId);

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Schedule analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}



