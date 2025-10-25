import { LTDPricingSection } from '@/components/ltd/LTDPricingSection';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Lifetime Deal Pricing | RepurposeAI',
  description: 'Get lifetime access to RepurposeAI with our exclusive AppSumo deal. 5 tiers available with increasing credits and features.',
};

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Navigation */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Lifetime Deal
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
              Pricing Tiers
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pay once, use forever. Choose from 5 flexible tiers with increasing credits and features. No monthly fees, no recurring charges.
          </p>
        </div>

        {/* LTD Pricing Section */}
        <LTDPricingSection currentTier={undefined} />

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What is a Lifetime Deal?</h3>
              <p className="text-muted-foreground">
                Pay once and get access forever. No monthly or yearly fees. Your credits refresh every month based on your tier.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Can I upgrade my tier?</h3>
              <p className="text-muted-foreground">
                Yes! You can stack AppSumo codes or upgrade directly to reach higher tiers with more credits and features.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Do credits roll over?</h3>
              <p className="text-muted-foreground">
                Yes! Unused credits roll over to the next month, so you never lose what you paid for.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What's included in all tiers?</h3>
              <p className="text-muted-foreground">
                All tiers include content repurposing, AI chat, trending topics, analytics, and more. Higher tiers unlock additional features.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Is there a money-back guarantee?</h3>
              <p className="text-muted-foreground">
                Yes! AppSumo offers a 60-day money-back guarantee. If you're not satisfied, get a full refund.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">How do I redeem my AppSumo code?</h3>
              <p className="text-muted-foreground">
                Sign up for RepurposeAI, go to your dashboard, and enter your AppSumo code in the billing section.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of content creators using RepurposeAI to save time and reach more people.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/signin">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                </Button>
              </Link>
              <Link href="/#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View All Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
