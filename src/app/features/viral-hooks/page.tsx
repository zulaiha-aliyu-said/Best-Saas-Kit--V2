import { FeatureDetailTemplate } from "@/components/features/FeatureDetailTemplate";
import { Zap, TrendingUp, Target, Sparkles, Brain } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: 'Viral Hooks Generator | Features | RepurposeAI',
  description: 'Create attention-grabbing hooks that boost engagement by up to 300% with AI-powered viral hook generation.',
};

export default function ViralHooksPage() {
  return (
    <FeatureDetailTemplate
      // Hero Section
      badge="High Engagement"
      badgeColor="bg-yellow-600"
      title="Viral Hooks Generator"
      description="Create attention-grabbing hooks that boost engagement by up to 300%. Use proven templates and AI-powered generation to craft irresistible opening lines that make people stop scrolling and start engaging with your content."
      heroIcon={Zap}
      heroGradient="from-yellow-500 to-orange-500"
      ctaPrimary="Generate Viral Hooks"
      ctaPrimaryLink="/dashboard/hooks"

      // Benefits
      benefits={[
        {
          icon: TrendingUp,
          title: "300% More Engagement",
          description: "Proven hooks that dramatically increase likes, comments, and shares"
        },
        {
          icon: Brain,
          title: "AI-Powered Generation",
          description: "Advanced AI creates hooks tailored to your topic and audience"
        },
        {
          icon: Sparkles,
          title: "Proven Templates",
          description: "Battle-tested hook formulas used by top content creators"
        },
        {
          icon: Target,
          title: "Platform-Optimized",
          description: "Hooks customized for Twitter, LinkedIn, Instagram, and more"
        }
      ]}
      benefitsTitle="Hook Benefits"
      benefitsSubtitle="Why great hooks matter for your content"

      // How It Works
      howItWorks={[
        {
          step: "1",
          title: "Enter Your Topic",
          description: "Tell us what your content is about or paste your main message",
          color: "from-yellow-500 to-orange-500"
        },
        {
          step: "2",
          title: "Choose Style",
          description: "Select from question, statistic, story, or bold statement hooks",
          color: "from-orange-500 to-red-500"
        },
        {
          step: "3",
          title: "AI Generates Hooks",
          description: "Get multiple viral hook options powered by AI in seconds",
          color: "from-red-500 to-pink-500"
        },
        {
          step: "4",
          title: "Copy & Use",
          description: "Pick your favorite hook and use it in your content immediately",
          color: "from-pink-500 to-purple-500"
        }
      ]}
      howItWorksTitle="How Viral Hooks Work"
      howItWorksSubtitle="Generate engaging hooks in four simple steps"

      // Features List
      features={[
        "AI-Powered Hook Generation",
        "10+ Proven Hook Templates",
        "Question-Based Hooks",
        "Statistic-Driven Hooks",
        "Story Opening Hooks",
        "Bold Statement Hooks",
        "Platform-Specific Optimization",
        "Tone Customization",
        "Character Count Optimization",
        "Hook Performance Tracking",
        "Copy to Clipboard",
        "Hook History",
        "Pattern Recognition",
        "Engagement Prediction",
        "A/B Testing Support",
        "Unlimited Generations"
      ]}
      featuresTitle="Complete Hook Arsenal"
      featuresSubtitle="Everything you need to create viral content"

      // Use Cases
      useCases={[
        {
          title: "Social Media Posts",
          description: "Grab attention on Twitter, LinkedIn, and Instagram"
        },
        {
          title: "Blog Articles",
          description: "Create compelling blog post introductions"
        },
        {
          title: "Email Campaigns",
          description: "Write subject lines and email openers that get opened"
        },
        {
          title: "YouTube Videos",
          description: "Hook viewers in the first 3 seconds"
        },
        {
          title: "Presentations",
          description: "Start slides with attention-grabbing statements"
        },
        {
          title: "Sales Copy",
          description: "Capture leads with irresistible headlines"
        }
      ]}

      // Additional Content
      additionalContent={
        <div className="space-y-16">
          {/* Hook Types */}
          <div className="text-center mb-16">
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mb-4">
              Hook Types
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven Hook Formulas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Choose from multiple hook types that are proven to drive engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                type: "Question Hook",
                icon: "❓",
                example: "What if I told you that 90% of marketers are doing content wrong?",
                color: "border-blue-300 bg-blue-50"
              },
              {
                type: "Statistic Hook",
                icon: "📊",
                example: "73% of consumers buy from brands that align with their values.",
                color: "border-green-300 bg-green-50"
              },
              {
                type: "Story Hook",
                icon: "📖",
                example: "I lost $10,000 before I learned this simple content strategy.",
                color: "border-purple-300 bg-purple-50"
              },
              {
                type: "Bold Statement",
                icon: "💥",
                example: "Everything you know about social media is wrong.",
                color: "border-red-300 bg-red-50"
              },
              {
                type: "How-To Hook",
                icon: "🎯",
                example: "Here's exactly how I grew my audience from 0 to 100K.",
                color: "border-orange-300 bg-orange-50"
              },
              {
                type: "Curiosity Hook",
                icon: "🤔",
                example: "This one trick changed everything about my content strategy.",
                color: "border-pink-300 bg-pink-50"
              }
            ].map((hook, idx) => (
              <div key={idx} className={`rounded-xl p-6 border-2 ${hook.color} hover:shadow-lg transition-all`}>
                <div className="text-4xl mb-3">{hook.icon}</div>
                <h3 className="text-xl font-bold mb-3">{hook.type}</h3>
                <p className="text-sm text-gray-700 italic">"{hook.example}"</p>
              </div>
            ))}
          </div>

          {/* Hook Performance */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-12 mt-16">
            <div className="text-center mb-12">
              <Badge className="bg-yellow-600 text-white mb-4">
                Performance Data
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                The Power of Great Hooks
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Data from 10,000+ posts shows the dramatic impact of viral hooks
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  metric: "300%",
                  label: "Higher Engagement",
                  description: "Posts with viral hooks get 3x more engagement"
                },
                {
                  metric: "5X",
                  label: "More Reach",
                  description: "Hooks increase content reach by 5x on average"
                },
                {
                  metric: "85%",
                  label: "Read-Through Rate",
                  description: "People who engage with hooks read full content"
                }
              ].map((stat, idx) => (
                <div key={idx} className="text-center bg-white rounded-2xl p-6 shadow-md">
                  <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                    {stat.metric}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mb-2">{stat.label}</div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }

      // CTA Section
      ctaTitle="Ready to Create Viral Hooks?"
      ctaDescription="Start generating attention-grabbing hooks that boost your engagement by 300%."
    />
  );
}
