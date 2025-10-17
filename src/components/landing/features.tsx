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
      icon: <Bot className="w-8 h-8" />,
      title: "AI Content Repurposing",
      description: "Transform any content into platform-optimized posts for Twitter, LinkedIn, Instagram, and Email. AI-powered generation with custom tones and styles.",
      color: "text-purple-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "15+ YouTube Trending Videos",
      description: "Discover trending videos from 5 categories: Science & Tech, People & Blogs, News & Politics, Entertainment, and Music. Updated in real-time.",
      color: "text-red-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-Time Trend Alerts",
      description: "Get instant notifications for new trending topics, hashtag surges, YouTube updates, and multi-platform trends. Stay ahead of the curve.",
      color: "text-yellow-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Platform Hashtags",
      description: "Curated trending hashtags for Twitter, LinkedIn, Instagram, and Email. Click to copy individual tags or entire collections.",
      color: "text-blue-500"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track trending topic performance over time with interactive charts. See engagement trends across 24 hours, 7 days, or 30 days.",
      color: "text-green-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "YouTube Category Hashtags",
      description: "Organized hashtags by YouTube category with color-coded cards. Copy all hashtags for a category or individual tags with one click.",
      color: "text-pink-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Content Generation Modal",
      description: "Customize content prompts and select target platforms. Generate engaging posts with hashtags, emojis, and CTAs automatically included.",
      color: "text-indigo-500"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Multi-Source Trending Data",
      description: "Aggregate trends from YouTube, Reddit, and News APIs. Real-time data fetching with smart caching and fallback mechanisms.",
      color: "text-cyan-500"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful UI Components",
      description: "Modern, responsive design with smooth animations. Color-coded categories, hover effects, and intuitive navigation throughout.",
      color: "text-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Smart Content Tools",
      description: "AI Topic Generator, bulk hashtag copying, and template browsing. Quick actions for trending content at your fingertips.",
      color: "text-teal-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure Authentication",
      description: "Google OAuth with NextAuth.js for secure user authentication. Protected routes and session management built-in.",
      color: "text-violet-500"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Credit-Based System",
      description: "Fair usage tracking with credit system. Stripe integration for Pro subscriptions with automatic credit allocation.",
      color: "text-emerald-500"
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
            Powerful Features for
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Content Creators
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to discover trends, repurpose content, and grow your reach 
            across multiple platforms with AI-powered tools.
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
            <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Content Reach?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join content creators who are discovering trends, repurposing content with AI, 
              and growing their audience across multiple platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Creating Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Explore Trending Topics
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
