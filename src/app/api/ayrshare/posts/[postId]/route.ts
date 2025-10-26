import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'edge';

// Update a scheduled post
export async function PUT(req: NextRequest) {
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

    const ayrshareClient = getAyrshareClient();
    
    const updates: any = {};
    if (platforms) updates.platforms = platforms;
    if (content) updates.text = content;
    if (scheduledAt) updates.scheduleDate = new Date(scheduledAt).toISOString();
    if (timezone) updates.timezone = timezone;
    if (mediaUrls) updates.mediaUrls = mediaUrls;
    if (hashtags) updates.hashtags = hashtags.map((tag: string) => tag.replace('#', ''));
    if (link) updates.link = link;
    if (location) {
      updates.location = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude
      };
    }

    const updatedPost = await ayrshareClient.updateScheduledPost(postId, updates);

    return NextResponse.json({ 
      success: true, 
      post: updatedPost,
      message: 'Post updated successfully' 
    });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update post' 
    }, { status: 500 });
  }
}

// Delete a scheduled post
export async function DELETE(req: NextRequest) {
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
    const success = await ayrshareClient.deleteScheduledPost(postId);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Post deleted successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to delete post' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete post' 
    }, { status: 500 });
  }
}

// Pause/Resume a scheduled post
export async function PATCH(req: NextRequest) {
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
    const action = searchParams.get('action'); // 'pause' or 'resume'

    if (!postId || !action) {
      return NextResponse.json({ 
        error: 'Post ID and action are required' 
      }, { status: 400 });
    }

    const ayrshareClient = getAyrshareClient();
    let success = false;

    if (action === 'pause') {
      success = await ayrshareClient.pauseScheduledPost(postId);
    } else if (action === 'resume') {
      success = await ayrshareClient.resumeScheduledPost(postId);
    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "pause" or "resume"' 
      }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Post ${action}d successfully` 
      });
    } else {
      return NextResponse.json({ 
        error: `Failed to ${action} post` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error(`Error ${req.url.includes('action=pause') ? 'pausing' : 'resuming'} post:`, error);
    return NextResponse.json({ 
      error: error.message || `Failed to ${req.url.includes('action=pause') ? 'pause' : 'resume'} post` 
    }, { status: 500 });
  }
}







