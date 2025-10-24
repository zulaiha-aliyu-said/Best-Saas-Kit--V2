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

    const { rating, category, message, pageUrl, emailFollowup } = await req.json();

    if (!category || !message) {
      return NextResponse.json(
        { error: 'Category and message are required' },
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

    // Insert feedback
    const result = await pool.query(
      `INSERT INTO user_feedback 
       (user_id, rating, category, message, page_url, email_followup) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, rating || null, category, message, pageUrl || null, emailFollowup || false]
    );

    return NextResponse.json({
      success: true,
      feedbackId: result.rows[0].id,
      message: 'Thank you for your feedback!',
    });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}



