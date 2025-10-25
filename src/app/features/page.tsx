import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Repeat2,
  MessageSquare,
  Zap,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  Palette,
  FileText,
  UsersRound,
  Crown,
  CreditCard,
  Shield,
  Percent,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Star
} from "lucide-react";

export const metadata = {
  title: 'Features | RepurposeAI - AI-Powered Content Platform',
  description: 'Discover all the powerful features that make RepurposeAI the ultimate content repurposing platform.',
};

const features = [
  {
    id: 'content-repurposing',
    icon: Repeat2,
    title: 'Content Repurposing',
    description: 'Transform one piece of content into multiple platform-specific posts with AI',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'Most Popular',
    badgeColor: 'bg-purple-600',
    highlights: ['4+ Platforms', 'Multiple Formats', 'AI-Powered'],
  },
  {
    id: 'ai-chat-assistant',
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Get instant help and content ideas from our advanced AI assistant',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'New',
    badgeColor: 'bg-blue-600',
    highlights: ['24/7 Available', 'Context Aware', 'Instant Responses'],
  },
  {
    id: 'viral-hooks',
    icon: Zap,
    title: 'Viral Hooks Generator',
    description: 'Create attention-grabbing hooks that boost engagement by up to 300%',
    gradient: 'from-yellow-500 to-orange-500',
    badge: 'Trending',
    badgeColor: 'bg-yellow-600',
    highlights: ['High Engagement', 'Proven Templates', 'AI-Generated'],
  },
  {
    id: 'competitor-analysis',
    icon: Users,
    title: 'Competitor Analysis',
    description: 'Track, analyze, and learn from your competitors\' content strategies',
    gradient: 'from-green-500 to-emerald-500',
    badge: 'Pro Feature',
    badgeColor: 'bg-green-600',
    highlights: ['Real-time Tracking', 'Deep Insights', 'Content Gaps'],
  },
  {
    id: 'trending-topics',
    icon: TrendingUp,
    title: 'Trending Topics & Hashtags',
    description: 'Discover what\'s hot with real-time data from multiple sources',
    gradient: 'from-red-500 to-pink-500',
    badge: 'Live Data',
    badgeColor: 'bg-red-600',
    highlights: ['Real-time Trends', 'Multiple Sources', 'Smart Hashtags'],
  },
  {
    id: 'scheduling',
    icon: Calendar,
    title: 'Content Scheduling',
    description: 'Plan and automate your content distribution across all platforms',
    gradient: 'from-indigo-500 to-purple-500',
    badge: 'Essential',
    badgeColor: 'bg-indigo-600',
    highlights: ['Auto-posting', 'Calendar View', 'Best Times'],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance with comprehensive analytics and insights',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'Data-Driven',
    badgeColor: 'bg-pink-600',
    highlights: ['Deep Metrics', 'Visual Reports', 'ROI Tracking'],
  },
  {
    id: 'style-training',
    icon: Palette,
    title: 'AI Style Training',
    description: 'Train AI to write in your unique voice and brand style',
    gradient: 'from-violet-500 to-purple-500',
    badge: 'Advanced',
    badgeColor: 'bg-violet-600',
    highlights: ['Learn Your Style', 'Brand Voice', 'Consistent Tone'],
  },
  {
    id: 'templates',
    icon: FileText,
    title: 'Content Templates',
    description: 'Quick-start templates for common content transformation scenarios',
    gradient: 'from-cyan-500 to-blue-500',
    badge: 'Time-Saver',
    badgeColor: 'bg-cyan-600',
    highlights: ['Pre-configured', 'Best Practices', 'One-Click Apply'],
  },
  {
    id: 'team-management',
    icon: UsersRound,
    title: 'Team Collaboration',
    description: 'Work together with your team on content creation and management',
    gradient: 'from-orange-500 to-red-500',
    badge: 'Teams',
    badgeColor: 'bg-orange-600',
    highlights: ['Role Management', 'Shared Access', 'Activity Tracking'],
  },
  {
    id: 'ltd-system',
    icon: Crown,
    title: 'Lifetime Deal Tiers',
    description: 'Flexible lifetime access plans with increasing features and credits',
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'Lifetime Access',
    badgeColor: 'bg-amber-600',
    highlights: ['5 Tiers', 'Lifetime Access', 'No Recurring Fees'],
  },
  {
    id: 'credit-system',
    icon: CreditCard,
    title: 'Smart Credit System',
    description: 'Flexible usage-based credits with optimization suggestions',
    gradient: 'from-teal-500 to-green-500',
    badge: 'Flexible',
    badgeColor: 'bg-teal-600',
    highlights: ['Pay-as-you-go', 'Smart Suggestions', 'Auto-refresh'],
  },
  {
    id: 'billing-integration',
    icon: Wallet,
    title: 'Seamless Billing',
    description: 'Secure payment processing with multiple plan options',
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'Secure',
    badgeColor: 'bg-emerald-600',
    highlights: ['Secure Payments', 'Multiple Plans', 'Auto-billing'],
  },
];

const stats = [
  { label: 'Active Features', value: '50+', icon: Sparkles },
  { label: 'Platforms Supported', value: '4+', icon: Repeat2 },
  { label: 'Happy Users', value: '10K+', icon: Users },
  { label: 'Content Generated', value: '1M+', icon: FileText },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/40 via-muted/30 to-background py-24 px-4">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          <Badge className="bg-muted/50 backdrop-blur-sm border border-border px-6 py-2 text-base">
            <Star className="w-4 h-4 mr-2 inline text-primary" />
            15 Powerful Features
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Everything You Need to
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mt-2">
              Dominate Content Creation
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From AI-powered repurposing to advanced analytics, RepurposeAI provides all the tools you need to create, distribute, and optimize content across multiple platforms.
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href="/auth/signin">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all" asChild>
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-b bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-muted/50 text-primary border-border px-6 py-2 text-base">
              Full Feature Suite
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our comprehensive feature set designed to streamline your content workflow and maximize your reach.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.id} href={`/features/${feature.id}`}>
                  <Card className="group relative overflow-hidden border-2 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
                    {/* Background on Hover */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs px-3 py-1">
                          {feature.badge}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      {/* Highlights */}
                      <div className="space-y-2">
                        {feature.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Learn More Button */}
                      <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all duration-300">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-2xl mx-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Your Content?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of content creators and marketers who are already using RepurposeAI to save time and boost engagement.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href="/auth/signin">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-muted/50 transition-all" asChild>
              <Link href="/contact">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 bg-muted/20 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            All features are available with our Pro and Lifetime Deal plans.{' '}
            <Link href="/pricing" className="text-primary font-semibold hover:underline">
              View Pricing →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

