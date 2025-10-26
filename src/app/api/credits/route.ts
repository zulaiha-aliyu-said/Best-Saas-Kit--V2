import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserCredits } from '@/lib/database';
import { withCache } from '@/lib/cache';

export const runtime = 'edge';

// Enable revalidation every 30 seconds
export const revalidate = 30;

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cache credits for 30 seconds
    const credits = await withCache(
      `credits:${session.user.id}`,
      () => getUserCredits(session.user.id),
      30000
    );

    return NextResponse.json(
      { credits },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
