import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreditUsageWidget } from '@/components/ltd/CreditUsageWidget';
import { CreditUsageAnalytics } from '@/components/ltd/CreditUsageAnalytics';

export const metadata = {
  title: 'Credits & Usage | RepurposeAI',
  description: 'Track your credit usage and analytics',
};

export default async function CreditsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Credits & Usage</h1>
          <p className="text-muted-foreground">
            Monitor your credit usage and track your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreditUsageWidget />
          </div>
          <div className="lg:col-span-2">
            <CreditUsageAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}

