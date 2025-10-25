"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const TechStack = () => {
  const technologies = [
    {
      name: "Next.js 15",
      category: "Framework",
      description: "React App Router + streaming UI",
      logo: "/next.svg",
      color: "from-black to-gray-800"
    },
    {
      name: "TypeScript",
      category: "Language",
      description: "Strict typing for reliable builds",
      icon: "TS",
      color: "from-blue-600 to-blue-400"
    },
    {
      name: "Tailwind CSS",
      category: "Styling",
      description: "Responsive creator-first layouts",
      icon: "TW",
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: "ShadCN UI",
      category: "Components",
      description: "Accessible components & modals",
      icon: "UI",
      color: "from-gray-800 to-gray-600"
    },
    {
      name: "Neon Postgres",
      category: "Database",
      description: "Serverless analytics & history",
      icon: "🐘",
      color: "from-blue-700 to-blue-500"
    },
    {
      name: "OpenRouter API",
      category: "AI Engine",
      description: "Multi-model AI for content generation",
      icon: "🤖",
      color: "from-green-600 to-emerald-400"
    },
    {
      name: "Stripe",
      category: "Payments",
      description: "Secure payment processing & billing",
      icon: "💳",
      color: "from-indigo-600 to-purple-500"
    },
    {
      name: "NextAuth.js",
      category: "Authentication",
      description: "Secure Google OAuth integration",
      icon: "🔐",
      color: "from-cyan-600 to-blue-500"
    },
    {
      name: "YouTube Data API",
      category: "Data Source",
      description: "Fetch 15+ trending videos hourly",
      icon: "🎥",
      color: "from-red-600 to-orange-500"
    },
    {
      name: "Google Trends",
      category: "Insights",
      description: "Spot breakout topics in real time",
      icon: "📈",
      color: "from-purple-600 to-purple-400"
    }
  ]

  return (
    <section id="tech-stack" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Powered By
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Creator Tech
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A battle-tested stack combining AI generation, live trend data, and modern UI so you can launch content experiences fast.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {tech.logo ? (
                      <Image src={tech.logo} alt={tech.name} width={40} height={40} className="invert" />
                    ) : (
                      tech.icon
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{tech.name}</h3>
                  <p className="text-xs text-primary font-medium mb-2">{tech.category}</p>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Real-Time Trends
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              AI Generation
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Multi-Platform Ready
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Secure Infrastructure
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TechStack
