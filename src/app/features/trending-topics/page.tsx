import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { TrendingUp, Sparkles, Hash, Video, Clock, Target, Zap, Globe } from "lucide-react";

export const metadata = {
  title: 'Trending Topics & Hashtags | Features | RepurposeAI',
  description: 'Discover what\'s hot with real-time trending topics, hashtags, and viral content from multiple sources.',
};

export default function TrendingTopicsPage() {
  return (
    <FeatureDetailTemplate
      badge="Live Data"
      badgeColor="bg-red-600"
      title="Trending Topics & Hashtags"
      description="Stay ahead of the curve with real-time trending topics, hashtags, and viral content. Access data from multiple sources including Twitter, LinkedIn, Instagram, YouTube, and more to create timely, relevant content that resonates with your audience."
      heroIcon={TrendingUp}
      heroGradient="from-red-500 to-pink-500"
      ctaPrimary="Explore Trending Topics"
      ctaPrimaryLink="/dashboard/trends"

      benefits={[
        {
          icon: Clock,
          title: "Real-Time Updates",
          description: "Get the latest trends as they happen across all major platforms"
        },
        {
          icon: Globe,
          title: "Multi-Source Data",
          description: "Aggregated trends from Twitter, LinkedIn, Instagram, YouTube, and more"
        },
        {
          icon: Target,
          title: "Niche Filtering",
          description: "Filter trends by category, platform, and industry relevance"
        },
        {
          icon: Zap,
          title: "Instant Content",
          description: "Generate content directly from trending topics with one click"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Browse Trends",
          description: "View hot topics, trending hashtags, and viral videos organized by platform",
          color: "from-red-500 to-pink-500"
        },
        {
          step: "2",
          title: "Filter by Category",
          description: "Select Technology, Business, Marketing, or other categories relevant to you",
          color: "from-pink-500 to-purple-500"
        },
        {
          step: "3",
          title: "Analyze Performance",
          description: "See trending performance charts and growth metrics for each topic",
          color: "from-purple-500 to-indigo-500"
        },
        {
          step: "4",
          title: "Generate Content",
          description: "Create platform-specific content based on trending topics instantly",
          color: "from-indigo-500 to-blue-500"
        }
      ]}

      features={[
        "Real-Time Trending Topics",
        "Multi-Platform Hashtags (Twitter, LinkedIn, Instagram)",
        "YouTube Trending Videos",
        "Category Filtering (Tech, Business, Marketing, etc.)",
        "Platform-Specific Trends",
        "Trending Performance Charts",
        "Growth Rate Tracking",
        "Topic Descriptions & Context",
        "Hashtag Copy Functionality",
        "YouTube Video Thumbnails & Stats",
        "Topic-to-Content Generation",
        "Content Customization Modal",
        "Trend Alerts & Notifications",
        "Historical Trend Data",
        "Engagement Metrics",
        "Export Trending Lists"
      ]}

      useCases={[
        {
          title: "Content Creators",
          description: "Create timely content that rides the wave of trending topics"
        },
        {
          title: "Social Media Managers",
          description: "Stay relevant with trending hashtags and topics"
        },
        {
          title: "Marketers",
          description: "Capitalize on trending conversations to boost reach"
        },
        {
          title: "Influencers",
          description: "Jump on trends early to maximize engagement"
        },
        {
          title: "Brands",
          description: "Join relevant conversations and increase brand visibility"
        },
        {
          title: "Agencies",
          description: "Keep clients' content fresh and timely"
        }
      ]}

      ctaTitle="Ready to Ride the Trend Wave?"
      ctaDescription="Start creating timely, relevant content with real-time trending data."
    />
  );
}
