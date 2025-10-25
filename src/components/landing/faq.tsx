"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "How does AI content repurposing work?",
      answer: "Our AI analyzes your original content (videos, articles, podcasts) and automatically creates platform-specific versions. It understands context, tone, and platform requirements to generate LinkedIn posts, Twitter threads, Instagram captions, and more from a single piece of content."
    },
    {
      question: "What types of content can I repurpose?",
      answer: "You can repurpose YouTube videos, blog posts, podcasts, webinars, presentations, and any text-based content. Our AI supports multiple input formats and can extract key insights to create engaging content across all major social platforms."
    },
    {
      question: "How accurate is the AI-generated content?",
      answer: "Our AI achieves 95%+ accuracy in maintaining your original message while adapting it for different platforms. The content is reviewed by our quality algorithms and you can always edit and refine the generated content before publishing."
    },
    {
      question: "Can I customize the AI's writing style?",
      answer: "Yes! You can set your brand voice, tone preferences, and specific guidelines. The AI learns from your edits and feedback to maintain consistency with your brand across all generated content."
    },
    {
      question: "What platforms does it support?",
      answer: "We support LinkedIn, Twitter/X, Instagram, Facebook, TikTok, YouTube Shorts, Medium, and more. Each platform gets content optimized for its specific format, character limits, and audience expectations."
    },
    {
      question: "How much time does it save?",
      answer: "Users typically save 15-20 hours per week on content creation. What used to take hours of manual work now takes minutes. You can turn one YouTube video into 10+ pieces of content across all platforms in under 5 minutes."
    },
    {
      question: "Is there a limit on content generation?",
      answer: "Our plans include generous monthly limits that scale with your needs. Pro plan offers unlimited credits, while Lifetime Deal tiers provide 50K to 1M credits per month depending on your tier. You can always upgrade your tier as needed."
    },
    {
      question: "Can I schedule content directly from the platform?",
      answer: "Yes! You can schedule posts directly to LinkedIn, Twitter, and Facebook. We also provide export options for other platforms and integrate with popular scheduling tools like Buffer and Hootsuite."
    },
    {
      question: "What if I'm not satisfied with the generated content?",
      answer: "We offer unlimited revisions and edits. You can regenerate content with different parameters, manually edit the AI output, or request specific changes. Our goal is to give you content you're proud to publish."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for an account, choose your plan, upload your first piece of content, and let our AI work its magic. You'll see results in minutes and can start building your content library immediately. No technical setup required!"
    }
  ]

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {" "}Questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about our AI-powered content repurposing platform. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
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
            <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help you get the most out of our AI content repurposing platform. 
              Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ



