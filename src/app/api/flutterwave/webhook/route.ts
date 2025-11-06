import { NextRequest, NextResponse } from 'next/server';
import { verifyFlutterwaveWebhookSignature, verifyFlutterwaveTransaction, FLUTTERWAVE_CONFIG } from '@/lib/flutterwave';
import { getUserByEmail, getUserById, updateUserSubscription, addCredits, pool } from '@/lib/database';

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
        const verifiedCurrency = verify?.data?.currency?.toUpperCase();

        if (verifiedCurrency !== FLUTTERWAVE_CONFIG.CURRENCY) {
          return NextResponse.json({ received: true });
        }

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

        if (!user) {
          return NextResponse.json({ received: true });
        }

        // Pro Trial handling
        if (meta.plan === 'pro_trial' && verifiedAmount === FLUTTERWAVE_CONFIG.PRO_TRIAL.amount) {
          const uid = user.id;
          await updateUserSubscription(uid, {
            subscription_status: 'pro',
            subscription_id: String(txId),
          });
          // Add trial credits (smaller than Stripe path)
          await addCredits(uid, 200);
        }

        // LTD purchase handling (Black Friday discounted prices)
        if (meta.plan === 'ltd') {
          const tier = String(meta.tier || '');
          const TIER_MONTHLY: Record<string, number> = { '1': 100, '2': 300, '3': 750, '4': 2000 };
          // Black Friday discounted prices
          const TIER_AMOUNT: Record<string, number> = { '1': 49, '2': 119, '3': 219, '4': 399 };
          const monthly = TIER_MONTHLY[tier];
          const expectedAmount = TIER_AMOUNT[tier];
          
          if (monthly && expectedAmount && verifiedAmount === expectedAmount) {
            const client = await pool.connect();
            try {
              await client.query(
                `UPDATE users 
                 SET plan_type = 'ltd',
                     subscription_status = $1,
                     ltd_tier = $2,
                     monthly_credit_limit = $3,
                     credit_reset_date = COALESCE(credit_reset_date, CURRENT_TIMESTAMP + INTERVAL '1 month'),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4`,
                [
                  `ltd_tier_${tier}`,
                  Number(tier),
                  monthly,
                  user.id,
                ]
              );
              // Add upfront credits equal to monthly limit
              await addCredits(user.id, monthly);
            } finally {
              client.release();
            }
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


