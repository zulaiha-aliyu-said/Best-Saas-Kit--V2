import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, generateUserApiKey } from '@/lib/database';

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

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
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








