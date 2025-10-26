'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Shield,
  Ticket,
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Mail,
  Inbox,
  ArrowRight,
  DollarSign,
  Code,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuickStats {
  totalRevenue: number;
  totalCodes: number;
  activeCodes: number;
  totalUsers: number;
  recentRedemptions: number;
}

export default function AdminLTDPage() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/admin/ltd/revenue');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalCodes: data.totalCodes || 0,
          activeCodes: data.activeCodes || 0,
          totalUsers: data.totalUsers || 0,
          recentRedemptions: data.recentRedemptions || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationCards = [
    {
      title: 'Overview',
      description: 'View comprehensive LTD metrics and performance',
      icon: BarChart3,
      href: '/admin/ltd/overview',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Code Management',
      description: 'View, edit, and manage all LTD codes',
      icon: Ticket,
      href: '/admin/ltd/codes',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Generate Codes',
      description: 'Create new LTD codes for campaigns',
      icon: Shield,
      href: '/admin/ltd/codes/generate',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'LTD Users',
      description: 'Manage users who have redeemed codes',
      icon: Users,
      href: '/admin/ltd/users',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Email Campaigns',
      description: 'Create and manage email campaigns',
      icon: Mail,
      href: '/admin/ltd/campaigns',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Email Analytics',
      description: 'Track email campaign performance',
      icon: Inbox,
      href: '/admin/ltd/email-analytics',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Analytics',
      description: 'Detailed analytics and insights',
      icon: TrendingUp,
      href: '/admin/ltd/analytics',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Activity Logs',
      description: 'View all admin actions and system logs',
      icon: Activity,
      href: '/admin/ltd/logs',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">LTD Admin Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Manage lifetime deal codes, users, and campaigns all in one place
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From LTD sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCodes}</div>
              <p className="text-xs text-muted-foreground mt-1">Generated codes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCodes}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">LTD customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Redemptions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentRedemptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Cards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {card.title}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/ltd/codes/generate">
              <Button className="gap-2">
                <Shield className="h-4 w-4" />
                Generate New Codes
              </Button>
            </Link>
            <Link href="/admin/ltd/users">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                View All Users
              </Button>
            </Link>
            <Link href="/admin/ltd/campaigns">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
            <Link href="/admin/ltd/analytics">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              All Systems Operational
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Connected
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Service</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Active
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


