'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Ticket, 
  TrendingUp,
  Loader2,
  CreditCard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  revenue: Array<{ tier: number; code_count: string; revenue: string }>;
  userGrowth: Array<{ month: string; new_users: string; ltd_tier: number }>;
  redemptionTrend: Array<{ date: string; redemptions: string }>;
  creditUsage: Array<{ action_type: string; usage_count: string; total_credits: string }>;
  topUsers: Array<{ id: string; email: string; name: string; ltd_tier: number; total_credits_used: string }>;
  stats: {
    total_users: string;
    total_codes: string;
    redeemed_codes: string;
    total_active_credits: string;
    total_redemptions: string;
  };
  tierDistribution: Array<{ ltd_tier: number; user_count: string }>;
}

const COLORS = ['#3b82f6', '#a855f7', '#ec4899', '#f97316'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ltd/analytics');
      const data = await response.json();

      if (data.success) {
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load analytics
      </div>
    );
  }

  const totalRevenue = analytics.revenue?.reduce((sum, r) => sum + parseInt(r.revenue || '0'), 0) || 0;
  const revenueByTier = (analytics.revenue || []).map(r => ({
    name: `Tier ${r.tier}`,
    revenue: parseInt(r.revenue || '0'),
    codes: parseInt(r.code_count || '0'),
  }));

  const tierDist = (analytics.tierDistribution || []).map(t => ({
    name: `Tier ${t.ltd_tier}`,
    value: parseInt(t.user_count || '0'),
    tier: t.ltd_tier,
  }));

  const redemptionData = (analytics.redemptionTrend || []).map(r => ({
    date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    redemptions: parseInt(r.redemptions || '0'),
  }));

  const creditUsageData = (analytics.creditUsage || []).map(c => ({
    action: c.action_type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Unknown',
    credits: parseInt(c.total_credits || '0'),
    count: parseInt(c.usage_count || '0'),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your LTD program
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analytics.stats.redeemed_codes} redeemed codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.total_users}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime deal customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stats.total_codes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.stats.redeemed_codes} redeemed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseInt(analytics.stats.total_active_credits || '0').toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In circulation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((parseInt(analytics.stats.redeemed_codes) / parseInt(analytics.stats.total_codes)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of all codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
            <CardDescription>Total revenue generated per tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByTier}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users across different tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tierDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.tier - 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Redemption Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption Trend (30 Days)</CardTitle>
            <CardDescription>Daily code redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={redemptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="redemptions" stroke="#ec4899" strokeWidth={2} name="Redemptions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Credit Usage by Action */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Usage by Action (30 Days)</CardTitle>
            <CardDescription>Most common credit-consuming actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="credits" fill="#3b82f6" name="Credits Used" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Users by Credit Usage (30 Days)</CardTitle>
          <CardDescription>Most active users this month</CardDescription>
        </CardHeader>
        <CardContent>
          {!analytics.topUsers || analytics.topUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No user activity in the last 30 days
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Tier {user.ltd_tier}</Badge>
                  <div className="text-right">
                    <p className="font-bold">{parseInt(user.total_credits_used).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">credits used</p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

