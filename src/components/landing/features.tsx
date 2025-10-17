"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Zap,
  Shield,
  Database,
  Palette,
  Bot,
  CreditCard,
  Code,
  Rocket,
  Users,
  BarChart3,
  Lock,
  Globe
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Google OAuth Authentication",
      description: "Secure authentication with NextAuth.js and Google OAuth. Automatic user creation, session management, and protected routes out of the box.",
      color: "text-green-500"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Stripe Payment Integration",
      description: "Complete payment system with Stripe checkout, webhook handling, and one-time Pro subscription ($99). Discount code system included.",
      color: "text-emerald-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Admin Panel",
      description: "Full-featured admin dashboard with user management, analytics, discount code creation, and system settings. Role-based access control.",
      color: "text-indigo-500"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "PostgreSQL Database",
      description: "Neon serverless PostgreSQL with custom functions for user management, credit tracking, and subscription handling. Fully optimized queries.",
      color: "text-blue-500"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Integration Ready",
      description: "OpenRouter API integration with credit-based usage system. Track AI usage, manage costs, and implement usage limits per user.",
      color: "text-purple-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Real-time user analytics, revenue tracking, credit usage monitoring, and detailed statistics. Admin and user-level insights.",
      color: "text-cyan-500"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Modern UI Components",
      description: "Beautiful, accessible components with ShadCN UI and Tailwind CSS v4. Dark/light theme support and responsive design.",
      color: "text-pink-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "TypeScript & Best Practices",
      description: "Fully typed with TypeScript, ESLint configured, and following Next.js 15 best practices. Clean, maintainable codebase.",
      color: "text-orange-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Credit Management System",
      description: "Built-in credit system for usage tracking. Automatic credit allocation, deduction, and balance management with database transactions.",
      color: "text-yellow-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Discount Code System",
      description: "Create and manage promotional codes from admin panel. Percentage or fixed discounts, usage limits, and expiration dates with Stripe sync.",
      color: "text-red-500"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Production Ready",
      description: "Optimized for Vercel deployment with environment configuration, error handling, and webhook endpoints ready for production.",
      color: "text-violet-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "User Dashboard",
      description: "Complete user dashboard with billing management, subscription status, credit balance, and profile settings. Seamless user experience.",
      color: "text-teal-500"
    }
  ]

  return (
    <section id="features" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-2">
              <Image
                src="/best saas kit.png"
                alt="Best SAAS Kit V2 - Complete AI-Powered SAAS Starter Kit"
                width={1200}
                height={800}
                className="w-full h-auto rounded-xl"
                priority
                quality={95}
              />
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent rounded-xl" />
            </div>

            {/* Floating elements for visual appeal */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary/20 rounded-full blur-sm" />
            <div className="absolute -top-2 -right-6 w-6 h-6 bg-secondary/30 rounded-full blur-sm" />
            <div className="absolute -bottom-3 left-8 w-5 h-5 bg-accent/25 rounded-full blur-sm" />
            <div className="absolute -bottom-4 -right-3 w-7 h-7 bg-primary/15 rounded-full blur-sm" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Launch Fast
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A complete toolkit with all the features and integrations you need to build, 
            deploy, and scale your AI-powered SAAS application.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your AI SAAS?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of developers who have already launched their AI applications 
              using our comprehensive toolkit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Building Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                View Documentation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
