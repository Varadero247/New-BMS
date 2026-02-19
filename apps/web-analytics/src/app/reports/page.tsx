'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { Plus, Search, FileText, Download, Eye, XCircle, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface ReportItem {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  author: string;
  createdAt: string;
  lastRun: string | null;
  format: string;
  schedule: string | null;
}

const MOCK_REPORTS: ReportItem[] = [
  {
    id: '1',
    name: 'Q1 2026 Compliance Summary',
    type: 'COMPLIANCE',
    status: 'PUBLISHED',
    description: 'Cross-module ISO compliance scores and open action summary',
    author: 'Alice Johnson',
    createdAt: '2026-01-01',
    lastRun: '2026-02-01',
    format: 'PDF',
    schedule: 'Monthly',
  },
  {
    id: '2',
    name: 'H&S Performance Dashboard',
    type: 'PERFORMANCE',
    status: 'PUBLISHED',
    description: 'KPI trends, incident rates, and CAPA metrics for H&S module',
    author: 'Bob Smith',
    createdAt: '2026-01-15',
    lastRun: '2026-02-10',
    format: 'PDF',
    schedule: 'Weekly',
  },
  {
    id: '3',
    name: 'Supplier Quality Report',
    type: 'QUALITY',
    status: 'DRAFT',
    description: 'Supplier NCR rates, audit findings and performance scorecard',
    author: 'Carol Davis',
    createdAt: '2026-02-01',
    lastRun: null,
    format: 'XLSX',
    schedule: null,
  },
  {
    id: '4',
    name: 'ESG Emissions Report',
    type: 'ESG',
    status: 'PUBLISHED',
    description: 'Scope 1, 2 and 3 GHG emissions with trend analysis',
    author: 'Eve Green',
    createdAt: '2025-12-01',
    lastRun: '2026-02-01',
    format: 'PDF',
    schedule: 'Monthly',
  },
  {
    id: '5',
    name: 'CAPA Effectiveness Review',
    type: 'QUALITY',
    status: 'PUBLISHED',
    description: 'CAPA closure rates and effectiveness verification results',
    author: 'Ivan Quality',
    createdAt: '2026-01-20',
    lastRun: '2026-02-14',
    format: 'PDF',
    schedule: 'Fortnightly',
  },
  {
    id: '6',
    name: 'Financial KPI Report',
    type: 'FINANCE',
    status: 'DRAFT',
    description: 'Revenue, cost and profitability KPIs with budget variance',
    author: 'Jane Finance',
    createdAt: '2026-02-10',
    lastRun: null,
    format: 'XLSX',
    schedule: null,
  },
  {
    id: '7',
    name: 'Energy Management Report',
    type: 'ENERGY',
    status: 'PUBLISHED',
    description: 'ISO 50001 energy performance review and reduction targets',
    author: 'Heidi Energy',
    createdAt: '2026-01-01',
    lastRun: '2026-02-01',
    format: 'PDF',
    schedule: 'Monthly',
  },
];

const TYPE_COLORS: Record<string, string> = {
  COMPLIANCE: 'bg-indigo-100 text-indigo-700',
  PERFORMANCE: 'bg-blue-100 text-blue-700',
  QUALITY: 'bg-blue-100 text-blue-700',
  ESG: 'bg-green-100 text-green-700',
  FINANCE: 'bg-lime-100 text-lime-700',
  ENERGY: 'bg-yellow-100 text-yellow-700',
  HR: 'bg-orange-100 text-orange-700',
};

export default function ReportsPage() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/reports');
        setItems(r.data.data || MOCK_REPORTS);
      } catch {
        setItems(MOCK_REPORTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === '' || i.type === typeFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const types = [...new Set(items.map((i) => i.type))].sort();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Generate and manage analytical reports
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Create Report
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Reports', value: items.length, color: 'bg-purple-50 text-purple-700' },
            {
              label: 'Published',
              value: items.filter((i) => i.status === 'PUBLISHED').length,
              color: 'bg-green-50 text-green-700',
            },
            {
              label: 'Scheduled',
              value: items.filter((i) => i.schedule).length,
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
              aria-label="Search reports..."
              placeholder="Search reports..."
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
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Reports grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No reports found.</p>
            </div>
          ) : (
            filtered.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${TYPE_COLORS[report.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                    >
                      {report.type}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${report.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-1">
                    {report.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {report.schedule ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.schedule}
                        </span>
                      ) : (
                        <span>Manual</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Create Report</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Safety Performance"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {types.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
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
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
