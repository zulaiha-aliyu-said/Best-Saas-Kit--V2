'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface LTDCode {
  id: number;
  code: string;
  tier: number;
  max_redemptions: number;
  current_redemptions: number;
  expires_at: string | null;
  is_active: boolean;
  batch_id: string | null;
  notes: string | null;
  created_at: string;
}

export default function CodesManagementPage() {
  const [codes, setCodes] = useState<LTDCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCodes();
  }, [page, tierFilter, statusFilter, search]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (tierFilter) params.append('tier', tierFilter.toString());
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/admin/ltd/codes?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCodes(data.codes);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (code: LTDCode) => {
    // Fully redeemed
    if (code.current_redemptions >= code.max_redemptions) {
      return <Badge variant="secondary">Redeemed</Badge>;
    }
    
    // Expired
    if (code.expires_at && new Date(code.expires_at) <= new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    // Disabled
    if (!code.is_active) {
      return <Badge variant="outline">Disabled</Badge>;
    }
    
    // Partially redeemed
    if (code.current_redemptions > 0) {
      return <Badge className="bg-blue-500">Partial</Badge>;
    }
    
    // Active
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const handleDelete = async (codeId: number) => {
    if (!confirm('Are you sure you want to delete this code?')) return;

    try {
      const response = await fetch(`/api/admin/ltd/codes/${codeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCodes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete code');
      }
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Failed to delete code');
    }
  };

  const handleToggleActive = async (code: LTDCode) => {
    try {
      const response = await fetch(`/api/admin/ltd/codes/${code.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !code.is_active }),
      });

      if (response.ok) {
        fetchCodes();
      }
    } catch (error) {
      console.error('Error toggling code status:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Code Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all LTD redemption codes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {codes.filter(c => c.is_active && c.current_redemptions < c.max_redemptions).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Redeemed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {codes.filter(c => c.current_redemptions > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {codes.filter(c => c.expires_at && new Date(c.expires_at) <= new Date()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search codes or notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tier Filter */}
            <div>
              <select
                value={tierFilter || ''}
                onChange={(e) => setTierFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Tiers</option>
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
                <option value="4">Tier 4</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Codes</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No codes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Tier</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Uses</th>
                    <th className="pb-3 font-medium">Expires</th>
                    <th className="pb-3 font-medium">Batch ID</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.id} className="border-b last:border-0">
                      <td className="py-4">
                        <code className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">Tier {code.tier}</Badge>
                      </td>
                      <td className="py-4">{getStatusBadge(code)}</td>
                      <td className="py-4">
                        <span className="text-sm">
                          {code.current_redemptions} / {code.max_redemptions}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">
                          {code.expires_at
                            ? new Date(code.expires_at).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground font-mono">
                          {code.batch_id ? code.batch_id.slice(-8) : '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(code)}
                            title={code.is_active ? 'Disable' : 'Enable'}
                          >
                            {code.is_active ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(code.id)}
                            disabled={code.current_redemptions > 0}
                            title={code.current_redemptions > 0 ? 'Cannot delete redeemed codes' : 'Delete'}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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





