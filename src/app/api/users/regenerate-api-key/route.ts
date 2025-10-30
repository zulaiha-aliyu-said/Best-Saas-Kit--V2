import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, generateUserApiKey } from '@/lib/database';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id; // Keep as string to avoid precision loss
    const newApiKey = await generateUserApiKey(userId);
    
    return NextResponse.json({ 
      message: "API key regenerated successfully",
      apiKey: newApiKey 
    });
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}







