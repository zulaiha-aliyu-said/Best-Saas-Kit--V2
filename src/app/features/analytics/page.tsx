import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { BarChart3, TrendingUp, PieChart, LineChart, Target, Eye, Clock, Zap } from "lucide-react";

export const metadata = {
  title: 'Analytics Dashboard | Features | RepurposeAI',
  description: 'Track content performance with comprehensive analytics, insights, and visual reports.',
};

export default function AnalyticsPage() {
  return (
    <FeatureDetailTemplate
      badge="Data-Driven"
      badgeColor="bg-pink-600"
      title="Analytics Dashboard"
      description="Track your content performance with comprehensive analytics and insights. Monitor repurposed content, scheduled posts, performance predictions, and optimization metrics all in one powerful dashboard. Make data-driven decisions to improve your content strategy."
      heroIcon={BarChart3}
      heroGradient="from-pink-500 to-rose-500"
      ctaPrimary="View Analytics"
      ctaPrimaryLink="/dashboard/analytics"

      benefits={[
        {
          icon: Eye,
          title: "Complete Visibility",
          description: "See all your content metrics in one centralized dashboard"
        },
        {
          icon: TrendingUp,
          title: "Performance Tracking",
          description: "Monitor engagement, reach, and performance across all platforms"
        },
        {
          icon: Target,
          title: "ROI Measurement",
          description: "Track time saved and content efficiency to measure real ROI"
        },
        {
          icon: Zap,
          title: "Actionable Insights",
          description: "Get recommendations to optimize your content strategy"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Content Generation",
          description: "Analytics automatically track all your repurposed and scheduled content",
          color: "from-pink-500 to-rose-500"
        },
        {
          step: "2",
          title: "Data Collection",
          description: "System collects engagement, reach, and performance data",
          color: "from-rose-500 to-red-500"
        },
        {
          step: "3",
          title: "Visual Reports",
          description: "View beautiful charts and graphs showing your content performance",
          color: "from-red-500 to-orange-500"
        },
        {
          step: "4",
          title: "Optimize Strategy",
          description: "Use insights to refine your content approach and improve results",
          color: "from-orange-500 to-yellow-500"
        }
      ]}

      features={[
        "Repurposed Content Analytics",
        "Scheduled Posts Tracking",
        "Performance Prediction Analytics",
        "Optimization Recommendations",
        "Platform Performance Breakdown",
        "Engagement Rate Metrics",
        "Reach & Impressions Tracking",
        "Time Saved Calculator",
        "Content Volume Stats",
        "Top Performing Content",
        "Engagement Trend Charts",
        "Real-Time Updates",
        "Historical Data Analysis",
        "Export Reports (CSV/PDF)",
        "Custom Date Ranges",
        "Comparison Charts"
      ]}

      useCases={[
        {
          title: "Marketing Managers",
          description: "Prove ROI and track campaign performance"
        },
        {
          title: "Content Teams",
          description: "Identify what content resonates with audience"
        },
        {
          title: "Agency Clients",
          description: "Share performance reports with stakeholders"
        },
        {
          title: "Social Media Managers",
          description: "Optimize posting strategy based on data"
        },
        {
          title: "Business Owners",
          description: "Measure content marketing effectiveness"
        },
        {
          title: "Influencers",
          description: "Track growth and engagement metrics"
        }
      ]}

      ctaTitle="Ready to Make Data-Driven Decisions?"
      ctaDescription="Start tracking your content performance with powerful analytics today."
    />
  );
}
