import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LTDPricingSection } from '@/components/ltd/LTDPricingSection';
import { getUserPlan } from '@/lib/feature-gate';

export const metadata = {
  title: 'Lifetime Deal Pricing | repurposely',
  description: 'Get lifetime access to repurposely with our exclusive Lifetime Deal',
};

export default async function LTDPricingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;
  const plan = await getUserPlan(userId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <LTDPricingSection 
          currentTier={plan?.ltd_tier ?? undefined}
        />
      </div>
    </div>
  );
}

