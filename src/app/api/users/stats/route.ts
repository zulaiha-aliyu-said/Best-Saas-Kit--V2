import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/database';
import { withCache } from '@/lib/cache';

export const runtime = 'nodejs';

// Enable revalidation every 60 seconds
export const revalidate = 60;

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

    // Get user statistics with caching (60 seconds)
    const stats = await withCache(
      `user-stats:${session.user.id}`,
      () => getUserStats(),
      60000
    );

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });

  } catch (error) {
    console.error('User stats API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
