import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, createPerformanceFeedback } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      prediction_id, 
      actual_likes, 
      actual_comments, 
      actual_shares, 
      actual_reach, 
      actual_engagement_rate,
      feedback_notes,
      accuracy_rating 
    } = await request.json();

    if (!prediction_id) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create performance feedback
    const userId = typeof user.id === 'string' ? String(user.id) : user.id;
    const feedback = await createPerformanceFeedback({
      prediction_id,
      user_id: userId,
      actual_likes: actual_likes || 0,
      actual_comments: actual_comments || 0,
      actual_shares: actual_shares || 0,
      actual_reach: actual_reach || 0,
      actual_engagement_rate: actual_engagement_rate || 0,
      feedback_notes: feedback_notes || null,
      accuracy_rating: accuracy_rating || null
    });

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Feedback submitted successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}



