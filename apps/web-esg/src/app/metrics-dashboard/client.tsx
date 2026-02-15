'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus, Filter, ArrowUpRight, Leaf, Users, Shield } from 'lucide-react';

type Category = 'environmental' | 'social' | 'governance';
type Trend = 'up' | 'down' | 'stable';

interface Metric {
  id: string;
  name: string;
  category: Category;
  value: number;
  unit: string;
  target: number;
  previousPeriod: number;
  trend: Trend;
  framework: string;
  disclosure: string;
  status: 'on-track' | 'at-risk' | 'off-track';
}

const metrics: Metric[] = [
  // Environmental
  { id: 'E1', name: 'Scope 1 Emissions', category: 'environmental', value: 4250, unit: 'tCO₂e', target: 3500, previousPeriod: 4800, trend: 'down', framework: 'GRI', disclosure: '305-1', status: 'at-risk' },
  { id: 'E2', name: 'Scope 2 Emissions', category: 'environmental', value: 2100, unit: 'tCO₂e', target: 1800, previousPeriod: 2900, trend: 'down', framework: 'GRI', disclosure: '305-2', status: 'at-risk' },
  { id: 'E3', name: 'Renewable Energy %', category: 'environmental', value: 62, unit: '%', target: 80, previousPeriod: 48, trend: 'up', framework: 'TCFD', disclosure: 'Strategy', status: 'on-track' },
  { id: 'E4', name: 'Water Consumption', category: 'environmental', value: 125000, unit: 'm³', target: 110000, previousPeriod: 142000, trend: 'down', framework: 'GRI', disclosure: '303-5', status: 'at-risk' },
  { id: 'E5', name: 'Waste Diverted from Landfill', category: 'environmental', value: 89, unit: '%', target: 95, previousPeriod: 82, trend: 'up', framework: 'GRI', disclosure: '306-4', status: 'on-track' },
  { id: 'E6', name: 'Energy Intensity', category: 'environmental', value: 42, unit: 'MWh/£M rev', target: 35, previousPeriod: 48, trend: 'down', framework: 'GRI', disclosure: '302-3', status: 'at-risk' },
  // Social
  { id: 'S1', name: 'Women in Leadership', category: 'social', value: 35, unit: '%', target: 40, previousPeriod: 30, trend: 'up', framework: 'GRI', disclosure: '405-1', status: 'on-track' },
  { id: 'S2', name: 'Gender Pay Gap', category: 'social', value: 3.2, unit: '%', target: 0, previousPeriod: 4.8, trend: 'down', framework: 'GRI', disclosure: '405-2', status: 'on-track' },
  { id: 'S3', name: 'Lost Time Injury Rate', category: 'social', value: 0.8, unit: 'per 200k hrs', target: 0.5, previousPeriod: 1.2, trend: 'down', framework: 'GRI', disclosure: '403-9', status: 'at-risk' },
  { id: 'S4', name: 'Employee Turnover', category: 'social', value: 12.5, unit: '%', target: 10, previousPeriod: 14.2, trend: 'down', framework: 'GRI', disclosure: '401-1', status: 'at-risk' },
  { id: 'S5', name: 'Training Hours per Employee', category: 'social', value: 32, unit: 'hrs', target: 40, previousPeriod: 28, trend: 'up', framework: 'GRI', disclosure: '404-1', status: 'on-track' },
  { id: 'S6', name: 'Employee Satisfaction', category: 'social', value: 4.2, unit: '/5', target: 4.5, previousPeriod: 4.0, trend: 'up', framework: 'SASB', disclosure: 'HC-01', status: 'on-track' },
  // Governance
  { id: 'G1', name: 'Board Independence', category: 'governance', value: 67, unit: '%', target: 60, previousPeriod: 58, trend: 'up', framework: 'GRI', disclosure: '2-9', status: 'on-track' },
  { id: 'G2', name: 'Anti-Corruption Training', category: 'governance', value: 98, unit: '%', target: 100, previousPeriod: 92, trend: 'up', framework: 'GRI', disclosure: '205-2', status: 'on-track' },
  { id: 'G3', name: 'Data Breaches', category: 'governance', value: 0, unit: 'incidents', target: 0, previousPeriod: 1, trend: 'down', framework: 'GRI', disclosure: '418-1', status: 'on-track' },
  { id: 'G4', name: 'Supplier ESG Audits', category: 'governance', value: 78, unit: '%', target: 90, previousPeriod: 65, trend: 'up', framework: 'GRI', disclosure: '414-2', status: 'at-risk' },
  { id: 'G5', name: 'Whistleblower Cases Resolved', category: 'governance', value: 100, unit: '%', target: 100, previousPeriod: 100, trend: 'stable', framework: 'GRI', disclosure: '2-26', status: 'on-track' },
];

