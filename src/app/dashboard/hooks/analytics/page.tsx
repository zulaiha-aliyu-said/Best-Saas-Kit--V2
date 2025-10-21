import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HookAnalytics from '@/components/hooks/hook-analytics';

export const metadata = {
  title: 'Hook Analytics | RepurposeAI',
  description: 'Track your viral hook performance and insights',
};

export default async function HookAnalyticsPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <HookAnalytics />;
}






