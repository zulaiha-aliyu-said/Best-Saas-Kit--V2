import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Get post analytics
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
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ 
        error: 'Post ID is required' 
      }, { status: 400 });
    }

    const ayrshareClient = getAyrshareClient();
    const analytics = await ayrshareClient.getPostAnalytics(postId);

    return NextResponse.json({ 
      success: true, 
      analytics,
      count: analytics.length 
    });
  } catch (error: any) {
    console.error('Error fetching post analytics:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch post analytics' 
    }, { status: 500 });
  }
}







