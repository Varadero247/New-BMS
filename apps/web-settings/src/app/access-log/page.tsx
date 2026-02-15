'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@ims/ui';
import { Activity, Search, Filter, Download, Clock, User, Shield, Globe } from 'lucide-react';
import { api } from '@/lib/api';

interface AuditEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  module: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  details?: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  READ: 'bg-blue-100 text-blue-700',
  UPDATE: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  EXPORT: 'bg-indigo-100 text-indigo-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
};

export default function AccessLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    module: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadEntries();
  }, [page, filters]);

  async function loadEntries() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (filters.search) params.set('search', filters.search);
      if (filters.action) params.set('action', filters.action);
      if (filters.module) params.set('module', filters.module);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const response = await api.get(`/api/access-log?${params}`);
      setEntries(response.data.data?.items || []);
      setTotal(response.data.data?.total || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(ts: string) {
    const d = new Date(ts);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  async function exportCSV() {
    try {
      const params = new URLSearchParams({ limit: '10000' });
      if (filters.action) params.set('action', filters.action);
      if (filters.module) params.set('module', filters.module);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);

      const response = await api.get(`/api/access-log?${params}`);
      const items: AuditEntry[] = response.data.data?.items || [];

      const csv = [
        'Timestamp,User,Action,Module,Resource,Resource ID,IP Address,Details',
        ...items.map(e =>
          `"${e.timestamp}","${e.userEmail}","${e.action}","${e.module}","${e.resource}","${e.resourceId || ''}","${e.ipAddress || ''}","${e.details || ''}"`
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export');
    }
  }

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Access Log</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Full audit trail of system activity</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:bg-gray-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by user, resource..."
                    value={filters.search}
                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All actions</option>
                  {Object.keys(ACTION_COLORS).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Module</label>
                <select
                  value={filters.module}
                  onChange={(e) => setFilters(f => ({ ...f, module: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All modules</option>
                  {['health-safety', 'environment', 'quality', 'finance', 'crm', 'hr', 'payroll',
                    'inventory', 'workflows', 'infosec', 'esg', 'cmms', 'analytics', 'settings'].map(m => (
                    <option key={m} value={m}>{m.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold">{total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold text-green-600">
                {entries.filter(e => e.action === 'CREATE').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Creates (page)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold text-yellow-600">
                {entries.filter(e => e.action === 'UPDATE').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Updates (page)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-xl font-bold text-red-600">
                {entries.filter(e => e.action === 'DELETE').length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Deletes (page)</p>
            </CardContent>
          </Card>
        </div>

        {/* Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No audit entries found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Module</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resource</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            {formatTimestamp(entry.timestamp)}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">{entry.userEmail}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            ACTION_COLORS[entry.action] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                          }`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-600">
                              {entry.module.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {entry.resource}
                          {entry.resourceId && (
                            <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">#{entry.resourceId.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400 text-xs max-w-[200px] truncate">
                          {entry.details || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages} ({total} entries)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
