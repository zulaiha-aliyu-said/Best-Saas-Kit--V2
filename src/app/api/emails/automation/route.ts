import { NextRequest, NextResponse } from 'next/server';
import { runEmailAutomation, checkCreditWarnings, checkInactiveUsers, sendWeeklyPerformanceSummaries } from '@/lib/email-automation';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long-running automation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, secret } = body;

    // Simple secret check (in production, use proper authentication)
    if (secret !== process.env.EMAIL_AUTOMATION_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let result;

    switch (type) {
      case 'all':
        result = await runEmailAutomation();
        break;

      case 'credit_warning':
        result = await checkCreditWarnings();
        break;

      case 'reengagement':
        result = await checkInactiveUsers();
        break;

      case 'performance':
        result = await sendWeeklyPerformanceSummaries();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: all, credit_warning, reengagement, or performance' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email automation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for manual triggering (requires secret)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const type = searchParams.get('type') || 'all';

  if (secret !== process.env.EMAIL_AUTOMATION_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let result;

  try {
    switch (type) {
      case 'all':
        result = await runEmailAutomation();
        break;

      case 'credit_warning':
        result = await checkCreditWarnings();
        break;

      case 'reengagement':
        result = await checkInactiveUsers();
        break;

      case 'performance':
        result = await sendWeeklyPerformanceSummaries();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email automation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


