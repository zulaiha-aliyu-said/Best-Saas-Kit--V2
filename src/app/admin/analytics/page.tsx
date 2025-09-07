import { requireAdminAccess } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData, getGrowthMetrics } from "@/lib/database";
import { AnalyticsClient } from "@/components/admin/analytics-client";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Crown,
  Zap,
  Target,
  Repeat
} from "lucide-react";

export const runtime = 'nodejs';

export default async function AnalyticsPage() {
  // This will redirect non-admin users
  await requireAdminAccess();

  // Get analytics data
  let analyticsData;
  let growthMetrics;
  
  try {
    [analyticsData, growthMetrics] = await Promise.all([
      getAnalyticsData(),
      getGrowthMetrics()
    ]);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return <div>Error loading analytics data.</div>;
  }

  // Calculate key metrics
  const totalRevenue = analyticsData.revenue.total;
  const totalUsers = analyticsData.users.total;
  const proUsers = analyticsData.revenue.proUsers;
  const freeUsers = totalUsers - proUsers;
  const conversionRate = growthMetrics.conversionRate;
  const growthRate = growthMetrics.growthRate;

  const keyMetrics = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: `${analyticsData.revenue.monthlyRevenue.length > 1 ? 
        ((analyticsData.revenue.monthlyRevenue[0]?.revenue || 0) - 
         (analyticsData.revenue.monthlyRevenue[1]?.revenue || 0)) : 0} this month`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: `+${growthMetrics.currentMonth} this month`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Pro Users",
      value: proUsers.toLocaleString(),
      change: `${conversionRate.toFixed(1)}% conversion rate`,
      icon: Crown,
      color: "text-yellow-600"
    },
    {
      title: "Growth Rate",
      value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
      change: "Month over month",
      icon: TrendingUp,
      color: growthRate > 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your application's performance and growth.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.credits.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {analyticsData.credits.average.toFixed(0)} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Repeat className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthMetrics.retentionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly retention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <AnalyticsClient 
        analyticsData={analyticsData}
        growthMetrics={growthMetrics}
      />
    </div>
  );
}
