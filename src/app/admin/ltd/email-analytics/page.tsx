'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Users,
  Loader2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface EmailAnalytics {
  overview: {
    total_sent: string;
    total_opened: string;
    total_clicked: string;
    total_delivered: string;
    total_bounced: string;
    total_failed: string;
    unique_recipients: string;
    open_rate: string;
    click_rate: string;
    delivery_rate: string;
    bounce_rate: string;
  };
  byType: Array<{
    email_type: string;
    sent: string;
    opened: string;
    clicked: string;
    open_rate: string;
  }>;
  campaigns: Array<any>;
  volumeOverTime: Array<{
    date: string;
    sent: string;
    opened: string;
    clicked: string;
  }>;
  topCampaigns: Array<{
    id: number;
    name: string;
    subject: string;
    targeted_count: number;
    sent_count: number;
    opened_count: number;
    clicked_count: number;
    open_rate: string;
    click_rate: string;
    created_at: string;
  }>;
}

export default function EmailAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ltd/email-analytics');
      const result = await response.json();

      if (response.ok) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview, byType, campaigns, volumeOverTime, topCampaigns } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Email Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track email delivery, opens, clicks, and campaign performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseInt(overview.total_sent).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              To {parseInt(overview.unique_recipients).toLocaleString()} unique recipients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.open_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {parseInt(overview.total_opened).toLocaleString()} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.click_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {parseInt(overview.total_clicked).toLocaleString()} clicked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.delivery_rate}%</div>
            <p className="text-xs text-muted-foreground">
              {parseInt(overview.total_bounced).toLocaleString()} bounced
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Email Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance by Email Type
          </CardTitle>
          <CardDescription>
            Open and click rates for different email types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {byType.map((type) => (
              <div key={type.email_type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type.email_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {parseInt(type.sent).toLocaleString()} sent
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {parseInt(type.opened).toLocaleString()} opened · {parseInt(type.clicked).toLocaleString()} clicked
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{type.open_rate}%</div>
                  <div className="text-xs text-muted-foreground">Open rate</div>
                </div>
              </div>
            ))}
            {byType.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No email data yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Performing Campaigns
          </CardTitle>
          <CardDescription>
            Campaigns with the highest engagement rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{campaign.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    Sent {new Date(campaign.created_at).toLocaleDateString()} · 
                    {campaign.sent_count} recipients
                  </div>
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-sm font-bold text-green-600">{campaign.open_rate}%</div>
                    <div className="text-xs text-muted-foreground">Opens</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">{campaign.click_rate}%</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                </div>
              </div>
            ))}
            {topCampaigns.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No campaigns sent yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>
            All campaigns sent in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campaigns.slice(0, 10).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="flex-1">
                  <div className="font-medium">{campaign.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(campaign.created_at).toLocaleString()} · By {campaign.admin_name || campaign.admin_email}
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground">
                    {campaign.sent_count}/{campaign.targeted_count} sent
                  </span>
                  <span className="text-green-600">
                    {campaign.opened_count} opened
                  </span>
                  <span className="text-blue-600">
                    {campaign.clicked_count} clicked
                  </span>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No campaigns yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Volume Over Time */}
      {volumeOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Volume (Last 30 Days)</CardTitle>
            <CardDescription>
              Daily email send and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {volumeOverTime.map((day) => {
                const sent = parseInt(day.sent);
                const opened = parseInt(day.opened);
                const clicked = parseInt(day.clicked);
                const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0';
                
                return (
                  <div key={day.date} className="flex items-center gap-4 p-2 border rounded text-sm">
                    <div className="w-24 text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{sent}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Eye className="w-3 h-3" />
                        <span>{opened}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <MousePointer className="w-3 h-3" />
                        <span>{clicked}</span>
                      </div>
                    </div>
                    <div className="text-right w-16">
                      <div className="font-medium">{openRate}%</div>
                      <div className="text-xs text-muted-foreground">open</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

