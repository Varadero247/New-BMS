'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { ShieldCheck, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  referenceNumber: string;
  name: string;
  tradingName: string;
  status: string;
  tier: string;
  category: string;
  primaryContact: string;
  email: string;
  approvedDate: string;
  createdAt: string;
}

export default function ApprovalClient() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/suppliers', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function handleApprove(id: string) {
    if (!confirm('Approve this supplier?')) return;
    setActionLoading(id);
    try {
      await api.post(`/approval/${id}/approve`);
      loadItems();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm('Suspend this supplier?')) return;
    setActionLoading(id);
    try {
      await api.post(`/approval/${id}/suspend`);
      loadItems();
    } catch (err) {
      console.error('Failed to suspend:', err);
    } finally {
      setActionLoading(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'CONDITIONAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'BLACKLISTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  }

  const pendingCount = items.filter(
    (i) => i.status === 'PROSPECTIVE' || i.status === 'CONDITIONAL'
  ).length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED').length;
  const suspendedCount = items.filter(
    (i) => i.status === 'SUSPENDED' || i.status === 'BLACKLISTED'
  ).length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Approval
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Approve, suspend, or manage supplier status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Suppliers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{pendingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{suspendedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suspended / Blocked</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search suppliers"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.primaryContact || item.email || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.approvedDate
                            ? new Date(item.approvedDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.status !== 'APPROVED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(item.id)}
                                disabled={actionLoading === item.id}
                                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            )}
                            {item.status !== 'SUSPENDED' && item.status !== 'BLACKLISTED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspend(item.id)}
                                disabled={actionLoading === item.id}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                {actionLoading === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Suspend
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShieldCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No suppliers to review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
