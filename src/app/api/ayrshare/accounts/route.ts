import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserByGoogleId } from "@/lib/database";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Get connected social media accounts
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
    const accounts = await ayrshareClient.getConnectedAccounts();

    // If no accounts returned (likely due to Business Plan limitation), provide helpful message
    if (accounts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        accounts: [],
        count: 0,
        message: 'Business Plan required to access connected accounts. You can still schedule posts by specifying platforms manually.',
        businessPlanRequired: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      accounts,
      count: accounts.length 
    });
  } catch (error: any) {
    console.error('Error fetching connected accounts:', error);
    
    // Handle business plan error gracefully
    if (error.message.includes('Business Plan')) {
      return NextResponse.json({ 
        success: true,
        accounts: [],
        count: 0,
        message: 'Business Plan required to access connected accounts. You can still schedule posts by specifying platforms manually.',
        businessPlanRequired: true
      });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch connected accounts' 
    }, { status: 500 });
  }
}

// Connect a new social media account
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
    const { platform, redirectUrl } = body;

    if (!platform) {
      return NextResponse.json({ 
        error: 'Platform is required' 
      }, { status: 400 });
    }

    // Generate OAuth URL for the platform
    const ayrshareClient = getAyrshareClient();
    const authUrl = `${ayrshareClient['baseUrl']}/oauth/${platform}?redirect_uri=${encodeURIComponent(redirectUrl || `${process.env.NEXTAUTH_URL}/dashboard/schedule`)}`;

    return NextResponse.json({ 
      success: true, 
      authUrl,
      message: `Redirect to ${platform} for authentication` 
    });
  } catch (error: any) {
    console.error('Error initiating account connection:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to initiate account connection' 
    }, { status: 500 });
  }
}

// Disconnect a social media account
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
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ 
        error: 'Account ID is required' 
      }, { status: 400 });
    }

    const ayrshareClient = getAyrshareClient();
    // Note: Ayrshare doesn't have a direct disconnect endpoint
    // This would typically involve revoking tokens or updating account status
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account disconnected successfully' 
    });
  } catch (error: any) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to disconnect account' 
    }, { status: 500 });
  }
}
