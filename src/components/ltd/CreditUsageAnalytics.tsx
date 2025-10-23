'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UsageAnalytics {
  plan: {
    type: string;
    tier: number | null;
    current_credits: number;
    monthly_limit: number;
    rollover: number;
  };
  usage_by_action: Array<{
    action_type: string;
    usage_count: number;
    total_credits_used: number;
    avg_credits_per_action: number;
    last_used: string;
  }>;
  daily_trend: Array<{
    date: string;
    credits_used: number;
    action_count: number;
  }>;
  summary: {
    total_actions: number;
    total_credits_used: number;
    first_action: string;
    last_action: string;
  };
  period_days: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export function CreditUsageAnalytics() {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ltd/usage-analytics?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.summary.total_actions}</div>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Credits Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.summary.total_credits_used}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((analytics.summary.total_credits_used / analytics.plan.monthly_limit) * 100).toFixed(1)}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average per Action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics.summary.total_actions > 0
                ? (analytics.summary.total_credits_used / analytics.summary.total_actions).toFixed(1)
                : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Credits per action</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Usage Analytics
              </CardTitle>
              <CardDescription>Detailed breakdown of your credit usage</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={days === 7 ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setDays(7)}
              >
                7 days
              </Badge>
              <Badge
                variant={days === 30 ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setDays(30)}
              >
                30 days
              </Badge>
              <Badge
                variant={days === 90 ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setDays(90)}
              >
                90 days
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trend" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trend">Daily Trend</TabsTrigger>
              <TabsTrigger value="actions">By Action</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="trend" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.daily_trend.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: any) => [value, 'Credits']}
                  />
                  <Line type="monotone" dataKey="credits_used" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.usage_by_action}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action_type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_credits_used" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>

              {/* Action Details Table */}
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Action</th>
                      <th className="text-right p-3 font-medium">Count</th>
                      <th className="text-right p-3 font-medium">Credits</th>
                      <th className="text-right p-3 font-medium">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.usage_by_action.map((action, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-3 font-medium">
                          {formatActionName(action.action_type)}
                        </td>
                        <td className="text-right p-3">{action.usage_count}</td>
                        <td className="text-right p-3">{action.total_credits_used}</td>
                        <td className="text-right p-3">
                          {parseFloat(action.avg_credits_per_action).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.usage_by_action}
                    dataKey="total_credits_used"
                    nameKey="action_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => formatActionName(entry.action_type)}
                  >
                    {analytics.usage_by_action.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} credits`,
                      formatActionName(name),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function formatActionName(action: string | undefined): string {
  if (!action) return 'Unknown';
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}



