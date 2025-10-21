"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare,
  Hash,
  Smile,
  Zap
} from "lucide-react";

interface UserOptimizationStats {
  total_optimizations: number;
  platforms_optimized: number;
  total_threads_created: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  avg_emoji_count: number;
  total_warnings: number;
  most_optimized_platform: string;
  avg_readability_score: number;
  recent_optimizations: number;
}

interface PlatformBreakdown {
  platform: string;
  optimization_count: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  thread_count: number;
  warning_count: number;
  avg_readability_score: number;
}

const platformColors: Record<string, string> = {
  x: "bg-black text-white",
  linkedin: "bg-[#0077B5] text-white",
  instagram: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
  email: "bg-gray-600 text-white",
  facebook: "bg-[#1877F2] text-white",
  tiktok: "bg-black text-white",
};

const platformNames: Record<string, string> = {
  x: "Twitter/X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  email: "Email",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export function UserOptimizationAnalytics() {
  const [stats, setStats] = useState<UserOptimizationStats | null>(null);
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/platform-optimization-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setStats(data.stats);
      setPlatformBreakdown(data.platformBreakdown);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_optimizations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Optimization Analytics</CardTitle>
          <CardDescription>
            No optimization data yet. Enable platform optimization in settings and start generating content!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Platform Optimization Analytics</h2>
        <p className="text-muted-foreground">
          Track how your content is being optimized for different platforms
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Total Optimizations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_optimizations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.recent_optimizations} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Threads Created</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_threads_created}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-split for Twitter/X
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Hash className="h-4 w-4" />
              <span>Avg Hashtags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avg_hashtag_count.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Warnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_warnings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Rule violations detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>
            Optimization statistics by platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={platformColors[platform.platform] || "bg-gray-600 text-white"}>
                      {platformNames[platform.platform] || platform.platform}
                    </Badge>
                    <span className="text-sm font-medium">
                      {platform.optimization_count} optimizations
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{Math.round(platform.avg_character_count)} chars avg</span>
                    <span>{platform.thread_count} threads</span>
                    {platform.warning_count > 0 && (
                      <span className="text-orange-600">
                        {platform.warning_count} warnings
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={platformColors[platform.platform]?.replace('text-white', '') || "bg-gray-600"}
                    style={{ width: `${(platform.optimization_count / stats.total_optimizations) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Used Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Badge className={platformColors[stats.most_optimized_platform] || "bg-gray-600 text-white"} className="text-lg px-4 py-2">
                {platformNames[stats.most_optimized_platform] || stats.most_optimized_platform}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Smile className="h-5 w-5" />
              <span>Content Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Characters</span>
              <span className="font-semibold">{Math.round(stats.avg_character_count)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Emojis</span>
              <span className="font-semibold">{stats.avg_emoji_count.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Platforms Used</span>
              <span className="font-semibold">{stats.platforms_optimized}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


