export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin-auth';
import AdminHooksAnalytics from '@/components/admin/admin-hooks-analytics';

export const metadata = {
  title: 'Admin Hook Analytics | RepurposeAI',
  description: 'System-wide viral hook performance and insights',
};

export default async function AdminHookAnalyticsPage() {
  const admin = await checkAdminAccess();

  if (!admin) {
    redirect('/auth/signin');
  }

  return <AdminHooksAnalytics />;
}