const categoryConfig: Record<Category, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  environmental: { label: 'Environmental', icon: <Leaf className="h-5 w-5" />, color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  social: { label: 'Social', icon: <Users className="h-5 w-5" />, color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  governance: { label: 'Governance', icon: <Shield className="h-5 w-5" />, color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
};

export default function MetricsDashboardClient() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = metrics.filter((m) => {
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const onTrack = metrics.filter((m) => m.status === 'on-track').length;
  const atRisk = metrics.filter((m) => m.status === 'at-risk').length;
  const offTrack = metrics.filter((m) => m.status === 'off-track').length;
  const overallScore = Math.round((onTrack / metrics.length) * 100);

  const TrendIcon = ({ trend }: { trend: Trend }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ESG Metrics Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key performance indicators across Environmental, Social & Governance dimensions</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">ESG Score</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{overallScore}%</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">metrics on track</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Metrics</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{metrics.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 uppercase font-medium">On Track</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{onTrack}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 uppercase font-medium">At Risk</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{atRisk}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 uppercase font-medium">Off Track</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{offTrack}</p>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-3 gap-4">
        {(['environmental', 'social', 'governance'] as Category[]).map((cat) => {
          const catMetrics = metrics.filter((m) => m.category === cat);
          const catOnTrack = catMetrics.filter((m) => m.status === 'on-track').length;
          const cfg = categoryConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
              className={`border rounded-xl p-4 text-left transition-colors ${categoryFilter === cat ? `${cfg.bgColor} ring-1` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {cfg.icon}
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{catOnTrack}/{catMetrics.length}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">on track</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 items-center">
        <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        {['all', 'on-track', 'at-risk', 'off-track'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'all' ? 'All Statuses' : s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Metric</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Category</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Current</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Target</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Progress</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">Trend</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Framework</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const progress = m.target === 0
                ? (m.value === 0 ? 100 : 0)
                : Math.min(100, Math.round((m.value / m.target) * 100));
              const isInverse = ['Scope 1 Emissions', 'Scope 2 Emissions', 'Water Consumption', 'Energy Intensity', 'Gender Pay Gap', 'Lost Time Injury Rate', 'Employee Turnover', 'Data Breaches'].includes(m.name);
              const displayProgress = isInverse
                ? (m.target === 0 ? (m.value === 0 ? 100 : Math.max(0, 100 - m.value * 10)) : Math.min(100, Math.round(((m.previousPeriod - m.value) / (m.previousPeriod - m.target)) * 100)))
                : progress;
              const adjustedProgress = Math.max(0, Math.min(100, displayProgress));

              return (
                <tr key={m.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{m.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{m.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.category === 'environmental' ? 'bg-green-100 text-green-700' : m.category === 'social' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {m.category[0].toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{typeof m.value === 'number' && m.value >= 1000 ? m.value.toLocaleString() : m.value}</span>
                    <span className="text-gray-400 dark:text-gray-500 ml-1">{m.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-gray-400">
                    {typeof m.target === 'number' && m.target >= 1000 ? m.target.toLocaleString() : m.target} {m.unit}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${adjustedProgress >= 80 ? 'bg-green-500' : adjustedProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${adjustedProgress}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TrendIcon trend={isInverse ? (m.trend === 'up' ? 'down' : m.trend === 'down' ? 'up' : 'stable') : m.trend} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'on-track' ? 'bg-green-100 text-green-700' : m.status === 'at-risk' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {m.status.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{m.framework} {m.disclosure}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
