"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Rocket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 pt-20 sm:pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-muted/50 backdrop-blur-sm border border-border rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-muted-foreground"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">AI-Powered Content Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight"
          >
            Transform Content
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Discover Trends
            </span>
            <br />
            Grow Your Reach
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
          >
            Repurpose content across platforms with AI and discover trending topics from YouTube, Reddit, and News. 
            Create engaging posts in seconds and stay ahead of the curve.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 text-sm"
          >
            <div className="flex items-center space-x-2 bg-muted/30 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Content Repurposing</span>
            </div>
            <div className="flex items-center space-x-2 bg-muted/30 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>15+ YouTube Trending Videos</span>
            </div>
            <div className="flex items-center space-x-2 bg-muted/30 backdrop-blur-sm border border-border rounded-full px-4 py-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span>Real-Time Trend Alerts</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              className="text-base font-medium px-6 py-3 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/auth/signin" className="flex items-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base font-medium px-6 py-3 h-12 rounded-lg border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link href="/dashboard">View Dashboard Demo</Link>
            </Button>
          </motion.div>

          {/* Product Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="pt-12 sm:pt-16 lg:pt-20 px-4"
          >
            <div className="relative max-w-6xl mx-auto">
              {/* Glow Effect Behind Image */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 blur-3xl opacity-50 -z-10 scale-105" />
              
              {/* Image Container with Border and Shadow */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
                <Image
                  src="/best saas kit.png"
                  alt="AI-Powered Content Transformation Interface"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  priority
                />
                
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -z-10" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
