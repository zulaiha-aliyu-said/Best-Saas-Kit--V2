import { NextRequest, NextResponse } from 'next/server';
import { verifyFlutterwaveWebhookSignature, verifyFlutterwaveTransaction, FLUTTERWAVE_CONFIG } from '@/lib/flutterwave';
import { getUserByEmail, getUserById, updateUserSubscription, addCredits } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature header
    if (!verifyFlutterwaveWebhookSignature(request.headers)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = await request.json();
    const event = payload?.event; // e.g., 'charge.completed'
    const data = payload?.data;

    if (!event || !data) {
      return NextResponse.json({ received: true });
    }

    // Only process successful charge events
    if (event === 'charge.completed' && data.status === 'successful') {
      try {
        // Verify the transaction with Flutterwave just to be safe
        const txId = data.id;
        const verify = await verifyFlutterwaveTransaction(txId);
        const verifiedAmount = verify?.data?.amount;
        const verifiedCurrency = verify?.data?.currency;

        if (
          verifiedAmount === FLUTTERWAVE_CONFIG.PRO_TRIAL.amount &&
          verifiedCurrency?.toUpperCase() === FLUTTERWAVE_CONFIG.CURRENCY
        ) {
          // Extract user from meta
          const meta = data.meta || {};
          const userId = meta.userId as string | undefined;
          const userEmail = meta.userEmail as string | undefined;

          let user = null;
          if (userId) {
            try { user = await getUserById(userId); } catch {}
          }
          if (!user && userEmail) {
            try { user = await getUserByEmail(userEmail); } catch {}
          }

          if (user) {
            // Activate Pro on trial purchase and add modest credits for testing
            const uid = user.id;
            await updateUserSubscription(uid, {
              subscription_status: 'pro',
              subscription_id: String(txId),
            });
            // Add trial credits (smaller than Stripe path)
            await addCredits(uid, 200);
          }
        }
      } catch (err) {
        console.error('Flutterwave webhook processing error:', err);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';


