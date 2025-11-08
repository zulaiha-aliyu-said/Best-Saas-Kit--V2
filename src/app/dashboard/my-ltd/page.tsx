import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/database';
import { LTD_TIERS } from '@/lib/ltd-tiers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import EnhancedLTDDashboard from '@/components/ltd/EnhancedLTDDashboard';
import { verifyFlutterwaveTransaction } from '@/lib/flutterwave';

export default async function MyLTDPage({ searchParams }: { searchParams?: Promise<{ status?: string | string[]; tx_ref?: string | string[]; transaction_id?: string | string[] }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard/my-ltd');
  }

  const userId = session.user.id;

  // Get user data
  const client = await pool.connect();
  try {
    // If redirected back from Flutterwave with success, verify and activate plan (idempotent)
    const sp = searchParams ? await searchParams : undefined;
    const norm = (v?: string | string[]) => Array.isArray(v) ? v[0] : v;
    const status = norm(sp?.status);
    const txRef = norm(sp?.tx_ref);
    const transactionId = norm(sp?.transaction_id);

    if (status === 'successful' && transactionId) {
      try {
        const verify = await verifyFlutterwaveTransaction(transactionId);
        const data = verify?.data;
        const verifiedStatus = data?.status?.toLowerCase();
        const verifiedCurrency = (data?.currency || '').toUpperCase();
        const verifiedAmount = Number(data?.amount || 0);

        // Require successful charge
        if (verifiedStatus === 'successful') {
          // Determine tier from either metadata or tx_ref pattern
          let tier = String(data?.meta?.tier || '');
          if (!tier && txRef && txRef.startsWith('ltd_t')) {
            const m = txRef.match(/^ltd_t(\d)_/);
            if (m) tier = m[1];
          }

          // Accept only USD and known LTD prices
          const TIER_MONTHLY: Record<string, number> = { '1': 100, '2': 300, '3': 750, '4': 2000 };
          const TIER_AMOUNT: Record<string, number> = { '1': 49, '2': 119, '3': 219, '4': 399 };
          const monthly = TIER_MONTHLY[tier];
          const expectedAmount = TIER_AMOUNT[tier];

          if (tier && monthly && expectedAmount && verifiedCurrency === 'USD' && verifiedAmount === expectedAmount) {
            // Upsert sale record first to ensure idempotency on credits
            await client.query('BEGIN');
            const saleRes = await client.query(
              `INSERT INTO black_friday_sales (
                transaction_id, tx_ref, amount, currency,
                user_id, user_email, user_name,
                plan_type, tier, monthly_credits,
                payment_status, payment_method, metadata
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
              ON CONFLICT (transaction_id) DO NOTHING
              RETURNING id`,
              [
                String(data.id),
                data.tx_ref || txRef || '',
                verifiedAmount,
                verifiedCurrency,
                userId,
                data?.customer?.email || null,
                data?.customer?.name || null,
                'ltd',
                Number(tier),
                monthly,
                'completed',
                'flutterwave',
                JSON.stringify(data)
              ]
            );

            // Always set user to LTD (idempotent update)
            await client.query(
              `UPDATE users 
               SET plan_type = 'ltd',
                   subscription_status = $1,
                   ltd_tier = $2,
                   monthly_credit_limit = $3,
                   credit_reset_date = COALESCE(credit_reset_date, CURRENT_TIMESTAMP + INTERVAL '1 month'),
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $4`,
              [
                `ltd_tier_${tier}`,
                Number(tier),
                monthly,
                userId,
              ]
            );

            await client.query('COMMIT');

            // Add upfront credits only if this transaction is newly recorded
            if (saleRes.rowCount && saleRes.rowCount > 0) {
              // Add credits outside the transaction using helper
              const { addCredits } = await import('@/lib/database');
              await addCredits(userId, monthly);
            }
          }
        }
      } catch (e) {
        // Swallow errors to not block page render; webhook may still complete
        console.error('LTD confirm on redirect failed:', e);
      }
    }

    const userResult = await client.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user || user.plan_type !== 'ltd') {
      // User doesn't have LTD plan
      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>No LTD Plan Active</CardTitle>
              <CardDescription>
                You don't have an active lifetime deal plan yet
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Want lifetime access to RepurposeAI?</p>
              <Link href="/redeem">
                <Button size="lg">
                  <Ticket className="mr-2 h-5 w-5" />
                  Redeem Your Code
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Get redemption history
    const redemptionsResult = await client.query(
      `SELECT lr.*, lc.code 
       FROM ltd_redemptions lr
       JOIN ltd_codes lc ON lr.code_id = lc.id
       WHERE lr.user_id = $1
       ORDER BY lr.redeemed_at DESC`,
      [userId]
    );

    const redemptions = redemptionsResult.rows;

    // Get tier config
    const tierConfig = LTD_TIERS.find(t => t.tier === user.ltd_tier);
    const creditPercentage = (user.credits / user.monthly_credit_limit) * 100;
    const resetDate = new Date(user.credit_reset_date);
    const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My LTD Plan</h1>
          <p className="text-muted-foreground mt-2">
            Manage your lifetime deal subscription
          </p>
        </div>

        {/* Current Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Card */}
          <Card className="lg:col-span-2 border-2" style={{
            borderColor: user.ltd_tier === 4 ? '#f97316' : 
                        user.ltd_tier === 3 ? '#ec4899' :
                        user.ltd_tier === 2 ? '#a855f7' : '#3b82f6'
          }}>
            <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={
                    user.ltd_tier === 4 ? 'bg-orange-500' :
                    user.ltd_tier === 3 ? 'bg-pink-500' :
                    user.ltd_tier === 2 ? 'bg-purple-500' : 'bg-blue-500'
                  } style={{ fontSize: '16px', padding: '8px 16px' }}>
                    🏆 LTD Tier {user.ltd_tier}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Lifetime Access • {tierConfig?.name || `Tier ${user.ltd_tier}`}
                  </p>
                </div>
                <Sparkles className="w-12 h-12 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm font-medium">Monthly Credits</span>
                  <span className="text-2xl font-bold">
                    {user.credits} / {user.monthly_credit_limit}
                  </span>
                </div>
                <Progress value={creditPercentage} className="h-3" />
                <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                  <span>{creditPercentage.toFixed(0)}% remaining</span>
                  <span>Resets in {daysUntilReset} days</span>
                </div>
              </div>

              {user.rollover_credits > 0 && (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    +{user.rollover_credits} rollover credits available
                  </AlertDescription>
                </Alert>
              )}

              {user.stacked_codes > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">
                    {user.stacked_codes} Codes Stacked
                  </Badge>
                  <span className="text-muted-foreground">
                    Higher limits from stacking
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Redemptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{redemptions.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Next Reset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">
                    {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Link href="/redeem">
              <Button variant="outline" className="w-full">
                <Ticket className="mr-2 h-4 w-4" />
                Stack Another Code
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Your Features</CardTitle>
            <CardDescription>
              What's included in your Tier {user.ltd_tier} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tierConfig?.features && Object.entries({
                'Content Repurposing': user.ltd_tier >= 1,
                'Premium Templates': user.ltd_tier >= 1,
                'Trending Topics': user.ltd_tier >= 1,
                'Viral Hook Generator': user.ltd_tier >= 2,
                'Content Scheduling': user.ltd_tier >= 2,
                'YouTube Trending': user.ltd_tier >= 2,
                'AI Performance Predictions': user.ltd_tier >= 3,
                'AI Chat Assistant': user.ltd_tier >= 3,
                'Style Training': user.ltd_tier >= 3,
                'Team Collaboration': user.ltd_tier >= 4,
                'API Access': user.ltd_tier >= 4,
                'White-label Options': user.ltd_tier >= 4,
              }).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-3 p-3 rounded-lg border">
                  {enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={enabled ? 'font-medium' : 'text-muted-foreground'}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats & Analytics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-2xl font-bold">Usage Analytics</h2>
          </div>
          <EnhancedLTDDashboard 
            initialTier={user.ltd_tier}
            initialCredits={user.credits}
            initialLimit={user.monthly_credit_limit}
          />
        </div>

        {/* Redemption History */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption History</CardTitle>
            <CardDescription>
              Codes you've redeemed on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {redemptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No redemptions yet
              </p>
            ) : (
              <div className="space-y-3">
                {redemptions.map((redemption: any) => (
                  <div key={redemption.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <code className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded">
                        {redemption.code}
                      </code>
                      <p className="text-sm text-muted-foreground mt-1">
                        Redeemed on {new Date(redemption.redeemed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge>Tier {redemption.tier}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Want Even More Credits?</h3>
                <p className="text-sm text-muted-foreground">
                  Stack another LTD code to increase your monthly credit limit
                </p>
              </div>
              <Link href="/redeem">
                <Button size="lg">
                  Stack More Codes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } finally {
    client.release();
  }
}

