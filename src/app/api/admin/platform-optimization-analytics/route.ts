import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import {
  getAdminOptimizationStats,
  getPlatformPopularity,
  getOptimizationTrends,
} from "@/lib/database";

export const runtime = 'edge';

/**
 * GET /api/admin/platform-optimization-analytics
 * Get admin platform optimization analytics
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Get URL params for trends
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get optimization stats
    const [stats, platformPopularity, trends] = await Promise.all([
      getAdminOptimizationStats(),
      getPlatformPopularity(),
      getOptimizationTrends(days),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      platformPopularity,
      trends,
    });
  } catch (error: any) {
    console.error('Error fetching admin platform optimization analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}






