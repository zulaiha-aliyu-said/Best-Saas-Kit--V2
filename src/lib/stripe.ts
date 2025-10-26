// Edge-compatible Stripe helpers implemented using fetch/Web Crypto
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

function getStripeSecretKey(): string {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not configured');
  return apiKey;
}

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
  const apiKey = getStripeSecretKey();
  const body = new URLSearchParams();
  body.set('email', email);
  if (name) body.set('name', name);
  const res = await fetch(`${STRIPE_API_BASE}/customers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe create customer failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// Create checkout session for Pro plan
export async function createCheckoutSession(
  customerId: string,
  userId: number,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  const apiKey = getStripeSecretKey();
  const body = new URLSearchParams();
  body.set('customer', customerId);
  body.set('mode', 'payment');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  // line_items[0]
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', STRIPE_CONFIG.PRO_PLAN.currency);
  body.set('line_items[0][price_data][product_data][name]', STRIPE_CONFIG.PRO_PLAN.name);
  body.set('line_items[0][price_data][product_data][description]', STRIPE_CONFIG.PRO_PLAN.description);
  body.set('line_items[0][price_data][unit_amount]', String(STRIPE_CONFIG.PRO_PLAN.price));
  // metadata
  body.set('metadata[plan]', 'pro');
  body.set('metadata[userId]', userId.toString());
  body.set('metadata[userEmail]', userEmail);

  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe checkout session failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// Create Stripe coupon for discount code
export async function createStripeCoupon(
  discountCode: string,
  discountType: 'percentage' | 'fixed',
  discountValue: number
) {
  try {
    const apiKey = getStripeSecretKey();
    const body = new URLSearchParams();
    body.set('id', `discount_${discountCode.toLowerCase()}`);
    body.set('name', `Discount Code: ${discountCode}`);
    body.set('duration', 'once');
    if (discountType === 'percentage') {
      body.set('percent_off', String(Math.round(discountValue)));
    } else {
      const amountInCents = discountValue < 100 ? discountValue * 100 : discountValue;
      body.set('amount_off', String(Math.round(amountInCents)));
      body.set('currency', STRIPE_CONFIG.PRO_PLAN.currency);
    }
    const res = await fetch(`${STRIPE_API_BASE}/coupons`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stripe create coupon failed: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Stripe coupon creation error:', error);
    throw error;
  }
}

// Delete Stripe coupon
export async function deleteStripeCoupon(couponId: string) {
  try {
    const apiKey = getStripeSecretKey();
    const res = await fetch(`${STRIPE_API_BASE}/coupons/${encodeURIComponent(couponId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stripe delete coupon failed: ${res.status} ${text}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error deleting Stripe coupon:', error);
    throw error;
  }
}

// Create checkout session with optional discount
export async function createCheckoutSessionWithDiscount(
  customerId: string,
  userId: number,
  userEmail: string,
  successUrl: string,
  cancelUrl: string,
  discountCouponId?: string
) {
  const apiKey = getStripeSecretKey();
  const body = new URLSearchParams();
  body.set('customer', customerId);
  body.set('mode', 'payment');
  body.set('success_url', successUrl);
  body.set('cancel_url', cancelUrl);
  // line_items[0]
  body.set('line_items[0][quantity]', '1');
  body.set('line_items[0][price_data][currency]', STRIPE_CONFIG.PRO_PLAN.currency);
  body.set('line_items[0][price_data][product_data][name]', STRIPE_CONFIG.PRO_PLAN.name);
  body.set('line_items[0][price_data][product_data][description]', STRIPE_CONFIG.PRO_PLAN.description);
  body.set('line_items[0][price_data][unit_amount]', String(STRIPE_CONFIG.PRO_PLAN.price));
  // metadata
  body.set('metadata[plan]', 'pro');
  body.set('metadata[userId]', userId.toString());
  body.set('metadata[userEmail]', userEmail);
  // discount
  if (discountCouponId) {
    body.set('discounts[0][coupon]', discountCouponId);
  }

  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe checkout session (discount) failed: ${res.status} ${text}`);
  }
  return await res.json();
}

// Verify webhook signature
export async function verifyWebhookSignature(body: string, signatureHeader: string) {
  // Implements basic signature verification compatible with Edge/Web Crypto
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');

  if (!signatureHeader) throw new Error('Missing Stripe-Signature header');

  // Parse header: t=timestamp, v1=signature
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), v];
    })
  ) as Record<string, string>;

  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1) throw new Error('Invalid Stripe-Signature header');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(`${t}.${body}`);
  const signatureArrayBuffer = await crypto.subtle.sign('HMAC', key, data);
  const signatureBytes = new Uint8Array(signatureArrayBuffer);
  const computed = Array.from(signatureBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (!timingSafeEqual(computed, v1)) {
    throw new Error('Invalid signature');
  }

  return JSON.parse(body);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
