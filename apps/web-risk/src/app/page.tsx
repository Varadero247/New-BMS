'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import {
  AlertTriangle,
  ShieldAlert,
  Target,
  ClipboardCheck,
  ListChecks,
  Activity,
  TrendingUp,
  Plus,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface DashboardStats {
  totalRisks: number;
  criticalRisks: number;
  exceedsAppetite: number;
  overdueReviews: number;
  overdueActions: number;
  kriBreaches: number;
  kriWarnings: number;
  newThisMonth: number;
  openCapas: number;
  pendingReviews: number;
  avgRiskScore: number;
}

interface HeatMapRisk {
  id: string;
  title: string;
  likelihood: string;
  consequence: string;
  inherentScore: number;
}

interface HeatMapData {
  risks: HeatMapRisk[];
  total: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

// Maps enum values to numeric 1-5
const LIKELIHOOD_MAP: Record<string, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

const CONSEQUENCE_MAP: Record<string, number> = {
  INSIGNIFICANT: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

function getCellColor(score: number): string {
  if (score >= 20) return 'bg-red-600 hover:bg-red-700 text-white';
  if (score >= 15) return 'bg-orange-500 hover:bg-orange-600 text-white';
  if (score >= 8) return 'bg-amber-400 hover:bg-amber-500 text-gray-900';
  if (score >= 4) return 'bg-yellow-300 hover:bg-yellow-400 text-gray-900';
  return 'bg-green-400 hover:bg-green-500 text-gray-900';
}

function getCellLabel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 15) return 'High';
  if (score >= 8) return 'Medium';
  if (score >= 4) return 'Low';
  return 'Very Low';
}

