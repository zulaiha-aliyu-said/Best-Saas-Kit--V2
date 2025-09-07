import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { getUserByStripeCustomerId, updateUserSubscription, addCredits } from '@/lib/database';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === 'paid' && session.customer) {
          // Get user by Stripe customer ID
          const user = await getUserByStripeCustomerId(session.customer as string);
          
          if (user) {
            // Update user to Pro subscription
            await updateUserSubscription(user.id, {
              subscription_status: 'pro',
              stripe_customer_id: session.customer as string,
              subscription_id: session.id,
              // For one-time payment, no end date (lifetime access)
            });

            // Add bonus credits for Pro users (e.g., 1000 credits)
            await addCredits(user.id, 1000);

            console.log(`User ${user.email} upgraded to Pro plan`);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
