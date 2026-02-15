'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, Filter, Download, ClipboardList, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  userId: string;
  userName: string;
  ipAddress: string;
  module: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const MODULE_COLORS: Record<string, string> = {
  'Quality': 'bg-blue-100 text-blue-700',
  'H&S': 'bg-red-100 text-red-700',
  'Environmental': 'bg-green-100 text-green-700',
  'InfoSec': 'bg-cyan-100 text-cyan-700',
  'Auth': 'bg-purple-100 text-purple-700',
  'CMMS': 'bg-stone-100 text-stone-700',
  'Finance': 'bg-lime-100 text-lime-700',
  'HR': 'bg-orange-100 text-orange-700',
  'CRM': 'bg-pink-100 text-pink-700',
  'Gateway': 'bg-indigo-100 text-indigo-700',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  REJECT: 'bg-red-100 text-red-700',
  EXPORT: 'bg-amber-100 text-amber-700',
  VIEW: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

const MOCK_ENTRIES: AuditEntry[] = [
  { id: '1', action: 'CREATE', entityType: 'NonConformance', entityId: 'NCR-2026-0042', description: 'NCR created: Supplier material out of spec', userId: 'u1', userName: 'Alice Johnson', ipAddress: '192.168.1.14', module: 'Quality', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', action: 'UPDATE', entityType: 'Incident', entityId: 'INC-2026-0118', description: 'Incident status changed to CLOSED', userId: 'u2', userName: 'Bob Smith', ipAddress: '10.0.1.22', module: 'H&S', createdAt: new Date(Date.now() - 22 * 60000).toISOString() },
  { id: '3', action: 'LOGIN', entityType: 'User', entityId: 'admin@ims.local', description: 'User logged in successfully', userId: 'u3', userName: 'Admin User', ipAddress: '127.0.0.1', module: 'Auth', createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: '4', action: 'APPROVE', entityType: 'CAPA', entityId: 'CAPA-2026-0031', description: 'CAPA approved by quality manager', userId: 'u4', userName: 'Carol Davis', ipAddress: '192.168.1.7', module: 'Quality', createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: '5', action: 'CREATE', entityType: 'EnvAspect', entityId: 'ENV-ASP-2026-012', description: 'Environmental aspect registered: Water discharge', userId: 'u5', userName: 'Eve Green', ipAddress: '192.168.1.9', module: 'Environmental', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '6', action: 'UPDATE', entityType: 'Risk', entityId: 'ISR-2026-008', description: 'Risk severity updated from HIGH to CRITICAL', userId: 'u6', userName: 'Frank Security', ipAddress: '10.0.2.5', module: 'InfoSec', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '7', action: 'EXPORT', entityType: 'Report', entityId: 'RPT-2026-Q1', description: 'Q1 compliance report exported to PDF', userId: 'u1', userName: 'Alice Johnson', ipAddress: '192.168.1.14', module: 'Quality', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '8', action: 'DELETE', entityType: 'Document', entityId: 'DOC-2026-OLD', description: 'Obsolete procedure document deleted', userId: 'u7', userName: 'George Admin', ipAddress: '192.168.1.1', module: 'Gateway', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: '9', action: 'CREATE', entityType: 'WorkOrder', entityId: 'WO-2026-0315', description: 'Preventive maintenance work order created', userId: 'u8', userName: 'Heidi Maint', ipAddress: '10.0.3.12', module: 'CMMS', createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: '10', action: 'UPDATE', entityType: 'Employee', entityId: 'EMP-0074', description: 'Employee competence record updated', userId: 'u9', userName: 'Ivan HR', ipAddress: '192.168.2.3', module: 'HR', createdAt: new Date(Date.now() - 10 * 3600000).toISOString() },
  { id: '11', action: 'APPROVE', entityType: 'Invoice', entityId: 'INV-2026-0401', description: 'Invoice approved for payment', userId: 'u10', userName: 'Jane Finance', ipAddress: '10.0.1.50', module: 'Finance', createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: '12', action: 'CREATE', entityType: 'Lead', entityId: 'LEAD-2026-0089', description: 'New CRM lead created: Acme Corp', userId: 'u11', userName: 'Karl Sales', ipAddress: '192.168.1.30', module: 'CRM', createdAt: new Date(Date.now() - 14 * 3600000).toISOString() },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AuditTrailPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const res = await api.get('/audit-trail');
        setEntries(res.data.data || MOCK_ENTRIES);
      } catch {
        setEntries(MOCK_ENTRIES);
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  const filtered = entries.filter(e => {
    const matchSearch = search === '' ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.entityId.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === '' || e.action === actionFilter;
    const matchModule = moduleFilter === '' || e.module === moduleFilter;
    return matchSearch && matchAction && matchModule;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const modules = [...new Set(entries.map(e => e.module))].sort();
  const actions = [...new Set(entries.map(e => e.action))].sort();

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded" />
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audit Trail</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Complete activity log across all IMS modules</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Events', value: entries.length, color: 'bg-blue-50 text-blue-700' },
              { label: 'Today', value: entries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length, color: 'bg-green-50 text-green-700' },
              { label: 'Modules', value: modules.length, color: 'bg-purple-50 text-purple-700' },
              { label: 'Unique Users', value: new Set(entries.map(e => e.userId)).size, color: 'bg-amber-50 text-amber-700' },
            ].map(stat => (
              <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search events, users, IDs..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select
                  value={moduleFilter}
                  onChange={e => { setModuleFilter(e.target.value); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Modules</option>
                  {modules.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-5 w-5 text-amber-500" />
                Audit Entries ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Action</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Module</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">No audit entries match your filters.</td>
                      </tr>
                    ) : paginated.map(entry => (
                      <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                            <span>{timeAgo(entry.createdAt)}</span>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {new Date(entry.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[entry.action] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${MODULE_COLORS[entry.module] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {entry.module}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{entry.entityType} · {entry.entityId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-700 dark:text-gray-300">{entry.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-mono text-xs">{entry.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
