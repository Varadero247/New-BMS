'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Code, Play, Clock, XCircle, Copy, Star } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface QueryItem {
  id: string;
  name: string;
  description: string;
  dataset: string;
  lastRun: string | null;
  runCount: number;
  avgDurationMs: number;
  isFavourite: boolean;
  owner: string;
  category: string;
  rowsLastRun: number | null;
  createdAt: string;
}

const MOCK_QUERIES: QueryItem[] = [
  { id: '1', name: 'Overdue CAPAs by Assignee', description: 'Lists all CAPAs past their due date grouped by assignee', dataset: 'CAPA Register', lastRun: '2026-02-14T09:00:00Z', runCount: 47, avgDurationMs: 340, isFavourite: true, owner: 'Alice Johnson', category: 'Quality', rowsLastRun: 23, createdAt: '2026-01-10' },
  { id: '2', name: 'Monthly Incident Summary', description: 'Incident count, severity breakdown and open rate by month', dataset: 'H&S Incidents', lastRun: '2026-02-01T00:00:00Z', runCount: 12, avgDurationMs: 560, isFavourite: true, owner: 'Bob Smith', category: 'H&S', rowsLastRun: 6, createdAt: '2026-01-15' },
  { id: '3', name: 'Supplier NCR Rate Ranking', description: 'Ranks suppliers by NCR rate per 100 deliveries', dataset: 'Supplier Performance', lastRun: '2026-02-13T08:30:00Z', runCount: 8, avgDurationMs: 820, isFavourite: false, owner: 'Karl Procurement', category: 'Supply Chain', rowsLastRun: 42, createdAt: '2026-01-20' },
  { id: '4', name: 'GHG Trend by Scope', description: 'Monthly Scope 1, 2, 3 emissions over the last 12 months', dataset: 'GHG Emissions', lastRun: '2026-02-01T00:00:00Z', runCount: 24, avgDurationMs: 1200, isFavourite: false, owner: 'Eve Green', category: 'ESG', rowsLastRun: 36, createdAt: '2025-12-01' },
  { id: '5', name: 'ISO Compliance Score by Module', description: 'Current compliance percentage for each active ISO standard', dataset: 'ISO Compliance Scores', lastRun: '2026-02-14T06:00:00Z', runCount: 60, avgDurationMs: 180, isFavourite: true, owner: 'Alice Johnson', category: 'Compliance', rowsLastRun: 8, createdAt: '2026-01-01' },
  { id: '6', name: 'Training Completion by Department', description: 'Mandatory training completion rates broken down by department', dataset: 'HR Headcount', lastRun: '2026-02-10T12:00:00Z', runCount: 5, avgDurationMs: 430, isFavourite: false, owner: 'Jane HR', category: 'HR', rowsLastRun: 12, createdAt: '2026-02-01' },
  { id: '7', name: 'Energy Consumption vs Budget', description: 'Compares actual site energy consumption to monthly budget targets', dataset: 'Energy Metering', lastRun: '2026-02-13T17:00:00Z', runCount: 14, avgDurationMs: 650, isFavourite: false, owner: 'Heidi Energy', category: 'Energy', rowsLastRun: 4, createdAt: '2026-01-05' },
];

const CATEGORY_STYLES: Record<string, string> = {
  Quality: 'bg-blue-100 text-blue-700',
  'H&S': 'bg-red-100 text-red-700',
  'Supply Chain': 'bg-orange-100 text-orange-700',
  ESG: 'bg-green-100 text-green-700',
  Compliance: 'bg-indigo-100 text-indigo-700',
  HR: 'bg-pink-100 text-pink-700',
  Energy: 'bg-yellow-100 text-yellow-700',
};

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

export default function QueriesPage() {
  const [items, setItems] = useState<QueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/queries');
        setItems(r.data.data || MOCK_QUERIES);
      } catch {
        setItems(MOCK_QUERIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggleFavourite(id: string) {
    setItems(prev => prev.map(q => q.id === id ? { ...q, isFavourite: !q.isFavourite } : q));
  }

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.dataset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === '' || i.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(items.map(i => i.category))].sort();
  const favourites = items.filter(i => i.isFavourite).length;
  const totalRuns = items.reduce((s, i) => s + i.runCount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Saved Queries</h1>
            <p className="text-gray-500 mt-1">Reusable data queries for reports and dashboards</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/nlq"
              className="px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 flex items-center gap-2 text-sm font-medium"
            >
              <Play className="h-4 w-4" /> Run New Query
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Save Query
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Queries', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Favourites', value: favourites, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Total Runs', value: totalRuns, color: 'bg-blue-50 text-blue-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Queries table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-5 w-5 text-purple-600" />
              Queries ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No queries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 w-6"></th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Query</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Dataset</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Runs</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Avg Time</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Last Rows</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Last Run</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(q => (
                      <tr key={q.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <button onClick={() => toggleFavourite(q.id)}>
                            <Star className={`h-4 w-4 ${q.isFavourite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{q.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{q.description}</p>
                          <p className="text-xs text-gray-400">{q.owner}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{q.dataset}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_STYLES[q.category] || 'bg-gray-100 text-gray-700'}`}>
                            {q.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">{q.runCount}</td>
                        <td className="py-3 px-4 text-right text-gray-500 text-xs">{formatDuration(q.avgDurationMs)}</td>
                        <td className="py-3 px-4 text-right text-gray-500 text-xs">
                          {q.rowsLastRun !== null ? q.rowsLastRun.toLocaleString() : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {q.lastRun ? new Date(q.lastRun).toLocaleString() : <span className="text-gray-300">Never</span>}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/nlq?query=${encodeURIComponent(q.name)}`} className="p-1.5 rounded hover:bg-purple-100 text-purple-600" title="Run">
                              <Play className="h-3.5 w-3.5" />
                            </Link>
                            <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Duplicate">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Query Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Save Query</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Query Name</label>
                  <input type="text" placeholder="e.g. Overdue Risk Assessments" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dataset</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>H&S Incidents</option>
                      <option>CAPA Register</option>
                      <option>GHG Emissions</option>
                      <option>HR Headcount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Query</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
