'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BarChart3, TrendingUp, Activity, Zap, Target, Calendar, FileText } from 'lucide-react';

interface RepurposedContentStats {
  total_generations: number;
  platforms_used: number;
  recent_generations: number;
  monthly_generations: number;
  total_tokens_used: number;
  avg_tokens_per_generation: number;
  platform_breakdown: Record<string, number>;
  tone_breakdown: Record<string, number>;
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  platforms_with_posts: number;
}

export function UserRepurposedContentAnalytics() {
  const [stats, setStats] = useState<RepurposedContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/repurpose/content-stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.error || 'Failed to fetch repurposed content statistics');
        }
      } catch (err) {
        setError('Failed to fetch repurposed content statistics');
        console.error('Error fetching repurposed content stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repurposed Content Analytics</CardTitle>
          <CardDescription>Your content repurposing performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repurposed Content Analytics</CardTitle>
          <CardDescription>Your content repurposing performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_generations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repurposed Content Analytics</CardTitle>
          <CardDescription>Your content repurposing performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Repurposed Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start repurposing your content to see analytics here.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>• Go to Repurpose page to create content</p>
              <p>• Transform your content across multiple platforms</p>
              <p>• Track your repurposing activity and efficiency</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_generations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recent_generations} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms Used</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.platforms_used}</div>
            <p className="text-xs text-muted-foreground">
              Different platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_posts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.published_posts} published, {stats.draft_posts} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tokens_used.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {stats.avg_tokens_per_generation} per generation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform and Tone Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Usage</CardTitle>
            <CardDescription>Your content repurposing by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.platform_breakdown).map(([platform, count]) => {
                const percentage = (count / stats.total_generations) * 100;
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tone Usage</CardTitle>
            <CardDescription>Your content tone preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.tone_breakdown).map(([tone, count]) => {
                const percentage = (count / stats.total_generations) * 100;
                return (
                  <div key={tone} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{tone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Your repurposing activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.recent_generations}</div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.monthly_generations}</div>
              <div className="text-sm text-muted-foreground">Last 30 days</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.platforms_with_posts}</div>
              <div className="text-sm text-muted-foreground">Platforms with posts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



