import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { tipId } = await req.json();

    if (!tipId) {
      return NextResponse.json(
        { error: 'Tip ID required' },
        { status: 400 }
      );
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Insert or update dismissed tip
    await pool.query(
      `INSERT INTO user_tips (user_id, tip_id, dismissed, dismissed_at) 
       VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, tip_id) 
       DO UPDATE SET dismissed = TRUE, dismissed_at = CURRENT_TIMESTAMP`,
      [userId, tipId]
    );

    return NextResponse.json({
      success: true,
      message: 'Tip dismissed',
    });
  } catch (error: any) {
    console.error('Error dismissing tip:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss tip' },
      { status: 500 }
    );
  }
}



