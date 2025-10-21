import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Get hashtag suggestions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const platform = searchParams.get('platform');

    if (!keyword) {
      return NextResponse.json({ 
        error: 'Keyword is required' 
      }, { status: 400 });
    }

    const ayrshareClient = getAyrshareClient();
    const hashtags = await ayrshareClient.getHashtagSuggestions(keyword, platform || undefined);

    return NextResponse.json({ 
      success: true, 
      hashtags,
      count: hashtags.length 
    });
  } catch (error: any) {
    console.error('Error fetching hashtag suggestions:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch hashtag suggestions' 
    }, { status: 500 });
  }
}







