'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AuditEntry {
  id: string;
  systemId: string | null;
  action: string;
  description: string;
  inputSummary: string | null;
  outputSummary: string | null;
  userId: string;
  userName: string | null;
  ipAddress: string | null;
  riskScore: number | null;
  createdAt: string;
}

interface Stats {
  totalEntries: number;
  byAction: Record<string, number>;
  recent: Array<{ id: string; action: string; description: string; userName: string | null; createdAt: string }>;
}

const ACTIONS = ['DECISION', 'OVERRIDE', 'REVIEW', 'APPROVAL', 'REJECTION', 'ESCALATION', 'CONFIG_CHANGE'] as const;

const actionColors: Record<string, string> = {
  DECISION: 'bg-blue-100 text-blue-700',
  OVERRIDE: 'bg-red-100 text-red-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  APPROVAL: 'bg-green-100 text-green-700',
  REJECTION: 'bg-red-100 text-red-700',
  ESCALATION: 'bg-yellow-100 text-yellow-700',
  CONFIG_CHANGE: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '50' };
      if (filterAction) params.action = filterAction;
      if (search) params.search = search;
      const res = await api.get('/audit-log', { params });
      setEntries(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch { /* empty */ }
    setLoading(false);
  }, [page, filterAction, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/audit-log/stats');
      setStats(res.data.data);
    } catch { /* empty */ }
  }, []);

  useEffect(() => { fetchEntries(); fetchStats(); }, [fetchEntries, fetchStats]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Audit Log</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO 42001:2023 — Transparent record of all AI decisions and actions</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalEntries}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Entries</div>
          </div>
          {Object.entries(stats.byAction).slice(0, 3).map(([action, count]) => (
            <div key={action} className="bg-white dark:bg-gray-900 rounded-lg border p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{action.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            placeholder="Search audit log..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select
          value={filterAction}
          onChange={e => { setFilterAction(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Log table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Timestamp</th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Action</th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">No audit log entries found</td></tr>
              ) : entries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:bg-gray-800">
                  <td className="p-3 text-gray-500 dark:text-gray-400 text-xs font-mono whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionColors[entry.action] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                      {entry.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 max-w-md truncate">{entry.description}</td>
                  <td className="p-3 text-gray-600">{entry.userName || entry.userId}</td>
                  <td className="p-3">
                    {entry.riskScore != null ? (
                      <span className={`font-medium ${entry.riskScore > 70 ? 'text-red-600' : entry.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {entry.riskScore}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-1.5">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm rounded-md border disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
