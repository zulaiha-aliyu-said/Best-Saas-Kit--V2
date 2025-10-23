'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  Calendar,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface LTDUser {
  id: string;
  email: string;
  name: string | null;
  ltd_tier: number;
  credits: number;
  monthly_credit_limit: number;
  rollover_credits: number;
  stacked_codes: number;
  created_at: string;
  last_login: string;
  subscription_status: string;
  total_redemptions: number;
  last_redeemed_at: string | null;
}

interface CreditUsageLog {
  id: number;
  action_type: string;
  credits_used: number;
  credits_remaining: number;
  action_details: any;
  created_at: string;
}

interface Redemption {
  id: number;
  code: string;
  tier: number;
  redeemed_at: string;
}

interface AdminAction {
  id: number;
  action_type: string;
  admin_email: string;
  details: any;
  created_at: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<LTDUser | null>(null);
  const [creditUsage, setCreditUsage] = useState<CreditUsageLog[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit form state
  const [editTier, setEditTier] = useState(0);
  const [editCredits, setEditCredits] = useState(0);
  const [editLimit, setEditLimit] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserHistory();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/ltd/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEditTier(data.user.ltd_tier);
        setEditCredits(data.user.credits);
        setEditLimit(data.user.monthly_credit_limit);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async () => {
    try {
      const response = await fetch(`/api/admin/ltd/users/${userId}/history`);
      const data = await response.json();

      if (data.success) {
        setCreditUsage(data.creditUsage);
        setRedemptions(data.redemptions);
        setAdminActions(data.adminActions);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`/api/admin/ltd/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ltd_tier: editTier,
          credits: editCredits,
          monthly_credit_limit: editLimit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setUser(data.user);
        fetchUserHistory(); // Refresh to see admin action log
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: 'Failed to update user' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatActionType = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/ltd/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.name || 'Unnamed User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge className={
          user.ltd_tier === 4 ? 'bg-orange-500' :
          user.ltd_tier === 3 ? 'bg-pink-500' :
          user.ltd_tier === 2 ? 'bg-purple-500' : 'bg-blue-500'
        }>
          Tier {user.ltd_tier}
        </Badge>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit Plan</TabsTrigger>
          <TabsTrigger value="usage">Credit Usage</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Current Credits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{user.credits}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  of {user.monthly_credit_limit} monthly
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${(user.credits / user.monthly_credit_limit) * 100}%` }}
                  ></div>
                </div>
                {user.rollover_credits > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{user.rollover_credits} rollover credits
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Account Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.total_redemptions} codes redeemed</span>
                  </div>
                  {user.stacked_codes > 1 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.stacked_codes} stacked codes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium">{formatDate(user.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p className="text-sm font-medium">{formatDate(user.last_login)}</p>
                  </div>
                  {user.last_redeemed_at && (
                    <div>
                      <p className="text-xs text-muted-foreground">Last Redemption</p>
                      <p className="text-sm font-medium">{formatDate(user.last_redeemed_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit User Plan</CardTitle>
              <CardDescription>
                Update the user's LTD tier and credit allocation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">LTD Tier</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value={1}>Tier 1 - $59 (100 credits/month)</option>
                  <option value={2}>Tier 2 - $139 (300 credits/month)</option>
                  <option value={3}>Tier 3 - $249 (750 credits/month)</option>
                  <option value={4}>Tier 4 - $449 (2000 credits/month)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Credits</label>
                <Input
                  type="number"
                  value={editCredits}
                  onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the user's current credit balance
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Credit Limit</label>
                <Input
                  type="number"
                  value={editLimit}
                  onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Credits that refresh each month
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditTier(user.ltd_tier);
                    setEditCredits(user.credits);
                    setEditLimit(user.monthly_credit_limit);
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage History</CardTitle>
              <CardDescription>Recent credit consumption activity</CardDescription>
            </CardHeader>
            <CardContent>
              {creditUsage.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No usage history</p>
              ) : (
                <div className="space-y-3">
                  {creditUsage.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{formatActionType(log.action_type)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">-{log.credits_used} credits</p>
                        <p className="text-xs text-muted-foreground">{log.credits_remaining} remaining</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redemptions Tab */}
        <TabsContent value="redemptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Redemptions</CardTitle>
              <CardDescription>History of redeemed LTD codes</CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No redemptions yet</p>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((redemption) => (
                    <div key={redemption.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <code className="font-mono text-sm font-bold">{redemption.code}</code>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(redemption.redeemed_at)}
                        </p>
                      </div>
                      <Badge>Tier {redemption.tier}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Logs</CardTitle>
              <CardDescription>Actions performed by administrators</CardDescription>
            </CardHeader>
            <CardContent>
              {adminActions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No admin actions</p>
              ) : (
                <div className="space-y-3">
                  {adminActions.map((action) => (
                    <div key={action.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{formatActionType(action.action_type)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(action.created_at)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        By: {action.admin_email}
                      </p>
                      {action.details && (
                        <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(action.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

