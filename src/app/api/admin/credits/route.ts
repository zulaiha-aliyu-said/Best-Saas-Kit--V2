import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getCreditStats } from '@/lib/database';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authResult = await requireAdminAccess();
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const stats = await getCreditStats();

    return NextResponse.json({
      ...stats,
      admin: authResult.admin.email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin credits stats API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
