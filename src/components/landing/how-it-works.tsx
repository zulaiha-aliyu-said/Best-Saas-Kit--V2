"use client"

import { motion } from "framer-motion"
import { UserPlus, Code2, Rocket, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-12 h-12" />,
      title: "Discover Trends",
      description: "Monitor real-time signals from YouTube, Reddit, and News. Spot breakout topics before they peak with AI-powered insight.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Code2 className="w-12 h-12" />,
      title: "Generate Content",
      description: "Turn any trend into tailored posts with AI. Choose tone, format, and platforms—Twitter, LinkedIn, Instagram, Email, and more.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Optimize Hashtags",
      description: "Auto-select platform-specific hashtag sets, then copy with one click. Mix in AI suggestions to boost discoverability.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: "Publish & Analyze",
      description: "Push content live and track performance trends over time. Use alerts and charts to iterate on what works next.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Go from emerging trend to published content in four guided steps. Everything stays synced across platforms and formats.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4" />
              )}

              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {index + 1}
                </div>

                <CardContent className="pt-8 pb-6 px-6">
                  <div className={`${step.bgColor} ${step.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Timeline for mobile */}
        <div className="lg:hidden mt-12 relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
