import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { pool } from "@/lib/database";
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * POST /api/admin/setup-platform-analytics
 * Run the platform optimization analytics schema setup
 * Admin only endpoint
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    console.log('🚀 Setting up Platform Optimization Analytics schema...');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'sql-queries', '13-create-platform-optimization-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

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




