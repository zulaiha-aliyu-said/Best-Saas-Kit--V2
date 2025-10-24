"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      company: "TechFlow Media",
      content: "This AI-powered repurposing tool has revolutionized my content strategy. I can now turn one YouTube video into 10+ pieces of content across all platforms in minutes. My engagement has increased by 300%!",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Director",
      company: "InnovateLabs",
      content: "The AI content repurposing features are incredible. We're now creating consistent, high-quality content across LinkedIn, Twitter, and Instagram without hiring additional team members. ROI is through the roof!",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Emily Watson",
      role: "Social Media Manager",
      company: "DataCorp",
      content: "I love how the AI understands context and adapts content for different platforms. The LinkedIn posts feel professional, Twitter posts are punchy, and Instagram captions are engaging. It's like having a content team in one tool.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "David Kim",
      role: "Solo Entrepreneur",
      company: "Personal Brand",
      content: "As a solo founder, this tool is a game-changer. I can maintain a consistent presence across all platforms without spending hours on content creation. The AI-generated content is surprisingly good and saves me 20+ hours per week.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Lisa Thompson",
      role: "Content Strategist",
      company: "StartupXYZ",
      content: "The platform's ability to analyze trends and suggest content angles is phenomenal. We've seen a 250% increase in organic reach since using this tool. The AI really understands what resonates with our audience.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    },
    {
      name: "Alex Johnson",
      role: "Digital Marketing Consultant",
      company: "FreelanceForce",
      content: "I use this tool for all my client projects. The AI-powered repurposing saves me hours of work, and clients love the consistent, high-quality content across all their channels. It's become an essential part of my workflow.",
      rating: 5,
      avatar: "/api/placeholder/40/40"
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Loved by
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Content Creators
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of content creators, marketers, and entrepreneurs who have transformed 
            their content strategy with our AI-powered repurposing platform.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-muted-foreground">Content Pieces Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Time Saved</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
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
            <h3 className="text-2xl font-bold mb-4">Join the Content Revolution</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Start transforming your content strategy today and
              see why creators love our AI-powered repurposing platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Creating Content
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                See More Success Stories
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
