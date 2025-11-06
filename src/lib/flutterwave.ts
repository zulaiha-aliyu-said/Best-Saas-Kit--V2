const FLW_API_BASE = 'https://api.flutterwave.com/v3';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export const FLUTTERWAVE_CONFIG = {
  CURRENCY: 'USD',
  PRO_TRIAL: {
    name: 'Pro Trial (First Month)',
    amount: 5,
    description: 'Intro month access to Pro features',
  },
} as const;

export interface FlutterwavePaymentInit {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: { email: string; name?: string };
  meta?: Record<string, string>;
  customizations?: { title?: string; description?: string };
}

export async function createFlutterwavePaymentLink(body: FlutterwavePaymentInit) {
  const secret = requireEnv('FLW_SECRET_KEY');
  const res = await fetch(`${FLW_API_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave create payment failed: ${res.status} ${text}`);
  }
  return await res.json();
}

export async function verifyFlutterwaveTransaction(transactionId: string | number) {
  const secret = requireEnv('FLW_SECRET_KEY');
  const res = await fetch(`${FLW_API_BASE}/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Flutterwave verify failed: ${res.status} ${text}`);
  }
  return await res.json();
}

export function verifyFlutterwaveWebhookSignature(requestHeaders: Headers): boolean {
  const hashHeader = requestHeaders.get('verif-hash');
  const secretHash = process.env.FLW_WEBHOOK_SECRET || process.env.FLW_SECRET_HASH;
  if (!secretHash) throw new Error('FLW_WEBHOOK_SECRET/FLW_SECRET_HASH is not configured');
  if (!hashHeader) return false;
  // For Flutterwave, the verif-hash must equal the configured secret hash
  return hashHeader === secretHash;
}


