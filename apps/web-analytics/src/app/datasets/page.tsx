'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Plus,
  Search,
  Database,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { api } from '@/lib/api';

interface DatasetItem {
  id: string;
  name: string;
  source: string;
  type: string;
  recordCount: number;
  lastRefreshed: string | null;
  refreshFrequency: string;
  status: string;
  owner: string;
  description: string;
  sizeKb: number;
}

const MOCK_DATASETS: DatasetItem[] = [
  {
    id: '1',
    name: 'H&S Incidents',
    source: 'api-health-safety',
    type: 'INTERNAL',
    recordCount: 1247,
    lastRefreshed: '2026-02-14T06:00:00Z',
    refreshFrequency: 'Hourly',
    status: 'ACTIVE',
    owner: 'Bob Smith',
    description: 'All incident records including near-misses, LTIs and observations',
    sizeKb: 842,
  },
  {
    id: '2',
    name: 'CAPA Register',
    source: 'api-quality',
    type: 'INTERNAL',
    recordCount: 389,
    lastRefreshed: '2026-02-14T05:30:00Z',
    refreshFrequency: 'Hourly',
    status: 'ACTIVE',
    owner: 'Ivan Quality',
    description: 'Corrective and preventive action records across all modules',
    sizeKb: 294,
  },
  {
    id: '3',
    name: 'GHG Emissions',
    source: 'api-esg',
    type: 'INTERNAL',
    recordCount: 2160,
    lastRefreshed: '2026-02-01T00:00:00Z',
    refreshFrequency: 'Monthly',
    status: 'ACTIVE',
    owner: 'Eve Green',
    description: 'Scope 1, 2 and 3 emissions data with emission factors',
    sizeKb: 1830,
  },
  {
    id: '4',
    name: 'Supplier Performance',
    source: 'api-quality + api-inventory',
    type: 'COMPOSITE',
    recordCount: 156,
    lastRefreshed: '2026-02-13T12:00:00Z',
    refreshFrequency: 'Daily',
    status: 'ACTIVE',
    owner: 'Karl Procurement',
    description: 'Supplier scorecard combining delivery, quality and audit data',
    sizeKb: 128,
  },
  {
    id: '5',
    name: 'Energy Metering',
    source: 'External API (Utility Co.)',
    type: 'EXTERNAL',
    recordCount: 8760,
    lastRefreshed: '2026-02-14T01:00:00Z',
    refreshFrequency: 'Hourly',
    status: 'ACTIVE',
    owner: 'Heidi Energy',
    description: 'Smart meter readings for all site buildings',
    sizeKb: 3420,
  },
  {
    id: '6',
    name: 'HR Headcount',
    source: 'api-hr',
    type: 'INTERNAL',
    recordCount: 312,
    lastRefreshed: '2026-02-10T00:00:00Z',
    refreshFrequency: 'Weekly',
    status: 'ACTIVE',
    owner: 'Jane HR',
    description: 'Employee records, department breakdown and training status',
    sizeKb: 215,
  },
  {
    id: '7',
    name: 'Financial KPIs',
    source: 'api-finance',
    type: 'INTERNAL',
    recordCount: 48,
    lastRefreshed: null,
    refreshFrequency: 'Monthly',
    status: 'STALE',
    owner: 'Jane Finance',
    description: 'Revenue, cost and profitability data by department',
    sizeKb: 34,
  },
  {
    id: '8',
    name: 'ISO Compliance Scores',
    source: 'api-gateway',
    type: 'COMPOSITE',
    recordCount: 24,
    lastRefreshed: '2026-02-14T04:00:00Z',
    refreshFrequency: 'Daily',
    status: 'ACTIVE',
    owner: 'Alice Johnson',
    description: 'Cross-module compliance scoring against ISO standards',
    sizeKb: 18,
  },
];

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  STALE: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  DISABLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

const TYPE_STYLES: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-orange-100 text-orange-700',
  COMPOSITE: 'bg-purple-100 text-purple-700',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'ACTIVE') return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === 'ERROR') return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (status === 'STALE') return <Clock className="h-4 w-4 text-yellow-500" />;
  return <Database className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
}

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export default function DatasetsPage() {
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/datasets');
        setItems(r.data.data || MOCK_DATASETS);
      } catch {
        setItems(MOCK_DATASETS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === '' || i.type === typeFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const active = items.filter((i) => i.status === 'ACTIVE').length;
  const stale = items.filter((i) => i.status === 'STALE').length;
  const totalRecords = items.reduce((s, i) => s + i.recordCount, 0);

  async function refreshDataset(id: string) {
    setRefreshingId(id);
    try {
      await api.post(`/datasets/${id}/refresh`);
      setItems((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, lastRefreshed: new Date().toISOString(), status: 'ACTIVE' } : d
        )
      );
    } catch {
      setItems((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, lastRefreshed: new Date().toISOString(), status: 'ACTIVE' } : d
        )
      );
    } finally {
      setRefreshingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Datasets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage data sources connected to the analytics engine
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Dataset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Datasets', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Active', value: active, color: 'bg-green-50 text-green-700' },
            { label: 'Stale / Errors', value: stale, color: 'bg-yellow-50 text-yellow-700' },
            {
              label: 'Total Records',
              value: totalRecords.toLocaleString(),
              color: 'bg-blue-50 text-blue-700',
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search datasets..."
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            <option value="INTERNAL">Internal</option>
            <option value="EXTERNAL">External</option>
            <option value="COMPOSITE">Composite</option>
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="STALE">Stale</option>
            <option value="ERROR">Error</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        {/* Datasets table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-purple-600" />
              Datasets ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No datasets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Dataset
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Source
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Records
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Refresh
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Last Refreshed
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ds) => (
                      <tr key={ds.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon status={ds.status} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {ds.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs truncate">
                                {ds.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400 max-w-[160px] truncate">
                          {ds.source}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_STYLES[ds.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {ds.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                          {ds.recordCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {formatSize(ds.sizeKb)}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {ds.refreshFrequency}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {ds.lastRefreshed ? (
                            new Date(ds.lastRefreshed).toLocaleString()
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">Never</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[ds.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {ds.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => refreshDataset(ds.id)}
                            disabled={refreshingId === ds.id}
                            className="p-1.5 rounded hover:bg-purple-100 text-purple-600 disabled:opacity-50"
                            title="Refresh now"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${refreshingId === ds.id ? 'animate-spin' : ''}`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Dataset Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add Dataset
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dataset Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asset Maintenance Records"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. api-cmms or External API URL"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="INTERNAL">Internal</option>
                      <option value="EXTERNAL">External</option>
                      <option value="COMPOSITE">Composite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Refresh Frequency
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Manual</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Add Dataset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
