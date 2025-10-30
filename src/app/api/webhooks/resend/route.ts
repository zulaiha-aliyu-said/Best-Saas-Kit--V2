/**
 * Resend Webhook Handler
 * Receives email events: delivered, opened, clicked, bounced, complained
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEmailOpen, trackEmailClick, updateEmailStatus } from '@/lib/email-tracking';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📧 Resend webhook received:', body.type);
    console.log('📧 Event data:', JSON.stringify(body, null, 2));

    const { type, data } = body;

    // Extract email ID from the event
    const emailId = data?.email_id || data?.id;

    if (!emailId) {
      console.log('⚠️ No email ID in webhook data');
      return NextResponse.json({ received: true });
    }

    // Handle different event types
    switch (type) {
      case 'email.sent':
        console.log(`✅ Email ${emailId} sent`);
        break;

      case 'email.delivered':
        console.log(`✅ Email ${emailId} delivered`);
        await updateEmailStatus(emailId, 'delivered');
        break;

      case 'email.delivery_delayed':
        console.log(`⏳ Email ${emailId} delivery delayed`);
        break;

      case 'email.complained':
        console.log(`⚠️ Email ${emailId} marked as spam`);
        await updateEmailStatus(emailId, 'failed');
        break;

      case 'email.bounced':
        console.log(`❌ Email ${emailId} bounced`);
        await updateEmailStatus(emailId, 'bounced');
        break;

      case 'email.opened':
        console.log(`👁️ Email ${emailId} opened`);
        await trackEmailOpen(emailId);
        break;

      case 'email.clicked':
        console.log(`🖱️ Email ${emailId} clicked`);
        await trackEmailClick(emailId);
        break;

      default:
        console.log(`ℹ️ Unknown event type: ${type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    // Return 200 even on error to prevent Resend from retrying
    return NextResponse.json({ received: true, error: error.message });
  }
}

// Allow POST requests without authentication
export const dynamic = 'force-dynamic';
