import { NextResponse } from "next/server";
import { fetchAllTrends } from "@/lib/trends-fetcher";

export const runtime = 'nodejs';

// Debug endpoint to test API fetching with detailed logs
export async function GET() {
  console.log('\n🔍 [DEBUG] Starting debug fetch...\n');
  
  try {
    const trends = await fetchAllTrends();
    
    const result = {
      success: true,
      trendsCount: trends.length,
      sources: trends.map(t => t.source).filter(Boolean),
      uniqueSources: [...new Set(trends.map(t => t.source).filter(Boolean))],
      sampleTrends: trends.slice(0, 3).map(t => ({
        title: t.title,
        source: t.source,
        badge: t.badge,
      })),
      timestamp: new Date().toISOString(),
    };
    
    console.log('\n🔍 [DEBUG] Result:', result, '\n');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('\n🔍 [DEBUG] Error:', error.message, '\n');
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
