"use client"

import { motion } from "framer-motion"
import { Users, Code, Star, Zap } from "lucide-react"

const Stats = () => {
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      value: "1000+",
      label: "Developers",
      description: "Building with our kit",
      color: "text-blue-500"
    },
    {
      icon: <Code className="w-8 h-8" />,
      value: "50+",
      label: "Components",
      description: "Pre-built & ready",
      color: "text-purple-500"
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "500+",
      label: "GitHub Stars",
      description: "Community trusted",
      color: "text-yellow-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      value: "30 min",
      label: "Setup Time",
      description: "From clone to deploy",
      color: "text-green-500"
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`${stat.color} flex justify-center mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
