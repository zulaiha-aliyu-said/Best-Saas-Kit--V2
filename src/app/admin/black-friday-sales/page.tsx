'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  RefreshCw,
  Calendar,
  Clock,
  Award,
  BarChart3
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SalesData {
  totalStats: {
    totalSales: number;
    totalRevenue: number;
    uniqueCustomers: number;
    averageOrderValue: number;
  };
  planTypeStats: Array<{
    planType: string;
    salesCount: number;
    revenue: number;
  }>;
  tierStats: Array<{
    tier: number;
    salesCount: number;
    revenue: number;
    avgAmount: number;
  }>;
  salesOverTime: Array<{
    date: string;
    salesCount: number;
    revenue: number;
  }>;
  recentSales: Array<{
    id: number;
    transactionId: string;
    txRef: string;
    amount: number;
    currency: string;
    userId: string;
    userEmail: string;
    userName: string | null;
    planType: string;
    tier: number | null;
    monthlyCredits: number | null;
    createdAt: string;
  }>;
  hourlySales: Array<{
    hour: string;
    salesCount: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    userId: string;
    userEmail: string;
    userName: string | null;
    purchaseCount: number;
    totalSpent: number;
  }>;
}

export default function BlackFridaySalesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<SalesData | null>(null);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/black-friday-sales');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
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

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load Black Friday sales data
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatNumber = (num: number) => num.toLocaleString();

  // Calculate max revenue for progress bars
  const maxTierRevenue = Math.max(...data.tierStats.map(t => t.revenue), 1);
  const maxPlanTypeRevenue = Math.max(...data.planTypeStats.map(p => p.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Black Friday Sales Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track all Black Friday sales and revenue in real-time
          </p>
        </div>
        <Button onClick={fetchData} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {formatNumber(data.totalStats.totalSales)} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalStats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(data.totalStats.uniqueCustomers)} unique customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalStats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalStats.uniqueCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              Total purchasers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Plan Type */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Plan Type</CardTitle>
          <CardDescription>Revenue breakdown by plan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.planTypeStats.map((plan) => (
              <div key={plan.planType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {plan.planType === 'ltd' ? 'LTD' : 'Pro Trial'}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatNumber(plan.salesCount)} sales
                    </span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrency(plan.revenue)}
                  </span>
                </div>
                <Progress 
                  value={(plan.revenue / maxPlanTypeRevenue) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales by Tier */}
      {data.tierStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>LTD Sales by Tier</CardTitle>
            <CardDescription>Revenue breakdown by LTD tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.tierStats.map((tier) => (
                <div key={tier.tier} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Tier {tier.tier}</Badge>
                      <span className="text-sm font-medium">
                        {formatNumber(tier.salesCount)} sales
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (Avg: {formatCurrency(tier.avgAmount)})
                      </span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(tier.revenue)}
                    </span>
                  </div>
                  <Progress 
                    value={(tier.revenue / maxTierRevenue) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Last 20 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.userName || sale.userEmail}</div>
                      <div className="text-xs text-muted-foreground">{sale.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {sale.planType === 'ltd' 
                        ? `LTD Tier ${sale.tier}` 
                        : 'Pro Trial'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(sale.amount)}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {sale.transactionId.substring(0, 12)}...
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Customers */}
      {data.topCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((customer, index) => (
                  <TableRow key={customer.userId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className={`h-4 w-4 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 
                          index === 2 ? 'text-orange-600' : 
                          'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium">{customer.userName || customer.userEmail}</div>
                          <div className="text-xs text-muted-foreground">{customer.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(customer.purchaseCount)}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sales Over Time */}
      {data.salesOverTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time (Last 30 Days)</CardTitle>
            <CardDescription>Daily sales and revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.salesOverTime.slice(0, 10).map((day) => (
                <div key={day.date} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Badge variant="outline">
                      {formatNumber(day.salesCount)} sales
                    </Badge>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrency(day.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}






