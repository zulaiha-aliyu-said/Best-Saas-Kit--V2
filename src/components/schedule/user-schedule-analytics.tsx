'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, Pause, BarChart3, TrendingUp, Activity, Target } from 'lucide-react';

interface ScheduleAnalytics {
  total_schedules: number;
  posted_schedules: number;
  pending_schedules: number;
  failed_schedules: number;
  cancelled_schedules: number;
  recent_schedules: number;
  monthly_schedules: number;
  avg_best_time_score: number;
  platform_breakdown: Record<string, number>;
  status_breakdown: Record<string, number>;
  upcoming_schedules: number;
}

export function UserScheduleAnalytics() {
  const [analytics, setAnalytics] = useState<ScheduleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/schedule/analytics');
        const data = await response.json();
        
        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          setError(data.error || 'Failed to fetch schedule analytics');
        }
      } catch (err) {
        setError('Failed to fetch schedule analytics');
        console.error('Error fetching schedule analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Analytics</CardTitle>
          <CardDescription>Your content scheduling performance</CardDescription>
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
          <CardTitle>Schedule Analytics</CardTitle>
          <CardDescription>Your content scheduling performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.total_schedules === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Analytics</CardTitle>
          <CardDescription>Your content scheduling performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Posts Scheduled Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start scheduling your content to see analytics here.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>• Go to Schedule page to create scheduled posts</p>
              <p>• Use AI-powered optimal timing suggestions</p>
              <p>• Track your scheduling success and patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const successRate = analytics.total_schedules > 0 
    ? ((analytics.posted_schedules / analytics.total_schedules) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_schedules}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.upcoming_schedules} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.posted_schedules} posted successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Posts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pending_schedules}</div>
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
            <div className="text-2xl font-bold">{analytics.avg_best_time_score}</div>
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
              {Object.entries(analytics.platform_breakdown).map(([platform, count]) => {
                const percentage = (count / analytics.total_schedules) * 100;
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
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Schedule status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.status_breakdown).map(([status, count]) => {
                const percentage = (count / analytics.total_schedules) * 100;
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
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'posted' ? 'bg-green-600' :
                            status === 'pending' ? 'bg-yellow-600' :
                            status === 'failed' ? 'bg-red-600' :
                            'bg-gray-600'
                          }`}
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
          <CardDescription>Your scheduling activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{analytics.recent_schedules}</div>
              <div className="text-sm text-muted-foreground">Last 7 days</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{analytics.monthly_schedules}</div>
              <div className="text-sm text-muted-foreground">Last 30 days</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
              <div className="text-sm text-muted-foreground">Success rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



