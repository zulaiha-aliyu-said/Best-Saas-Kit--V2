import { requireAdminAccess } from "@/lib/admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsData, getGrowthMetrics, getPredictionAccuracyStats, getAdminPredictionAnalytics, getAdminRepurposedContentAnalytics, getAdminScheduleAnalytics } from "@/lib/database";
import { getSimpleAnalytics, getSimpleGrowthMetrics } from "@/lib/simple-analytics";
import { AdminOptimizationAnalytics } from "@/components/platform/admin-optimization-analytics";

import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Crown,
  Zap,
  Target,
  Repeat,
  BarChart3,
  Brain,
  Star,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause
} from "lucide-react";

export const runtime = 'edge';

export default async function AnalyticsPage() {
  // This will redirect non-admin users
  await requireAdminAccess();

  // Get analytics data
  let analyticsData;
  let growthMetrics;
  let predictionAnalytics;
  let accuracyStats;
  let repurposedContentAnalytics;
  let scheduleAnalytics;

  try {
    console.log("Starting analytics data fetch...");
    // Use simple analytics first to avoid SQL errors
    analyticsData = await getSimpleAnalytics();
    console.log("Simple analytics data fetched successfully");

    growthMetrics = await getSimpleGrowthMetrics();
    console.log("Simple growth metrics fetched successfully");

    // Get prediction analytics
    predictionAnalytics = await getAdminPredictionAnalytics();
    console.log("Prediction analytics fetched successfully");

    accuracyStats = await getPredictionAccuracyStats();
    console.log("Accuracy stats fetched successfully");

    // Get repurposed content analytics
    repurposedContentAnalytics = await getAdminRepurposedContentAnalytics();
    console.log("Repurposed content analytics fetched successfully");

    // Get schedule analytics
    scheduleAnalytics = await getAdminScheduleAnalytics();
    console.log("Schedule analytics fetched successfully");
  } catch (error) {
    console.error("Error fetching analytics:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading analytics data</h3>
          <p className="text-red-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <p className="text-red-600 text-xs mt-2">
            Check the server logs for more details.
          </p>
        </div>
      </div>
    );
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
      change: `${proUsers} Pro users × $99`,
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
          Comprehensive insights into your application's performance and growth (Real-time data).
        </p>
        {/* Debug info to verify real data */}
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleString()} | Total Users: {totalUsers} | Pro Users: {proUsers} | Revenue: ${totalRevenue} | Data Source: Live PostgreSQL Database
        </div>
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

      {/* User Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.users.byStatus.map((status: any) => {
                const percentage = (parseInt(status.count) / totalUsers) * 100;
                return (
                  <div key={status.subscription_status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {status.subscription_status === 'pro' ? 'Pro' : 'Free'}: {status.count} users
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credits Overview</CardTitle>
            <CardDescription>Credit statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Credits</span>
                <span className="text-lg font-bold">{analyticsData.credits.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average per User</span>
                <span className="text-lg font-bold">{analyticsData.credits.average.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-lg font-bold">{analyticsData.users.activeUsers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Prediction Analytics</h2>
          <p className="text-muted-foreground">
            Performance prediction feature usage and accuracy metrics
          </p>
        </div>

        {/* Prediction Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictionAnalytics?.total_predictions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {predictionAnalytics?.unique_users || 0} unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictionAnalytics?.average_score || 0}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100 points
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{predictionAnalytics?.recent_predictions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accuracyStats?.average_accuracy_rating || 0}</div>
              <p className="text-xs text-muted-foreground">
                {accuracyStats?.predictions_with_feedback || 0} with feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform and Model Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage</CardTitle>
              <CardDescription>Predictions by social media platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionAnalytics?.platform_breakdown && Object.entries(predictionAnalytics.platform_breakdown).map(([platform, count]: [string, any]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} predictions
                    </span>
                  </div>
                ))}
                {(!predictionAnalytics?.platform_breakdown || Object.keys(predictionAnalytics.platform_breakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground">No prediction data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Model usage and accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accuracyStats?.model_performance && Object.entries(accuracyStats.model_performance).map(([model, data]: [string, any]) => (
                  <div key={model} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">{model}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{data.count} predictions</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: {data.avg_score} score
                      </div>
                    </div>
                  </div>
                ))}
                {(!accuracyStats?.model_performance || Object.keys(accuracyStats.model_performance).length === 0) && (
                  <p className="text-sm text-muted-foreground">No model data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repurposed Content Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repurposed Content Analytics</h2>
          <p className="text-muted-foreground">
            Content repurposing feature usage and performance metrics
          </p>
        </div>

        {/* Repurposed Content Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repurposedContentAnalytics?.total_generations || 0}</div>
              <p className="text-xs text-muted-foreground">
                {repurposedContentAnalytics?.unique_users || 0} unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Created</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repurposedContentAnalytics?.total_posts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {repurposedContentAnalytics?.published_posts || 0} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repurposedContentAnalytics?.recent_generations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(repurposedContentAnalytics?.total_tokens_used || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {repurposedContentAnalytics?.avg_tokens_per_generation || 0} per generation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform and Tone Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage</CardTitle>
              <CardDescription>Content repurposing by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repurposedContentAnalytics?.platform_breakdown && Object.entries(repurposedContentAnalytics.platform_breakdown).map(([platform, count]: [string, any]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} generations
                    </span>
                  </div>
                ))}
                {(!repurposedContentAnalytics?.platform_breakdown || Object.keys(repurposedContentAnalytics.platform_breakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground">No platform data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tone Usage</CardTitle>
              <CardDescription>Content tone preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repurposedContentAnalytics?.tone_breakdown && Object.entries(repurposedContentAnalytics.tone_breakdown).map(([tone, count]: [string, any]) => (
                  <div key={tone} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{tone}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} generations
                    </span>
                  </div>
                ))}
                {(!repurposedContentAnalytics?.tone_breakdown || Object.keys(repurposedContentAnalytics.tone_breakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground">No tone data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedule Analytics</h2>
          <p className="text-muted-foreground">
            Content scheduling feature usage and performance metrics
          </p>
        </div>

        {/* Schedule Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduleAnalytics?.total_schedules || 0}</div>
              <p className="text-xs text-muted-foreground">
                {scheduleAnalytics?.unique_users || 0} unique users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scheduleAnalytics?.total_schedules > 0 
                  ? ((scheduleAnalytics.posted_schedules / scheduleAnalytics.total_schedules) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {scheduleAnalytics?.posted_schedules || 0} posted successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Posts</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduleAnalytics?.pending_schedules || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting scheduled time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Time Score</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduleAnalytics?.avg_best_time_score || 0}</div>
              <p className="text-xs text-muted-foreground">
                Average optimal timing score
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Platform and Status Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage</CardTitle>
              <CardDescription>Scheduled posts by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleAnalytics?.platform_breakdown && Object.entries(scheduleAnalytics.platform_breakdown).map(([platform, count]: [string, any]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">{platform}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} scheduled posts
                    </span>
                  </div>
                ))}
                {(!scheduleAnalytics?.platform_breakdown || Object.keys(scheduleAnalytics.platform_breakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground">No platform data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>Schedule status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleAnalytics?.status_breakdown && Object.entries(scheduleAnalytics.status_breakdown).map(([status, count]: [string, any]) => {
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case 'posted': return <CheckCircle className="h-4 w-4 text-green-600" />;
                      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
                      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
                      case 'cancelled': return <Pause className="h-4 w-4 text-gray-600" />;
                      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
                    }
                  };
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium capitalize">{status}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} posts
                      </span>
                    </div>
                  );
                })}
                {(!scheduleAnalytics?.status_breakdown || Object.keys(scheduleAnalytics.status_breakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground">No status data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Optimization Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Platform Optimization Analytics</h2>
          <p className="text-muted-foreground">
            Platform-specific content optimization feature usage and metrics
          </p>
        </div>
        <AdminOptimizationAnalytics />
      </div>
    </div>
  );
}
