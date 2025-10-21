"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Hash,
  Activity
} from "lucide-react";

interface AdminOptimizationStats {
  total_optimizations: number;
  unique_users: number;
  total_threads_created: number;
  avg_character_count: number;
  avg_hashtag_count: number;
  total_warnings: number;
  optimization_enabled_users: number;
  recent_optimizations: number;
  monthly_optimizations: number;
}

interface PlatformPopularity {
  platform: string;
  optimization_count: number;
  unique_users: number;
  avg_character_count: number;
  thread_count: number;
  avg_readability_score: number;
}

interface OptimizationTrend {
  date: string;
  optimization_count: number;
  unique_users: number;
  thread_count: number;
  avg_character_count: number;
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

export function AdminOptimizationAnalytics() {
  const [stats, setStats] = useState<AdminOptimizationStats | null>(null);
  const [platformPopularity, setPlatformPopularity] = useState<PlatformPopularity[]>([]);
  const [trends, setTrends] = useState<OptimizationTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendDays, setTrendDays] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [trendDays]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/platform-optimization-analytics?days=${trendDays}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setStats(data.stats);
      setPlatformPopularity(data.platformPopularity);
      setTrends(data.trends);
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

  // Check if the error is because the database schema doesn't exist
  const isSchemaError = error?.includes('does not exist') || error?.includes('relation') || error?.includes('function');
  
  if (isSchemaError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Optimization Analytics - Setup Required</CardTitle>
          <CardDescription>
            The analytics database schema needs to be initialized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              🔧 Database Setup Required
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              Run the setup endpoint to create the platform optimization analytics schema:
            </p>
            <div className="bg-black text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
              {`fetch('/api/admin/setup-platform-analytics', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('✅ Setup:', data));`}
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-3">
              Copy the command above, open your browser console (F12), paste it, and press Enter.
            </p>
          </div>
        </CardContent>
      </Card>
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

  if (!stats) {
    return null;
  }

  const adoptionRate = stats.unique_users > 0 
    ? ((stats.optimization_enabled_users / stats.unique_users) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Platform Optimization Analytics</h2>
          <p className="text-muted-foreground">
            System-wide platform optimization metrics and insights
          </p>
        </div>
        <Select value={trendDays} onValueChange={setTrendDays}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
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
            <div className="text-3xl font-bold">{stats.total_optimizations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.monthly_optimizations} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Active Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.unique_users}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.optimization_enabled_users} enabled ({adoptionRate}%)
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
              <AlertTriangle className="h-4 w-4" />
              <span>Total Warnings</span>
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

      {/* Platform Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Popularity</CardTitle>
          <CardDescription>
            Most optimized platforms across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformPopularity.map((platform, idx) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{idx + 1}</span>
                    <Badge className={platformColors[platform.platform] || "bg-gray-600 text-white"}>
                      {platformNames[platform.platform] || platform.platform}
                    </Badge>
                    <span className="text-sm font-medium">
                      {platform.optimization_count.toLocaleString()} optimizations
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{platform.unique_users} users</span>
                    <span>{Math.round(platform.avg_character_count)} chars avg</span>
                    <span>{platform.thread_count} threads</span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={platformColors[platform.platform]?.replace('text-white', '') || "bg-gray-600"}
                    style={{
                      width: `${(platform.optimization_count / platformPopularity[0].optimization_count) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Optimization activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.slice(0, 7).map((trend) => (
                <div key={trend.date} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(trend.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">{trend.optimization_count}</span>
                    <span className="text-muted-foreground">optimizations</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Metrics</span>
            </CardTitle>
            <CardDescription>
              Average optimization metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Characters</span>
              <span className="font-semibold">{Math.round(stats.avg_character_count)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Hashtags</span>
              <span className="font-semibold">{stats.avg_hashtag_count.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Adoption Rate</span>
              <span className="font-semibold">{adoptionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Optimizations/User</span>
              <span className="font-semibold">
                {stats.unique_users > 0 ? (stats.total_optimizations / stats.unique_users).toFixed(1) : "0"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



