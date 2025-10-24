import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user onboarding status
    const result = await pool.query(
      `SELECT 
        onboarding_completed,
        onboarding_step,
        onboarding_skipped,
        onboarding_completed_at
       FROM users 
       WHERE email = $1`,
      [session.user.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const status = result.rows[0];

    return NextResponse.json({ 
      success: true,
      onboardingCompleted: status.onboarding_completed || false,
      onboardingStep: status.onboarding_step || 0,
      onboardingSkipped: status.onboarding_skipped || false,
      onboardingCompletedAt: status.onboarding_completed_at,
    });
  } catch (error: any) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}



