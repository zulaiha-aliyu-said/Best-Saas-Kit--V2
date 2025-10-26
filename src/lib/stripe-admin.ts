const STRIPE_API_BASE = 'https://api.stripe.com/v1';

function getStripeSecretKey(): string {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not configured');
  return apiKey;
}

export async function getStripeEvents(limit = 10, types: string[] = []) {
  const apiKey = getStripeSecretKey();
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  for (const t of types) {
    params.append('types[]', t);
  }
  const res = await fetch(`${STRIPE_API_BASE}/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe list events failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.data || []).map((event: any) => ({
    id: event.id,
    type: event.type,
    created: new Date((event.created || 0) * 1000).toISOString(),
    data: event.data?.object,
  }));
}

export async function listCheckoutSessions(limit = 10) {
  const apiKey = getStripeSecretKey();
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe list sessions failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return (data.data || []).map((s: any) => ({
    id: s.id,
    payment_status: s.payment_status,
    customer: s.customer,
    amount_total: s.amount_total,
    metadata: s.metadata,
    created: new Date((s.created || 0) * 1000).toISOString(),
    success_url: s.success_url,
    cancel_url: s.cancel_url,
  }));
}

export async function getCheckoutSession(sessionId: string) {
  const apiKey = getStripeSecretKey();
  const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe get session failed: ${res.status} ${text}`);
  }
  const s = await res.json();
  return {
    id: s.id,
    payment_status: s.payment_status,
    customer: s.customer,
    amount_total: s.amount_total,
    metadata: s.metadata,
    created: new Date((s.created || 0) * 1000).toISOString(),
    success_url: s.success_url,
    cancel_url: s.cancel_url,
  };
}
