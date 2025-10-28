import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserRepurposedContentStats } from '@/lib/database';

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

    // Ensure user exists (auto-create if missing)
    const { ensureUserExists } = await import('@/lib/ensure-user');
    const ensure = await ensureUserExists();
    if (!ensure.success) {
      return NextResponse.json({ error: ensure.error || 'Unauthorized' }, { status: ensure.status || 401 });
    }

    const userId: string | number = ensure.user!.id;

    // Get user repurposed content statistics
    const stats = await getUserRepurposedContentStats(userId as any);

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Repurposed content stats error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}



