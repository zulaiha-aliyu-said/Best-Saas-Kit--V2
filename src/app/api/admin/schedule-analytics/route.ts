import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getAdminScheduleAnalytics } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminAccess();

    // Get schedule analytics
    const analytics = await getAdminScheduleAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin schedule analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}



