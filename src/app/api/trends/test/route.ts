import { NextResponse } from "next/server";

// Simple test endpoint to verify API is working
export async function GET() {
  const envCheck = {
    hasRedditId: !!process.env.REDDIT_CLIENT_ID,
    hasRedditSecret: !!process.env.REDDIT_CLIENT_SECRET,
    hasNewsKey: !!process.env.NEWS_API_KEY,
    timestamp: new Date().toISOString(),
  };

  console.log('🧪 [Test Endpoint] API Keys Check:', envCheck);

  return NextResponse.json({
    status: 'ok',
    message: 'Trends API is working',
    environment: envCheck,
  });
}
