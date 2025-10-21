import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ViralHookGenerator from '@/components/hooks/viral-hook-generator';

export const metadata = {
  title: 'Viral Hook Generator | RepurposeAI',
  description: 'Generate high-performing viral hooks for your content',
};

export default async function HooksPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <ViralHookGenerator />;
}






