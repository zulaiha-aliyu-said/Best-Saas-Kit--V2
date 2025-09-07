"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import { redirectToCheckout } from "@/lib/stripe-client";

interface BillingClientProps {
  currentPlan: string;
}

export function BillingClient({ currentPlan }: BillingClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (currentPlan === 'pro') {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'pro',
        }),
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

  if (currentPlan === 'pro') {
    return (
      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
        <h3 className="font-medium text-green-800">You're a Pro Member!</h3>
        <p className="text-sm text-green-600">
          Thank you for supporting our platform. Enjoy unlimited access to all features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleUpgrade}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro - $99
          </>
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by Stripe. One-time payment, lifetime access.
      </p>
    </div>
  );
}
