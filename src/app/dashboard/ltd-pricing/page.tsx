import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LTDPricingSection } from '@/components/ltd/LTDPricingSection';
import { getUserPlan } from '@/lib/feature-gate';

export const metadata = {
  title: 'Lifetime Deal Pricing | RepurposeAI',
  description: 'Get lifetime access to RepurposeAI with our exclusive AppSumo deal',
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

