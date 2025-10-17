"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Image, FileText, Code, TrendingUp, Sparkles } from "lucide-react"

const UseCases = () => {
  const useCases = [
    {
      icon: <MessageSquare className="w-10 h-10" />,
      title: "AI Chat Applications",
      description: "Build intelligent chatbots and conversational AI apps with OpenRouter integration, credit management, and real-time streaming.",
      examples: ["Customer Support Bots", "Virtual Assistants", "AI Tutors"],
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Image className="w-10 h-10" />,
      title: "Content Generation",
      description: "Create AI-powered content creation platforms with user management, subscription billing, and usage tracking.",
      examples: ["Blog Post Generators", "Social Media Tools", "Marketing Copy"],
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <Code className="w-10 h-10" />,
      title: "Developer Tools",
      description: "Launch code generation, debugging, or documentation tools with built-in authentication and payment processing.",
      examples: ["Code Assistants", "API Documentation", "Testing Tools"],
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: "Document Processing",
      description: "Build document analysis, summarization, or extraction tools with secure user accounts and credit systems.",
      examples: ["PDF Analyzers", "Text Summarizers", "Data Extractors"],
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: <TrendingUp className="w-10 h-10" />,
      title: "Business Analytics",
      description: "Create AI-powered analytics dashboards with admin panels, user management, and subscription tiers.",
      examples: ["Market Analysis", "Trend Prediction", "Report Generation"],
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      title: "Creative Tools",
      description: "Launch creative AI applications with payment integration, user galleries, and usage-based pricing.",
      examples: ["Design Assistants", "Music Generators", "Story Writers"],
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
            Perfect For Any
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}AI Use Case
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're building chatbots, content generators, or developer tools, 
            our kit provides everything you need to launch quickly.
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
