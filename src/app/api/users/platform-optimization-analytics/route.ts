import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId, getUserOptimizationStats, getUserPlatformBreakdown } from "@/lib/database";

export const runtime = 'nodejs';

/**
 * GET /api/users/platform-optimization-analytics
 * Get user's platform optimization analytics
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get database user
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get optimization stats
    const [stats, platformBreakdown] = await Promise.all([
      getUserOptimizationStats(user.id),
      getUserPlatformBreakdown(user.id),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      platformBreakdown,
    });
  } catch (error: any) {
    console.error('Error fetching platform optimization analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


