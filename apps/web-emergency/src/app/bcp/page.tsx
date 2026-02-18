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
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

interface BCP {
  id: string;
  referenceNumber: string;
  title: string;
  scope: string;
  version: string;
  status: string;
  premisesName: string;
  ownerName: string;
  lastTestedDate: string | null;
  nextTestDue: string | null;
  approvedDate: string | null;
  reviewDate: string | null;
  crisisTeamSize: number;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { style: string; label: string }> = {
  DRAFT: { style: 'bg-gray-100 text-gray-600', label: 'Draft' },
  APPROVED: { style: 'bg-green-100 text-green-800', label: 'Approved' },
  ACTIVE: { style: 'bg-blue-100 text-blue-800', label: 'Active' },
  UNDER_REVIEW: { style: 'bg-amber-100 text-amber-800', label: 'Under Review' },
  ARCHIVED: { style: 'bg-gray-100 text-gray-500', label: 'Archived' },
};

function TestStatusBadge({
  lastTested,
  nextDue,
}: {
  lastTested: string | null;
  nextDue: string | null;
}) {
  if (!lastTested) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Never tested
      </span>
    );
  }
  const isDue = nextDue && new Date(nextDue) < new Date();
  if (isDue) {
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Test overdue
      </span>
    );
  }
  return (
    <div>
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Tested
      </span>
      <p className="text-xs text-gray-400 mt-0.5">{new Date(lastTested).toLocaleDateString()}</p>
    </div>
  );
}

export default function BCPPage() {
  const [bcps, setBcps] = useState<BCP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadBCPs = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const r = await api.get('/bcp', { params });
      setBcps(r.data.data || []);
    } catch {
      setError('Failed to load business continuity plans.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadBCPs();
  }, [loadBCPs]);

  const neverTested = bcps.filter((b) => !b.lastTestedDate).length;
  const testOverdue = bcps.filter(
    (b) => b.nextTestDue && new Date(b.nextTestDue) < new Date()
  ).length;
  const approved = bcps.filter((b) => b.status === 'APPROVED' || b.status === 'ACTIVE').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Business Continuity Plans
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                BCP library — ISO 22301 aligned
              </p>
            </div>
            <Link href="/bcp/new">
              <Button
                className="flex items-center gap-2 text-white"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <Plus className="h-4 w-4" />
                Create BCP
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{bcps.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total BCPs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{approved}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved / Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">{testOverdue}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Test Overdue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#F04B5A' }}>
                  {neverTested}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Never Tested</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search BCPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'DRAFT', 'APPROVED', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === f
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  style={statusFilter === f ? { backgroundColor: '#F04B5A' } : undefined}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* BCP Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : bcps.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Tested</TableHead>
                        <TableHead>Review Due</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bcps.map((bcp) => {
                        const statusInfo = STATUS_STYLES[bcp.status] || STATUS_STYLES.DRAFT;
                        return (
                          <TableRow key={bcp.id}>
                            <TableCell className="font-mono text-xs">
                              {bcp.referenceNumber}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{bcp.title}</p>
                              {bcp.scope && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {bcp.scope}
                                </p>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{bcp.premisesName || 'All'}</TableCell>
                            <TableCell className="text-sm">{bcp.ownerName}</TableCell>
                            <TableCell className="text-sm">v{bcp.version}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.style}`}
                              >
                                {statusInfo.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <TestStatusBadge
                                lastTested={bcp.lastTestedDate}
                                nextDue={bcp.nextTestDue}
                              />
                            </TableCell>
                            <TableCell className="text-sm">
                              {bcp.reviewDate ? (
                                <span
                                  className={
                                    new Date(bcp.reviewDate) < new Date()
                                      ? 'text-red-600 font-medium'
                                      : ''
                                  }
                                >
                                  {new Date(bcp.reviewDate).toLocaleDateString()}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" className="gap-1">
                                View <ChevronRight className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No business continuity plans found
                  </p>
                  <Link href="/bcp/new">
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First BCP
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
