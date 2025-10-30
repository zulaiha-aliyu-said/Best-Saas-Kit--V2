import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getAdminRepurposedContentAnalytics } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminAccess();

    // Get repurposed content analytics
    const analytics = await getAdminRepurposedContentAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin repurposed content analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}


