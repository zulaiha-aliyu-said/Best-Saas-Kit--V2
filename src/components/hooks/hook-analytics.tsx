'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Copy,
  BarChart3,
  PieChart,
  Award,
  Calendar,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface HookAnalytics {
  stats: any[];
  recentHooks: any[];
  topHooks: any[];
  platformDistribution: any[];
  categoryPerformance: any[];
  totals: {
    total_hooks: number;
    total_copied: number;
    avg_engagement_score: number;
    max_score: number;
  };
}

export default function HookAnalytics() {
  const [analytics, setAnalytics] = useState<HookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/hooks/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600">Failed to load analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const { totals, platformDistribution, categoryPerformance, topHooks, recentHooks } =
    analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/hooks"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Generator
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Hook Analytics
          </h1>
          <p className="text-gray-600">Track your viral hook performance and insights</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Hooks</h3>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {totals.total_hooks.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-pink-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Hooks Copied</h3>
              <Copy className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {totals.total_copied.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {totals.total_hooks > 0
                ? ((totals.total_copied / totals.total_hooks) * 100).toFixed(1)
                : 0}
              % copy rate
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Avg Score</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {parseFloat(totals.avg_engagement_score || '0').toFixed(1)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Best Score</h3>
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{totals.max_score || 0}</p>
          </div>
        </div>

        {/* Platform & Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Platform Distribution</h2>
            </div>
            <div className="space-y-3">
              {platformDistribution.map((platform) => (
                <div key={platform.platform} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize">
                      {platform.platform}
                    </span>
                    <span className="text-gray-600">
                      {platform.count} hooks (avg: {parseFloat(platform.avg_score).toFixed(1)})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (platform.count / totals.total_hooks) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Category Performance</h2>
            </div>
            <div className="space-y-4">
              {categoryPerformance.map((category) => {
                const copyRate =
                  category.count > 0
                    ? ((category.copies / category.count) * 100).toFixed(1)
                    : '0';
                return (
                  <div
                    key={category.category}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 capitalize">
                        {category.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {category.count} hooks
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Avg Score: {parseFloat(category.avg_score).toFixed(1)}
                      </span>
                      <span className="text-gray-600">Copy Rate: {copyRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Hooks */}
        {topHooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Top Performing Hooks (85+ Score)
              </h2>
            </div>
            <div className="space-y-3">
              {topHooks.map((hook, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">{hook.generated_hook}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="capitalize">{hook.platform}</span>
                        <span>•</span>
                        <span className="capitalize">{hook.niche}</span>
                        <span>•</span>
                        <span className="font-semibold text-green-600">
                          Score: {hook.engagement_score}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Hooks */}
        {recentHooks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Recent Hooks</h2>
            </div>
            <div className="space-y-3">
              {recentHooks.slice(0, 10).map((hook) => (
                <div
                  key={hook.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">{hook.generated_hook}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="capitalize">{hook.platform}</span>
                        <span>•</span>
                        <span className="capitalize">{hook.niche}</span>
                        <span>•</span>
                        <span>Topic: {hook.topic}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            hook.engagement_score >= 85
                              ? 'text-green-600'
                              : hook.engagement_score >= 75
                              ? 'text-blue-600'
                              : 'text-purple-600'
                          }`}
                        >
                          {hook.engagement_score}
                        </span>
                        {hook.copied && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">✓ Copied</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






