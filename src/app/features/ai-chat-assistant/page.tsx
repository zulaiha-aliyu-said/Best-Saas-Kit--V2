import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Brain,
  Zap,
  Clock,
  Target,
  Sparkles,
  Lightbulb,
  TrendingUp,
  BarChart3
} from "lucide-react";

export const metadata = {
  title: 'AI Chat Assistant | Features | RepurposeAI',
  description: 'Get instant help and content ideas from our advanced AI assistant powered by Qwen3-235B.',
};

export default function AIChatAssistantPage() {
  const benefits = [
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'AI assistant ready to help whenever you need content ideas or guidance'
    },
    {
      icon: Brain,
      title: 'Context-Aware',
      description: 'Maintains conversation context for more intelligent and helpful responses'
    },
    {
      icon: Zap,
      title: 'Instant Responses',
      description: 'Get immediate answers without waiting for human support'
    },
    {
      icon: Target,
      title: 'Multi-Purpose',
      description: 'From ideation to strategy, the AI helps with every content task'
    }
  ];

  const capabilities = [
    {
      icon: Lightbulb,
      title: 'Content Ideas',
      description: 'Generate fresh content ideas tailored to your niche and audience',
      examples: ['Blog post topics', 'Social media post ideas', 'Video concepts']
    },
    {
      icon: TrendingUp,
      title: 'Strategy Planning',
      description: 'Develop comprehensive content strategies and marketing plans',
      examples: ['Content calendars', 'Campaign planning', 'Growth strategies']
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'Analyze trends and provide insights from your content performance',
      examples: ['Performance metrics', 'Trend analysis', 'ROI calculations']
    },
    {
      icon: Sparkles,
      title: 'Creative Writing',
      description: 'Draft marketing copy, captions, and engaging content',
      examples: ['Ad copy', 'Email subject lines', 'Social captions']
    }
  ];

  const howToUse = [
    {
      step: '1',
      title: 'Start a Conversation',
      description: 'Navigate to the Chat page and begin typing your question or request'
    },
    {
      step: '2',
      title: 'Ask Anything',
      description: 'Request content ideas, strategy advice, or help with any marketing task'
    },
    {
      step: '3',
      title: 'Refine Responses',
      description: 'Continue the conversation to refine ideas and get exactly what you need'
    },
    {
      step: '4',
      title: 'Apply Insights',
      description: 'Use the AI\'s suggestions directly in your content creation workflow'
    }
  ];

  const quickActions = [
    '💡 Generate business ideas',
    '📊 Analyze data trends',
    '✍️ Write marketing copy',
    '🔍 Research topics',
    '🎯 Plan strategies',
    '📝 Draft outlines',
    '🚀 Launch campaigns',
    '📈 Optimize content'
  ];

  const features = [
    'Powered by Qwen3-235B AI Model',
    'Real-time Streaming Responses',
    'Context-Aware Conversations',
    'Message History',
    'Usage Tracking',
    'Token Optimization',
    'Multiple Use Cases',
    'Creative Assistance',
    'Strategic Planning',
    'Research Support',
    'Content Ideation',
    'Copywriting Help',
    'Data Analysis',
    'Trend Insights',
    'Best Practice Guidance',
    '24/7 Availability'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-20 px-4">
        <div className="relative max-w-7xl mx-auto">
          <Link href="/features" className="inline-flex items-center text-white/80 hover:text-white mb-8 group">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                AI-Powered
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                AI Chat Assistant
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Get instant help, content ideas, and strategic guidance from our advanced AI assistant powered by Qwen3-235B. Available 24/7 to boost your productivity.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90" asChild>
                  <Link href="/dashboard/chat">
                    Try Chat Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/auth/signin">
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg animate-pulse">
                    <MessageSquare className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-xl p-3 text-right">
                    <p className="text-sm">Need content ideas for LinkedIn</p>
                  </div>
                  <div className="bg-blue-500 rounded-xl p-3">
                    <p className="text-sm">I'll help you with that! Here are 5 engaging LinkedIn post ideas...</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Brain className="w-4 h-4" />
                    <span>AI is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Key Benefits
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your 24/7 Content Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Never feel stuck again with instant AI assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="border-2 hover:border-blue-300 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              AI Capabilities
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Can AI Help You With?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From ideation to execution, AI assists with every content task
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, idx) => {
              const Icon = capability.icon;
              return (
                <Card key={idx} className="border-2 hover:border-blue-300 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{capability.title}</CardTitle>
                        <CardDescription className="text-base">{capability.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Examples:</p>
                      <ul className="space-y-1">
                        {capability.examples.map((example, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Easy to Use
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How to Use AI Chat
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start chatting with AI in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howToUse.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {idx < howToUse.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Quick Actions
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular AI Prompts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Try these common requests to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center font-medium"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
              Complete Feature Set
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for intelligent content assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-4 border hover:border-blue-300 hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Start Chatting with AI Today
          </h2>
          <p className="text-xl text-white/90">
            Get instant content help and boost your productivity with our AI assistant.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 text-lg px-8 py-6" asChild>
              <Link href="/dashboard/chat">
                Try AI Chat Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6" asChild>
              <Link href="/features">
                Explore More Features
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

