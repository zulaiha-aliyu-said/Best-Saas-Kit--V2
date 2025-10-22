'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  Copy,
  BarChart3,
  Calendar,
  Award,
  Loader2,
  Filter,
} from 'lucide-react';

interface AdminHookAnalytics {
  overallStats: {
    total_users: number;
    total_hooks_generated: number;
    total_hooks_copied: number;
    avg_engagement_score: number;
    overall_copy_rate: number;
  };
  platformStats: any[];
  nicheStats: any[];
  categoryStats: any[];
  dailyTrend: any[];
  topHooks: any[];
  activeUsers: any[];
  patternUsage: any[];
  timeframe: number;
}

export default function AdminHooksAnalytics() {
  const [analytics, setAnalytics] = useState<AdminHookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/hooks-analytics?timeframe=${timeframe}`);
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
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600">Failed to load analytics</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    overallStats,
    platformStats,
    nicheStats,
    categoryStats,
    dailyTrend,
    topHooks,
    activeUsers,
    patternUsage,
  } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Admin Hook Analytics
            </h1>
            <p className="text-gray-600">
              System-wide viral hook performance and insights
            </p>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {overallStats.total_users.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Hooks Generated</h3>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {overallStats.total_hooks_generated.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-pink-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Hooks Copied</h3>
              <Copy className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {overallStats.total_hooks_copied.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Avg Score</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {parseFloat(overallStats.avg_engagement_score || '0').toFixed(1)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Copy Rate</h3>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {parseFloat(overallStats.overall_copy_rate || '0').toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Platform & Category Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Platform Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Platform Performance</h2>
            </div>
            <div className="space-y-4">
              {platformStats.map((platform) => (
                <div
                  key={platform.platform}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 capitalize">
                      {platform.platform}
                    </span>
                    <span className="text-sm text-gray-600">
                      {platform.hooks_generated.toLocaleString()} hooks
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="block text-gray-500">Avg Score</span>
                      <span className="font-semibold">
                        {parseFloat(platform.avg_engagement_score).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Copy Rate</span>
                      <span className="font-semibold">
                        {parseFloat(platform.copy_rate || '0').toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Users</span>
                      <span className="font-semibold">{platform.unique_users}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Category Performance</h2>
            </div>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div
                  key={category.category}
                  className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 capitalize">
                      {category.category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {category.hooks_generated.toLocaleString()} hooks
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="block text-gray-500">Avg Score</span>
                      <span className="font-semibold">
                        {parseFloat(category.avg_engagement_score).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Copy Rate</span>
                      <span className="font-semibold">
                        {parseFloat(category.copy_rate || '0').toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Niches */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Top Performing Niches</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {nicheStats.slice(0, 8).map((niche, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 capitalize">
                  {niche.platform} - {niche.niche}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>{niche.hooks_generated.toLocaleString()} hooks</div>
                  <div>Score: {parseFloat(niche.avg_engagement_score).toFixed(1)}</div>
                  <div>{niche.unique_users} users</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Daily Trend</h2>
          </div>
          <div className="space-y-2">
            {dailyTrend.slice(0, 14).map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {new Date(day.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>{day.hooks_generated} generated</span>
                  <span>{day.hooks_copied} copied</span>
                  <span>{day.unique_users} users</span>
                  <span className="font-semibold">
                    Avg: {parseFloat(day.avg_engagement_score).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Hooks */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Top Performing Hooks (System-wide)
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
                      <span className="capitalize">
                        {hook.category.replace('_', ' ')}
                      </span>
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

        {/* Most Active Users */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Most Active Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    User
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Hooks Generated
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Hooks Copied
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Avg Score
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Copy Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user, index) => {
                  const copyRate =
                    user.hooks_generated > 0
                      ? ((user.hooks_copied / user.hooks_generated) * 100).toFixed(1)
                      : '0';
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {user.name || user.email}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {user.hooks_generated}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {user.hooks_copied}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {parseFloat(user.avg_engagement_score).toFixed(1)}
                      </td>
                      <td className="text-center py-3 px-4 text-sm text-gray-600">
                        {copyRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pattern Usage */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Most Used Patterns</h2>
          </div>
          <div className="space-y-3">
            {patternUsage.slice(0, 10).map((pattern, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium mb-2">
                      {pattern.pattern}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="capitalize">{pattern.platform}</span>
                      <span>•</span>
                      <span className="capitalize">{pattern.niche}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {pattern.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {pattern.usage_count || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg: {parseFloat(pattern.avg_engagement_score || '0').toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}









