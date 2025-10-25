import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Crown, Star, Zap, TrendingUp, CheckCircle2, DollarSign, Infinity, Gift } from "lucide-react";

export const metadata = {
  title: 'Lifetime Deal Tiers | Features | RepurposeAI',
  description: 'Flexible lifetime access plans with increasing features and credits - no recurring fees.',
};

export default function LTDSystemPage() {
  return (
    <FeatureDetailTemplate
      badge="Lifetime Access"
      badgeColor="bg-amber-600"
      title="Lifetime Deal Tiers"
      description="Get lifetime access to RepurposeAI with our flexible tier system. Choose from 5 different tiers based on your needs - from solopreneurs to enterprises. Pay once, use forever with increasing credits, features, and capabilities. No recurring subscriptions, no hidden fees."
      heroIcon={Crown}
      heroGradient="from-amber-500 to-yellow-500"
      ctaPrimary="View LTD Tiers"
      ctaPrimaryLink="/pricing"
      
      benefits={[
        {
          icon: Infinity,
          title: "Lifetime Access",
          description: "Pay once and get access forever - no monthly or yearly fees"
        },
        {
          icon: Star,
          title: "5 Flexible Tiers",
          description: "Choose the tier that matches your content volume and needs"
        },
        {
          icon: Zap,
          title: "Increasing Benefits",
          description: "Higher tiers unlock more credits, features, and capabilities"
        },
        {
          icon: Gift,
          title: "AppSumo Exclusive",
          description: "Special lifetime deal pricing available through AppSumo"
        }
      ]}
      
      howItWorks={[
        {
          step: "1",
          title: "Choose Your Tier",
          description: "Select from Tier 1 (Starter) to Tier 5 (Enterprise) based on needs",
          color: "from-amber-500 to-yellow-500"
        },
        {
          step: "2",
          title: "One-Time Payment",
          description: "Pay once through AppSumo or direct purchase",
          color: "from-yellow-500 to-orange-500"
        },
        {
          step: "3",
          title: "Instant Activation",
          description: "Your lifetime access and credits activate immediately",
          color: "from-orange-500 to-red-500"
        },
        {
          step: "4",
          title: "Use Forever",
          description: "Enjoy lifetime access with monthly credit refresh",
          color: "from-red-500 to-pink-500"
        }
      ]}
      
      features={[
        "5 Lifetime Deal Tiers",
        "Tier 1: 50,000 credits/month",
        "Tier 2: 125,000 credits/month",
        "Tier 3: 250,000 credits/month",
        "Tier 4: 500,000 credits/month",
        "Tier 5: 1,000,000 credits/month",
        "Monthly Credit Refresh",
        "Rollover Unused Credits",
        "All Core Features Included",
        "Priority Support (Higher Tiers)",
        "API Access (Tier 4+)",
        "White-Label Options (Tier 5)",
        "Team Seats (Tier 3+)",
        "Competitor Analysis (Tier 2+)",
        "Advanced Analytics (All Tiers)",
        "Lifetime Updates & Features"
      ]}
      
      useCases={[
        {
          title: "Solopreneurs (Tier 1-2)",
          description: "Perfect for individual content creators and small businesses"
        },
        {
          title: "Growing Businesses (Tier 3)",
          description: "Ideal for expanding content needs and small teams"
        },
        {
          title: "Agencies (Tier 4)",
          description: "Designed for agencies managing multiple clients"
        },
        {
          title: "Enterprises (Tier 5)",
          description: "Built for large organizations with high content volume"
        },
        {
          title: "AppSumo Buyers",
          description: "Stack codes to reach higher tiers at exclusive pricing"
        },
        {
          title: "Long-Term Users",
          description: "Avoid subscription fatigue with one-time payment"
        }
      ]}
      
      ctaTitle="Ready for Lifetime Access?"
      ctaDescription="Choose your tier and never pay monthly subscription fees again."
    />
  );
}


