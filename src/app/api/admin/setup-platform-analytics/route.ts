import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { pool } from "@/lib/database";
import { PLATFORM_OPTIMIZATION_SQL } from '@/sql/platform-optimization-schema';

export const runtime = 'edge';

/**
 * POST /api/admin/setup-platform-analytics
 * Run the platform optimization analytics schema setup
 * Admin only endpoint
 */
export async function POST() {
  try {
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    console.log('🚀 Setting up Platform Optimization Analytics schema...');

    // Load SQL from embedded string (Edge-compatible)
    const sql = PLATFORM_OPTIMIZATION_SQL;

    console.log('📖 Executing SQL schema...');

    // Execute the SQL
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('✅ Platform optimization analytics schema created successfully!');
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: "Platform optimization analytics schema created successfully!",
      created: [
        "platform_optimization_analytics table",
        "get_user_optimization_stats() function",
        "get_user_platform_breakdown() function",
        "get_admin_optimization_stats() function",
        "get_platform_popularity() function",
        "get_optimization_trends() function",
        "insert_optimization_analytics() function"
      ]
    });
  } catch (error: any) {
    console.error('❌ Error setting up platform optimization analytics:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to setup analytics',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}




