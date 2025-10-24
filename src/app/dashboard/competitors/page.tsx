import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CompetitorAnalysisClient from './CompetitorAnalysisClient';

export const runtime = 'nodejs';

export default async function CompetitorAnalysisPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return <CompetitorAnalysisClient userId={session.user.id} />;
}















