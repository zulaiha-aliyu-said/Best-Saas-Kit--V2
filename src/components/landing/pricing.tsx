"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { PricingClient } from "./pricing-client"

interface PricingProps {
  isAuthenticated?: boolean;
}

const Pricing = ({ isAuthenticated = false }: PricingProps) => {
  const plans = [
    {
      name: "Pro Trial",
      price: "$5",
      period: "first month",
      description: "Test Pro for a month via Flutterwave",
      features: [
        "All Pro features for 1 month",
        "Intro price via Flutterwave",
        "200 bonus trial credits"
      ],
      cta: "Start $5 Trial",
      popular: false,
      variant: "outline" as const
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "For creators & businesses who need more",
      features: [
        "Unlimited credits",
        "All platform integrations",
        "Viral hooks generator",
        "Competitor analysis",
        "Content scheduling",
        "Advanced analytics",
        "AI style training",
        "Priority support",
        "Unlimited generations"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      variant: "default" as const
    },
    {
      name: "Lifetime Deal",
      price: "$49",
      period: "one-time",
      description: "Pay once, use forever - 4 tiers available",
      features: [
        "Lifetime access (no recurring fees)",
        "100-2,000 credits/month (tier based)",
        "12-month credit rollover",
        "Early bird pricing available",
        "Code stacking to multiply credits",
        "All features unlock at higher tiers",
        "Priority support (tier 2+)",
        "Future updates included"
      ],
      cta: "View LTD Tiers",
      popular: false,
      variant: "outline" as const
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
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs. Pro monthly or pay once for lifetime access.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'} hover:shadow-lg transition-all duration-300`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <PricingClient
                    plan={plan}
                    isAuthenticated={isAuthenticated}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Start Creating Content Today</h3>
            <p className="text-muted-foreground">
              Join thousands of content creators using RepurposeAI to save time and reach more people.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Pricing
