'use client';

import React, { useState } from 'react';
import { LTDPricingCard } from './LTDPricingCard';
import { LTD_TIERS } from '@/lib/ltd-tiers';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Zap, Gift, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LTDPricingSectionProps {
  onSelectTier?: (tier: number) => void;
  currentTier?: number;
}

export function LTDPricingSection({ onSelectTier, currentTier }: LTDPricingSectionProps) {
  const [showEarlyBird, setShowEarlyBird] = useState(true);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Gift className="w-3 h-3 mr-1" />
          Lifetime Deal
        </Badge>
        <h2 className="text-4xl font-bold mb-4">
          Transform Content Into 10+ Posts in Seconds
        </h2>
        <p className="text-xl text-muted-foreground mb-6">
          Lifetime access to AI-powered content repurposing • Pay once, use forever
        </p>
        
        {/* Early Bird Toggle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Label htmlFor="early-bird" className="text-sm">
            Regular Price
          </Label>
          <Switch
            id="early-bird"
            checked={showEarlyBird}
            onCheckedChange={setShowEarlyBird}
          />
          <Label htmlFor="early-bird" className="text-sm font-semibold">
            Early Bird Pricing
            {showEarlyBird && (
              <Badge variant="destructive" className="ml-2">
                Limited Time
              </Badge>
            )}
          </Label>
        </div>

        {showEarlyBird && (
          <Alert className="max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-300">
            <Zap className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 dark:text-orange-200">
              Early bird pricing available for limited time! Save up to $50 on your lifetime deal.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {LTD_TIERS.map((tier) => (
          <LTDPricingCard
            key={tier.tier}
            tier={tier}
            onSelect={onSelectTier}
            showEarlyBird={showEarlyBird}
            currentTier={currentTier}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <InfoCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Code Stacking"
          description="Buy multiple codes to multiply your credits. All features from your highest tier apply."
        />
        <InfoCard
          icon={<Zap className="w-6 h-6" />}
          title="Credit Rollover"
          description="Unused credits roll over for up to 12 months. Never lose your credits!"
        />
        <InfoCard
          icon={<Gift className="w-6 h-6" />}
          title="Lifetime Updates"
          description="Get all future features, AI upgrades, and platform updates forever."
        />
      </div>

      {/* Comparison Table */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">
          Feature Comparison
        </h3>
        <ComparisonTable />
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>
        <FAQSection />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border rounded-lg p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ComparisonTable() {
  const features = [
    { name: 'Monthly Credits', t1: '100', t2: '300', t3: '750', t4: '2,000' },
    { name: 'Content Repurposing', t1: '✓', t2: '✓', t3: '✓', t4: '✓' },
    { name: 'Premium Templates', t1: '15', t2: '40', t3: '60+', t4: '60+' },
    { name: 'Viral Hook Generator', t1: '✗', t2: '✓', t3: '✓', t4: '✓' },
    { name: 'Content Scheduling', t1: '✗', t2: '30/mo', t3: '100/mo', t4: 'Unlimited' },
    { name: 'AI Chat', t1: '✗', t2: '✗', t3: '200 msg', t4: 'Unlimited' },
    { name: 'Predictive AI', t1: '✗', t2: '✗', t3: '✓', t4: '✓' },
    { name: 'Style Training', t1: '✗', t2: '✗', t3: '1 profile', t4: '3 profiles' },
    { name: 'Team Members', t1: '✗', t2: '✗', t3: '✗', t4: '3' },
    { name: 'API Access', t1: '✗', t2: '✗', t3: '✗', t4: '✓' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Feature</th>
            <th className="text-center p-4">Tier 1</th>
            <th className="text-center p-4">Tier 2</th>
            <th className="text-center p-4 bg-primary/5">Tier 3 ⭐</th>
            <th className="text-center p-4">Tier 4</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b hover:bg-muted/50">
              <td className="p-4 font-medium">{feature.name}</td>
              <td className="text-center p-4">{feature.t1}</td>
              <td className="text-center p-4">{feature.t2}</td>
              <td className="text-center p-4 bg-primary/5 font-semibold">{feature.t3}</td>
              <td className="text-center p-4">{feature.t4}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: 'How long is this deal available?',
      a: 'This lifetime deal is available for a limited time only. Once it\'s gone, it\'s gone forever.',
    },
    {
      q: 'Do credits expire?',
      a: 'Credits refresh monthly on your purchase anniversary. Unused credits roll over for up to 12 months.',
    },
    {
      q: 'Can I stack codes?',
      a: 'Absolutely! Buy multiple codes to multiply your monthly credits. All features from your highest tier apply.',
    },
    {
      q: 'Is there really no monthly fee?',
      a: 'Correct! This is a true lifetime deal. Pay once, use forever. No recurring fees, ever.',
    },
    {
      q: 'Can I upgrade later?',
      a: 'Yes! You can upgrade by purchasing additional codes or redeeming a higher tier code.',
    },
    {
      q: 'What kind of support do I get?',
      a: 'Support varies by tier: Tier 1-2 get email support, Tier 3 gets priority 24hr email, and Tier 4 gets priority chat support.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-card border rounded-lg p-6">
          <h4 className="font-semibold mb-2">{faq.q}</h4>
          <p className="text-sm text-muted-foreground">{faq.a}</p>
        </div>
      ))}
    </div>
  );
}







