import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Wallet, CreditCard, Shield, Zap, CheckCircle2, Lock, DollarSign, RefreshCw } from "lucide-react";

export const metadata = {
  title: 'Seamless Billing | Features | RepurposeAI',
  description: 'Secure payment processing with multiple plan options and encrypted transactions.',
};

export default function BillingIntegrationPage() {
  return (
    <FeatureDetailTemplate
      badge="Secure"
      badgeColor="bg-emerald-600"
      title="Seamless Billing Integration"
      description="Enterprise-grade payment processing with industry-leading security. Support for multiple subscription plans, one-time payments, lifetime deals, discount codes, and secure checkout. PCI-compliant infrastructure ensures your payment data is always protected. Manage subscriptions, invoices, and payment methods with ease."
      heroIcon={Wallet}
      heroGradient="from-emerald-500 to-teal-500"
      ctaPrimary="View Billing Options"
      ctaPrimaryLink="/dashboard/billing"
      
      benefits={[
        {
          icon: Shield,
          title: "Bank-Level Security",
          description: "PCI-DSS compliant payment processing with bank-level security"
        },
        {
          icon: CreditCard,
          title: "Multiple Payment Methods",
          description: "Accept credit cards, debit cards, and other payment types"
        },
        {
          icon: Zap,
          title: "Instant Activation",
          description: "Immediate access to features after successful payment"
        },
        {
          icon: RefreshCw,
          title: "Easy Management",
          description: "Update payment methods and manage subscriptions anytime"
        }
      ]}
      
      howItWorks={[
        {
          step: "1",
          title: "Choose Plan",
          description: "Select from Free, Pro, or Lifetime Deal tiers",
          color: "from-emerald-500 to-teal-500"
        },
        {
          step: "2",
          title: "Secure Checkout",
          description: "Enter payment details through our secure checkout",
          color: "from-teal-500 to-cyan-500"
        },
        {
          step: "3",
          title: "Apply Discounts",
          description: "Enter discount codes for promotional pricing",
          color: "from-cyan-500 to-blue-500"
        },
        {
          step: "4",
          title: "Instant Access",
          description: "Get immediate access to your plan features and credits",
          color: "from-blue-500 to-indigo-500"
        }
      ]}
      
      features={[
        "Secure Payment Integration",
        "Multiple Subscription Plans",
        "One-Time Payments (LTD)",
        "Recurring Subscriptions",
        "Discount Code Support",
        "Secure Checkout",
        "PCI-DSS Compliance",
        "Credit Card Support",
        "Debit Card Support",
        "International Payments",
        "Automatic Invoicing",
        "Payment History",
        "Subscription Management",
        "Payment Method Updates",
        "Failed Payment Handling",
        "Refund Processing"
      ]}
      
      useCases={[
        {
          title: "Individual Users",
          description: "Upgrade from Free to Pro with simple monthly billing"
        },
        {
          title: "Lifetime Buyers",
          description: "Purchase lifetime access with one-time payment"
        },
        {
          title: "AppSumo Customers",
          description: "Redeem codes and activate lifetime tier access"
        },
        {
          title: "Teams",
          description: "Manage team billing and shared payment methods"
        },
        {
          title: "Enterprises",
          description: "Process large transactions securely"
        },
        {
          title: "International Users",
          description: "Pay in your local currency with global support"
        }
      ]}
      
      ctaTitle="Ready for Secure, Hassle-Free Billing?"
      ctaDescription="Upgrade your plan and experience enterprise-grade payment processing."
    />
  );
}

