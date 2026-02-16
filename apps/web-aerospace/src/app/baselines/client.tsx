'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, GitBranch, Package, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface Baseline {
  id: string;
  name: string;
  version: string;
  status: 'current' | 'superseded' | 'draft';
  createdDate: string;
  approvedDate: string | null;
  itemCount: number;
  changesSinceLastBaseline: number;
  description: string;
  approvedBy: string | null;
}

const MOCK_BASELINES: Baseline[] = [
  { id: '1', name: 'Airframe Assembly Baseline', version: 'v4.2.0', status: 'current', createdDate: '2026-01-10', approvedDate: '2026-01-12', itemCount: 247, changesSinceLastBaseline: 0, description: 'Current approved configuration for the main airframe assembly including all structural components and interfaces.', approvedBy: 'C. Rodriguez' },
  { id: '2', name: 'Airframe Assembly Baseline', version: 'v4.1.0', status: 'superseded', createdDate: '2025-10-05', approvedDate: '2025-10-07', itemCount: 241, changesSinceLastBaseline: 6, description: 'Previous baseline superseded after ECR-2025-044 material substitution and ECR-2025-051 tolerance updates.', approvedBy: 'C. Rodriguez' },
  { id: '3', name: 'Avionics Software Baseline', version: 'v2.5.1', status: 'current', createdDate: '2026-01-20', approvedDate: '2026-01-22', itemCount: 93, changesSinceLastBaseline: 0, description: 'Certified software configuration baseline for DO-178C Level A compliance.', approvedBy: 'P. Nakamura' },
  { id: '4', name: 'Propulsion System Baseline', version: 'v3.0.0', status: 'draft', createdDate: '2026-02-01', approvedDate: null, itemCount: 158, changesSinceLastBaseline: 14, description: 'Draft baseline for updated propulsion configuration pending FAA DER review and sign-off.', approvedBy: null },
  { id: '5', name: 'Electrical Harness Baseline', version: 'v1.8.3', status: 'current', createdDate: '2025-12-15', approvedDate: '2025-12-18', itemCount: 312, changesSinceLastBaseline: 0, description: 'Complete electrical harness routing and connector specification for production release.', approvedBy: 'M. Thompson' },
  { id: '6', name: 'Landing Gear System Baseline', version: 'v2.2.0', status: 'superseded', createdDate: '2025-07-01', approvedDate: '2025-07-03', itemCount: 87, changesSinceLastBaseline: 8, description: 'Superseded baseline — emergency revision required after ECR-2025-089 safety assessment.', approvedBy: 'A. Smith' },
];

const STATUS_CONFIG = {
  current:    { label: 'Current',    bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  icon: CheckCircle2 },
  superseded: { label: 'Superseded', bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-500 dark:text-gray-400',   border: 'border-gray-200 dark:border-gray-700',   icon: Clock },
  draft:      { label: 'Draft',      bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertCircle },
};

export default function BaselinesClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_BASELINES.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.version.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const counts = {
    current: MOCK_BASELINES.filter(b => b.status === 'current').length,
    draft: MOCK_BASELINES.filter(b => b.status === 'draft').length,
    superseded: MOCK_BASELINES.filter(b => b.status === 'superseded').length,
    totalItems: MOCK_BASELINES.filter(b => b.status === 'current').reduce((s, b) => s + b.itemCount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuration Baselines</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AS9100D Clause 8.3 — Design & Development Baselines</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Baseline
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Baselines</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{counts.current}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active configurations</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{counts.draft}</p>
            <p className="text-xs text-yellow-600 mt-1">Draft baselines</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Superseded</p>
            <p className="text-3xl font-bold text-gray-500 dark:text-gray-400 mt-1">{counts.superseded}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Historical record</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Config Items</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{counts.totalItems.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across active baselines</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search baseline name or version..." placeholder="Search baseline name or version..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="current">Current</option>
            <option value="draft">Draft</option>
            <option value="superseded">Superseded</option>
          </select>
        </div>

        {/* Baseline Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(baseline => {
            const sc = STATUS_CONFIG[baseline.status];
            const StatusIcon = sc.icon;
            return (
              <div key={baseline.id} className={`bg-white dark:bg-gray-900 rounded-lg border ${sc.border} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className={`px-5 py-3 ${sc.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <GitBranch className={`w-4 h-4 ${sc.text}`} />
                    <span className={`font-semibold text-sm ${sc.text}`}>{baseline.name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text} border ${sc.border}`}>
                    <StatusIcon className="w-3 h-3" />
                    {sc.label}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono">{baseline.version}</span>
                    {baseline.changesSinceLastBaseline > 0 && (
                      <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                        +{baseline.changesSinceLastBaseline} changes
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{baseline.description}</p>
                  <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 dark:border-gray-700 pt-3">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-500 mb-0.5">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-lg font-bold text-gray-800">{baseline.itemCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Config Items</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-500 mb-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{baseline.createdDate}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-gray-400 dark:text-gray-500 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{baseline.approvedDate ?? '—'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{baseline.approvedBy ? `By ${baseline.approvedBy}` : 'Pending'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 py-16 text-center text-gray-400 dark:text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No baselines match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
