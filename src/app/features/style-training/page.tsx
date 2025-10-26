import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Palette, Brain, Sparkles, Target, Zap, TrendingUp, CheckCircle2, FileText } from "lucide-react";

export const metadata = {
  title: 'AI Style Training | Features | RepurposeAI',
  description: 'Train AI to write in your unique voice and brand style for consistent, authentic content.',
};

export default function StyleTrainingPage() {
  return (
    <FeatureDetailTemplate
      badge="Advanced"
      badgeColor="bg-violet-600"
      title="AI Style Training"
      description="Train our AI to write in your unique voice and brand style. Upload examples of your best content, and our AI learns your tone, vocabulary, and style patterns to generate content that sounds authentically like you across all platforms."
      heroIcon={Palette}
      heroGradient="from-violet-500 to-purple-500"
      ctaPrimary="Train Your AI"
      ctaPrimaryLink="/dashboard/settings"
      
      benefits={[
        {
          icon: Brain,
          title: "Personalized AI",
          description: "AI learns your unique writing style, tone, and brand voice"
        },
        {
          icon: Sparkles,
          title: "Authentic Content",
          description: "Generated content sounds like you wrote it yourself"
        },
        {
          icon: Target,
          title: "Brand Consistency",
          description: "Maintain consistent messaging across all content and platforms"
        },
        {
          icon: Zap,
          title: "Time Efficiency",
          description: "No more extensive editing - AI gets it right the first time"
        }
      ]}
      
      howItWorks={[
        {
          step: "1",
          title: "Upload Examples",
          description: "Provide 3-5 examples of your best content that represents your style",
          color: "from-violet-500 to-purple-500"
        },
        {
          step: "2",
          title: "AI Analyzes",
          description: "Our AI analyzes tone, vocabulary, sentence structure, and patterns",
          color: "from-purple-500 to-fuchsia-500"
        },
        {
          step: "3",
          title: "Style Profile Created",
          description: "AI creates a style profile unique to your brand voice",
          color: "from-fuchsia-500 to-pink-500"
        },
        {
          step: "4",
          title: "Generate On-Brand Content",
          description: "All future content matches your style automatically",
          color: "from-pink-500 to-rose-500"
        }
      ]}
      
      features={[
        "Custom Style Training",
        "Multi-Example Learning",
        "Tone Analysis",
        "Vocabulary Mapping",
        "Sentence Structure Recognition",
        "Brand Voice Consistency",
        "Multiple Style Profiles",
        "Style Preview & Testing",
        "Refinement Options",
        "Style Strength Adjustment",
        "Platform-Specific Adaptation",
        "Automatic Style Application",
        "Style Templates",
        "Export Style Profiles",
        "Team Style Sharing",
        "Continuous Learning"
      ]}
      
      useCases={[
        {
          title: "Personal Brands",
          description: "Maintain authentic voice while scaling content production"
        },
        {
          title: "Corporate Teams",
          description: "Ensure all team members produce on-brand content"
        },
        {
          title: "Agencies",
          description: "Create unique style profiles for each client"
        },
        {
          title: "Influencers",
          description: "Keep your unique voice while working with assistants"
        },
        {
          title: "B2B Companies",
          description: "Maintain professional yet distinctive brand voice"
        },
        {
          title: "Content Creators",
          description: "Scale content without losing personal touch"
        }
      ]}
      
      ctaTitle="Ready to Clone Your Writing Style?"
      ctaDescription="Train AI to write like you and scale your content authentically."
    />
  );
}


