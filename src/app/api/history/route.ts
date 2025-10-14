import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId, listRecentPosts } from "@/lib/database";

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await getUserByGoogleId(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

  const posts = await listRecentPosts(user.id, 20);
  return NextResponse.json({ posts });
}