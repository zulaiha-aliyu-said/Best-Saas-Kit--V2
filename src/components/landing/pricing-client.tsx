"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2 } from "lucide-react";
import { redirectToCheckout } from "@/lib/stripe-client";
import { DiscountInput } from "@/components/checkout/discount-input";

interface PricingClientProps {
  plan: {
    name: string;
    popular: boolean;
    variant: "default" | "outline";
    cta: string;
  };
  isAuthenticated: boolean;
}

export function PricingClient({ plan, isAuthenticated }: PricingClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      // Redirect to sign in
      window.location.href = '/auth/signin?callbackUrl=/dashboard/billing';
      return;
    }

    if (plan.name === 'Pro Trial') {
      setIsLoading(true);
      try {
        const response = await fetch('/api/flutterwave/checkout', {
          method: 'POST',
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to create Flutterwave checkout');
        }
        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error('Flutterwave checkout error:', error);
        alert('Failed to start checkout. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (plan.name !== 'Pro') {
      // Handle other plans
      if (plan.name === 'Starter') {
        window.location.href = '/auth/signin';
      } else {
        // Enterprise/LTD inquiries
        window.location.href = 'mailto:support@bestsaaskit.com?subject=Plan Inquiry';
      }
      return;
    }

    setIsLoading(true);
    
    try {
      // Create checkout session for Pro plan with optional discount
      const requestBody: any = { plan: 'pro' };
      if (appliedDiscount) {
        requestBody.discountCode = appliedDiscount.code;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      await redirectToCheckout(sessionId);

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
