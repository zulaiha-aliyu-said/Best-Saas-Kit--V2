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

    const { 
      userId, 
      type, 
      title, 
      message, 
      actionUrl, 
      actionText, 
      icon 
    } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const result = await pool.query(
      `INSERT INTO notifications (
        user_id, type, title, message, action_url, action_text, icon
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [userId, type, title, message, actionUrl || null, actionText || null, icon || 'Sparkles']
    );

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}



