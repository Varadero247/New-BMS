'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  FlaskConical,
  AlertTriangle,
  FileWarning,
  FileText,
  Microscope,
  Trash2,
  BarChart3,
  ShieldAlert,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface CategoryCount {
  category: string;
  count: number;
}

interface RiskCount {
  risk: string;
  count: number;
}

interface DashboardData {
  totalChemicals: number;
  cmrCount: number;
  highRiskCoshh: number;
  sdsOverdue: number;
  coshhDueReview: number;
  biologicalMonitoringDue: number;
  disposalsPendingApproval: number;
  categoryCounts: CategoryCount[];
  riskDistribution: RiskCount[];
}

const MOCK_DATA: DashboardData = {
  totalChemicals: 342,
  cmrCount: 23,
  highRiskCoshh: 48,
  sdsOverdue: 12,
  coshhDueReview: 18,
  biologicalMonitoringDue: 5,
  disposalsPendingApproval: 7,
  categoryCounts: [
    { category: 'Solvents', count: 87 },
    { category: 'Acids & Alkalis', count: 54 },
    { category: 'Flammables', count: 63 },
    { category: 'Oxidisers', count: 29 },
    { category: 'Biological', count: 41 },
    { category: 'Other', count: 68 },
  ],
  riskDistribution: [
    { risk: 'LOW', count: 189 },
    { risk: 'MEDIUM', count: 96 },
    { risk: 'HIGH', count: 48 },
    { risk: 'VERY_HIGH', count: 9 },
  ],
};

const RISK_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  LOW: { label: 'Low Risk', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', bar: 'bg-green-500' },
  MEDIUM: { label: 'Medium Risk', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', bar: 'bg-yellow-400' },
  HIGH: { label: 'High Risk', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', bar: 'bg-orange-500' },
  VERY_HIGH: { label: 'Very High Risk', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', bar: 'bg-red-600' },
};

const CATEGORY_COLORS = [
  'bg-amber-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-red-400',
  'bg-green-500',
  'bg-gray-400',
];

export default function ChemicalsAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  function load() {
    setLoading(true);
    api
      .get('/analytics/dashboard')
      .then((r) => setData(r.data.data))
      .catch(() => setData(MOCK_DATA))
      .finally(() => {
        setLoading(false);
        setLastRefresh(new Date());
      });
  }

  useEffect(() => {
    load();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <div className="text-amber-600 font-medium animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const d = data ?? MOCK_DATA;
  const maxCategory = Math.max(...d.categoryCounts.map((c) => c.count), 1);
  const totalRisk = d.riskDistribution.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="w-7 h-7 text-amber-600" />
              Chemicals / COSHH Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Chemicals"
            value={d.totalChemicals}
            icon={<FlaskConical className="w-5 h-5 text-amber-600" />}
            bg="bg-amber-50"
            border="border-amber-200"
          />
          <StatCard
            label="CMR Substances"
            value={d.cmrCount}
            icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
            bg="bg-red-50"
            border="border-red-200"
            alert={d.cmrCount > 0}
          />
          <StatCard
            label="High Risk COSHH"
            value={d.highRiskCoshh}
            icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
            bg="bg-orange-50"
            border="border-orange-200"
            alert={d.highRiskCoshh > 0}
          />
          <StatCard
            label="SDS Overdue"
            value={d.sdsOverdue}
            icon={<FileWarning className="w-5 h-5 text-red-600" />}
            bg={d.sdsOverdue > 0 ? 'bg-red-50' : 'bg-green-50'}
            border={d.sdsOverdue > 0 ? 'border-red-300' : 'border-green-200'}
            alert={d.sdsOverdue > 0}
            valueClass={d.sdsOverdue > 0 ? 'text-red-700' : 'text-green-700'}
          />
          <StatCard
            label="COSHH Due Review"
            value={d.coshhDueReview}
            icon={<FileText className="w-5 h-5 text-yellow-600" />}
            bg="bg-yellow-50"
            border="border-yellow-200"
          />
          <StatCard
            label="Bio Monitoring Due"
            value={d.biologicalMonitoringDue}
            icon={<Microscope className="w-5 h-5 text-purple-600" />}
            bg="bg-purple-50"
            border="border-purple-200"
            alert={d.biologicalMonitoringDue > 0}
          />
        </div>

        {/* Disposals Pending Banner */}
        {d.disposalsPendingApproval > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-100 border border-amber-300 rounded-xl">
            <Trash2 className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {d.disposalsPendingApproval} Disposal{d.disposalsPendingApproval !== 1 ? 's' : ''} Pending Approval
              </p>
              <p className="text-xs text-amber-700">Chemical disposal requests require authorisation before processing.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-100">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                Chemical Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {d.categoryCounts.map((cat, idx) => {
                const pct = maxCategory > 0 ? Math.max((cat.count / maxCategory) * 100, 2) : 2;
                const totalPct = d.totalChemicals > 0 ? ((cat.count / d.totalChemicals) * 100).toFixed(1) : '0';
                const barColor = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className="text-gray-500 tabular-nums">{cat.count} <span className="text-xs text-gray-400">({totalPct}%)</span></span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-amber-100">
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {d.riskDistribution.map((r) => {
                  const cfg = RISK_CONFIG[r.risk] ?? { label: r.risk, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', bar: 'bg-gray-400' };
                  const pct = totalRisk > 0 ? ((r.count / totalRisk) * 100).toFixed(1) : '0';
                  return (
                    <div
                      key={r.risk}
                      className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} text-center`}
                    >
                      <p className={`text-3xl font-bold ${cfg.text}`}>{r.count}</p>
                      <p className={`text-xs font-medium mt-1 ${cfg.text}`}>{cfg.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pct}% of total</p>
                    </div>
                  );
                })}
              </div>

              {/* Stacked bar */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Risk Profile Overview</p>
                <div className="flex h-4 w-full rounded-full overflow-hidden gap-0.5">
                  {d.riskDistribution.map((r) => {
                    const cfg = RISK_CONFIG[r.risk];
                    const pct = totalRisk > 0 ? (r.count / totalRisk) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={r.risk}
                        className={`h-full ${cfg?.bar ?? 'bg-gray-400'} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${cfg?.label ?? r.risk}: ${r.count} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {d.riskDistribution.map((r) => {
                    const cfg = RISK_CONFIG[r.risk];
                    return (
                      <span key={r.risk} className="flex items-center gap-1 text-xs text-gray-600">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${cfg?.bar ?? 'bg-gray-400'}`} />
                        {cfg?.label ?? r.risk}
                      </span>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Footer */}
        <Card className="border-amber-200 shadow-sm">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{d.totalChemicals}</p>
                <p className="text-xs text-gray-500 mt-1">Total Registered Chemicals</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${d.sdsOverdue > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.sdsOverdue}</p>
                <p className="text-xs text-gray-500 mt-1">SDS Documents Overdue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{d.highRiskCoshh}</p>
                <p className="text-xs text-gray-500 mt-1">High Risk COSHH Assessments</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{d.disposalsPendingApproval}</p>
                <p className="text-xs text-gray-500 mt-1">Disposals Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  bg,
  border,
  alert = false,
  valueClass = 'text-gray-900',
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
  border: string;
  alert?: boolean;
  valueClass?: string;
}) {
  return (
    <Card className={`border shadow-sm ${bg} ${border} ${alert ? 'ring-2 ring-red-400' : ''}`}>
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
      </CardContent>
    </Card>
  );
}
