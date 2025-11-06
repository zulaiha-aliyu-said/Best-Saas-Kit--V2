"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  saveText: string;
  period: string;
  annualSavingsText: string;
  creditsPerMonth: number;
  rolloverMonths: number;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
  variant: "default" | "outline";
  tier: string;
}

interface PricingClientProps {
  plan: Plan;
  isAuthenticated: boolean;
}

export function PricingClient({ plan, isAuthenticated }: PricingClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/signin?callbackUrl=/dashboard/billing';
      return;
    }

    // Handle License Tier (LTD) purchases via Flutterwave
    if (plan.name.startsWith('License Tier')) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/flutterwave/ltd/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: plan.tier }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to create Flutterwave LTD checkout');
        }

        const { url } = await response.json();
        window.location.href = url; // Redirect to Flutterwave hosted payment page
      } catch (error: any) {
        console.error('Flutterwave LTD checkout error:', error);
        alert(error.message || 'Failed to start checkout. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback for any other plan types
    alert('This plan is not available for direct purchase.');
  };

  return (
    <Button 
      className="w-full" 
      variant={plan.variant}
      size="lg"
      onClick={handlePurchase}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {plan.popular && <Zap className="w-4 h-4 mr-2" />}
          {plan.cta}
        </>
      )}
    </Button>
  );
}
