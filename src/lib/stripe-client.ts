"use client"

import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Lazily initialize Stripe and guard against missing publishable key
let stripePromise: Promise<Stripe | null> | null = null;

function getStripePromise(): Promise<Stripe | null> | null {
  if (stripePromise) return stripePromise;
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk) {
    return null;
  }
  stripePromise = loadStripe(pk);
  return stripePromise;
}

export const redirectToCheckout = async (sessionId: string) => {
  const promise = getStripePromise();
  if (!promise) {
    throw new Error(
      'Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local and restart the dev server.'
    );
  }

  const stripe = await promise;
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
};
