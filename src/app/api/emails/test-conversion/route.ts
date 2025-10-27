import { NextRequest, NextResponse } from 'next/server';
import { 
  createCreditWarningUpgradeEmail,
  createReengagementEmail,
  createPerformanceSummaryEmail,
  sendEmail 
} from '@/lib/resend';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailType, testEmail, userName } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'testEmail is required' },
        { status: 400 }
      );
    }

    if (!emailType) {
      return NextResponse.json(
        { error: 'emailType is required (credit_warning, reengagement, or performance)' },
        { status: 400 }
      );
    }

    let emailData;

    switch (emailType) {
      case 'credit_warning':
        emailData = createCreditWarningUpgradeEmail(
          userName || 'Test User',
          testEmail,
          2, // remaining credits
          10, // monthly limit
          'free'
        );
        break;

      case 'reengagement':
        emailData = createReengagementEmail(
          userName || 'Test User',
          testEmail,
          30, // days since last login
          15 // total posts created
        );
        break;

      case 'performance':
        emailData = createPerformanceSummaryEmail(
          userName || 'Test User',
          testEmail,
          {
            postsCreated: 47,
            creditsUsed: 35,
            creditsRemaining: 15,
            monthlyLimit: 50,
            topPlatform: 'LinkedIn',
            timeSaved: 12,
            weekNumber: 3,
            comparedToLastWeek: 25
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown emailType: ${emailType}. Use: credit_warning, reengagement, or performance` },
          { status: 400 }
        );
    }

    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${emailType} email sent successfully`,
        emailId: result.emailId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test conversion email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview emails
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'credit_warning';

  let emailData;

  switch (type) {
    case 'credit_warning':
      emailData = createCreditWarningUpgradeEmail(
        'John Doe',
        'john@example.com',
        2,
        10,
        'free'
      );
      break;

    case 'reengagement':
      emailData = createReengagementEmail(
        'John Doe',
        'john@example.com',
        30,
        15
      );
      break;

    case 'performance':
      emailData = createPerformanceSummaryEmail(
        'John Doe',
        'john@example.com',
        {
          postsCreated: 47,
          creditsUsed: 35,
          creditsRemaining: 15,
          monthlyLimit: 50,
          topPlatform: 'LinkedIn',
          timeSaved: 12,
          weekNumber: 3,
          comparedToLastWeek: 25
        }
      );
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid type. Use: credit_warning, reengagement, or performance' },
        { status: 400 }
      );
  }
  
  return new NextResponse(emailData.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}


