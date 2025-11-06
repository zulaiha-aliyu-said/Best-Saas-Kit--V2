import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId } from '@/lib/database';
import { createFlutterwavePaymentLink, FLUTTERWAVE_CONFIG } from '@/lib/flutterwave';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByGoogleId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const txRef = `pro_trial_${user.id}_${Date.now()}`;

    const init = {
      tx_ref: txRef,
      amount: FLUTTERWAVE_CONFIG.PRO_TRIAL.amount,
      currency: FLUTTERWAVE_CONFIG.CURRENCY,
      redirect_url: `${siteUrl}/dashboard/billing?success=true`,
      customer: { email: user.email, name: user.name || undefined },
      meta: {
        plan: 'pro_trial',
        userId: user.id,
        userEmail: user.email,
      },
      customizations: {
        title: FLUTTERWAVE_CONFIG.PRO_TRIAL.name,
        description: FLUTTERWAVE_CONFIG.PRO_TRIAL.description,
      },
    } as const;

    const result = await createFlutterwavePaymentLink(init);

    // Flutterwave responds with data.link where the hosted payment page lives
    const link = result?.data?.link;
    if (!link) {
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ url: link, tx_ref: txRef });
  } catch (error) {
    console.error('Flutterwave checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


