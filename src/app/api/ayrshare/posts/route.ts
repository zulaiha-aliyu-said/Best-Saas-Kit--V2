import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient, AYRSHARE_PLATFORMS } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Schedule a post using Ayrshare
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      platforms, 
      content, 
      scheduledAt, 
      timezone = 'UTC',
      mediaUrls = [],
      hashtags = [],
      link,
      location
    } = body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ 
        error: 'At least one platform is required' 
      }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ 
        error: 'Content is required' 
      }, { status: 400 });
    }

    // Map platforms to Ayrshare format
    const ayrsharePlatforms = platforms.map(platform => 
      AYRSHARE_PLATFORMS[platform as keyof typeof AYRSHARE_PLATFORMS] || platform
    );

    const ayrshareClient = getAyrshareClient();
    
    const postData = {
      text: content, // This will be converted to 'post' in the client
      platforms: ayrsharePlatforms,
      mediaUrls,
      scheduleDate: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      timezone,
      hashtags: hashtags.map((tag: string) => tag.replace('#', '')),
      link,
      location: location ? {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude
      } : undefined,
      autoHashtag: false,
      shortLink: false,
    };

    let scheduledPost;
    
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      // Schedule for later
      scheduledPost = await ayrshareClient.schedulePost(postData);
    } else {
      // Post immediately
      const { scheduleDate, ...immediatePostData } = postData;
      scheduledPost = await ayrshareClient.postNow(immediatePostData);
    }

    return NextResponse.json({ 
      success: true, 
      post: scheduledPost,
      message: scheduledAt ? 'Post scheduled successfully' : 'Post published successfully'
    });
  } catch (error: any) {
    console.error('Error scheduling post:', error);
    
    // Handle Premium/Business Plan requirement
    if (error.message && error.message.includes('Premium or Business Plan')) {
      return NextResponse.json({ 
        success: false,
        error: 'Premium or Business Plan Required',
        message: 'The Ayrshare API requires a Premium or Business Plan to schedule posts. Please upgrade your plan or use local scheduling.',
        upgradeUrl: 'https://www.ayrshare.com/business-plan-for-multiple-users/',
        planRequired: true
      }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to schedule post' 
    }, { status: 500 });
  }
}

// Get scheduled posts
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

    const ayrshareClient = getAyrshareClient();
    const posts = await ayrshareClient.getScheduledPosts();

    return NextResponse.json({ 
      success: true, 
      posts,
      count: posts.length 
    });
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch scheduled posts' 
    }, { status: 500 });
  }
}

