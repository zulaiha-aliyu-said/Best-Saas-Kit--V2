import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { FileText, Zap, Clock, Sparkles, Target, TrendingUp, CheckCircle2, Rocket } from "lucide-react";

export const metadata = {
  title: 'Content Templates | Features | RepurposeAI',
  description: 'Quick-start templates for common content transformation scenarios with one-click application.',
};

export default function TemplatesPage() {
  return (
    <FeatureDetailTemplate
      badge="Time-Saver"
      badgeColor="bg-cyan-600"
      title="Content Templates"
      description="Access pre-configured templates for common content transformation scenarios. Whether you're repurposing a blog post, YouTube video, or podcast, start with proven templates that apply best practices automatically. One-click setup gets you creating content in seconds."
      heroIcon={FileText}
      heroGradient="from-cyan-500 to-blue-500"
      ctaPrimary="Browse Templates"
      ctaPrimaryLink="/dashboard/repurpose"

      benefits={[
        {
          icon: Clock,
          title: "Instant Setup",
          description: "Skip configuration and start creating with one-click templates"
        },
        {
          icon: Sparkles,
          title: "Best Practices",
          description: "Templates built on proven content transformation strategies"
        },
        {
          icon: Target,
          title: "Scenario-Specific",
          description: "Templates designed for specific use cases and content types"
        },
        {
          icon: Rocket,
          title: "Quick Results",
          description: "Go from idea to published content in minutes, not hours"
        }
      ]}

      howItWorks={[
        {
          step: "1",
          title: "Choose Template",
          description: "Select from Blog to Social, Video to Posts, Podcast to Newsletter, etc.",
          color: "from-cyan-500 to-blue-500"
        },
        {
          step: "2",
          title: "Auto-Configure",
          description: "Template applies optimal settings for platforms, tone, and length",
          color: "from-blue-500 to-indigo-500"
        },
        {
          step: "3",
          title: "Add Your Content",
          description: "Paste or upload your source content",
          color: "from-indigo-500 to-purple-500"
        },
        {
          step: "4",
          title: "Generate & Publish",
          description: "AI creates platform-optimized content ready to publish",
          color: "from-purple-500 to-pink-500"
        }
      ]}

      features={[
        "15+ Pre-Built Templates",
        "Blog to Social Media",
        "YouTube to Posts",
        "Podcast to Newsletter",
        "Article to Threads",
        "Long-form to Short-form",
        "One-Click Apply",
        "Best Practice Settings",
        "Platform Optimization",
        "Custom Template Creation",
        "Template Favorites",
        "Template Categories",
        "Quick Preview",
        "Template Descriptions",
        "Success Rate Tracking",
        "Template Recommendations"
      ]}

      useCases={[
        {
          title: "Bloggers",
          description: "Repurpose blog posts into social content instantly"
        },
        {
          title: "YouTubers",
          description: "Transform video content into text posts effortlessly"
        },
        {
          title: "Podcasters",
          description: "Convert episodes into newsletters and social posts"
        },
        {
          title: "Beginners",
          description: "Start with proven templates instead of guessing settings"
        },
        {
          title: "Busy Professionals",
          description: "Save time with pre-configured workflows"
        },
        {
          title: "Content Teams",
          description: "Standardize content transformation processes"
        }
      ]}

      ctaTitle="Ready to Work Smarter, Not Harder?"
      ctaDescription="Start using proven templates to create content in minutes."
    />
  );
}
