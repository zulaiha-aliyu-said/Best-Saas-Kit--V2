import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Repeat2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  FileText,
  Video,
  Link as LinkIcon,
  Upload,
  Zap,
  BarChart3
} from "lucide-react";

export const metadata = {
  title: 'Content Repurposing | Features | RepurposeAI',
  description: 'Transform one piece of content into multiple platform-specific posts with AI-powered repurposing.',
};

export default function ContentRepurposingPage() {
  const benefits = [
    {
      icon: Clock,
      title: 'Save 10+ Hours Weekly',
      description: 'Automate content transformation across platforms, reducing manual work by 90%'
    },
    {
      icon: Target,
      title: 'Reach 4X More Audience',
      description: 'Expand your reach by repurposing content for Twitter, LinkedIn, Instagram, and Email'
    },
    {
      icon: TrendingUp,
      title: 'Boost Engagement 300%',
      description: 'Platform-optimized content performs better with tailored messaging and formatting'
    },
    {
      icon: Sparkles,
      title: 'Maintain Brand Voice',
      description: 'AI learns your style to ensure consistent messaging across all platforms'
    }
  ];

  const inputOptions = [
    {
      icon: FileText,
      title: 'Text & Articles',
      description: 'Paste blog posts, articles, or any text content directly'
    },
    {
      icon: LinkIcon,
      title: 'URLs & Links',
      description: 'Extract content from any web page automatically'
    },
    {
      icon: Video,
      title: 'YouTube Videos',
      description: 'Extract transcripts and repurpose video content'
    },
    {
      icon: Upload,
      title: 'File Upload',
      description: 'Upload TXT, MD, or HTML files (max 10MB)'
    }
  ];

  const platforms = [
    {
      name: 'Twitter/X',
      icon: '𝕏',
      color: 'bg-blue-500',
      description: 'Threads and single tweets with optimal character count'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: 'bg-blue-700',
      description: 'Professional posts with thought leadership tone'
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-500',
      description: 'Engaging captions with visual storytelling'
    },
    {
      name: 'Email',
      icon: '✉️',
      color: 'bg-green-500',
      description: 'Newsletter format with subject lines'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Input Your Content',
      description: 'Paste text, enter a URL, upload a file, or extract YouTube transcripts',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '2',
      title: 'Choose Settings',
      description: 'Select target platforms, tone, length, and advanced options like hashtags and CTAs',
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '3',
      title: 'AI Repurposes Content',
      description: 'Our advanced AI transforms your content for each platform automatically',
      color: 'from-orange-500 to-red-500'
    },
    {
      step: '4',
      title: 'Review & Publish',
      description: 'Copy, schedule, or publish your optimized content directly to platforms',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const features = [
    '4+ Platform Support (Twitter, LinkedIn, Instagram, Email)',
    'Multiple Input Options (Text, URL, YouTube, Files)',
    'AI-Powered Content Transformation',
    'Tone Customization (Professional, Funny, Motivational, Casual)',
    'Adjustable Content Length (Short to Detailed)',
    'Auto-generated Hashtags',
    'Emoji Integration',
    'Call-to-Action Inclusion',
    'Thread Generation for Twitter',
    'Character Count Optimization',
    'Platform-Specific Formatting',
    'Real-time Preview',
    'Copy & Schedule Functions',
    'Performance Prediction',
    'Style Learning',
    'Template Integration'
  ];

  const useCases = [
    {
      title: 'Content Creators',
      description: 'Turn YouTube videos into social media posts'
    },
    {
      title: 'Bloggers',
      description: 'Transform blog posts into engaging social content'
    },
    {
      title: 'Marketers',
      description: 'Repurpose campaigns across multiple channels'
    },
    {
      title: 'Agencies',
      description: 'Scale content production for multiple clients'
    },
    {
      title: 'Businesses',
      description: 'Maximize content ROI with multi-platform distribution'
    },
    {
      title: 'Podcasters',
      description: 'Convert podcast transcripts into shareable posts'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <Link href="/features" className="inline-flex items-center text-white/80 hover:text-white mb-8 group">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Features
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                Most Popular Feature
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Content Repurposing
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Transform one piece of content into multiple platform-specific posts with AI. Save hours of manual work while expanding your reach across Twitter, LinkedIn, Instagram, and Email.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90" asChild>
                  <Link href="/dashboard/repurpose">
                    Try It Now
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
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
                    <Repeat2 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/20 rounded-xl p-4">
                    <p className="text-sm text-white/80">Input</p>
                    <p className="font-semibold">1 Blog Post</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Zap className="w-8 h-8 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform, idx) => (
                      <div key={idx} className="bg-white/20 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">{platform.icon}</div>
                        <p className="text-xs font-medium">{platform.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Key Benefits
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Content Repurposing?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Maximize your content's impact and reach more people with less effort
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <Card key={idx} className="border-2 hover:border-purple-300 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
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

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to repurpose your content across all platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Input Options */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Flexible Input
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Multiple Ways to Input Content
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the input method that works best for your workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inputOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <Card key={idx} className="border-2 hover:border-purple-300 hover:shadow-xl transition-all text-center">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Platform Support
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Repurpose for Every Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each platform gets content optimized for its unique format and audience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platforms.map((platform, idx) => (
              <Card key={idx} className="border-2 hover:border-purple-300 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className={`w-20 h-20 rounded-2xl ${platform.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-4xl">{platform.icon}</span>
                  </div>
                  <CardTitle className="text-center text-xl">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{platform.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Complete Feature Set
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features for professional content repurposing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-4 border hover:border-purple-300 hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-4">
              Use Cases
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect For Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Content repurposing works for any content creator or business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="border-2 hover:border-purple-300 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Repurpose Your Content?
          </h2>
          <p className="text-xl text-white/90">
            Start transforming your content across multiple platforms in minutes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6" asChild>
              <Link href="/dashboard/repurpose">
                Start Repurposing Now
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

