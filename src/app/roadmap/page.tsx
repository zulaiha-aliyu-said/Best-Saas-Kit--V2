import { Metadata } from 'next'
import Link from 'next/link'
import { Map, Zap, Clock, CheckCircle2, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Roadmap | repurposely',
  description: 'Explore what we are building next at repurposely. See upcoming features and our product vision.',
}

interface RoadmapItem {
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  quarter: string
  category: 'feature' | 'improvement' | 'integration' | 'infrastructure'
}

const roadmap: RoadmapItem[] = [
  // Q4 2025 - In Progress
  {
    title: 'Advanced Team Collaboration',
    description: 'Real-time collaborative editing, comments, and approvals for team workflows.',
    status: 'in-progress',
    quarter: 'Q4 2025',
    category: 'feature',
  },
  {
    title: 'Mobile Apps (iOS & Android)',
    description: 'Native mobile apps for content creation and management on the go.',
    status: 'in-progress',
    quarter: 'Q4 2025',
    category: 'feature',
  },
  {
    title: 'Advanced Analytics Dashboard',
    description: 'Deeper insights with ROI tracking, content attribution, and audience demographics.',
    status: 'in-progress',
    quarter: 'Q4 2025',
    category: 'improvement',
  },

  // Q1 2026 - Planned
  {
    title: 'Instagram & TikTok Integration',
    description: 'Direct publishing to Instagram and TikTok with platform-specific optimizations.',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'integration',
  },
  {
    title: 'Video Content Repurposing',
    description: 'AI-powered video editing, clip extraction, and automatic subtitle generation.',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'feature',
  },
  {
    title: 'Content Calendar Integration',
    description: 'Sync with Google Calendar, Outlook, and other calendar platforms.',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'integration',
  },
  {
    title: 'Advanced AI Models',
    description: 'Support for GPT-4o, Claude 3.5 Opus, and custom model selection.',
    status: 'planned',
    quarter: 'Q1 2026',
    category: 'improvement',
  },

  // Q2 2026 - Planned
  {
    title: 'White Label Solution',
    description: 'Customizable white-label platform for agencies and enterprises.',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'feature',
  },
  {
    title: 'API Access',
    description: 'Developer API for custom integrations and automation workflows.',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'infrastructure',
  },
  {
    title: 'Zapier & Make Integration',
    description: 'Connect repurposely with 5000+ apps through automation platforms.',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'integration',
  },
  {
    title: 'A/B Testing for Content',
    description: 'Test different variations of content to optimize performance.',
    status: 'planned',
    quarter: 'Q2 2026',
    category: 'feature',
  },

  // Q3 2026 - Planned
  {
    title: 'Multi-Language Support',
    description: 'Content creation and translation in 50+ languages.',
    status: 'planned',
    quarter: 'Q3 2026',
    category: 'feature',
  },
  {
    title: 'Advanced SEO Optimization',
    description: 'Keyword research, SEO scoring, and optimization recommendations.',
    status: 'planned',
    quarter: 'Q3 2026',
    category: 'feature',
  },
  {
    title: 'Content Library & Asset Management',
    description: 'Organized library for images, videos, templates, and brand assets.',
    status: 'planned',
    quarter: 'Q3 2026',
    category: 'feature',
  },
  {
    title: 'Podcast Episode Repurposing',
    description: 'Convert podcast episodes into blog posts, social content, and newsletters.',
    status: 'planned',
    quarter: 'Q3 2026',
    category: 'feature',
  },

  // Q4 2026 - Planned
  {
    title: 'AI Image & Video Generation',
    description: 'Generate custom images and short videos using AI for content.',
    status: 'planned',
    quarter: 'Q4 2026',
    category: 'feature',
  },
  {
    title: 'Advanced Competitor Intelligence',
    description: 'Comprehensive competitor tracking, benchmarking, and alerts.',
    status: 'planned',
    quarter: 'Q4 2026',
    category: 'improvement',
  },
  {
    title: 'Custom Workflows & Automation',
    description: 'Build custom automation workflows for content creation and distribution.',
    status: 'planned',
    quarter: 'Q4 2026',
    category: 'feature',
  },
  {
    title: 'Enterprise Features',
    description: 'SSO, advanced security, SLA guarantees, and dedicated support.',
    status: 'planned',
    quarter: 'Q4 2026',
    category: 'infrastructure',
  },

  // Recently Completed
  {
    title: 'Next.js 15 & Tailwind CSS v4',
    description: 'Platform upgrade with modern architecture and design system.',
    status: 'completed',
    quarter: 'Q4 2025',
    category: 'infrastructure',
  },
  {
    title: 'Competitor Analysis Dashboard',
    description: 'Track and analyze competitor content strategies and performance.',
    status: 'completed',
    quarter: 'Q4 2025',
    category: 'feature',
  },
  {
    title: 'Public Pricing Pages',
    description: 'Accessible LTD and pricing information for non-authenticated users.',
    status: 'completed',
    quarter: 'Q4 2025',
    category: 'improvement',
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5" />
    case 'in-progress':
      return <Zap className="w-5 h-5" />
    case 'planned':
      return <Clock className="w-5 h-5" />
    default:
      return <Target className="w-5 h-5" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    case 'in-progress':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    case 'planned':
      return 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'feature':
      return 'bg-primary/10 text-primary'
    case 'improvement':
      return 'bg-blue-500/10 text-blue-500'
    case 'integration':
      return 'bg-purple-500/10 text-purple-500'
    case 'infrastructure':
      return 'bg-orange-500/10 text-orange-500'
    default:
      return 'bg-gray-500/10 text-gray-500'
  }
}

export default function RoadmapPage() {
  const groupedRoadmap = roadmap.reduce((acc, item) => {
    if (!acc[item.quarter]) {
      acc[item.quarter] = []
    }
    acc[item.quarter].push(item)
    return acc
  }, {} as Record<string, RoadmapItem[]>)

  const quarters = Object.keys(groupedRoadmap).sort((a, b) => {
    // Sort quarters chronologically
    const [qA, yA] = a.split(' ')
    const [qB, yB] = b.split(' ')
    if (yA !== yB) return parseInt(yB) - parseInt(yA)
    return parseInt(qB.charAt(1)) - parseInt(qA.charAt(1))
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Map className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Product Roadmap</h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            See what we're building next at repurposely. Our roadmap is driven by your feedback
            and our vision to make content creation effortless.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor('completed')}`}>
            {getStatusIcon('completed')}
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor('in-progress')}`}>
            {getStatusIcon('in-progress')}
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor('planned')}`}>
            {getStatusIcon('planned')}
            <span className="text-sm font-medium">Planned</span>
          </div>
        </div>

        {/* Roadmap by Quarter */}
        <div className="space-y-12">
          {quarters.map((quarter) => (
            <div key={quarter}>
              {/* Quarter Header */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">{quarter}</h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedRoadmap[quarter].map((item, index) => (
                  <div
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Status & Category */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status.replace('-', ' ')}</span>
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <Target className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Have a Feature Request?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We'd love to hear your ideas! Your feedback helps shape our roadmap and build 
              features that matter most to you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="mailto:feedback@repurposeai.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Submit Feedback
              </Link>
              <Link
                href="/changelog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-card border rounded-lg font-medium hover:bg-muted/50 transition-colors"
              >
                View Changelog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

