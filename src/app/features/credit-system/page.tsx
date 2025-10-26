import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { CreditCard, TrendingUp, Zap, BarChart3, RefreshCw, DollarSign, Eye, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: 'Smart Credit System | Features | RepurposeAI',
  description: 'Flexible usage-based credits with optimization suggestions and transparent pricing.',
};

export default function CreditSystemPage() {
  return (
    <FeatureDetailTemplate
      badge="Flexible"
      badgeColor="bg-teal-600"
      title="Smart Credit System"
      description="Our transparent, usage-based credit system gives you complete control over your content creation costs. See exactly how many credits each action costs, get optimization suggestions to save credits, and track your usage in real-time. Credits refresh monthly based on your tier."
      heroIcon={CreditCard}
      heroGradient="from-teal-500 to-green-500"
      ctaPrimary="View Credit Usage"
      ctaPrimaryLink="/dashboard/billing"
      
      benefits={[
        {
          icon: Eye,
          title: "Complete Transparency",
          description: "See exactly how many credits each feature and action costs"
        },
        {
          icon: TrendingUp,
          title: "Smart Optimization",
          description: "Get suggestions to optimize credit usage and save money"
        },
        {
          icon: RefreshCw,
          title: "Monthly Refresh",
          description: "Credits refresh automatically every month based on your tier"
        },
        {
          icon: BarChart3,
          title: "Usage Tracking",
          description: "Monitor credit usage in real-time with detailed analytics"
        }
      ]}
      
      howItWorks={[
        {
          step: "1",
          title: "Get Credits",
          description: "Receive monthly credits based on your subscription tier or LTD level",
          color: "from-teal-500 to-green-500"
        },
        {
          step: "2",
          title: "Use Features",
          description: "Each feature uses a specific number of credits (shown before use)",
          color: "from-green-500 to-emerald-500"
        },
        {
          step: "3",
          title: "Track Usage",
          description: "Monitor your credit balance and usage history in real-time",
          color: "from-emerald-500 to-cyan-500"
        },
        {
          step: "4",
          title: "Auto-Refresh",
          description: "Credits refresh on your monthly anniversary date",
          color: "from-cyan-500 to-blue-500"
        }
      ]}
      
      features={[
        "Transparent Credit Pricing",
        "Real-Time Balance Display",
        "Credit Cost Preview",
        "Usage History Tracking",
        "Monthly Credit Refresh",
        "Rollover Credits (LTD Plans)",
        "Credit Optimization Suggestions",
        "Usage Analytics",
        "Credit Alerts & Notifications",
        "Per-Feature Credit Costs",
        "Bulk Action Discounts",
        "Credit Purchase Options",
        "Usage Trends Charts",
        "Team Credit Pooling",
        "Budget Management Tools",
        "Export Usage Reports"
      ]}
      
      useCases={[
        {
          title: "Budget-Conscious Users",
          description: "Control costs with transparent, predictable pricing"
        },
        {
          title: "Variable Usage",
          description: "Pay for what you use with flexible credit allocation"
        },
        {
          title: "Growing Businesses",
          description: "Scale credit usage as your content needs grow"
        },
        {
          title: "Team Management",
          description: "Track and manage team member credit usage"
        },
        {
          title: "ROI Tracking",
          description: "Measure content creation costs against results"
        },
        {
          title: "Optimization Focus",
          description: "Use AI suggestions to maximize credit efficiency"
        }
      ]}
      
      ctaTitle="Ready for Flexible, Transparent Pricing?"
      ctaDescription="Start with our smart credit system and only pay for what you use."
    />
  );
}


