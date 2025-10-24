'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  Calendar, 
  CreditCard,
  Loader2,
  Users as UsersIcon,
  TrendingUp,
  Download
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

export default function LTDUsersPage() {
  const [users, setUsers] = useState<LTDUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/admin/ltd/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: number) => {
    const colors = {
      1: 'bg-blue-500',
      2: 'bg-purple-500',
      3: 'bg-pink-500',
      4: 'bg-orange-500',
    };
    return <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-500'}>Tier {tier}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateCreditUsage = (credits: number, limit: number) => {
    const percentage = ((credits / limit) * 100).toFixed(0);
    return { percentage, remaining: credits, total: limit };
  };

  const handleExport = async () => {
    window.location.href = '/api/admin/ltd/users/export';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">LTD Users</h1>
          <p className="text-muted-foreground mt-2">
            Manage lifetime deal users and their plans
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total LTD Users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active This Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => {
                const lastLogin = new Date(u.last_login);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return lastLogin > monthAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {users.reduce((sum, u) => sum + u.total_redemptions, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search Users</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/api/admin/ltd/users/export', '_blank')}
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No LTD users found
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const creditUsage = calculateCreditUsage(user.credits, user.monthly_credit_limit);
                
                return (
                  <Card key={user.id} className="border-l-4" style={{
                    borderLeftColor: user.ltd_tier === 4 ? '#f97316' : 
                                    user.ltd_tier === 3 ? '#ec4899' :
                                    user.ltd_tier === 2 ? '#a855f7' : '#3b82f6'
                  }}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* User Info */}
                        <div className="md:col-span-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold truncate">{user.name || 'No Name'}</p>
                                {getTierBadge(user.ltd_tier)}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <p className="truncate">{user.email}</p>
                              </div>
                              {user.stacked_codes > 1 && (
                                <Badge variant="outline" className="mt-2">
                                  {user.stacked_codes} Stacked Codes
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Credits */}
                        <div className="md:col-span-3">
                          <p className="text-xs text-muted-foreground mb-2">Credits</p>
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">{user.credits}</span>
                              <span className="text-sm text-muted-foreground">/ {user.monthly_credit_limit}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500"
                                style={{ width: `${creditUsage.percentage}%` }}
                              ></div>
                            </div>
                            {user.rollover_credits > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{user.rollover_credits} rollover
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="md:col-span-3">
                          <p className="text-xs text-muted-foreground mb-2">Activity</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span>{user.total_redemptions} redemptions</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Joined {formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span>Last login: {formatDate(user.last_login)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-2 flex items-center justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/ltd/users/${user.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

