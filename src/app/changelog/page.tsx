import { Metadata } from 'next'
import Link from 'next/link'
import { Rocket, Sparkles, Bug, Wrench, Plus, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog | RepurposeAI',
  description: 'Track all updates, new features, and improvements to RepurposeAI.',
}

interface ChangelogEntry {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  changes: {
    category: 'new' | 'improved' | 'fixed' | 'deprecated'
    items: string[]
  }[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: 'October 24, 2025',
    type: 'major',
    changes: [
      {
        category: 'new',
        items: [
          'Next.js 15 upgrade with App Router architecture',
          'Tailwind CSS v4 integration with modern design system',
          'Complete UI/UX overhaul with purple/violet theme',
          'Public pricing pages for non-authenticated users',
          'Enhanced feature detail pages with comprehensive documentation',
          'Improved mobile responsiveness across all pages',
        ],
      },
      {
        category: 'improved',
        items: [
          'Landing page optimization - removed GitHub references',
          'Streamlined hero section for better conversion',
          'Updated pricing section with accurate LTD tiers',
          'Enhanced navigation with cleaner layout',
          'Faster page load times with optimized assets',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Duplicate FAQ sections on landing page',
          'Color inconsistencies across feature pages',
          'Background contrast issues on dark mode',
          'Build errors with Next.js 15 compatibility',
        ],
      },
    ],
  },
  {
    version: '1.8.0',
    date: 'October 15, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Competitor Analysis feature with real-time insights',
          'Content Gap Analysis to identify opportunities',
          'Top Competitor Posts tracking and analysis',
          'Comprehensive competitor insights dashboard',
        ],
      },
      {
        category: 'improved',
        items: [
          'Analytics dashboard with better data visualization',
          'Enhanced chart components (Content Breakdown, Format Performance, Posting Pattern)',
          'Improved loading states and error handling',
        ],
      },
    ],
  },
  {
    version: '1.7.0',
    date: 'October 1, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Promotional discount system',
          'Enhanced management tools',
          'Advanced user management features',
          'System-wide discount tracking',
        ],
      },
      {
        category: 'improved',
        items: [
          'Credit system optimization for better performance',
          'Enhanced billing integration with improved security',
          'Improved notification system with real-time updates',
        ],
      },
    ],
  },
  {
    version: '1.6.0',
    date: 'September 20, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Style Training feature to learn your brand voice',
          'Custom content templates for faster creation',
          'Template library with pre-built options',
          'Brand voice consistency across all generated content',
        ],
      },
      {
        category: 'improved',
        items: [
          'AI Chat Assistant with better context understanding',
          'Viral Hooks Generator with more variety',
          'Content repurposing quality improvements',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Template saving issues in certain browsers',
          'Style training accuracy for longer content',
          'Character limit handling in templates',
        ],
      },
    ],
  },
  {
    version: '1.5.0',
    date: 'September 5, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Team Management with multi-user collaboration',
          'Role-based permissions (Admin, Editor, Viewer)',
          'Team workspace for shared content',
          'Activity logs for team actions',
        ],
      },
      {
        category: 'improved',
        items: [
          'Dashboard performance optimization',
          'Credit usage tracking with detailed breakdown',
          'Notification system for team activities',
        ],
      },
    ],
  },
  {
    version: '1.4.0',
    date: 'August 22, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Trending Topics discovery from YouTube, Reddit, and News',
          'Real-time trend alerts and notifications',
          'Topic analytics with engagement metrics',
          'Custom topic tracking and monitoring',
        ],
      },
      {
        category: 'improved',
        items: [
          'Faster trend data fetching with caching',
          'Better categorization of trending content',
          'Enhanced search and filtering for topics',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: 'August 8, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Content Scheduling with calendar view',
          'Multi-platform scheduling support',
          'Recurring post scheduling',
          'Scheduling analytics and best time suggestions',
        ],
      },
      {
        category: 'improved',
        items: [
          'Calendar UI with drag-and-drop functionality',
          'Time zone support for global audiences',
          'Bulk scheduling capabilities',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Scheduling conflicts with overlapping posts',
          'Time zone conversion accuracy',
          'Calendar view performance on mobile',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: 'July 25, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Performance Analytics dashboard',
          'Content performance tracking across platforms',
          'Engagement metrics and insights',
          'Predictive analytics for content success',
        ],
      },
      {
        category: 'improved',
        items: [
          'Real-time analytics data updates',
          'Enhanced data visualization with charts',
          'Export analytics reports as PDF/CSV',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: 'July 10, 2025',
    type: 'minor',
    changes: [
      {
        category: 'new',
        items: [
          'Lifetime Deal (LTD) system with tiered pricing',
          'LTD-specific features and credit allocations',
          'Public LTD pricing page',
          'One-time payment option with secure processing',
        ],
      },
      {
        category: 'improved',
        items: [
          'Payment integration with better error handling',
          'Payment flow optimization',
          'Invoice generation for LTD purchases',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: 'June 28, 2025',
    type: 'major',
    changes: [
      {
        category: 'new',
        items: [
          'Initial launch of RepurposeAI platform',
          'AI Content Repurposing with advanced AI integration',
          'AI Chat Assistant for content ideation',
          'Viral Hooks Generator',
          'Video Transcript Extraction',
          'File Content Extraction (TXT, MD, HTML)',
          'Email Newsletter Generation',
          'Secure authentication system',
          'Credit-based usage system',
          'User dashboard with overview',
          'Enterprise-grade database integration',
        ],
      },
    ],
  },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'new':
      return <Plus className="w-4 h-4" />
    case 'improved':
      return <Wrench className="w-4 h-4" />
    case 'fixed':
      return <Bug className="w-4 h-4" />
    case 'deprecated':
      return <CheckCircle2 className="w-4 h-4" />
    default:
      return <Sparkles className="w-4 h-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'new':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    case 'improved':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    case 'fixed':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    case 'deprecated':
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    default:
      return 'text-primary bg-primary/10 border-primary/20'
  }
}

const getVersionBadgeColor = (type: string) => {
  switch (type) {
    case 'major':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'minor':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'patch':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    default:
      return 'bg-primary/10 text-primary border-primary/20'
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track all the latest updates, new features, and improvements to RepurposeAI. 
            We're constantly evolving to help you create better content.
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelog.map((entry, index) => (
            <div
              key={entry.version}
              className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 sm:p-8 hover:shadow-lg transition-all duration-300"
            >
              {/* Version Header */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  v{entry.version}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVersionBadgeColor(entry.type)}`}>
                  {entry.type.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {entry.date}
                </span>
              </div>

              {/* Changes */}
              <div className="space-y-6">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border mb-3 ${getCategoryColor(change.category)}`}>
                      {getCategoryIcon(change.category)}
                      <span className="capitalize">{change.category}</span>
                    </div>
                    <ul className="space-y-2 ml-4">
                      {change.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span className="text-muted-foreground leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">
              Follow our <Link href="/roadmap" className="text-primary hover:underline">roadmap</Link> to see what's coming next!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

