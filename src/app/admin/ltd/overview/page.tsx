'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  Code,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  Percent,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLTDOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [revenueRes, alertsRes] = await Promise.all([
        fetch('/api/admin/ltd/revenue'),
        fetch('/api/admin/ltd/alerts/expiring-codes?days=30')
      ]);

      if (revenueRes.ok) {
        setRevenue(await revenueRes.json());
      }
      if (alertsRes.ok) {
        setAlerts(await alertsRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LTD Overview Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Your lifetime deal business at a glance
          </p>
        </div>
        <Button onClick={fetchData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts Section */}
      {alerts && (alerts.stats.expiring_soon > 0 || alerts.stats.already_expired > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Attention Required!</strong>
              {alerts.stats.already_expired > 0 && (
                <span className="ml-2">
                  {alerts.stats.already_expired} codes have expired and are still active.
                </span>
              )}
              {alerts.stats.expiring_soon > 0 && (
                <span className="ml-2">
                  {alerts.stats.expiring_soon} codes expiring in the next 30 days.
                </span>
              )}
            </div>
            <Link href="/admin/ltd/codes">
              <Button variant="outline" size="sm">
                View Codes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.overview?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {formatNumber(revenue?.overview?.total_redemptions || 0)} redemptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(revenue?.overview?.active_users || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: {formatCurrency(Math.round(revenue?.overview?.avg_revenue_per_user || 0))}/user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.overview?.potential_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From unredeemed codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stacking Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(revenue?.overview?.stacking_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From multi-code users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Tier & Projections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
            <CardDescription>Performance breakdown by LTD tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenue?.revenue_by_tier?.map((tier: any) => (
              <div key={tier.tier} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Tier {tier.tier}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(tier.total_revenue)} ({tier.redemptions} codes)
                  </span>
                </div>
                <Progress 
                  value={(tier.total_revenue / revenue.overview.total_revenue) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
            <CardDescription>Based on recent trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Next Month</p>
                <p className="text-xs text-muted-foreground">Estimated revenue</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(revenue?.projections?.next_month || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Next Quarter</p>
                <p className="text-xs text-muted-foreground">3-month projection</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(revenue?.projections?.next_quarter || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
              <div>
                <p className="text-sm font-medium">Next Year</p>
                <p className="text-xs text-muted-foreground">12-month projection</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatCurrency(revenue?.projections?.next_year || 0)}
                </p>
                <div className="flex items-center justify-end gap-1 text-xs mt-1">
                  {revenue?.projections?.growth_rate >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+{revenue?.projections?.growth_rate}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">{revenue?.projections?.growth_rate}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Utilization & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Code Utilization</CardTitle>
            <CardDescription>How your codes are being used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Redeemed</span>
                <span className="font-medium">
                  {revenue?.code_utilization?.redeemed_codes || 0} / {revenue?.code_utilization?.total_codes || 0}
                </span>
              </div>
              <Progress 
                value={(revenue?.code_utilization?.redeemed_codes / revenue?.code_utilization?.total_codes) * 100 || 0} 
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">{revenue?.code_utilization?.fully_redeemed || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Fully Used</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">{revenue?.code_utilization?.inactive_codes || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Inactive</p>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <p className="text-2xl font-bold">{revenue?.code_utilization?.remaining_redemptions || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/ltd/codes/generate">
              <Button className="w-full justify-start" variant="outline">
                <Code className="mr-2 h-4 w-4" />
                Generate New Codes
              </Button>
            </Link>
            <Link href="/admin/ltd/campaigns">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Send Email Campaign
              </Button>
            </Link>
            <Link href="/admin/ltd/users">
              <Button className="w-full justify-start" variant="outline">
                <Target className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/ltd/analytics">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Full Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
