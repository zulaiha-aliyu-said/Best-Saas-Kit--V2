import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getAllUsers, searchUsers } from '@/lib/database';

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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let users;
    if (search) {
      users = await searchUsers(search);
    } else {
      users = await getAllUsers();
    }

    return NextResponse.json({
      users,
      total: users.length,
      admin: authResult.admin.email
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
