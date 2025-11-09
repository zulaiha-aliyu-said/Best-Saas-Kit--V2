"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { PricingClient } from "./pricing-client"

interface PricingProps {
  isAuthenticated?: boolean;
}

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

const Pricing = ({ isAuthenticated = false }: PricingProps) => {
  const plans: Plan[] = [
    {
      name: "License Tier 1",
      description: "Solo creators, bloggers, small business owners",
      price: "$49",
      originalPrice: "$59",
      saveText: "Save $10",
      period: "one-time payment",
      annualSavingsText: "Save $289/year",
      creditsPerMonth: 100,
      rolloverMonths: 12,
      features: [
        { text: "4 platforms repurposing", included: true },
        { text: "15 templates", included: true },
        { text: "Viral hook generator", included: false },
        { text: "Content scheduling", included: false },
        { text: "AI chat assistant", included: false },
        { text: "Predictive performance AI", included: false },
        { text: "Style training", included: false },
        { text: "30 days analytics", included: true },
        { text: "Watermark on content", included: false },
        { text: "1x processing speed", included: true },
        { text: "Community support", included: true },
      ],
      cta: "Get Started",
      popular: false,
      variant: "outline" as const,
      tier: "1"
    },
    {
      name: "License Tier 2",
      description: "Content marketers, freelancers, small agencies",
      price: "$119",
      originalPrice: "$139",
      saveText: "Save $20",
      period: "one-time payment",
      annualSavingsText: "Save $557 (2 years)",
      creditsPerMonth: 300,
      rolloverMonths: 12,
      features: [
        { text: "4 platforms repurposing", included: true },
        { text: "40 templates", included: true },
        { text: "Viral hook generator", included: true },
        { text: "Schedule 30 posts/month", included: true },
        { text: "AI chat assistant", included: false },
        { text: "Predictive performance AI", included: false },
        { text: "Style training", included: false },
        { text: "180 days analytics", included: true },
        { text: "Watermark on content", included: false },
        { text: "2x processing speed", included: true },
        { text: "Priority email (48hr)", included: true },
      ],
      cta: "Get Started",
      popular: false,
      variant: "outline" as const,
      tier: "2"
    },
    {
      name: "License Tier 3",
      description: "Agencies, marketing teams, power users",
      price: "$219",
      originalPrice: "$249",
      saveText: "Save $30",
      period: "one-time payment",
      annualSavingsText: "Save $939/year",
      creditsPerMonth: 750,
      rolloverMonths: 12,
      features: [
        { text: "4 platforms repurposing", included: true },
        { text: "60 templates", included: true },
        { text: "Viral hook generator", included: true },
        { text: "Schedule 100 posts/month", included: true },
        { text: "AI Chat (200 msg/mo)", included: true },
        { text: "Predictive performance AI", included: true },
        { text: "Style training (1 profile)", included: true },
        { text: "Bulk generation", included: true },
        { text: "Unlimited analytics", included: true },
        { text: "No watermark", included: true },
        { text: "3x processing speed", included: true },
        { text: "Priority email (24hr)", included: true },
      ],
      cta: "Get Started",
      popular: true,
      variant: "default" as const,
      tier: "3"
    },
    {
      name: "License Tier 4",
      description: "Large agencies, enterprise teams",
      price: "$399",
      originalPrice: "$449",
      saveText: "Save $50",
      period: "one-time payment",
      annualSavingsText: "Save $1,927 (2 years)",
      creditsPerMonth: 2000,
      rolloverMonths: 12,
      features: [
        { text: "4 platforms repurposing", included: true },
        { text: "60 templates", included: true },
        { text: "Viral hook generator", included: true },
        { text: "Schedule unlimited posts/month", included: true },
        { text: "AI Chat (unlimited)", included: true },
        { text: "Predictive performance AI", included: true },
        { text: "Style training (3 profiles)", included: true },
        { text: "Bulk generation", included: true },
        { text: "Team (3 members)", included: true },
        { text: "API access (2,500/mo)", included: true },
        { text: "Unlimited analytics", included: true },
        { text: "No watermark", included: true },
        { text: "5x processing speed", included: true },
        { text: "Priority chat (4hr)", included: true },
      ],
      cta: "Get Started",
      popular: false,
      variant: "outline" as const,
      tier: "4"
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Get Your <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Lifetime Deal</span>
          </h2>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <p className="text-lg text-foreground flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Early bird pricing available for limited time! Save up to $50 on your lifetime deal.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'} hover:shadow-lg transition-all duration-300`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mb-4">{plan.description}</CardDescription>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-2xl line-through text-muted-foreground">{plan.originalPrice}</span>
                      <span className="text-4xl font-bold">{plan.price}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{plan.saveText}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.period}</p>
                    <p className="text-sm text-green-600 font-medium">{plan.annualSavingsText}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-sm font-semibold">{plan.creditsPerMonth.toLocaleString()} credits/month (lifetime)</p>
                    <p className="text-xs text-muted-foreground mt-1">Rollover for {plan.rolloverMonths} months</p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground line-through"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <PricingClient
                    plan={plan}
                    isAuthenticated={isAuthenticated}
                  />

                  <div className="pt-3 text-center">
                    <a href="/refund-policy" className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-background hover:bg-muted transition-colors">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-600"></span>
                      14‑Day Money‑Back Guarantee
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
