'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Search,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ModuleScore {
  id: string;
  module: string;
  standard: string;
  score: number;
  previousScore: number;
  status: string;
  openFindings: number;
  criticalFindings: number;
  lastAudit: string | null;
  nextAudit: string | null;
  certificationExpiry: string | null;
  trend: string;
  href: string;
}

const MOCK_SCORES: ModuleScore[] = [
  {
    id: '1',
    module: 'Health & Safety',
    standard: 'ISO 45001:2018',
    score: 87,
    previousScore: 82,
    status: 'CERTIFIED',
    openFindings: 3,
    criticalFindings: 0,
    lastAudit: '2025-10-15',
    nextAudit: '2026-10-15',
    certificationExpiry: '2027-10-15',
    trend: 'UP',
    href: 'http://localhost:3001',
  },
  {
    id: '2',
    module: 'Environment',
    standard: 'ISO 14001:2015',
    score: 91,
    previousScore: 88,
    status: 'CERTIFIED',
    openFindings: 2,
    criticalFindings: 0,
    lastAudit: '2025-09-20',
    nextAudit: '2026-09-20',
    certificationExpiry: '2027-09-20',
    trend: 'UP',
    href: 'http://localhost:3002',
  },
  {
    id: '3',
    module: 'Quality',
    standard: 'ISO 9001:2015',
    score: 79,
    previousScore: 84,
    status: 'CERTIFIED',
    openFindings: 7,
    criticalFindings: 1,
    lastAudit: '2025-11-01',
    nextAudit: '2026-05-01',
    certificationExpiry: '2027-11-01',
    trend: 'DOWN',
    href: 'http://localhost:3003',
  },
  {
    id: '4',
    module: 'Information Security',
    standard: 'ISO 27001:2022',
    score: 83,
    previousScore: 83,
    status: 'CERTIFIED',
    openFindings: 4,
    criticalFindings: 0,
    lastAudit: '2025-08-15',
    nextAudit: '2026-08-15',
    certificationExpiry: '2027-08-15',
    trend: 'STABLE',
    href: 'http://localhost:3015',
  },
  {
    id: '5',
    module: 'ESG',
    standard: 'GRI Standards',
    score: 74,
    previousScore: 68,
    status: 'IN_PROGRESS',
    openFindings: 9,
    criticalFindings: 2,
    lastAudit: '2025-12-01',
    nextAudit: '2026-06-01',
    certificationExpiry: null,
    trend: 'UP',
    href: 'http://localhost:3016',
  },
  {
    id: '6',
    module: 'AI Management',
    standard: 'ISO 42001:2023',
    score: 62,
    previousScore: 48,
    status: 'IN_PROGRESS',
    openFindings: 12,
    criticalFindings: 3,
    lastAudit: '2026-01-10',
    nextAudit: '2026-07-10',
    certificationExpiry: null,
    trend: 'UP',
    href: 'http://localhost:3024',
  },
  {
    id: '7',
    module: 'Anti-Bribery',
    standard: 'ISO 37001:2016',
    score: 88,
    previousScore: 85,
    status: 'CERTIFIED',
    openFindings: 2,
    criticalFindings: 0,
    lastAudit: '2025-09-01',
    nextAudit: '2026-09-01',
    certificationExpiry: '2027-09-01',
    trend: 'UP',
    href: 'http://localhost:3025',
  },
  {
    id: '8',
    module: 'Food Safety',
    standard: 'ISO 22000:2018',
    score: 93,
    previousScore: 90,
    status: 'CERTIFIED',
    openFindings: 1,
    criticalFindings: 0,
    lastAudit: '2025-11-15',
    nextAudit: '2026-11-15',
    certificationExpiry: '2027-11-15',
    trend: 'UP',
    href: 'http://localhost:3020',
  },
  {
    id: '9',
    module: 'Energy',
    standard: 'ISO 50001:2018',
    score: 76,
    previousScore: 71,
    status: 'CERTIFIED',
    openFindings: 5,
    criticalFindings: 0,
    lastAudit: '2025-10-01',
    nextAudit: '2026-10-01',
    certificationExpiry: '2027-10-01',
    trend: 'UP',
    href: 'http://localhost:3021',
  },
];

