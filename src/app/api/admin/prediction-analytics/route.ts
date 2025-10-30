import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getPredictionAccuracyStats, getAdminPredictionAnalytics } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminAccess();

    // Get prediction analytics
    const [accuracyStats, adminAnalytics] = await Promise.all([
      getPredictionAccuracyStats(),
      getAdminPredictionAnalytics()
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        accuracy: accuracyStats,
        admin: adminAnalytics
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Admin prediction analytics error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}


