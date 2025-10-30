import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId, insertPost, insertSchedule } from "@/lib/database";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await getUserByGoogleId(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

    // Keep user ID as string to avoid precision loss with large numbers
    const userId = user.id;

    const body = await req.json();
    const { platform, content, scheduledAt, timezone = 'UTC' } = body || {};
    if (!platform || !content || !scheduledAt) {
      return NextResponse.json({ error: 'platform, content, scheduledAt are required' }, { status: 400 });
    }

    // Create a post record and schedule it
    const post = await insertPost({ userId, platform, body: String(content), status: 'scheduled' });
    const schedule = await insertSchedule({ userId, postId: post.id, scheduledAt: new Date(scheduledAt), timezone });

    return NextResponse.json({ success: true, schedule, post });
  } catch (e: any) {
    console.error('schedule error', e);
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}