const STATUS_STYLES: Record<string, string> = {
  CERTIFIED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  LAPSED: 'bg-red-100 text-red-700',
  NOT_STARTED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

function TrendBadge({ trend, prev, current }: { trend: string; prev: number; current: number }) {
  const diff = current - prev;
  if (trend === 'UP' || diff > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <TrendingUp className="h-3 w-3" />+{Math.abs(diff)}%
      </span>
    );
  if (trend === 'DOWN' || diff < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
        <TrendingDown className="h-3 w-3" />
        {diff}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
      <Minus className="h-3 w-3" />
      No change
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span
        className={`text-sm font-bold w-10 text-right ${score >= 85 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
      >
        {score}%
      </span>
    </div>
  );
}

export default function ComplianceScoresPage() {
  const [items, setItems] = useState<ModuleScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/compliance');
        setItems(r.data.data?.scores || MOCK_SCORES);
      } catch {
        setItems(MOCK_SCORES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) => {
    const matchSearch =
      searchTerm === '' ||
      i.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.standard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const certified = items.filter((i) => i.status === 'CERTIFIED').length;
  const avgScore =
    items.length > 0 ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;
  const totalOpenFindings = items.reduce((s, i) => s + i.openFindings, 0);
  const totalCritical = items.reduce((s, i) => s + i.criticalFindings, 0);

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
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Compliance Scores</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO certification status and compliance performance across all modules
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Modules Tracked',
              value: items.length,
              color: 'bg-blue-50 text-blue-700',
              icon: Shield,
            },
            {
              label: 'Certified',
              value: `${certified}/${items.length}`,
              color: 'bg-green-50 text-green-700',
              icon: CheckCircle,
            },
            {
              label: 'Avg Score',
              value: `${avgScore}%`,
              color: `${avgScore >= 85 ? 'bg-green-50 text-green-700' : avgScore >= 70 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`,
              icon: TrendingUp,
            },
            {
              label: 'Open Findings',
              value: totalOpenFindings,
              color: totalCritical > 0 ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700',
              icon: AlertCircle,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`rounded-lg p-4 ${s.color} flex items-start justify-between`}
              >
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm font-medium mt-0.5">{s.label}</p>
                </div>
                <Icon className="h-5 w-5 opacity-60 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Critical findings banner */}
        {totalCritical > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {totalCritical} critical finding{totalCritical > 1 ? 's' : ''} require immediate
                attention
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Critical findings must be resolved before next certification audit.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search modules or standards..."
              placeholder="Search modules or standards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="CERTIFIED">Certified</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="LAPSED">Lapsed</option>
          </select>
        </div>

        {/* Score cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.module}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.standard}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_STYLES[item.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                  >
                    {item.status === 'IN_PROGRESS' ? 'In Progress' : item.status}
                  </span>
                </div>

                <ScoreBar score={item.score} />

                <div className="mt-2 flex items-center justify-between">
                  <TrendBadge trend={item.trend} prev={item.previousScore} current={item.score} />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    vs {item.previousScore}% prior
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`rounded p-2 ${item.openFindings > 0 ? 'bg-orange-50' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.openFindings}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Open Findings</p>
                  </div>
                  <div
                    className={`rounded p-2 ${item.criticalFindings > 0 ? 'bg-red-50' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <p
                      className={`font-semibold ${item.criticalFindings > 0 ? 'text-red-700' : 'text-gray-900 dark:text-gray-100'}`}
                    >
                      {item.criticalFindings}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">Critical</p>
                  </div>
                </div>

                {item.certificationExpiry && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Cert expires: {new Date(item.certificationExpiry).toLocaleDateString()}
                  </p>
                )}
                {item.nextAudit && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Next audit: {new Date(item.nextAudit).toLocaleDateString()}
                  </p>
                )}

                <a
                  href={item.href}
                  className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go to module <ArrowRight className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-blue-600" />
              All Compliance Scores ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Module
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Standard
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-32">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Trend
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Findings
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Last Audit
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                      Next Audit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {item.module}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {item.standard}
                      </td>
                      <td className="py-3 px-4">
                        <ScoreBar score={item.score} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <TrendBadge
                          trend={item.trend}
                          prev={item.previousScore}
                          current={item.score}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[item.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                        >
                          {item.status === 'IN_PROGRESS' ? 'In Progress' : item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-sm font-medium ${item.criticalFindings > 0 ? 'text-red-600' : item.openFindings > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-gray-100'}`}
                        >
                          {item.openFindings}
                        </span>
                        {item.criticalFindings > 0 && (
                          <span className="ml-1 text-xs text-red-500">
                            ({item.criticalFindings} critical)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {item.lastAudit ? new Date(item.lastAudit).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {item.nextAudit ? new Date(item.nextAudit).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
