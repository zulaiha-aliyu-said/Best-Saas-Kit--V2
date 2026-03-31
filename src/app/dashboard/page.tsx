"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { ProTipBanner } from "@/components/tips/ProTipBanner";
import { CreditOptimizationWidget } from "@/components/credits/CreditOptimizationWidget";
import { useSession } from "next-auth/react";

import {
  BarChart3,
  Settings,
  Calendar,
  Sparkles,
  Heart,
  Clock,
  Target,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  
  // State for real data
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userTier, setUserTier] = useState(1);
  const [contentStats, setContentStats] = useState({
    postsGenerated: 0,
    creditsUsed: 0,
    hoursSaved: 0,
    engagementRate: 0
  });
  const [platformStats, setPlatformStats] = useState({
    twitter: 0,
    linkedin: 0,
    instagram: 0,
    email: 0
  });

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
    checkOnboardingStatus();
    checkAdminStatus();
  }, [session]);

  const checkAdminStatus = () => {
    if (session?.user?.email) {
      // Simple admin check based on email or other session data
      // This is a placeholder - in a real app, you'd check a role field
      const adminEmails = ['admin@repurposeai.com', 'zulaiha@repurposeai.com'];
      setIsAdmin(adminEmails.includes(session.user.email));
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const [onboardingRes, tierRes] = await Promise.all([
        fetch('/api/onboarding/status'),
        fetch('/api/user/tier')
      ]);

      if (onboardingRes.ok) {
        const onboardingData = await onboardingRes.json();
        if (!onboardingData.onboardingCompleted) {
          setShowOnboarding(true);
        }
      }

      if (tierRes.ok) {
        const tierData = await tierRes.json();
        setUserTier(tierData.tier || 1);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Parallelize all API calls for better performance
      const [creditsResponse, activityResponse, trendsResponse] = await Promise.allSettled([
        fetch('/api/credits'),
        fetch('/api/history'),
        fetch('/api/trends?platform=all&category=all&timeRange=24')
      ]);

      // Handle credits response
      if (creditsResponse.status === 'fulfilled' && creditsResponse.value.ok) {
        const creditsData = await creditsResponse.value.json();
        setUserCredits(creditsData.credits || 0);
      }

      // Handle activity response
      if (activityResponse.status === 'fulfilled' && activityResponse.value.ok) {
        const activityData = await activityResponse.value.json();
        const posts = activityData.posts || [];
        setRecentActivity(posts);
        
        // Calculate content stats from recent activity
        const totalPosts = posts.length;
        const totalCreditsUsed = posts.reduce((sum: number, post: any) => sum + (post.credits_used || 1), 0);
        const hoursSaved = totalPosts * 2; // Assume 2 hours saved per post
        const avgEngagement = posts.length > 0 ? 
          posts.reduce((sum: number, post: any) => sum + (post.engagement || 0), 0) / posts.length : 0;
        
        // Calculate platform distribution
        const platformCounts = posts.reduce((acc: any, post: any) => {
          const platform = post.platform?.toLowerCase();
          if (platform === 'twitter' || platform === 'x') {
            acc.twitter++;
          } else if (platform === 'linkedin') {
            acc.linkedin++;
          } else if (platform === 'instagram') {
            acc.instagram++;
          } else if (platform === 'email') {
            acc.email++;
          }
          return acc;
        }, { twitter: 0, linkedin: 0, instagram: 0, email: 0 });
        
        setContentStats({
          postsGenerated: totalPosts,
          creditsUsed: totalCreditsUsed,
          hoursSaved: hoursSaved,
          engagementRate: Math.round(avgEngagement)
        });
        
        setPlatformStats(platformCounts);
      }

      // Handle trends response
      if (trendsResponse.status === 'fulfilled' && trendsResponse.value.ok) {
        const trendsData = await trendsResponse.value.json();
        setTrendingTopics(trendsData.topics?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Onboarding Modal */}
      <WelcomeModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        userTier={userTier}
        userName={session?.user?.name || undefined}
        isNewUser={true}
      />

      <div className="space-y-8">
        {/* Pro Tip Banner */}
        <ProTipBanner 
          tipId="dashboard-welcome"
          title="💡 Pro Tip: Maximize Your Content Impact"
          description="Use viral hooks to increase engagement by up to 300%. Combine them with AI predictions for best results!"
          icon="lightbulb"
          variant="info"
        />

        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
            {isAdmin ? "Admin Dashboard" : `Welcome back, ${session?.user?.name || 'User'}!`}
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            {isAdmin
              ? "Here's what's happening with your application."
              : "Your content repurposing performance at a glance"
            }
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="gap-2" onClick={() => fetchDashboardData()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
        {isAdmin && (
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Admin Analytics
                </Link>
            </Button>
              <Button asChild>
                <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Credit Status Card */}
      <div className="flex justify-end mb-4">
        <Card className="w-48">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Credits</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  userCredits
                )}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((userCredits / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transform Your Content Promotional Card */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white border-0 mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-4">
                Transform Your Content in Seconds ✨
              </h2>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                Leverage AI to effortlessly repurpose your content across multiple platforms and reach a wider audience.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-8 py-3 transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/dashboard/repurpose">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Post Now 💡
                </Link>
            </Button>
            </div>
            <div className="hidden lg:block ml-8">
              <div className="text-center bg-pink-500/20 rounded-2xl p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm mb-1">Boost your reach</p>
                <p className="text-white/80 text-xs">Save countless hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Posts Generated */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => window.open('/dashboard/analytics?metric=posts', '_blank')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posts Generated
            </CardTitle>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold group-hover:text-blue-600 transition-colors">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  contentStats.postsGenerated.toLocaleString()
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Total Generated</p>
          </CardContent>
        </Card>

        {/* Credits Used */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credits Used
            </CardTitle>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold group-hover:text-purple-600 transition-colors">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  contentStats.creditsUsed.toLocaleString()
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Total Credits</p>
          </CardContent>
        </Card>

        {/* Hours Saved */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours Saved
            </CardTitle>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold group-hover:text-green-600 transition-colors">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${contentStats.hoursSaved}h`
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Estimated Saved</p>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Rate
            </CardTitle>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold group-hover:text-red-600 transition-colors">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  `${contentStats.engagementRate}%`
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Average Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics Section */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Trending Topics</h2>
            <p className="text-muted-foreground text-lg mt-1">
              Hot topics to inspire your next content
            </p>
          </div>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/trends">
              View All Trends
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading trending topics...</span>
            </div>
          ) : trendingTopics.length > 0 ? (
            trendingTopics.map((topic, index) => {
              const getBadgeInfo = (engagement: number) => {
                if (engagement > 80) {
                  return { text: 'Trending', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🔥' };
                } else if (engagement > 60) {
                  return { text: 'Rising', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📈' };
                } else {
                  return { text: 'Popular', color: 'bg-green-100 text-green-700 border-green-200', icon: '⭐' };
                }
              };

              const badgeInfo = getBadgeInfo(topic.engagement || 0);
              const engagementPercent = Math.round(topic.engagement || 0);

              return (
                 <Card key={topic.id || index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                   <Link href={`/dashboard/trends?topic=${encodeURIComponent(topic.title || '')}`} className="block">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={badgeInfo.color}>
                          <span className="mr-1">{badgeInfo.icon}</span>
                          {badgeInfo.text}
                        </Badge>
                        <span className="text-sm font-semibold text-purple-600">+{engagementPercent}% engagement</span>
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {topic.title || 'Trending Topic'}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                        {topic.description || topic.content || 'Discover trending content in this category.'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topic.tags?.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || (
                          <>
                            <Badge variant="secondary" className="text-xs">#Trending</Badge>
                            <Badge variant="secondary" className="text-xs">#Content</Badge>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No trending topics available right now</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/trends">View All Trends</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Start Templates Section */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Quick Start Templates</h2>
            <p className="text-muted-foreground text-lg mt-1">
              Pre-built templates for common content types
            </p>
          </div>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/dashboard/templates">
              Browse All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Blog → Social */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <Link href="/dashboard/repurpose?template=blog-social" className="block">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    b
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">Blog → Social</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Transform blog posts into social media content
                </p>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                  Most Used
                </Badge>
              </CardContent>
            </Link>
          </Card>

          {/* Video → Posts */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <Link href="/dashboard/repurpose?template=video-posts" className="block">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-red-600 transition-colors">Video → Posts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Convert video content into engaging posts
                </p>
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                  Popular
                </Badge>
              </CardContent>
            </Link>
          </Card>

          {/* Podcast → Thread */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <Link href="/dashboard/repurpose?template=podcast-thread" className="block">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 transition-colors">Podcast → Thread</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Turn podcasts into Twitter threads
                </p>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                  Trending
                </Badge>
              </CardContent>
            </Link>
          </Card>

          {/* Article → Newsletter */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <Link href="/dashboard/repurpose?template=article-newsletter" className="block">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors">Article → Newsletter</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Convert articles to newsletter format
                </p>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                  New
                </Badge>
            </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription>
                  Your latest content generations
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/history">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-muted-foreground">Loading recent activity...</span>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => {
                  const getPlatformIcon = (platform: string) => {
                    switch (platform?.toLowerCase()) {
                      case 'twitter':
                      case 'x':
                        return <span className="text-blue-600 font-bold text-lg">𝕏</span>;
                      case 'linkedin':
                        return <span className="text-blue-700 font-bold text-sm">in</span>;
                      case 'instagram':
                        return <span className="text-pink-600 text-lg">📷</span>;
                      case 'email':
                        return <span className="text-green-600 text-lg">✉️</span>;
                      default:
                        return <span className="text-purple-600 text-lg">📝</span>;
                    }
                  };

                  const getPlatformColor = (platform: string) => {
                    switch (platform?.toLowerCase()) {
                      case 'twitter':
                      case 'x':
                        return 'bg-blue-50 dark:bg-blue-900/30';
                      case 'linkedin':
                        return 'bg-blue-50 dark:bg-blue-900/30';
                      case 'instagram':
                        return 'bg-pink-50';
                      case 'email':
                        return 'bg-green-50 dark:bg-green-900/30';
                      default:
                        return 'bg-purple-50';
                    }
                  };

                  const formatTimeAgo = (dateString: string) => {
                    const date = new Date(dateString);
                    const now = new Date();
                    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                    
                    if (diffInHours < 1) return 'Just now';
                    if (diffInHours < 24) return `${diffInHours} hours ago`;
                    const diffInDays = Math.floor(diffInHours / 24);
                    if (diffInDays === 1) return 'Yesterday';
                    return `${diffInDays} days ago`;
                  };

                  return (
                    <Link key={activity.id || index} href={`/dashboard/history/${activity.id}`} className="block">
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${getPlatformColor(activity.platform)} flex items-center justify-center`}>
                            {getPlatformIcon(activity.platform)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm group-hover:text-blue-600 transition-colors">
                              {activity.title || `${activity.platform} Content`}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Generated {activity.platform} content • {formatTimeAgo(activity.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-700 border-green-200">Success</Badge>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No recent activity found</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/dashboard/repurpose">Start Creating Content</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>
              Jump to your most used features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/dashboard/repurpose">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Repurpose</span>
                </Link>
                </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/dashboard/schedule">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium">Schedule</span>
                </Link>
                </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/dashboard/trends">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Trends</span>
                </Link>
                </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="h-6 w-6 text-red-600" />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown & Credit Optimization */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Platform Breakdown</CardTitle>
            <CardDescription>
              Your content distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               {/* Twitter */}
               <Link href="/dashboard/analytics?platform=twitter" className="block">
                 <div className="space-y-2 cursor-pointer group">
                   <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                         <span className="text-blue-600 font-bold text-sm">𝕏</span>
                       </div>
                       <span className="font-medium group-hover:text-blue-600 transition-colors">Twitter</span>
                     </div>
                     <span className="font-semibold">{platformStats.twitter}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                       className="bg-blue-500 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-600" 
                       style={{ width: `${Math.max((platformStats.twitter / Math.max(contentStats.postsGenerated, 1)) * 100, 0)}%` }}
                     ></div>
                   </div>
                 </div>
               </Link>

               {/* LinkedIn */}
               <Link href="/dashboard/analytics?platform=linkedin" className="block">
                 <div className="space-y-2 cursor-pointer group">
                   <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                         <span className="text-blue-700 font-bold text-xs">in</span>
                       </div>
                       <span className="font-medium group-hover:text-blue-700 transition-colors">LinkedIn</span>
                     </div>
                     <span className="font-semibold">{platformStats.linkedin}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                       className="bg-blue-700 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-800" 
                       style={{ width: `${Math.max((platformStats.linkedin / Math.max(contentStats.postsGenerated, 1)) * 100, 0)}%` }}
                     ></div>
                   </div>
                 </div>
               </Link>

               {/* Instagram */}
               <Link href="/dashboard/analytics?platform=instagram" className="block">
                 <div className="space-y-2 cursor-pointer group">
                   <div className="flex items-center justify-between p-2 rounded-lg hover:bg-pink-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                         <span className="text-pink-600 text-sm">📷</span>
                       </div>
                       <span className="font-medium group-hover:text-pink-600 transition-colors">Instagram</span>
                     </div>
                     <span className="font-semibold">{platformStats.instagram}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                       className="bg-pink-500 h-2 rounded-full transition-all duration-300 group-hover:bg-pink-600" 
                       style={{ width: `${Math.max((platformStats.instagram / Math.max(contentStats.postsGenerated, 1)) * 100, 0)}%` }}
                     ></div>
                   </div>
                 </div>
               </Link>

               {/* Email */}
               <Link href="/dashboard/analytics?platform=email" className="block">
                 <div className="space-y-2 cursor-pointer group">
                   <div className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                         <span className="text-green-600 text-sm">✉️</span>
                       </div>
                       <span className="font-medium group-hover:text-green-600 transition-colors">Email</span>
                     </div>
                     <span className="font-semibold">{platformStats.email}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div 
                       className="bg-green-500 h-2 rounded-full transition-all duration-300 group-hover:bg-green-600" 
                       style={{ width: `${Math.max((platformStats.email / Math.max(contentStats.postsGenerated, 1)) * 100, 0)}%` }}
                     ></div>
                   </div>
                 </div>
               </Link>
            </div>
          </CardContent>
        </Card>

        {/* Credit Optimization Widget */}
        <div className="lg:col-span-2">
          <CreditOptimizationWidget />
        </div>
      </div>

      {/* Account Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Status</CardTitle>
            <CardDescription>
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">Plan</span>
                <Badge variant="default">{userTier > 1 ? `LTD Tier ${userTier}` : "Free Plan"}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm font-medium">Credits Available</span>
                <span className="text-sm font-semibold">{userCredits.toLocaleString()}</span>
              </div>
               <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                 <span className="text-sm font-medium">Content This Month</span>
                 <span className="text-sm font-semibold">{contentStats.postsGenerated} pieces</span>
               </div>
               <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                 <span className="text-sm font-medium">Time Saved</span>
                 <span className="text-sm font-semibold text-green-600">{contentStats.hoursSaved} hours</span>
               </div>
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/billing">
                  <Target className="mr-2 h-4 w-4" />
                Upgrade Plan
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Built with love by Zulaiha Aliyu — RepurposeAI © 2025
        </p>
      </footer>

      {/* Help Button - Fixed Position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg hover:scale-110 transition-all duration-300"
          title="Help & Support"
          onClick={() => {
            // Open help modal or redirect to help page
            window.open('/help', '_blank');
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      </div>
    </div>
    </>
  );
}
