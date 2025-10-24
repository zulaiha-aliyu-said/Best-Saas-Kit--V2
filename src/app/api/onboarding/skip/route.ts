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

    // Mark onboarding as skipped
    await pool.query(
      `UPDATE users 
       SET onboarding_skipped = TRUE,
           onboarding_completed = TRUE,
           onboarding_completed_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding skipped'
    });
  } catch (error: any) {
    console.error('Error skipping onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    );
  }
}



