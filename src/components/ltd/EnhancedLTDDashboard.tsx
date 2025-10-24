'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  BarChart3,
  Loader2,
  AlertCircle,
  Sparkles,
  CalendarDays
} from 'lucide-react';

interface LTDStats {
  user: {
    ltd_tier: number;
    credits: number;
    monthly_credit_limit: number;
    stacked_codes: number;
    credit_reset_date: string;
  };
  creditHistory: Array<{
    date: string;
    credits_used: string;
    operations: string;
  }>;
  actionBreakdown: Array<{
    action_type: string;
    count: string;
    total_credits: string;
  }>;
  recentActivity: Array<{
    action_type: string;
    credits_used: number;
    created_at: string;
    metadata?: any;
  }>;
  stats: {
    total_operations: string;
    total_credits_used: string;
    active_days: string;
    operations_this_month: string;
    credits_this_month: string;
    total_emails: string;
    emails_opened: string;
    credits_remaining: number;
    credit_percentage: string;
  };
}

interface Props {
  initialTier: number;
  initialCredits: number;
  initialLimit: number;
}

export default function EnhancedLTDDashboard({ initialTier, initialCredits, initialLimit }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LTDStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ltd/my-stats');
      const result = await response.json();

      if (response.ok) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to load stats');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Failed to load stats'}</AlertDescription>
      </Alert>
    );
  }

  const creditPercentage = parseFloat(stats.stats.credit_percentage);
  const isLowCredits = creditPercentage < 20;
  const resetDate = new Date(stats.user.credit_reset_date);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Get action names
  const actionNames: Record<string, string> = {
    'content_repurposing': '📝 Content Repurposing',
    'viral_hook': '🔥 Viral Hook',
    'trend_generation': '📈 Trend Content',
    'ai_chat': '💬 AI Chat',
    'performance_prediction': '🎯 Performance Prediction',
  };

  return (
    <div className="space-y-6">
      {/* Low Credits Warning */}
      {isLowCredits && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Low credits!</strong> You have {creditPercentage.toFixed(0)}% remaining. 
            Your credits will refresh in {daysUntilReset} days.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseInt(stats.stats.total_operations).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {parseInt(stats.stats.operations_this_month).toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseInt(stats.stats.total_credits_used || '0').toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {parseInt(stats.stats.credits_this_month || '0').toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseInt(stats.stats.active_days || '0')}</div>
            <p className="text-xs text-muted-foreground">
              Days you&apos;ve used the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseInt(stats.stats.total_emails || '0')}</div>
            <p className="text-xs text-muted-foreground">
              {parseInt(stats.stats.emails_opened || '0')} opened
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Usage Over Time */}
      {stats.creditHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Credit Usage (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily credit consumption and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.creditHistory.slice(0, 7).map((day) => {
                const date = new Date(day.date);
                const maxCredits = Math.max(...stats.creditHistory.map(d => parseInt(d.credits_used)));
                const percentage = (parseInt(day.credits_used) / maxCredits) * 100;
                
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="font-medium">{parseInt(day.credits_used)} credits</div>
                      <div className="text-xs text-muted-foreground">{parseInt(day.operations)} ops</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Action Breakdown */}
        {stats.actionBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usage Breakdown</CardTitle>
              <CardDescription>
                How you&apos;re using your credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.actionBreakdown.map((action) => {
                  const total = stats.actionBreakdown.reduce((sum, a) => sum + parseInt(a.total_credits), 0);
                  const percentage = total > 0 ? (parseInt(action.total_credits) / total) * 100 : 0;
                  
                  return (
                    <div key={action.action_type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {actionNames[action.action_type] || action.action_type}
                        </span>
                        <span className="text-muted-foreground">
                          {parseInt(action.count)} uses · {parseInt(action.total_credits)} credits
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No activity yet. Start creating content!
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {actionNames[activity.action_type] || activity.action_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <Badge variant="outline">
                      -{activity.credits_used} credits
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Insights & Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {creditPercentage < 20 && (
            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                You&apos;re running low on credits. Consider stacking another code or wait for your monthly refresh.
              </AlertDescription>
            </Alert>
          )}
          
          {creditPercentage > 80 && parseInt(stats.stats.operations_this_month) < 5 && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                You have plenty of credits! Why not try the viral hook generator or AI chat features?
              </AlertDescription>
            </Alert>
          )}

          {parseInt(stats.stats.active_days) >= 7 && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                🎉 You&apos;ve been active for {parseInt(stats.stats.active_days)} days! Keep up the great work!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

