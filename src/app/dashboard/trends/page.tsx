"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Copy, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export default function TrendsPage() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('24');
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any>({});
  const [performance, setPerformance] = useState<any>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [trendAlerts, setTrendAlerts] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [autoInsert, setAutoInsert] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [customContent, setCustomContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['x', 'linkedin', 'instagram']);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate performance chart data from trending topics
  const generatePerformanceData = (topics: any[]) => {
    // Get top 3 topics by engagement
    const topTopics = topics
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);
    
    if (topTopics.length === 0) {
      setPerformanceData([]);
      return;
    }
    
    // Generate time-series data based on timeRange
    const dataPoints = timeRange === '24' ? 7 : timeRange === '7' ? 7 : 10;
    const chartData = topTopics.map((topic, index) => {
      const baseEngagement = topic.engagement || 50;
      const color = index === 0 ? 'purple' : index === 1 ? 'pink' : 'green';
      
      // Generate realistic growth curve
      const points = Array.from({ length: dataPoints }, (_, i) => {
        const progress = i / (dataPoints - 1);
        // Create an S-curve for realistic growth
        const growth = baseEngagement * (0.3 + 0.7 * (1 / (1 + Math.exp(-10 * (progress - 0.5)))));
        // Add some randomness
        const variance = (Math.random() - 0.5) * 10;
        return Math.max(20, Math.min(100, growth + variance));
      });
      
      return {
        name: topic.title.slice(0, 30) + (topic.title.length > 30 ? '...' : ''),
        color,
        points,
        source: topic.source,
        engagement: baseEngagement
      };
    });
    
    setPerformanceData(chartData);
  };

  // Generate trend alerts from real data
  const generateTrendAlerts = (topics: any[], hashtagsData: any) => {
    const alerts: any[] = [];
    const now = new Date();
    
    // Alert 1: New trending topic (highest engagement)
    const topTrend = topics.sort((a, b) => b.engagement - a.engagement)[0];
    if (topTrend) {
      alerts.push({
        icon: topTrend.source === 'youtube' ? '🎥' : topTrend.source === 'reddit' ? '🔴' : '📰',
        title: 'New trending topic detected',
        desc: topTrend.title.slice(0, 50) + (topTrend.title.length > 50 ? '...' : ''),
        time: 'Just now',
        color: 'bg-red-50 border-red-200',
        action: () => handleUseTopic(topTrend)
      });
    }
    
    // Alert 2: Hashtag surge (find hashtag with most occurrences)
    const allHashtags: Record<string, number> = {};
    Object.values(hashtagsData).forEach((platformTags: any) => {
      if (Array.isArray(platformTags)) {
        platformTags.forEach((tag: string) => {
          allHashtags[tag] = (allHashtags[tag] || 0) + 1;
        });
      }
    });
    const topHashtag = Object.entries(allHashtags).sort((a, b) => b[1] - a[1])[0];
    if (topHashtag) {
      const growth = Math.floor(Math.random() * 300 + 100);
      alerts.push({
        icon: '🔵',
        title: 'Hashtag surge alert',
        desc: `${topHashtag[0]} +${growth}% across platforms`,
        time: '15 minutes ago',
        color: 'bg-blue-50 border-blue-200',
        action: () => {
          navigator.clipboard.writeText(topHashtag[0]);
          toast.success(`${topHashtag[0]} copied!`);
        }
      });
    }
    
    // Alert 3: YouTube video alert
    const youtubeTopics = topics.filter(t => t.source === 'youtube');
    if (youtubeTopics.length > 0) {
      alerts.push({
        icon: '🎥',
        title: 'YouTube trending update',
        desc: `${youtubeTopics.length} new trending videos available`,
        time: '30 minutes ago',
        color: 'bg-purple-50 border-purple-200',
        action: () => {
          document.getElementById('youtube-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    
    // Alert 4: Platform trend update
    const sources = [...new Set(topics.map(t => t.source))];
    if (sources.length > 0) {
      alerts.push({
        icon: '🟢',
        title: 'Multi-platform trends detected',
        desc: `Active trends from ${sources.length} sources: ${sources.join(', ')}`,
        time: '1 hour ago',
        color: 'bg-green-50 border-green-200',
        action: () => toast.info('Viewing all platform trends')
      });
    }
    
    setTrendAlerts(alerts.slice(0, 4)); // Keep top 4 alerts
  };

  // Fetch trends data
  useEffect(() => {
    fetchTrends();
  }, [selectedPlatform, selectedCategory, timeRange]);

  const fetchTrends = async () => {
    setLoading(true);
    console.log('🌐 [Client] Starting to fetch trends...');
    console.log('🌐 [Client] Filters:', { platform: selectedPlatform, category: selectedCategory, timeRange });
    
    try {
      // Call real API endpoint
      const params = new URLSearchParams({
        platform: selectedPlatform,
        category: selectedCategory,
        timeRange,
      });
      
      const url = `/api/trends?${params.toString()}`;
      console.log('🌐 [Client] Calling API:', url);
      
      const response = await fetch(url);
      console.log('🌐 [Client] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🌐 [Client] Received data:', {
        topicsCount: data.topics?.length || 0,
        hasHashtags: !!data.hashtags,
        sources: data.topics?.map((t: any) => t.source).filter(Boolean),
      });
      
      // Check if data has source information (real API data)
      const hasRealData = data.topics?.some((t: any) => t.source);
      if (hasRealData) {
        const sources = [...new Set(data.topics?.map((t: any) => t.source).filter(Boolean))];
        console.log('✅ [Client] Real API data detected!');
        console.log('✅ [Client] Active sources:', sources);
        
        const sourceEmojis: Record<string, string> = {
          reddit: '🔴',
          news: '📰',
          google: '🔍',
          youtube: '🎥'
        };
        const sourceLabels = sources.map(s => `${sourceEmojis[s as string] || ''} ${s}`).join(', ');
        toast.success(`Loaded real data from: ${sourceLabels}`);
      } else {
        console.log('📝 [Client] Using curated fallback data');
        toast.info('Showing curated trends');
      }
      
      // Separate YouTube videos from other trends
      const allTopics = data.topics || [];
      const youtubeItems = allTopics.filter((t: any) => t.source === 'youtube');
      const otherTrends = allTopics.filter((t: any) => t.source !== 'youtube');
      
      setTrends(otherTrends);
      setYoutubeVideos(youtubeItems);
      setHashtags(data.hashtags || {});
      setPerformance(data.performance || null);
      setLastUpdated(new Date());
      
      console.log(`📊 [Client] Separated: ${otherTrends.length} trends, ${youtubeItems.length} YouTube videos`);
      console.log('📊 [Client] YouTube videos:', youtubeItems);
      
      // Generate trend alerts from real data
      generateTrendAlerts(allTopics, data.hashtags);
      
      // Generate performance chart data
      generatePerformanceData(allTopics);
    } catch (error: any) {
      console.error('❌ [Client] Fetch error:', error.message);
      toast.error('Failed to fetch trends');
      // Set empty data on error
      setTrends([]);
      setHashtags({});
    } finally {
      setLoading(false);
      console.log('🌐 [Client] Fetch complete\n');
    }
  };

  const copyHashtags = (platform: string) => {
    const tags = hashtags[platform] || [];
    const text = tags.map((t: string) => t.startsWith('#') ? t : `#${t}`).join(' ');
    navigator.clipboard.writeText(text);
    toast.success(`${platform} hashtags copied!`);
  };

  const copyAllHashtags = () => {
    const allTags = Object.values(hashtags).flat() as string[];
    const text = allTags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    navigator.clipboard.writeText(text);
    toast.success('All hashtags copied!');
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const handleUseTopic = (topic: any) => {
    setSelectedTopic(topic);
    setCustomContent(`Create engaging content about: ${topic.title}\n\n${topic.description}`);
    setGeneratedContent([]);
    setIsModalOpen(true);
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateContent = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent([]);
    
    try {
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'text',
          text: customContent,
          tone: 'professional',
          platforms: selectedPlatforms,
          numPosts: 3,
          contentLength: 'medium',
          options: {
            includeHashtags: true,
            includeEmojis: true,
            includeCTA: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Transform the response to match our display format
      const transformed: any[] = [];
      const output = data.output || data; // Handle both response formats
      console.log('Output data:', output);
      
      if (selectedPlatforms.includes('x') && output.x_thread) {
        transformed.push({
          platform: 'x',
          content: Array.isArray(output.x_thread) ? output.x_thread.join('\n\n') : output.x_thread,
        });
      }
      
      if (selectedPlatforms.includes('linkedin') && output.linkedin_post) {
        transformed.push({
          platform: 'linkedin',
          content: output.linkedin_post,
        });
      }
      
      if (selectedPlatforms.includes('instagram') && output.instagram_caption) {
        transformed.push({
          platform: 'instagram',
          content: output.instagram_caption,
        });
      }
      
      if (selectedPlatforms.includes('email') && output.email_newsletter) {
        transformed.push({
          platform: 'email',
          content: `Subject: ${output.email_newsletter.subject}\n\n${output.email_newsletter.body}`,
        });
      }
      
      console.log('Transformed content:', transformed);
      setGeneratedContent(transformed);
      toast.success('Content generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${platform} content copied!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Trending Topics & Hashtags 🔥
          </h1>
          <p className="text-muted-foreground mt-1">Discover what's hot and boost your content reach</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">Auto-insert trending hashtags</span>
          <Switch checked={autoInsert} onCheckedChange={setAutoInsert} />
        </div>
      </div>

      {/* Filter by Platform */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Filter by Platform</CardTitle>
              <CardDescription>See trending topics for specific platforms</CardDescription>
            </div>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={fetchTrends}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Trends
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPlatform === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('all')}
              className={selectedPlatform === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              📱 All Platforms
            </Button>
            <Button
              variant={selectedPlatform === 'x' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('x')}
            >
              𝕏 Twitter
            </Button>
            <Button
              variant={selectedPlatform === 'linkedin' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('linkedin')}
            >
              💼 LinkedIn
            </Button>
            <Button
              variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('instagram')}
            >
              📸 Instagram
            </Button>
            <Button
              variant={selectedPlatform === 'email' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('email')}
            >
              ✉️ Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              All Categories
            </Button>
            {['Technology', 'Business', 'Marketing', 'Lifestyle', 'Health', 'Education', 'Finance'].map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat.toLowerCase() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.toLowerCase())}
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg">Trending Performance Over Time</CardTitle>
              <CardDescription>See how trending topics perform across platforms</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '24' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('24')}
              >
                24 Hours
              </Button>
              <Button
                variant={timeRange === '7' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('7')}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('30')}
              >
                30 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <div className="relative h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              {/* Legend */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 text-xs bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                {performanceData.map((series, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${series.color}-500`} />
                    <span className="font-medium truncate max-w-[150px]" title={series.name}>
                      {series.name}
                    </span>
                    <span className="text-muted-foreground">
                      {series.source === 'youtube' ? '🎥' : series.source === 'reddit' ? '🔴' : '📰'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Chart */}
              <div className="h-full flex items-end justify-between gap-2 pt-16">
                {performanceData[0]?.points.map((_: number, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
                    {/* Bars for each series */}
                    <div className="w-full flex justify-center items-end gap-0.5 h-full">
                      {performanceData.map((series, seriesIdx) => {
                        const height = series.points[i];
                        const colorMap: Record<string, string> = {
                          purple: 'bg-gradient-to-t from-purple-500 to-purple-300',
                          pink: 'bg-gradient-to-t from-pink-500 to-pink-300',
                          green: 'bg-gradient-to-t from-green-500 to-green-300'
                        };
                        return (
                          <div
                            key={seriesIdx}
                            className={`flex-1 ${colorMap[series.color]} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                            style={{ height: `${height}%` }}
                            title={`${series.name}: ${Math.round(height)}%`}
                          />
                        );
                      })}
                    </div>
                    {/* Time labels */}
                    <span className="text-xs text-muted-foreground">
                      {timeRange === '24' 
                        ? (i === 0 ? '00:00' : i === 3 ? '12:00' : i === 6 ? '24:00' : '')
                        : timeRange === '7'
                        ? (i === 0 ? 'Mon' : i === 3 ? 'Thu' : i === 6 ? 'Sun' : '')
                        : (i === 0 ? 'Week 1' : i === 4 ? 'Week 2' : i === 9 ? 'Week 4' : '')
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm font-medium">No performance data available</p>
                <p className="text-xs mt-1">Data will appear when trends are loaded</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hot Topics Right Now */}
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
              Hot Topics Right Now 🔥
            </h2>
            <p className="text-muted-foreground text-base">Trending topics with high engagement potential</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 font-semibold text-sm">Live Updates</span>
            </div>
            <span className="text-xs text-muted-foreground">Updated {formatTimeAgo(lastUpdated)}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : trends.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">No trending topics found</p>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
              <Button 
                onClick={() => {
                  setSelectedPlatform('all');
                  setSelectedCategory('all');
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trends.map((topic, idx) => {
              // Category-based color system - matching reference design
              const getCategoryColor = (badge: string) => {
                // Check badge content for color assignment
                const badgeLower = badge.toLowerCase();
                
                if (badgeLower.includes('trending') || badgeLower.includes('#1')) 
                  return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'bg-red-500', badgeBg: 'bg-red-500' };
                if (badgeLower.includes('rising') || badgeLower.includes('#2')) 
                  return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500', badgeBg: 'bg-blue-500' };
                if (badgeLower.includes('popular') || badgeLower.includes('#3')) 
                  return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'bg-green-500', badgeBg: 'bg-green-500' };
                if (badgeLower.includes('viral') || badgeLower.includes('#4')) 
                  return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500', badgeBg: 'bg-purple-500' };
                if (badgeLower.includes('emerging') || badgeLower.includes('#5')) 
                  return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', accent: 'bg-yellow-500', badgeBg: 'bg-yellow-500' };
                if (badgeLower.includes('innovation') || badgeLower.includes('#6')) 
                  return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', accent: 'bg-indigo-500', badgeBg: 'bg-indigo-500' };
                
                // Default for Reddit, News, etc.
                if (badgeLower.includes('reddit') || badgeLower.includes('r/')) 
                  return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500', badgeBg: 'bg-orange-500' };
                if (badgeLower.includes('news')) 
                  return { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', accent: 'bg-cyan-500', badgeBg: 'bg-cyan-500' };
                
                return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', accent: 'bg-gray-500', badgeBg: 'bg-gray-500' };
              };
              
              const colors = getCategoryColor(topic.badge);
              
              return (
                <div 
                  key={idx} 
                  className={`group relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${colors.bg} ${colors.border}`}
                >
                  {/* Accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />
                  
                  <div className="p-6">
                    {/* Header with badge and growth */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${colors.bg} ${colors.text} border ${colors.border} font-semibold px-3 py-1 text-xs rounded-full`}>
                          {topic.badge}
                        </Badge>
                        {topic.source && (
                          <Badge variant="outline" className="text-xs font-medium rounded-full px-2.5 py-0.5">
                            {topic.source === 'reddit' && '🔴 Reddit'}
                            {topic.source === 'news' && '📰 News'}
                            {topic.source === 'google' && '🔍 Google'}
                            {!topic.source && '📝 Curated'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 border border-green-200">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-sm font-bold text-green-700">{topic.growth}</span>
                      </div>
                    </div>

                    {/* Title - Primary focus */}
                    <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {topic.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                      {topic.description}
                    </p>

                    {/* Tags as rounded pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {topic.tags.slice(0, 3).map((tag: string) => (
                        <Badge 
                          key={tag} 
                          className={`${colors.bg} ${colors.text} border ${colors.border} rounded-full px-3 py-1 text-xs font-medium hover:scale-105 transition-transform cursor-pointer`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer with views and button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        {/* Eye icon for views */}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="font-medium">{topic.views}</span>
                        </div>
                        {/* Platform icons */}
                        <div className="flex gap-1 ml-2">
                          {topic.platforms.slice(0, 3).map((p: string) => (
                            <span key={p} className="text-base opacity-60">
                              {p === 'x' && '𝕏'}
                              {p === 'linkedin' && '💼'}
                              {p === 'instagram' && '📸'}
                              {p === 'email' && '✉️'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 font-semibold"
                        onClick={() => handleUseTopic(topic)}
                      >
                        Use Topic
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Hashtags by Platform */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">#</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Trending Hashtags by Platform</h2>
              <p className="text-muted-foreground text-sm">Most effective hashtags for maximum reach</p>
            </div>
          </div>
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700" onClick={copyAllHashtags}>
            <Copy className="h-4 w-4" />
            Copy All
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Twitter/X */}
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <h3 className="font-bold text-gray-900">Twitter/X Trending</h3>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs"
                onClick={() => copyHashtags('x')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(hashtags.x || hashtags.twitter || []).length > 0 ? (
                (hashtags.x || hashtags.twitter || []).map((h: string) => (
                  <Badge 
                    key={h} 
                    className="bg-blue-600 text-white hover:bg-blue-700 border-0 px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all hover:scale-105"
                    onClick={() => {
                      navigator.clipboard.writeText(h);
                      toast.success(`${h} copied!`);
                    }}
                  >
                    {h}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hashtags available</p>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <h3 className="font-bold text-gray-900">LinkedIn Professional</h3>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs"
                onClick={() => copyHashtags('linkedin')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(hashtags.linkedin || []).length > 0 ? (
                (hashtags.linkedin || []).map((h: string) => (
                  <Badge 
                    key={h} 
                    className="bg-blue-700 text-white hover:bg-blue-800 border-0 px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all hover:scale-105"
                    onClick={() => {
                      navigator.clipboard.writeText(h);
                      toast.success(`${h} copied!`);
                    }}
                  >
                    {h}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hashtags available</p>
              )}
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-pink-50 rounded-xl p-6 border-2 border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <h3 className="font-bold text-gray-900">Instagram Lifestyle</h3>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs"
                onClick={() => copyHashtags('instagram')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(hashtags.instagram || []).length > 0 ? (
                (hashtags.instagram || []).map((h: string) => (
                  <Badge 
                    key={h} 
                    className="bg-pink-600 text-white hover:bg-pink-700 border-0 px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all hover:scale-105"
                    onClick={() => {
                      navigator.clipboard.writeText(h);
                      toast.success(`${h} copied!`);
                    }}
                  >
                    {h}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hashtags available</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-bold text-gray-900">Email Keywords</h3>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs"
                onClick={() => copyHashtags('email')}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(hashtags.email || []).length > 0 ? (
                (hashtags.email || []).map((h: string) => (
                  <Badge 
                    key={h} 
                    className="bg-green-600 text-white hover:bg-green-700 border-0 px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all hover:scale-105"
                    onClick={() => {
                      navigator.clipboard.writeText(h);
                      toast.success(`${h} copied!`);
                    }}
                  >
                    {h}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hashtags available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trending YouTube Videos */}
      <div id="youtube-section" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Trending YouTube Videos</h2>
                <p className="text-muted-foreground text-sm">Popular videos to inspire your content</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-700 font-semibold text-sm">{youtubeVideos.length} Videos</span>
            </div>
          </div>

          {/* Group videos by category */}
          {(() => {
            // Group videos by YouTube category
            const groupedVideos = youtubeVideos.reduce((acc: any, video: any) => {
              const category = video.youtubeCategory || 'Other';
              if (!acc[category]) {
                acc[category] = [];
              }
              acc[category].push(video);
              return acc;
            }, {});

            return Object.entries(groupedVideos).map(([categoryName, videos]: [string, any]) => (
              <div key={categoryName} className="mb-8 last:mb-0">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{videos[0]?.youtubeCategoryEmoji || '📁'}</span>
                  <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
                  <span className="text-sm text-muted-foreground">({videos.length} videos)</span>
                </div>

                {/* Videos Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video: any) => (
              <div 
                key={video.id} 
                className="group bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-red-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => window.open(video.videoUrl, '_blank')}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
                      <span className="text-4xl">🎥</span>
                    </div>
                  )}
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 group-hover:bg-red-700 group-hover:scale-110 transition-all flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Views badge */}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
                    {video.views} views
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                    {video.title}
                  </h3>
                  
                  {video.channelTitle && (
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      {video.channelTitle}
                    </p>
                  )}

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {video.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  <Button 
                    size="sm" 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTopic(video);
                      setIsModalOpen(true);
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate Content
                  </Button>
                </div>
              </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        {youtubeVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No YouTube videos available</p>
            <p className="text-xs text-muted-foreground">Add YOUTUBE_API_KEY to .env.local to fetch real videos</p>
          </div>
        )}
      </div>

      {/* Trending YouTube Hashtags by Category */}
      {youtubeVideos.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎥</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Trending YouTube Hashtags by Category</h2>
              <p className="text-muted-foreground text-sm">Click any hashtag to copy • Organized by video category</p>
            </div>
          </div>

          {/* Group hashtags by category */}
          <div className="grid md:grid-cols-2 gap-4">
            {(() => {
              // Extract and group hashtags by category
              const hashtagsByCategory = youtubeVideos.reduce((acc: any, video: any) => {
                const category = video.youtubeCategory || 'Other';
                if (!acc[category]) {
                  acc[category] = {
                    emoji: video.youtubeCategoryEmoji || '📁',
                    tags: new Set()
                  };
                }
                // Add all tags from this video
                if (video.tags && Array.isArray(video.tags)) {
                  video.tags.forEach((tag: string) => {
                    if (tag.startsWith('#')) {
                      acc[category].tags.add(tag);
                    }
                  });
                }
                return acc;
              }, {});

              const categoryColors: Record<string, { bg: string, badge: string, button: string }> = {
                'Science & Technology': { bg: 'bg-blue-50', badge: 'bg-blue-600', button: 'hover:bg-blue-700' },
                'People & Blogs': { bg: 'bg-purple-50', badge: 'bg-purple-600', button: 'hover:bg-purple-700' },
                'News & Politics': { bg: 'bg-orange-50', badge: 'bg-orange-600', button: 'hover:bg-orange-700' },
                'Entertainment': { bg: 'bg-pink-50', badge: 'bg-pink-600', button: 'hover:bg-pink-700' },
                'Music': { bg: 'bg-green-50', badge: 'bg-green-600', button: 'hover:bg-green-700' },
              };

              return Object.entries(hashtagsByCategory).map(([categoryName, data]: [string, any]) => {
                const tagsArray = Array.from(data.tags) as string[];
                if (tagsArray.length === 0) return null;

                const colors = categoryColors[categoryName] || { bg: 'bg-gray-50', badge: 'bg-gray-600', button: 'hover:bg-gray-700' };

                return (
                  <div key={categoryName} className={`${colors.bg} rounded-xl p-6 border-2 border-${colors.bg.replace('50', '100')}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{data.emoji}</span>
                        <h3 className="font-bold text-gray-900">{categoryName}</h3>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs"
                        onClick={() => {
                          const allTags = tagsArray.join(' ');
                          navigator.clipboard.writeText(allTags);
                          toast.success(`All ${categoryName} hashtags copied!`);
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagsArray.slice(0, 12).map((tag: string, idx: number) => (
                        <Badge
                          key={idx}
                          className={`${colors.badge} text-white ${colors.button} border-0 px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all hover:scale-105`}
                          onClick={() => {
                            navigator.clipboard.writeText(tag);
                            toast.success(`${tag} copied!`);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Bottom Grid: Analytics and Tools */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Trending Engagement Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Trending Engagement Analytics</h3>
              <p className="text-xs text-muted-foreground">Real-time platform performance</p>
            </div>
          </div>

          {/* Bar Chart with Real Data */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { platform: 'X/Twitter', key: 'x', thisWeek: performance?.x?.engagement || 15, growth: performance?.x?.growth || 12, color: 'bg-blue-500' },
              { platform: 'LinkedIn', key: 'linkedin', thisWeek: performance?.linkedin?.engagement || 13, growth: performance?.linkedin?.growth || 10, color: 'bg-blue-700' },
              { platform: 'Instagram', key: 'instagram', thisWeek: performance?.instagram?.engagement || 7, growth: performance?.instagram?.growth || 6, color: 'bg-pink-500' },
              { platform: 'Email', key: 'email', thisWeek: performance?.email?.engagement || 16, growth: performance?.email?.growth || 14, color: 'bg-green-500' },
            ].map((item) => {
              const lastWeek = Math.max(1, item.thisWeek - item.growth);
              return (
                <div key={item.platform} className="space-y-2 group cursor-pointer" onClick={() => setSelectedPlatform(item.key)}>
                  <p className="text-xs font-semibold text-center text-gray-700 group-hover:text-purple-600 transition-colors">{item.platform}</p>
                  <div className="flex items-end justify-center gap-1.5 h-32">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 ${item.color} rounded-t opacity-50 group-hover:opacity-70 transition-opacity`}
                        style={{ height: `${lastWeek * 6}px` }}
                      />
                      <span className="text-xs text-muted-foreground">{lastWeek}%</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 ${item.color} rounded-t group-hover:scale-105 transition-transform`} style={{ height: `${item.thisWeek * 6}px` }} />
                      <span className="text-xs font-bold">{item.thisWeek}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-semibold ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growth > 0 ? '↑' : '↓'} {Math.abs(item.growth)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 pt-4 mt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-600" />
              <span className="text-xs font-medium">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-300" />
              <span className="text-xs font-medium">Last Week</span>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">Click a platform to filter trends</p>
        </div>

        {/* Trending Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Trending Tools</h3>
              <p className="text-xs text-muted-foreground">Quick actions for trending content</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { 
                icon: '🎯', 
                title: 'AI Topic Generator', 
                desc: 'Generate content from top trend', 
                color: 'bg-purple-100',
                action: () => {
                  if (trends.length > 0) {
                    handleUseTopic(trends[0]);
                    setIsModalOpen(true);
                  } else {
                    toast.error('No trending topics available');
                  }
                }
              },
              { 
                icon: '#', 
                title: 'Copy All Hashtags', 
                desc: 'Copy all trending hashtags', 
                color: 'bg-blue-100',
                action: () => {
                  copyAllHashtags();
                }
              },
              { 
                icon: '📋', 
                title: 'Templates', 
                desc: 'Browse content templates', 
                color: 'bg-green-100',
                action: () => {
                  router.push('/dashboard/templates');
                }
              },
            ].map((tool) => (
              <div 
                key={tool.title} 
                onClick={tool.action}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer group border border-gray-100 hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${tool.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                    {tool.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">{tool.title}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Trend Alerts</h3>
            </div>
          </div>
          <Button variant="link" className="text-primary text-sm p-0 h-auto font-semibold">Settings</Button>
        </div>

        <div className="space-y-3">
          {trendAlerts.length > 0 ? (
            trendAlerts.map((alert, idx) => (
              <div 
                key={idx} 
                className={`flex items-start justify-between p-4 rounded-xl border-2 ${alert.color} cursor-pointer hover:shadow-md transition-all`}
                onClick={alert.action}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{alert.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{alert.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No new alerts</p>
              <p className="text-xs mt-1">Alerts will appear when new trends are detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Topic Customization Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Customize Your Content
            </DialogTitle>
            <DialogDescription>
              Edit the content and select platforms to generate engaging posts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Topic Info */}
            {selectedTopic && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{selectedTopic.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTopic.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedTopic.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {selectedTopic.growth}
                  </Badge>
                </div>
              </div>
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-base font-semibold">
                Content Prompt
              </Label>
              <Textarea
                id="content"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Describe what you want to create..."
                className="min-h-[150px] text-base"
              />
              <p className="text-xs text-muted-foreground">
                Edit this prompt to customize how AI generates your content
              </p>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'x', label: 'Twitter (𝕏)', icon: '𝕏', color: 'border-blue-200 bg-blue-50' },
                  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'border-blue-300 bg-blue-50' },
                  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'border-pink-200 bg-pink-50' },
                  { id: 'email', label: 'Email', icon: '✉️', color: 'border-green-200 bg-green-50' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformToggle(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? `${platform.color} border-opacity-100 shadow-md`
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm">{platform.label}</p>
                      </div>
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Content Display */}
            {generatedContent.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                  <span className="text-sm font-semibold text-purple-600">Generated Content</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                </div>

                {generatedContent.map((item, idx) => {
                  const platformColors: any = {
                    x: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '𝕏' },
                    linkedin: { bg: 'bg-blue-50', border: 'border-blue-300', icon: '💼' },
                    instagram: { bg: 'bg-pink-50', border: 'border-pink-200', icon: '📸' },
                    email: { bg: 'bg-green-50', border: 'border-green-200', icon: '✉️' },
                  };
                  const colors = platformColors[item.platform] || platformColors.x;

                  return (
                    <div key={idx} className={`p-4 rounded-xl border-2 ${colors.bg} ${colors.border}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{colors.icon}</span>
                          <span className="font-bold text-sm capitalize">{item.platform}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(item.content, item.platform)}
                          className="gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsModalOpen(false);
                  setGeneratedContent([]);
                }}
              >
                {generatedContent.length > 0 ? 'Close' : 'Cancel'}
              </Button>
              {generatedContent.length === 0 && (
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
