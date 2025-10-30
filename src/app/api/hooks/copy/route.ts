import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { pool } from '@/lib/database';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hookId } = await request.json();

    if (!hookId) {
      return NextResponse.json(
        { error: 'Hook ID is required' },
        { status: 400 }
      );
    }

    // Track the copy using the database function
    await pool.query('SELECT track_hook_copy($1)', [hookId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking hook copy:', error);
    return NextResponse.json(
      { error: 'Failed to track copy' },
      { status: 500 }
    );
  }
}




