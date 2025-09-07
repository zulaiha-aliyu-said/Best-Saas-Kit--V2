import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_CONFIG = {
  PRO_PLAN: {
    name: 'Pro Plan',
    price: 9900, // $99.00 in cents
    currency: 'usd',
    description: 'One-time payment for Pro features',
  },
} as const;

// Create Stripe customer
export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name: name || undefined,
  });
}

// Create checkout session for Pro plan
export async function createCheckoutSession(
  customerId: string,
  userId: number,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: STRIPE_CONFIG.PRO_PLAN.currency,
          product_data: {
            name: STRIPE_CONFIG.PRO_PLAN.name,
            description: STRIPE_CONFIG.PRO_PLAN.description,
          },
          unit_amount: STRIPE_CONFIG.PRO_PLAN.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment', // One-time payment
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan: 'pro',
      userId: userId.toString(),
      userEmail: userEmail,
    },
  });
}

// Verify webhook signature
export function verifyWebhookSignature(body: string, signature: string) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
