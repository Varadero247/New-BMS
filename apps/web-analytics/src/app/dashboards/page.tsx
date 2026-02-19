'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  Plus,
  Search,
  LayoutDashboard,
  Lock,
  Globe,
  XCircle,
  Edit,
  Copy,
  Star } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardItem {
  id: string;
  name: string;
  description: string;
  owner: string;
  widgetCount: number;
  visibility: string;
  isFeatured: boolean;
  lastUpdated: string;
  viewCount: number;
  tags: string[];
}

const MOCK_DASHBOARDS: DashboardItem[] = [
  {
    id: '1',
    name: 'Executive Overview',
    description: 'High-level cross-module KPIs and compliance scores for leadership',
    owner: 'Alice Johnson',
    widgetCount: 12,
    visibility: 'PUBLIC',
    isFeatured: true,
    lastUpdated: '2026-02-14',
    viewCount: 284,
    tags: ['Executive', 'KPIs', 'Compliance'] },
  {
    id: '2',
    name: 'H&S Performance Monitor',
    description: 'Incident rates, LTI trends, near-miss frequency and CAPA status',
    owner: 'Bob Smith',
    widgetCount: 8,
    visibility: 'PUBLIC',
    isFeatured: false,
    lastUpdated: '2026-02-13',
    viewCount: 156,
    tags: ['H&S', 'Safety', 'Incidents'] },
  {
    id: '3',
    name: 'Quality KPI Tracker',
    description: 'NCR rates, CAPA closure, first-pass yield and customer satisfaction',
    owner: 'Ivan Quality',
    widgetCount: 10,
    visibility: 'PUBLIC',
    isFeatured: true,
    lastUpdated: '2026-02-12',
    viewCount: 198,
    tags: ['Quality', 'NCR', 'CAPA'] },
  {
    id: '4',
    name: 'ESG Metrics Board',
    description: 'Scope 1/2/3 emissions, energy consumption, waste and water KPIs',
    owner: 'Eve Green',
    widgetCount: 14,
    visibility: 'PUBLIC',
    isFeatured: false,
    lastUpdated: '2026-02-10',
    viewCount: 112,
    tags: ['ESG', 'Emissions', 'Sustainability'] },
  {
    id: '5',
    name: 'Supply Chain Scorecard',
    description: 'Supplier OTD, defect rates, audit findings and risk indicators',
    owner: 'Karl Procurement',
    widgetCount: 6,
    visibility: 'PRIVATE',
    isFeatured: false,
    lastUpdated: '2026-02-08',
    viewCount: 43,
    tags: ['Supply Chain', 'Suppliers'] },
  {
    id: '6',
    name: 'Finance BI Dashboard',
    description: 'Revenue, margin, budget variance and financial KPIs by department',
    owner: 'Jane Finance',
    widgetCount: 9,
    visibility: 'RESTRICTED',
    isFeatured: false,
    lastUpdated: '2026-02-07',
    viewCount: 67,
    tags: ['Finance', 'Budget', 'Revenue'] },
  {
    id: '7',
    name: 'ISO Compliance Radar',
    description: 'Compliance scoring across all active ISO standards at a glance',
    owner: 'Alice Johnson',
    widgetCount: 7,
    visibility: 'PUBLIC',
    isFeatured: true,
    lastUpdated: '2026-02-14',
    viewCount: 321,
    tags: ['Compliance', 'ISO', 'Audit'] },
  {
    id: '8',
    name: 'Workforce Analytics',
    description: 'Headcount, training completion, engagement and turnover metrics',
    owner: 'Jane HR',
    widgetCount: 5,
    visibility: 'RESTRICTED',
    isFeatured: false,
    lastUpdated: '2026-02-06',
    viewCount: 89,
    tags: ['HR', 'Training', 'Workforce'] },
];

const VISIBILITY_STYLES: Record<string, string> = {
  PUBLIC: 'bg-green-100 text-green-700',
  PRIVATE: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  RESTRICTED: 'bg-orange-100 text-orange-700' };

function VisibilityIcon({ v }: { v: string }) {
  if (v === 'PUBLIC') return <Globe className="h-3.5 w-3.5" />;
  if (v === 'RESTRICTED') return <Lock className="h-3.5 w-3.5" />;
  return <Lock className="h-3.5 w-3.5" />;
}

export default function DashboardsPage() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/dashboards');
        setItems(r.data.data || MOCK_DASHBOARDS);
      } catch {
        setItems(MOCK_DASHBOARDS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchVisibility = visibilityFilter === '' || i.visibility === visibilityFilter;
    return matchSearch && matchVisibility;
  });

  const featured = items.filter((i) => i.isFeatured);
  const totalViews = items.reduce((s, i) => s + i.viewCount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Custom Dashboards
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Create, share and manage data visualisation dashboards
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> New Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Total Dashboards',
              value: items.length,
              color: 'bg-purple-50 text-purple-700' },
            { label: 'Featured', value: featured.length, color: 'bg-yellow-50 text-yellow-700' },
            {
              label: 'Total Views',
              value: totalViews.toLocaleString(),
              color: 'bg-blue-50 text-blue-700' },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Featured dashboards */}
        {featured.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-yellow-500" /> Featured Dashboards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((d) => (
                <Card
                  key={d.id}
                  className="border-yellow-200 bg-yellow-50/30 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${VISIBILITY_STYLES[d.visibility]}`}
                      >
                        <VisibilityIcon v={d.visibility} />
                        {d.visibility}
                      </div>
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {d.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {d.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>{d.widgetCount} widgets</span>
                      <span>{d.viewCount} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search dashboards..."
              placeholder="Search dashboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            aria-label="Filter by visibility"
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Visibility</option>
            <option value="PUBLIC">Public</option>
            <option value="RESTRICTED">Restricted</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>

        {/* Dashboards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No dashboards found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <Card key={d.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${VISIBILITY_STYLES[d.visibility]}`}
                    >
                      <VisibilityIcon v={d.visibility} />
                      {d.visibility}
                    </div>
                    {d.isFeatured && (
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-1">
                    {d.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {d.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        {d.widgetCount} widgets · {d.viewCount} views
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {d.owner} · Updated {d.lastUpdated}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dashboard Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  New Dashboard
                </h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dashboard Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Operations Weekly Review"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What is this dashboard for?"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Visibility
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="PUBLIC">Public — visible to all users</option>
                    <option value="RESTRICTED">Restricted — specific roles only</option>
                    <option value="PRIVATE">Private — only me</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quality, KPIs, Weekly"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Create Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
