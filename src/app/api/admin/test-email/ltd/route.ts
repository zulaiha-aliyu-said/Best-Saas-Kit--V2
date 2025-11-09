import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByGoogleId, pool } from '@/lib/database';
import { sendEmail, createLTDActivationEmail } from '@/lib/resend';

export const runtime = 'nodejs';

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

    // Read optional overrides from form data
    const contentType = request.headers.get('content-type') || '';
    let tierOverride: number | undefined;
    let monthlyOverride: number | undefined;

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      tierOverride = body.tier ? Number(body.tier) : undefined;
      monthlyOverride = body.monthly ? Number(body.monthly) : undefined;
    } else {
      const form = await request.formData();
      const t = form.get('tier');
      const m = form.get('monthly');
      if (t) tierOverride = Number(t);
      if (m) monthlyOverride = Number(m);
    }

    // Determine tier/monthly
    let tier = typeof tierOverride === 'number' && !Number.isNaN(tierOverride) ? tierOverride : (user.plan_type === 'ltd' && user.ltd_tier ? Number(user.ltd_tier) : 2);
    let monthly = typeof monthlyOverride === 'number' && !Number.isNaN(monthlyOverride) ? monthlyOverride : (user.plan_type === 'ltd' && user.monthly_credit_limit ? Number(user.monthly_credit_limit) : 300);

    // Build and send email
    const email = createLTDActivationEmail(user.name || user.email, user.email, tier, monthly);
    const result = await sendEmail(email);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, emailId: result.emailId });
  } catch (error) {
    console.error('Test LTD email send error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
