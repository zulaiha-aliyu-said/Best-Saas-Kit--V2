import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId } from '@/lib/database';
import { createFlutterwavePaymentLink } from '@/lib/flutterwave';

export const runtime = 'edge';

// Black Friday discounted prices
const LTD_TIER_CONFIG: Record<string, { amount: number; monthly: number; title: string; description: string }> = {
  '1': { amount: 49, monthly: 100, title: 'LTD Tier 1', description: 'Lifetime deal - Tier 1 (Black Friday)' },
  '2': { amount: 119, monthly: 300, title: 'LTD Tier 2', description: 'Lifetime deal - Tier 2 (Black Friday)' },
  '3': { amount: 219, monthly: 750, title: 'LTD Tier 3', description: 'Lifetime deal - Tier 3 (Black Friday)' },
  '4': { amount: 399, monthly: 2000, title: 'LTD Tier 4', description: 'Lifetime deal - Tier 4 (Black Friday)' },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();
    const cfg = LTD_TIER_CONFIG[String(tier)];
    if (!cfg) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const txRef = `ltd_t${tier}_${user.id}_${Date.now()}`;

    const init = {
      tx_ref: txRef,
      amount: cfg.amount,
      currency: 'USD',
      redirect_url: `${siteUrl}/dashboard/billing?success=true`,
      customer: { email: user.email, name: user.name || undefined },
      meta: {
        plan: 'ltd',
        tier: String(tier),
        userId: user.id,
        userEmail: user.email,
      },
      customizations: {
        title: cfg.title,
        description: cfg.description,
      },
    } as const;

    const result = await createFlutterwavePaymentLink(init);
    const link = result?.data?.link;
    if (!link) {
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ url: link, tx_ref: txRef });
  } catch (error) {
    console.error('Flutterwave LTD checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


