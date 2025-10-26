import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-auth';
import { getStripeEvents, listCheckoutSessions, getCheckoutSession } from '@/lib/stripe-admin';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminAccess();

    // Get recent webhook events from Stripe
    const events = await getStripeEvents(10, [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
    ]);

    // Get recent checkout sessions
    const sessions = await listCheckoutSessions(10);

    return NextResponse.json({
      webhook_events: events,
      checkout_sessions: sessions,
    });

  } catch (error) {
    console.error('Webhook debug error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    await requireAdminAccess();

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get specific checkout session details
    const session = await getCheckoutSession(sessionId);

    return NextResponse.json({
      session
    });

  } catch (error) {
    console.error('Session debug error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