const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const CONSEQUENCE_LABELS = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRiskLevelBadge(level: string): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'LOW':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getRiskLevelFromScore(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 15) return 'HIGH';
  if (score >= 8) return 'MEDIUM';
  if (score >= 4) return 'LOW';
  return 'VERY LOW';
}

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalRisks: 0,
    criticalRisks: 0,
    exceedsAppetite: 0,
    overdueReviews: 0,
    overdueActions: 0,
    kriBreaches: 0,
    kriWarnings: 0,
    newThisMonth: 0,
    openCapas: 0,
    pendingReviews: 0,
    avgRiskScore: 0,
  });

  const [heatMapData, setHeatMapData] = useState<HeatMapData>({ risks: [], total: 0 });
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Which heat map cell is selected (to show tooltip of risk titles)
  const [selectedCell, setSelectedCell] = useState<{ l: number; c: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, heatRes, catRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/risks/heatmap'),
          api.get('/categories'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data || {});
        }
        if (heatRes.status === 'fulfilled') {
          setHeatMapData(heatRes.value.data.data || { risks: [], total: 0 });
        }
        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value.data.data || []);
        }
      } catch (e: any) {
        setError(
          e.response?.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build a 5x5 cell map: cellMap[likelihood(1-5)][consequence(1-5)] = Risk[]
  const cellMap: Record<number, Record<number, HeatMapRisk[]>> = {};
  for (let l = 1; l <= 5; l++) {
    cellMap[l] = {};
    for (let c = 1; c <= 5; c++) {
      cellMap[l][c] = [];
    }
  }
  for (const risk of heatMapData.risks) {
    const l = LIKELIHOOD_MAP[risk.likelihood] ?? 0;
    const c = CONSEQUENCE_MAP[risk.consequence] ?? 0;
    if (l >= 1 && l <= 5 && c >= 1 && c <= 5) {
      cellMap[l][c].push(risk);
    }
  }

  // Top 5 risks by score
  const top5 = [...heatMapData.risks]
    .sort((a, b) => (b.inherentScore ?? 0) - (a.inherentScore ?? 0))
    .slice(0, 5);

  const kpis = [
    {
      label: 'Total Risks',
      value: stats.totalRisks,
      icon: AlertTriangle,
      colorClass: 'bg-gray-50 dark:bg-gray-800',
      iconClass: 'text-gray-600 dark:text-gray-400',
    },
    {
      label: 'Critical Risks',
      value: stats.criticalRisks,
      icon: ShieldAlert,
      colorClass:
        stats.criticalRisks > 0
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.criticalRisks > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      label: 'Exceeds Appetite',
      value: stats.exceedsAppetite,
      icon: Target,
      colorClass:
        stats.exceedsAppetite > 0
          ? 'bg-orange-50 dark:bg-orange-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.exceedsAppetite > 0 ? 'text-orange-600' : 'text-green-600',
    },
    {
      label: 'Overdue Reviews',
      value: stats.overdueReviews,
      icon: ClipboardCheck,
      colorClass:
        stats.overdueReviews > 0
          ? 'bg-amber-50 dark:bg-amber-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.overdueReviews > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      label: 'Overdue Actions',
      value: stats.overdueActions,
      icon: ListChecks,
      colorClass:
        stats.overdueActions > 0
          ? 'bg-amber-50 dark:bg-amber-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.overdueActions > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      label: 'KRI Breaches',
      value: stats.kriBreaches,
      icon: Activity,
      colorClass:
        stats.kriBreaches > 0
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.kriBreaches > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      label: 'KRI Warnings',
      value: stats.kriWarnings,
      icon: TrendingUp,
      colorClass:
        stats.kriWarnings > 0
          ? 'bg-amber-50 dark:bg-amber-900/20'
          : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.kriWarnings > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      label: 'New This Month',
      value: stats.newThisMonth,
      icon: Plus,
      colorClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconClass: 'text-blue-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Enterprise Risk Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 31000:2018 Risk Management Framework — Real-time Overview
            </p>
          </div>

          {/* Alert Banners */}
          {stats.criticalRisks > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {stats.criticalRisks} Critical Risk{stats.criticalRisks > 1 ? 's' : ''} Require Immediate Attention
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  Review and implement controls to bring residual risk within acceptable levels.
                </p>
              </div>
              <button
                onClick={() => router.push('/risks?level=CRITICAL')}
                className="ml-auto text-xs font-medium text-red-700 dark:text-red-300 hover:underline whitespace-nowrap"
              >
                View All
              </button>
            </div>
          )}

          {stats.overdueReviews > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  {stats.overdueReviews} Risk Review{stats.overdueReviews > 1 ? 's' : ''} Overdue
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Scheduled risk reviews have passed their due date and must be completed.
                </p>
              </div>
              <button
                onClick={() => router.push('/reviews')}
                className="ml-auto text-xs font-medium text-amber-700 dark:text-amber-300 hover:underline whitespace-nowrap"
              >
                View Reviews
              </button>
            </div>
          )}

          {stats.kriBreaches > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <Activity className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  {stats.kriBreaches} Key Risk Indicator{stats.kriBreaches > 1 ? 's' : ''} in Breach (RED)
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  KRI thresholds have been exceeded. Escalation and corrective action required.
                </p>
              </div>
              <button
                onClick={() => router.push('/kri')}
                className="ml-auto text-xs font-medium text-red-700 dark:text-red-300 hover:underline whitespace-nowrap"
              >
                View KRIs
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* KPI Cards — 8 in a row (2 rows of 4 on xl, 4 cols on md) */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-start gap-2">
                      <div className={`p-2 rounded-lg ${kpi.colorClass}`}>
                        <Icon className={`h-5 w-5 ${kpi.iconClass}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {kpi.value ?? 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                          {kpi.label}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Middle Row: Heat Map + Top 5 Risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Risk Heat Map */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Risk Heat Map
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Inherent risk — click a cell to see risks
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/heat-map')}
                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Full view <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex gap-2">
                  {/* Y-axis label */}
                  <div className="flex flex-col justify-center items-center w-5 shrink-0">
                    <span
                      className="text-xs text-gray-400 dark:text-gray-500 font-medium"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Likelihood
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* Y-axis row labels + grid */}
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((l) => (
                        <div key={l} className="flex gap-1 items-center">
                          <span className="text-xs text-gray-400 dark:text-gray-500 w-16 text-right pr-1 shrink-0">
                            {LIKELIHOOD_LABELS[l - 1]}
                          </span>
                          {[1, 2, 3, 4, 5].map((c) => {
                            const score = l * c;
                            const risks = cellMap[l][c];
                            const count = risks.length;
                            const isSelected =
                              selectedCell?.l === l && selectedCell?.c === c;
                            return (
                              <button
                                key={c}
                                onClick={() =>
                                  setSelectedCell(
                                    isSelected ? null : { l, c }
                                  )
                                }
                                className={`flex-1 h-10 rounded text-xs font-semibold transition-all ${getCellColor(score)} ${
                                  isSelected
                                    ? 'ring-2 ring-offset-1 ring-gray-700 dark:ring-gray-200 scale-105'
                                    : ''
                                } ${count === 0 ? 'opacity-50' : 'opacity-100'}`}
                                title={`${getCellLabel(score)} — Score ${score} (${LIKELIHOOD_LABELS[l - 1]} × ${CONSEQUENCE_LABELS[c - 1]})`}
                              >
                                {count > 0 ? count : ''}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-1 mt-1 ml-[4.5rem]">
                      {CONSEQUENCE_LABELS.map((label) => (
                        <span
                          key={label}
                          className="flex-1 text-center text-xs text-gray-400 dark:text-gray-500 truncate"
                          title={label}
                        >
                          {label.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Consequence
                    </p>
                  </div>
                </div>

                {/* Selected cell detail */}
                {selectedCell && cellMap[selectedCell.l][selectedCell.c].length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {LIKELIHOOD_LABELS[selectedCell.l - 1]} × {CONSEQUENCE_LABELS[selectedCell.c - 1]} — Score {selectedCell.l * selectedCell.c}
                    </p>
                    <ul className="space-y-1">
                      {cellMap[selectedCell.l][selectedCell.c].map((r) => (
                        <li key={r.id}>
                          <button
                            onClick={() => router.push(`/risks/${r.id}`)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline text-left"
                          >
                            {r.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  {[
                    { label: 'Very Low (1-3)', cls: 'bg-green-400' },
                    { label: 'Low (4-6)', cls: 'bg-yellow-300' },
                    { label: 'Medium (8-12)', cls: 'bg-amber-400' },
                    { label: 'High (15-19)', cls: 'bg-orange-500' },
                    { label: 'Critical (20-25)', cls: 'bg-red-600' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-sm ${item.cls}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Risks */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Top 5 Risks by Score
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Highest inherent risk scores across the register
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/risks')}
                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Full register <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {top5.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <AlertTriangle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No risks in register yet.
                    </p>
                    <button
                      onClick={() => router.push('/risks/new')}
                      className="mt-3 flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add First Risk
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {top5.map((risk, idx) => {
                      const level = getRiskLevelFromScore(risk.inherentScore ?? 0);
                      return (
                        <button
                          key={risk.id}
                          onClick={() => router.push(`/risks/${risk.id}`)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left group"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {risk.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Score: {risk.inherentScore ?? 0}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getRiskLevelBadge(level)}`}
                          >
                            {level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Risk by Category + Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Risk by Category */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Risk by Category
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Distribution across ISO 31000 risk categories
                    </p>
                  </div>
                </div>

                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No categorised risks yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {[...categories]
                      .sort((a, b) => b.count - a.count)
                      .map(({ category, count }) => {
                        const max = Math.max(...categories.map((c) => c.count), 1);
                        const pct = Math.round((count / max) * 100);
                        return (
                          <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {formatCategory(category)}
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-red-500 dark:bg-red-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  {[
                    {
                      label: 'New Risk',
                      href: '/risks/new',
                      icon: Plus,
                      description: 'Add to register',
                    },
                    {
                      label: 'Risk Reviews',
                      href: '/reviews',
                      icon: ClipboardCheck,
                      description: 'Scheduled & overdue',
                    },
                    {
                      label: 'KRI Dashboard',
                      href: '/kri',
                      icon: Activity,
                      description: 'Monitor indicators',
                    },
                    {
                      label: 'Risk Actions',
                      href: '/actions',
                      icon: ListChecks,
                      description: 'Treatment tasks',
                    },
                    {
                      label: 'Risk Appetite',
                      href: '/appetite',
                      icon: Target,
                      description: 'Tolerance thresholds',
                    },
                    {
                      label: 'Analytics',
                      href: '/analytics',
                      icon: TrendingUp,
                      description: 'Trends & reporting',
                    },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => router.push(action.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-left"
                      >
                        <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                          <Icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                            {action.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 ml-auto group-hover:text-red-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Footer */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-6">
            <span>
              Avg. Residual Score:{' '}
              <strong className="text-gray-700 dark:text-gray-300">{stats.avgRiskScore ?? 0}</strong>
            </span>
            <span>
              Open CAPAs:{' '}
              <strong className="text-gray-700 dark:text-gray-300">{stats.openCapas ?? 0}</strong>
            </span>
            <span>
              Pending Reviews:{' '}
              <strong className="text-gray-700 dark:text-gray-300">{stats.pendingReviews ?? 0}</strong>
            </span>
            <span className="ml-auto text-xs">
              ISO 31000:2018 — Risk Management Framework
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
