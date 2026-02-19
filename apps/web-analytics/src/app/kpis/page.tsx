'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Plus,
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface KpiItem {
  id: string;
  name: string;
  category: string;
  value: number | string;
  target: number | string;
  unit: string;
  trend: string;
  status: string;
  owner: string;
  lastUpdated: string;
  description: string;
}

const MOCK_KPIS: KpiItem[] = [
  {
    id: '1',
    name: 'Lost Time Injury Rate',
    category: 'H&S',
    value: 0.12,
    target: 0,
    unit: 'per 100k hrs',
    trend: 'DOWN',
    status: 'OFF_TARGET',
    owner: 'Bob Smith',
    lastUpdated: '2026-02-10',
    description: 'Number of lost time injuries per 100,000 hours worked',
  },
  {
    id: '2',
    name: 'Customer Satisfaction Score',
    category: 'Quality',
    value: 88,
    target: 90,
    unit: '%',
    trend: 'UP',
    status: 'NEAR_TARGET',
    owner: 'Alice Johnson',
    lastUpdated: '2026-02-01',
    description: 'Average customer satisfaction rating from surveys',
  },
  {
    id: '3',
    name: 'CAPA Closure Rate',
    category: 'Quality',
    value: 76,
    target: 85,
    unit: '%',
    trend: 'STABLE',
    status: 'OFF_TARGET',
    owner: 'Carol Davis',
    lastUpdated: '2026-02-14',
    description: 'Percentage of CAPAs closed on time',
  },
  {
    id: '4',
    name: 'On-Time Delivery',
    category: 'Operations',
    value: 93,
    target: 95,
    unit: '%',
    trend: 'UP',
    status: 'NEAR_TARGET',
    owner: 'George Ops',
    lastUpdated: '2026-02-13',
    description: 'Percentage of orders delivered on or before due date',
  },
  {
    id: '5',
    name: 'Carbon Intensity',
    category: 'ESG',
    value: 24.8,
    target: 20,
    unit: 'tCO2/£m',
    trend: 'DOWN',
    status: 'OFF_TARGET',
    owner: 'Eve Green',
    lastUpdated: '2026-02-01',
    description: 'GHG emissions per £million revenue',
  },
  {
    id: '6',
    name: 'First Pass Yield',
    category: 'Quality',
    value: 97.4,
    target: 98,
    unit: '%',
    trend: 'UP',
    status: 'ON_TARGET',
    owner: 'Ivan Quality',
    lastUpdated: '2026-02-12',
    description: 'Percentage of products passing quality inspection first time',
  },
  {
    id: '7',
    name: 'Employee Engagement',
    category: 'HR',
    value: 74,
    target: 80,
    unit: '%',
    trend: 'UP',
    status: 'OFF_TARGET',
    owner: 'Jane HR',
    lastUpdated: '2026-01-15',
    description: 'Annual employee engagement survey score',
  },
  {
    id: '8',
    name: 'Supplier On-Time Delivery',
    category: 'Supply Chain',
    value: 89,
    target: 92,
    unit: '%',
    trend: 'STABLE',
    status: 'OFF_TARGET',
    owner: 'Karl Procurement',
    lastUpdated: '2026-02-05',
    description: 'Supplier on-time delivery performance',
  },
  {
    id: '9',
    name: 'Energy Consumption',
    category: 'ESG',
    value: 1240,
    target: 1100,
    unit: 'MWh/month',
    trend: 'DOWN',
    status: 'OFF_TARGET',
    owner: 'Heidi Energy',
    lastUpdated: '2026-02-01',
    description: 'Total site energy consumption',
  },
  {
    id: '10',
    name: 'Training Completion Rate',
    category: 'HR',
    value: 96,
    target: 95,
    unit: '%',
    trend: 'UP',
    status: 'ON_TARGET',
    owner: 'Jane HR',
    lastUpdated: '2026-02-10',
    description: 'Percentage of employees with up-to-date mandatory training',
  },
];

const STATUS_STYLES: Record<string, string> = {
  ON_TARGET: 'bg-green-100 text-green-700',
  NEAR_TARGET: 'bg-yellow-100 text-yellow-700',
  OFF_TARGET: 'bg-red-100 text-red-700',
};

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'UP' || trend === 'IMPROVING')
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (trend === 'DOWN' || trend === 'DECLINING')
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
}

export default function KPIsPage() {
  const [items, setItems] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/kpis');
        setItems(r.data.data || MOCK_KPIS);
      } catch {
        setItems(MOCK_KPIS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === '' || i.category === categoryFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const onTarget = items.filter((i) => i.status === 'ON_TARGET').length;
  const offTarget = items.filter((i) => i.status === 'OFF_TARGET').length;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">KPI Tracking</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Key performance indicator monitoring across all modules
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add KPI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total KPIs', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'On Target', value: onTarget, color: 'bg-green-50 text-green-700' },
            {
              label: 'Near Target',
              value: items.filter((i) => i.status === 'NEAR_TARGET').length,
              color: 'bg-yellow-50 text-yellow-700',
            },
            { label: 'Off Target', value: offTarget, color: 'bg-red-50 text-red-700' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg p-4 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search KPIs..."
              placeholder="Search KPIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="ON_TARGET">On Target</option>
            <option value="NEAR_TARGET">Near Target</option>
            <option value="OFF_TARGET">Off Target</option>
          </select>
        </div>

        {/* KPI Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              KPIs ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Target
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Trend
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="text-gray-900 dark:text-gray-100 font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">
                            {item.description}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {item.value}
                          {typeof item.value === 'number' && item.unit === '%' ? '%' : ''}
                          {item.unit !== '%' && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                              {item.unit}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                          {item.target}
                          {typeof item.target === 'number' && item.unit === '%' ? '%' : ''}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <TrendIcon trend={item.trend} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[item.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {item.status === 'ON_TARGET'
                              ? 'On Target'
                              : item.status === 'NEAR_TARGET'
                                ? 'Near Target'
                                : 'Off Target'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                          {item.owner}
                        </td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">
                          {item.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No KPIs found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add KPI Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add KPI</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    KPI Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Customer Complaint Rate"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Quality</option>
                      <option>H&S</option>
                      <option>ESG</option>
                      <option>Operations</option>
                      <option>HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. %"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Owner
                    </label>
                    <input
                      type="text"
                      placeholder="Assignee name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
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
                  Add KPI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
