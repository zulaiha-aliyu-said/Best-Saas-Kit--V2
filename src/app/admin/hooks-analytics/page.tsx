import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import AdminHooksAnalytics from '@/components/admin/admin-hooks-analytics';

export const metadata = {
  title: 'Admin Hook Analytics | RepurposeAI',
  description: 'System-wide viral hook performance and insights',
};

export default async function AdminHookAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/auth/signin');
  }

  return <AdminHooksAnalytics />;
}






