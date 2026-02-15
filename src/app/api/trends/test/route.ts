import { NextResponse } from "next/server";

export const runtime = 'nodejs';

// Test endpoint: verify trends API and which sources have credentials in this environment.
// In production, set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, NEWS_API_KEY in your host's Environment Variables.
export async function GET() {
  const envCheck = {
    reddit: !!process.env.REDDIT_CLIENT_ID && !!process.env.REDDIT_CLIENT_SECRET,
    news: !!process.env.NEWS_API_KEY,
    youtube: !!process.env.YOUTUBE_API_KEY,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({
    status: 'ok',
    message: 'Trends API is working. Configure Reddit/News/YouTube keys in production for live trends.',
    sourcesConfigured: envCheck,
  });
}