import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Users, Target, TrendingUp, Zap, Brain, BarChart3, Eye, LineChart } from "lucide-react";

export const metadata = {
  title: 'Competitor Analysis | Features | RepurposeAI',
  description: 'Track, analyze, and learn from your competitors with real-time insights and AI-powered content analysis.',
};

export default function CompetitorAnalysisPage() {
  return (
    <FeatureDetailTemplate
      badge="Pro Feature"
      badgeColor="bg-green-600"
      title="Competitor Analysis"
      description="Track, analyze, and learn from your competitors' content strategies across social media platforms. Get real-time insights into what's working for them, identify content gaps, and stay ahead of the competition with AI-powered analysis."
      heroIcon={Users}
      heroGradient="from-green-500 to-emerald-500"
      ctaPrimary="Try Competitor Analysis"
      ctaPrimaryLink="/dashboard/competitors"

      benefits={[
        {
          icon: Eye,
          title: "Real-time Tracking",
          description: "Monitor competitor content and performance metrics as they happen across platforms"
        },
        {
          icon: Brain,
          title: "AI-Powered Insights",
          description: "Advanced AI analyzes competitor strategies and provides actionable recommendations"
        },
        {
          icon: TrendingUp,
          title: "Content Gap Analysis",
          description: "Discover untapped opportunities and topics your competitors are missing"
        },
        {
          icon: BarChart3,
          title: "Performance Metrics",
          description: "Track engagement rates, posting patterns, and content performance data"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Add Competitors",
          description: "Enter competitor usernames from Twitter, LinkedIn, Instagram, or other platforms",
          color: "from-green-500 to-emerald-500"
        },
        {
          step: "2",
          title: "AI Analyzes Data",
          description: "Our AI tracks and analyzes their content, engagement, and posting patterns",
          color: "from-emerald-500 to-teal-500"
        },
        {
          step: "3",
          title: "Review Insights",
          description: "Get detailed reports on top posts, content breakdown, and performance trends",
          color: "from-teal-500 to-cyan-500"
        },
        {
          step: "4",
          title: "Apply Learnings",
          description: "Use insights to improve your content strategy and fill identified gaps",
          color: "from-cyan-500 to-blue-500"
        }
      ]}

      features={[
        "Multi-Platform Competitor Tracking",
        "Real-time Content Monitoring",
        "AI-Powered Content Analysis",
        "Top Performing Posts Tracking",
        "Engagement Rate Analysis",
        "Posting Pattern Insights",
        "Content Type Breakdown",
        "Format Performance Charts",
        "Topic & Hashtag Analysis",
        "Content Gap Identification",
        "Comparison Dashboards",
        "Historical Performance Data",
        "Automated Reports",
        "Competitive Benchmarking",
        "Trend Detection",
        "Export Analytics Data"
      ]}

      useCases={[
        {
          title: "Content Strategists",
          description: "Develop data-driven content strategies based on competitive intelligence"
        },
        {
          title: "Marketing Teams",
          description: "Stay ahead of competition and identify winning content formats"
        },
        {
          title: "Brand Managers",
          description: "Monitor brand positioning and competitive landscape"
        },
        {
          title: "Social Media Managers",
          description: "Optimize posting times and content types based on competitor data"
        },
        {
          title: "Agencies",
          description: "Provide comprehensive competitive intelligence to clients"
        },
        {
          title: "Startups",
          description: "Learn from established competitors and find market gaps"
        }
      ]}

      ctaTitle="Ready to Outsmart Your Competition?"
      ctaDescription="Start tracking and learning from your competitors with AI-powered analysis today."
    />
  );
}
