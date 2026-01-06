import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserByGoogleId } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createLTDActivationEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function LTDEmailPreviewPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin/test-email/ltd');
  }

  const user = await getUserByGoogleId(session.user.id);
  if (!user) {
    redirect('/auth/signin?callbackUrl=/admin/test-email/ltd');
  }

  // Use user's current LTD tier if available; otherwise provide a sample (Tier 2)
  const tier = user.plan_type === 'ltd' && user.ltd_tier ? Number(user.ltd_tier) : 2;
  const monthly = user.plan_type === 'ltd' && user.monthly_credit_limit ? Number(user.monthly_credit_limit) : 300;

  const email = createLTDActivationEmail(user.name || user.email, user.email, tier, monthly);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LTD Activation Email – Preview</h1>
        <p className="text-muted-foreground">Preview and send the LTD activation email template.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject</CardTitle>
          <CardDescription>{email.subject}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <form action="/api/admin/test-email/ltd" method="POST">
              {/* Allow overriding tier/monthly for testing */}
              <input type="hidden" name="tier" value={String(tier)} />
              <input type="hidden" name="monthly" value={String(monthly)} />
              <Button type="submit">Send Test Email to {user.email}</Button>
            </form>
          </div>

          <div className="border rounded-md overflow-hidden">
            {/* Email HTML preview */}
            <div dangerouslySetInnerHTML={{ __html: email.html }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
