"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Sparkles, Youtube, Megaphone, Share2, BarChart3 } from "lucide-react"

const UseCases = () => {
  const useCases = [
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: "Social Media Teams",
      description: "Plan and publish daily content across Twitter, LinkedIn, Instagram, and TikTok using AI-powered repurposing workflows.",
      examples: ["Campaign Calendars", "Thread Builders", "Carousel Copy"],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Youtube className="w-10 h-10" />,
      title: "YouTube Creators",
      description: "Turn trending videos into companion social posts, newsletter summaries, and podcast scripts within minutes.",
      examples: ["Episode Highlights", "Short Form Hooks", "Community Posts"],
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: <Megaphone className="w-10 h-10" />,
      title: "Marketing Agencies",
      description: "Monitor trend alerts for clients, generate branded content variations, and deliver analytics in a single dashboard.",
      examples: ["Client Trend Reports", "Brand Voice Presets", "Content Calendars"],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <Share2 className="w-10 h-10" />,
      title: "Community Managers",
      description: "Respond to momentum in real time with curated hashtags, ready-to-send announcements, and automated engagement prompts.",
      examples: ["Discord Announcements", "Newsletter Segments", "Event Promos"],
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Growth Teams",
      description: "Track content performance over time, experiment with AI-written variations, and double down on what converts.",
      examples: ["A/B Copy Testing", "Trend Attribution", "Engagement Dashboards"],
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: "Solo Creators",
      description: "Automate ideation, convert long-form content into snackable clips, and keep every channel active without burnout.",
      examples: ["Blog-to-Thread", "Video Clip Scripts", "Email Drips"],
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    }
  ]

  return (
    <section id="use-cases" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Built For Modern
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Content Teams
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how creators, marketers, and growth teams turn real-time trends into platform-ready content with one unified workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm group">
                <CardHeader>
                  <div className={`${useCase.bgColor} ${useCase.color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{useCase.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Popular Examples:</p>
                    <ul className="space-y-1">
                      {useCase.examples.map((example) => (
                        <li key={example} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          {example}
                        </li>
                      ))}
                    </ul>
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

export default UseCases
