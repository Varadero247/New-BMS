'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnifiedRisk {
  id: string;
  refNumber: string;
  source: string;
  isoStandard: string;
  title: string;
  likelihood: number;
  severity: number;
  score: number;
  treatment: string;
  owner: string;
  status: string;
  dueDate?: string;
  module: string;
  url: string;
}

interface RiskSummary {
  total: number;
  bySource: Record<string, number>;
  byScoreRange: { critical: number; high: number; medium: number; low: number };
  redZonePercent: number;
}

interface RiskResponse {
  risks: UnifiedRisk[];
  summary: RiskSummary;
  heatmap: number[][];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'quality', label: 'Quality' },
  { value: 'health_safety', label: 'Health & Safety' },
  { value: 'environment', label: 'Environment' },
  { value: 'infosec', label: 'Information Security' },
  { value: 'ai', label: 'AI Management' },
  { value: 'energy', label: 'Energy Management' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'MONITORING', label: 'Monitoring' },
];

const SCORE_RANGE_OPTIONS = [
  { value: '', label: 'All Scores' },
  { value: '20-25', label: 'Critical (20-25)' },
  { value: '12-19', label: 'High (12-19)' },
  { value: '6-11', label: 'Medium (6-11)' },
  { value: '1-5', label: 'Low (1-5)' },
];

const SOURCE_COLORS: Record<string, string> = {
  quality: 'bg-blue-100 text-blue-700',
  health_safety: 'bg-orange-100 text-orange-700',
  environment: 'bg-green-100 text-green-700',
  infosec: 'bg-purple-100 text-purple-700',
  ai: 'bg-indigo-100 text-indigo-700',
  energy: 'bg-yellow-100 text-yellow-700',
};

