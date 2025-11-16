'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Ticket,
  ArrowRight,
  Gift,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function RedeemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: any;
  } | null>(null);

  // Check if code is in URL params
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setResult({
        type: 'error',
        message: 'Please enter a valid code'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Attempting to redeem code:', code.trim());

      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Check if user needs to sign in (401 Unauthorized)
      if (response.status === 401) {
        console.log('🔒 Not authenticated, redirecting to sign in...');
        router.push(`/auth/signin?callbackUrl=/redeem${code ? `?code=${code}` : ''}`);
        return;
      }

      if (response.ok && data.success) {
        console.log('✅ Redemption successful!');
        setResult({
          type: 'success',
          message: data.message,
          details: data,
        });

        // Redirect to dashboard after 3 seconds
        console.log('⏳ Redirecting in 3 seconds...');
        setTimeout(() => {
          console.log('🔀 Redirecting to /dashboard/my-ltd');
          router.push('/dashboard/my-ltd');
        }, 3000);
      } else {
        console.error('❌ Redemption failed:', data.error);
        setResult({
          type: 'error',
          message: data.error || 'Failed to redeem code'
        });
      }
    } catch (error) {
      console.error('💥 Redemption error:', error);
      setResult({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Success Message */}
      {result?.type === 'success' && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription className="ml-2">
            <div>
              <p className="font-semibold text-green-900">{result.message}</p>
              {result.details && (
                <div className="mt-3 space-y-1 text-sm text-green-800">
                  <p>🎉 <strong>Tier {result.details.tier}</strong> activated!</p>
                  <p>💳 <strong>{result.details.monthlyCredits} credits/month</strong></p>
                  <p>✨ <strong>{result.details.currentCredits} credits</strong> available now</p>
                  {result.details.stackedCodes > 1 && (
                    <p>🔗 <strong>{result.details.stackedCodes} codes</strong> stacked</p>
                  )}
                </div>
              )}
              <p className="mt-3 text-sm">Redirecting to your dashboard...</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {result?.type === 'error' && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Enter Your Code
          </CardTitle>
          <CardDescription>
            Enter the LTD code you received from your purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="LTD-T3-XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono h-14 text-xl"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Codes are not case-sensitive
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redeeming...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Redeem Code
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3 text-center">What You'll Get:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Monthly Credits</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>All Future Updates</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Priority Support</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>No Recurring Fees</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Code Stacking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link href="/dashboard/my-ltd" className="text-purple-600 hover:underline">
            View My LTD Plan
          </Link>
        </p>
        <p className="mt-2">
          Need help?{' '}
          <Link href="/help" className="text-purple-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
