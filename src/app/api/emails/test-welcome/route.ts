import { NextRequest, NextResponse } from 'next/server';
import { createWelcomeEmail, sendEmail } from '@/lib/resend';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail, userName } = body;

    if (!testEmail) {
      return NextResponse.json(
        { error: 'testEmail is required' },
        { status: 400 }
      );
    }

    // Create and send welcome email
    const emailData = createWelcomeEmail(userName || 'Test User', testEmail);
    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test welcome email sent successfully',
        emailId: result.emailId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview the email HTML
export async function GET() {
  const emailData = createWelcomeEmail('John Doe', 'john@example.com');
  
  return new NextResponse(emailData.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}


