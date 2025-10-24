import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import pool from '@/lib/db';
import { isAdminEmail } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { feedbackId, status, adminResponse } = await req.json();

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'Feedback ID required' },
        { status: 400 }
      );
    }

    // Update feedback
    await pool.query(
      `UPDATE user_feedback 
       SET status = COALESCE($1, status),
           admin_response = COALESCE($2, admin_response),
           responded_at = CASE WHEN $2 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE responded_at END,
           responded_by = CASE WHEN $2 IS NOT NULL THEN $3 ELSE responded_by END
       WHERE id = $4`,
      [status, adminResponse, session.user.email, feedbackId]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}



