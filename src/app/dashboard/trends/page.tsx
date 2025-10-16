"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function TrendsPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('24');

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Trending Topics & Hashtags 🔥</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Discover what's hot and boost your content reach</p>
        </div>
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-xs font-medium">Auto-insert trending hashtags</span>
          <Switch defaultChecked />
        </div>
      </div>

      {/* Filter by Platform */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Filter by Platform</CardTitle>
              <CardDescription className="text-xs">See trending topics for specific platforms</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { key: 'all', label: 'All Platforms', icon: '🌐' },
              { key: 'twitter', label: 'Twitter', icon: '🐦' },
              { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
              { key: 'instagram', label: 'Instagram', icon: '📸' },
              { key: 'email', label: 'Email', icon: '✉️' },
            ].map((p) => (
              <Button
                key={p.key}
                variant={selectedPlatform === p.key ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform(p.key)}
                className={selectedPlatform === p.key ? 'repurpose-gradient' : ''}
              >
                <span className="mr-2">{p.icon}</span>
                {p.label}
              </Button>
            ))}
          </div>
          <Button variant="link" className="text-primary p-0 h-auto">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Trends
          </Button>
        </CardContent>
      </Card>

      {/* Filter by Category */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <CardTitle className="text-sm font-semibold">Filter by Category</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Categories' },
              { key: 'tech', label: 'Technology' },
              { key: 'business', label: 'Business' },
              { key: 'marketing', label: 'Marketing' },
              { key: 'lifestyle', label: 'Lifestyle' },
              { key: 'health', label: 'Health' },
              { key: 'education', label: 'Education' },
              { key: 'finance', label: 'Finance' },
            ].map((c) => (
              <Button
                key={c.key}
                variant={selectedCategory === c.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(c.key)}
                className={selectedCategory === c.key ? 'bg-primary' : ''}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-sm font-semibold">Trending Performance Over Time</CardTitle>
              <CardDescription className="text-xs">See how trending topics perform across platforms</CardDescription>
            </div>
            <div className="flex gap-2">
              {[
                { key: '24', label: '24 Hours' },
                { key: '7', label: '7 Days' },
                { key: '30', label: '30 Days' },
              ].map((t) => (
                <Button
                  key={t.key}
                  variant={timeRange === t.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(t.key)}
                  className={timeRange === t.key ? 'bg-primary' : ''}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {/* Chart Placeholder with Lines */}
          <div className="relative h-48 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-border p-3">
            <div className="absolute inset-0 flex items-end justify-around p-6">
              {/* Simulated line chart */}
              <div className="flex items-end gap-8 w-full">
                {[40, 55, 65, 75, 82, 88, 95].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-muted-foreground">{i * 4}:00</div>
                    <div
                      className="w-full bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="absolute top-4 right-4 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>AI Content</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span>Remote Work</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Sustainability</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hot Topics Right Now */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold">Hot Topics Right Now 🔥</h2>
              <p className="text-xs text-muted-foreground">Trending topics with high engagement potential</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Updated 2 minutes ago</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600 font-medium">Live Updates</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: 'AI Content Revolution',
              desc: 'How artificial intelligence is transforming content creation and marketing strategies worldwide.',
              views: '2.3M',
              growth: '+347%',
              badge: '#1 Trending',
              badgeColor: 'bg-red-500',
              tags: ['#AIContent', '#ContentMarketing', '#AI'],
              platforms: ['twitter', 'linkedin'],
            },
            {
              title: 'Remote Work Productivity',
              desc: 'Best practices and tools for maintaining high productivity while working from home.',
              views: '1.8M',
              growth: '+289%',
              badge: '#2 Rising',
              badgeColor: 'bg-blue-500',
              tags: ['#RemoteWork', '#Productivity', '#WorkFromHome'],
              platforms: ['linkedin', 'twitter'],
            },
            {
              title: 'Sustainable Business',
              desc: 'How companies are adopting eco-friendly practices and green technologies for better future.',
              views: '1.2M',
              growth: '+156%',
              badge: '#3 Popular',
              badgeColor: 'bg-green-500',
              tags: ['#Sustainability', '#GreenTech', '#EcoFriendly'],
              platforms: ['linkedin', 'twitter', 'email'],
            },
            {
              title: 'Mental Health Awareness',
              desc: 'Breaking stigmas and promoting mental wellness in workplace and personal life.',
              views: '956K',
              growth: '+198%',
              badge: '#4 Viral',
              badgeColor: 'bg-purple-500',
              tags: ['#MentalHealth', '#Wellness', '#SelfCare'],
              platforms: ['instagram', 'twitter'],
            },
            {
              title: 'Crypto & Web3',
              desc: 'Latest developments in cryptocurrency, blockchain, and decentralized technologies.',
              views: '743K',
              growth: '+134%',
              badge: '#8 Emerging',
              badgeColor: 'bg-yellow-500',
              tags: ['#Crypto', '#Web3', '#Blockchain'],
              platforms: ['twitter', 'linkedin'],
            },
            {
              title: 'Future of Work',
              desc: 'Exploring new work models, automation, and the changing landscape of employment.',
              views: '621K',
              growth: '+87%',
              badge: '#6 Innovation',
              badgeColor: 'bg-indigo-500',
              tags: ['#FutureOfWork', '#Automation', '#WorkTrends'],
              platforms: ['linkedin', 'twitter'],
            },
          ].map((topic, idx) => (
            <Card key={idx} className="border-0 bg-white shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Badge className={`${topic.badgeColor} text-white border-0 text-xs px-2 py-0`}>{topic.badge}</Badge>
                    <div className="flex gap-0.5">
                      {topic.platforms.map((p) => (
                        <div key={p} className="text-xs">
                          {p === 'twitter' && '🐦'}
                          {p === 'linkedin' && '💼'}
                          {p === 'instagram' && '📸'}
                          {p === 'email' && '✉️'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-600">{topic.growth}</span>
                </div>

                <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{topic.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{topic.desc}</p>

                <div className="flex flex-wrap gap-1 mb-2">
                  {topic.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{topic.views} views</span>
                  </div>
                  <Button
                    size="sm"
                    className="repurpose-gradient text-xs h-7 px-3"
                    onClick={() => {
                      const params = new URLSearchParams({
                        prefill: topic.title,
                        platforms: 'x,linkedin,instagram',
                        num: '3',
                      });
                      router.push(`/dashboard/repurpose?${params.toString()}`);
                    }}
                  >
                    Use Topic
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Hashtags by Platform */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Trending Hashtags by Platform</CardTitle>
                <CardDescription className="text-xs">Most effective hashtags for maximum reach</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs h-7">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 pb-3">
          {/* Twitter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <h3 className="text-sm font-semibold">Twitter Trending</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated 5 min ago</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['#AIRevolution', '#TechTrends', '#Innovation', '#DigitalTransformation', '#StartupLife', '#ContentCreation', '#RemoteWork', '#Productivity'].map((h) => (
                <Badge key={h} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 px-2.5 py-0.5 text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <h3 className="text-sm font-semibold">LinkedIn Professional</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated 3 min ago</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['#Leadership', '#ProfessionalGrowth', '#BusinessStrategy', '#CareerDevelopment', '#Networking', '#ThoughtLeadership', '#Innovation', '#DigitalMarketing'].map((h) => (
                <Badge key={h} className="bg-blue-700 text-white hover:bg-blue-800 border-0 px-2.5 py-0.5 text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <h3 className="text-sm font-semibold">Instagram Lifestyle</h3>
              </div>
              <span className="text-xs text-muted-foreground">Updated 7 min ago</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['#CreativeLife', '#Inspiration', '#LifestyleBrand', '#ContentCreator', '#BehindTheScenes', '#Motivation', '#PersonalBrand', '#Entrepreneur'].map((h) => (
                <Badge key={h} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-0 px-2.5 py-0.5 text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold">Email Keywords</h3>
              </div>
              <span className="text-xs text-green-600 font-medium">High open rates</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['ExclusiveUpdate', 'WeeklyInsights', 'TrendAlert', 'IndustryNews', 'ExpertTips', 'BehindScenes', 'SpecialOffer', 'CommunitySpotlight'].map((h) => (
                <Badge key={h} className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-2.5 py-0.5 text-xs">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Engagement Analytics */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Trending Engagement Analytics</CardTitle>
              <CardDescription className="text-xs">Performance metrics for trending topics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { platform: 'Twitter', thisWeek: 15, lastWeek: 9, color: 'bg-blue-500' },
                { platform: 'LinkedIn', thisWeek: 13, lastWeek: 10, color: 'bg-blue-700' },
                { platform: 'Instagram', thisWeek: 7, lastWeek: 6, color: 'bg-pink-500' },
                { platform: 'Email', thisWeek: 16, lastWeek: 14, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.platform} className="space-y-2">
                  <p className="text-sm font-medium text-center">{item.platform}</p>
                  <div className="flex items-end justify-center gap-2 h-32">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 ${item.color} rounded-t opacity-60`}
                        style={{ height: `${item.lastWeek * 6}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{item.lastWeek}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 ${item.color} rounded-t`} style={{ height: `${item.thisWeek * 6}px` }} />
                      <span className="text-xs font-semibold">{item.thisWeek}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-sm">This Week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/40" />
                <span className="text-sm">Last Week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Tools */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <CardTitle className="text-sm font-semibold">Trending Tools</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0 pb-3">
          {[
            { icon: '🎯', title: 'AI Topic Generator', desc: 'Generate trending topics', color: 'bg-purple-100 text-purple-700' },
            { icon: '#', title: 'Hashtag Optimizer', desc: 'Optimize hashtag strategy', color: 'bg-blue-100 text-blue-700' },
            { icon: '📅', title: 'Trend Scheduler', desc: 'Schedule trending posts', color: 'bg-green-100 text-green-700' },
          ].map((tool) => (
            <div key={tool.title} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg ${tool.color} flex items-center justify-center text-lg`}>
                  {tool.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{tool.title}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trend Alerts */}
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <CardTitle className="text-sm font-semibold">Trend Alerts</CardTitle>
            </div>
            <Button variant="link" className="text-primary text-xs p-0 h-auto">Settings</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-0 pb-3">
          {[
            { icon: '🔴', title: 'New trending topic detected', desc: 'AI Ethics in Business', time: '2 minutes ago', color: 'bg-yellow-50 border-yellow-200' },
            { icon: '🔵', title: 'Hashtag surge alert', desc: '#SustainableTech +356%', time: '15 minutes ago', color: 'bg-blue-50 border-blue-200' },
            { icon: '🟢', title: 'Platform trend update', desc: 'LinkedIn trending topics refreshed', time: '1 hour ago', color: 'bg-green-50 border-green-200' },
          ].map((alert, idx) => (
            <div key={idx} className={`flex items-start justify-between p-2.5 rounded-lg border ${alert.color}`}>
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{alert.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
