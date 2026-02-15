'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Download, FileText, Table, XCircle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface ExportItem {
  id: string;
  name: string;
  format: string;
  source: string;
  requestedBy: string;
  createdAt: string;
  completedAt: string | null;
  status: string;
  sizeKb: number | null;
  rowCount: number | null;
  expiresAt: string | null;
}

const MOCK_EXPORTS: ExportItem[] = [
  { id: '1', name: 'Q1 2026 Compliance Report', format: 'PDF', source: 'Reports', requestedBy: 'Alice Johnson', createdAt: '2026-02-01T10:00:00Z', completedAt: '2026-02-01T10:02:15Z', status: 'COMPLETED', sizeKb: 1840, rowCount: null, expiresAt: '2026-03-01T10:00:00Z' },
  { id: '2', name: 'H&S KPI Data — Feb 2026', format: 'XLSX', source: 'KPI Tracker', requestedBy: 'Bob Smith', createdAt: '2026-02-14T08:30:00Z', completedAt: '2026-02-14T08:30:45Z', status: 'COMPLETED', sizeKb: 124, rowCount: 312, expiresAt: '2026-03-14T08:30:00Z' },
  { id: '3', name: 'Supplier NCR Export', format: 'CSV', source: 'Saved Queries', requestedBy: 'Karl Procurement', createdAt: '2026-02-13T14:00:00Z', completedAt: '2026-02-13T14:01:30Z', status: 'COMPLETED', sizeKb: 56, rowCount: 847, expiresAt: '2026-03-13T14:00:00Z' },
  { id: '4', name: 'ESG Emissions Dataset', format: 'XLSX', source: 'Datasets', requestedBy: 'Eve Green', createdAt: '2026-02-10T09:00:00Z', completedAt: '2026-02-10T09:03:40Z', status: 'COMPLETED', sizeKb: 2310, rowCount: 2160, expiresAt: '2026-03-10T09:00:00Z' },
  { id: '5', name: 'Finance KPI Report', format: 'PDF', source: 'Reports', requestedBy: 'Jane Finance', createdAt: '2026-02-14T11:00:00Z', completedAt: null, status: 'PROCESSING', sizeKb: null, rowCount: null, expiresAt: null },
  { id: '6', name: 'All Incidents 2025', format: 'CSV', source: 'Datasets', requestedBy: 'Bob Smith', createdAt: '2026-01-31T17:00:00Z', completedAt: '2026-01-31T17:05:00Z', status: 'EXPIRED', sizeKb: 890, rowCount: 1247, expiresAt: '2026-02-07T17:00:00Z' },
  { id: '7', name: 'ISO Compliance Summary', format: 'PDF', source: 'Reports', requestedBy: 'Alice Johnson', createdAt: '2026-02-14T07:00:00Z', completedAt: null, status: 'FAILED', sizeKb: null, rowCount: null, expiresAt: null },
];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  QUEUED: 'bg-yellow-100 text-yellow-700',
};

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-red-500" />,
  XLSX: <Table className="h-4 w-4 text-green-600" />,
  CSV: <Table className="h-4 w-4 text-blue-500" />,
};

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function ExportsPage() {
  const [items, setItems] = useState<ExportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/exports');
        setItems(r.data.data || MOCK_EXPORTS);
      } catch {
        setItems(MOCK_EXPORTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFormat = formatFilter === '' || i.format === formatFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchFormat && matchStatus;
  });

  const completed = items.filter(i => i.status === 'COMPLETED').length;
  const processing = items.filter(i => i.status === 'PROCESSING').length;
  const totalSize = items.filter(i => i.sizeKb).reduce((s, i) => s + (i.sizeKb || 0), 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Exports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Download reports, datasets and query results</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New Export
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Exports', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Completed', value: completed, color: 'bg-green-50 text-green-700' },
            { label: 'Total Size', value: formatSize(totalSize), color: 'bg-blue-50 text-blue-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {processing > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            <p className="text-sm text-blue-800 font-medium">{processing} export{processing > 1 ? 's are' : ' is'} currently processing…</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search exports..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Formats</option>
            <option value="PDF">PDF</option>
            <option value="XLSX">XLSX</option>
            <option value="CSV">CSV</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        {/* Exports table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-5 w-5 text-purple-600" />
              Exports ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Download className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No exports found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Export</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Format</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Requested By</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rows</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Size</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Created</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(exp => (
                      <tr key={exp.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{exp.name}</p>
                          {exp.expiresAt && exp.status === 'COMPLETED' && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">Expires {new Date(exp.expiresAt).toLocaleDateString()}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {FORMAT_ICONS[exp.format]}
                            <span className="text-xs text-gray-600">{exp.format}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{exp.source}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">{exp.requestedBy}</td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {exp.rowCount !== null ? exp.rowCount.toLocaleString() : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {exp.sizeKb !== null ? formatSize(exp.sizeKb) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(exp.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[exp.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {exp.status === 'PROCESSING' ? (
                              <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3 animate-spin" />{exp.status}</span>
                            ) : exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {exp.status === 'COMPLETED' && (
                            <button className="p-1.5 rounded hover:bg-purple-100 text-purple-600" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {exp.status === 'FAILED' && (
                            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500" title="Retry">
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Export Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Export</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Export Name</label>
                  <input type="text" placeholder="e.g. March CAPA Summary" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Reports</option>
                      <option>Datasets</option>
                      <option>Saved Queries</option>
                      <option>KPI Tracker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>PDF</option>
                      <option>XLSX</option>
                      <option>CSV</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Generate Export</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