const SOURCE_LABELS: Record<string, string> = {
  quality: 'Quality',
  health_safety: 'H&S',
  environment: 'Environment',
  infosec: 'InfoSec',
  ai: 'AI',
  energy: 'Energy',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  MONITORING: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

// ---------------------------------------------------------------------------
// Heatmap cell colour
// ---------------------------------------------------------------------------

function heatmapCellColor(count: number, likelihood: number, severity: number): string {
  const inherentRisk = (likelihood + 1) * (severity + 1); // 1-indexed from grid position
  if (count === 0) {
    // Base colour by inherent risk zone
    if (inherentRisk >= 20) return 'bg-red-50';
    if (inherentRisk >= 12) return 'bg-orange-50';
    if (inherentRisk >= 6) return 'bg-yellow-50';
    return 'bg-green-50';
  }
  if (inherentRisk >= 20) return 'bg-red-500 text-white';
  if (inherentRisk >= 12) return 'bg-orange-400 text-white';
  if (inherentRisk >= 6) return 'bg-yellow-400 text-gray-900';
  return 'bg-green-400 text-white';
}

function scoreColor(score: number): string {
  if (score >= 20) return 'text-red-700 bg-red-100';
  if (score >= 12) return 'text-orange-700 bg-orange-100';
  if (score >= 6) return 'text-yellow-700 bg-yellow-100';
  return 'text-green-700 bg-green-100';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UnifiedRisksPage() {
  const [data, setData] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scoreRange, setScoreRange] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [sortField, setSortField] = useState<'score' | 'likelihood' | 'severity' | 'title'>(
    'score'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams();
        if (sourceFilter) params.set('source', sourceFilter);
        if (statusFilter) params.set('status', statusFilter);
        if (scoreRange) {
          const [min, max] = scoreRange.split('-');
          params.set('minScore', min);
          params.set('maxScore', max);
        }
        if (ownerFilter) params.set('owner', ownerFilter);
        params.set('sortBy', sortField);
        params.set('sortOrder', sortOrder);
        params.set('limit', '200');

        const r = await api.get(`/unified-risks?${params.toString()}`);
        setData(r.data.data);
      } catch {
        // Fallback — won't break the page
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [sourceFilter, statusFilter, scoreRange, ownerFilter, sortField, sortOrder]);

  const filteredRisks = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data.risks;
    const term = searchTerm.toLowerCase();
    return data.risks.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.refNumber.toLowerCase().includes(term) ||
        r.owner.toLowerCase().includes(term) ||
        r.module.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
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

  const summary = data?.summary;
  const heatmap = data?.heatmap || Array.from({ length: 5 }, () => Array(5).fill(0));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Unified Risk Register
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Cross-module risk view aggregating risks from Quality, H&S, Environment, InfoSec, AI,
            and Energy
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="rounded-lg p-4 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
              <p className="text-2xl font-bold">{summary.total}</p>
              <p className="text-sm font-medium mt-0.5">Total Risks</p>
            </div>
            <div className="rounded-lg p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <p className="text-2xl font-bold">{summary.byScoreRange.critical}</p>
              <p className="text-sm font-medium mt-0.5">Critical (20-25)</p>
            </div>
            <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
              <p className="text-2xl font-bold">{summary.byScoreRange.high}</p>
              <p className="text-sm font-medium mt-0.5">High (12-19)</p>
            </div>
            <div className="rounded-lg p-4 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              <p className="text-2xl font-bold">{summary.byScoreRange.medium}</p>
              <p className="text-sm font-medium mt-0.5">Medium (6-11)</p>
            </div>
            <div className="rounded-lg p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              <p className="text-2xl font-bold">{summary.byScoreRange.low}</p>
              <p className="text-sm font-medium mt-0.5">Low (1-5)</p>
            </div>
          </div>
        )}

        {/* Heatmap + Source Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 5x5 Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Heatmap (Likelihood x Severity)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-1 text-xs text-gray-500 dark:text-gray-400 w-20"></th>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <th
                          key={s}
                          className="p-1 text-xs text-center text-gray-500 dark:text-gray-400 font-medium"
                        >
                          Sev {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5, 4, 3, 2, 1].map((l) => (
                      <tr key={l}>
                        <td className="p-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Lik {l}
                        </td>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const count = heatmap[l - 1]?.[s - 1] || 0;
                          return (
                            <td key={s} className="p-1">
                              <div
                                className={`w-full aspect-square flex items-center justify-center rounded text-sm font-bold ${heatmapCellColor(count, l - 1, s - 1)}`}
                                title={`Likelihood ${l}, Severity ${s}: ${count} risk(s) — Score ${l * s}`}
                              >
                                {count > 0 ? count : ''}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Source Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risks by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {summary && (
                <div className="space-y-3">
                  {Object.entries(summary.bySource)
                    .sort((a, b) => b[1] - a[1])
                    .map(([source, count]) => {
                      const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                      return (
                        <div key={source}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {SOURCE_LABELS[source] || source}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Red Zone (score 12+)
                      </span>
                      <span
                        className={`font-bold ${(summary.redZonePercent || 0) > 30 ? 'text-red-600' : 'text-orange-500'}`}
                      >
                        {summary.redZonePercent}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search risks..."
              placeholder="Search risks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={scoreRange}
            onChange={(e) => setScoreRange(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
          >
            {SCORE_RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Owner..."
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
          />
        </div>

        {/* Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-5 w-5 text-purple-600" />
              Risks ({filteredRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRisks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Ref
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Source
                      </th>
                      <th
                        className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => toggleSort('title')}
                      >
                        <span className="inline-flex items-center gap-1">
                          Title <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => toggleSort('likelihood')}
                      >
                        <span className="inline-flex items-center gap-1">
                          L <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => toggleSort('severity')}
                      >
                        <span className="inline-flex items-center gap-1">
                          S <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th
                        className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 cursor-pointer select-none"
                        onClick={() => toggleSort('score')}
                      >
                        <span className="inline-flex items-center gap-1">
                          Score <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Due
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRisks.map((risk) => (
                      <tr
                        key={risk.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/30"
                      >
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {risk.refNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SOURCE_COLORS[risk.source] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {SOURCE_LABELS[risk.source] || risk.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                            {risk.title}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {risk.isoStandard}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                          {risk.likelihood}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                          {risk.severity}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scoreColor(risk.score)}`}
                          >
                            {risk.score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[risk.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {risk.status === 'IN_PROGRESS'
                              ? 'In Progress'
                              : risk.status.charAt(0) + risk.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                          {risk.owner}
                        </td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">
                          {risk.dueDate || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <a
                            href={risk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-500 hover:text-purple-700"
                            title={`Open in ${risk.module}`}
                          >
                            <ExternalLink className="h-4 w-4 inline" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No risks found matching your filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
