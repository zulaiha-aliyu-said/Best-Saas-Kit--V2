import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Upload media file
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'File is required' 
      }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images and videos are allowed.' 
      }, { status: 400 });
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 100MB.' 
      }, { status: 400 });
    }

    const ayrshareClient = getAyrshareClient();
    const mediaUrl = await ayrshareClient.uploadMedia(file);

    return NextResponse.json({ 
      success: true, 
      mediaUrl,
      message: 'Media uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload media' 
    }, { status: 500 });
  }
}







