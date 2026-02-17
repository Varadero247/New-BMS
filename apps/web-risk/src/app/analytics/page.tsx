'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  BarChart3, AlertTriangle, TrendingUp, Activity,
  Target, RefreshCw, Layers, Package,
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface HeatmapCell {
  likelihood: number;
  consequence: number;
  count: number;
  risks: { id: string; title: string; ref: string; level: string }[];
}

interface TopRisk {
  id: string;
  referenceNumber: string;
  title: string;
  residualScore: number;
  residualRiskLevel: string;
  category: string;
  ownerName?: string;
}

interface RecentlyChanged {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  residualRiskLevel: string;
  updatedAt: string;
}

interface ModuleBreakdown {
  module: string;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

interface AnalyticsDashboard {
  totalRisks: number;
  byStatus: Record<string, number>;
  byLevel: Record<string, number>;
  byCategory: CategoryBreakdown[];
  exceedsAppetite: number;
  overdueReview: number;
  overdueActions: number;
  kriBreaches: number;
  kriWarnings: number;
  heatmapData: HeatmapCell[];
  topRisks: TopRisk[];
  recentlyChanged: RecentlyChanged[];
  moduleBreakdown: ModuleBreakdown[];
  newThisMonth: number;
}

function getCellColor(l: number, c: number): string {
  const score = l * c;
  if (score >= 15) return 'bg-red-500';
  if (score >= 10) return 'bg-orange-400';
  if (score >= 5) return 'bg-yellow-400';
  return 'bg-green-400';
}

function getCellTextColor(l: number, c: number): string {
  const score = l * c;
  if (score >= 5) return 'text-white';
  return 'text-gray-800';
}

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  VERY_HIGH: 'bg-orange-400',
  HIGH: 'bg-yellow-400',
  MEDIUM: 'bg-blue-400',
  LOW: 'bg-green-400',
};

const LEVEL_TEXT: Record<string, string> = {
  CRITICAL: 'text-red-700 dark:text-red-300',
  VERY_HIGH: 'text-orange-700 dark:text-orange-300',
  HIGH: 'text-yellow-700 dark:text-yellow-300',
  MEDIUM: 'text-blue-700 dark:text-blue-300',
  LOW: 'text-green-700 dark:text-green-300',
};

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
  '#10B981', '#0EA5E9', '#D946EF', '#84CC16', '#FB923C',
];

const LIKELIHOOD_LABELS = ['', 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
const CONSEQUENCE_LABELS = ['', 'Insignif.', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

function StatusBreakdown({ byStatus }: { byStatus: Record<string, number> }) {
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const statuses = [
    { key: 'IDENTIFIED', color: 'bg-blue-400', label: 'Identified' },
    { key: 'ASSESSED', color: 'bg-purple-400', label: 'Assessed' },
    { key: 'TREATING', color: 'bg-yellow-400', label: 'Treating' },
    { key: 'MONITORING', color: 'bg-teal-400', label: 'Monitoring' },
    { key: 'CLOSED', color: 'bg-green-400', label: 'Closed' },
  ];
  return (
    <div className="space-y-2 mt-3">
      {statuses.map(s => {
        const count = byStatus[s.key] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={s.key}>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
              <span>{s.label}</span>
              <span className="font-medium">{count} ({pct}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryDonut({ byCategory }: { byCategory: CategoryBreakdown[] }) {
  const total = byCategory.reduce((a, b) => a + b.count, 0);
  if (total === 0) return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No data</p>;

  const sorted = [...byCategory].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="mt-3 space-y-2">
      {sorted.map((cat, idx) => {
        const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
        return (
          <div key={cat.category} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {cat.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 shrink-0">{cat.count}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
              </div>
            </div>
          </div>
        );
      })}
      {byCategory.length > 8 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-right">+{byCategory.length - 8} more categories</p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const r = await api.get('/risks/analytics/dashboard');
      setData(r.data.data || null);
    } catch (e: unknown) {
      setError(e.response?.status === 401 ? 'Session expired. Please log in.' : 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Enterprise risk portfolio analytics — ISO 31000</p>
            </div>
            <button onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
              </div>
            </div>
          ) : data ? (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Risks', value: data.totalRisks, icon: AlertTriangle, color: 'red', sub: `${data.newThisMonth} new this month` },
                  { label: 'Exceeds Appetite', value: data.exceedsAppetite, icon: Target, color: 'orange', sub: 'Above tolerance' },
                  { label: 'KRI Breaches', value: data.kriBreaches, icon: Activity, color: 'red', sub: `${data.kriWarnings} warnings` },
                  { label: 'Overdue Actions', value: data.overdueActions, icon: TrendingUp, color: 'yellow', sub: `${data.overdueReview} reviews overdue` },
                ].map(kpi => {
                  const Icon = kpi.icon;
                  return (
                    <Card key={kpi.label} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{kpi.value}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{kpi.sub}</p>
                          </div>
                          <div className={`p-3 bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20 rounded-xl`}>
                            <Icon className={`h-6 w-6 text-${kpi.color}-500`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 5x5 Heatmap */}
                <Card className="lg:col-span-2">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-red-500" />
                      Residual Risk Heat Map (5x5)
                    </h3>
                    <div className="flex">
                      <div className="flex items-center justify-center pr-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          LIKELIHOOD
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
                          <div />
                          {[1, 2, 3, 4, 5].map(c => (
                            <div key={c} className="text-center text-xs text-gray-400 dark:text-gray-500 pb-1 font-medium">
                              {CONSEQUENCE_LABELS[c]}
                            </div>
                          ))}
                          {[5, 4, 3, 2, 1].map(l => (
                            <>
                              <div key={`label-${l}`} className="flex items-center justify-end pr-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {LIKELIHOOD_LABELS[l]}
                              </div>
                              {[1, 2, 3, 4, 5].map(c => {
                                const cell = data.heatmapData?.find(h => h.likelihood === l && h.consequence === c);
                                const count = cell?.count || 0;
                                return (
                                  <div key={`${l}-${c}`}
                                    className={`${getCellColor(l, c)} ${getCellTextColor(l, c)} rounded p-1 min-h-[44px] flex flex-col items-center justify-center text-center relative cursor-pointer hover:opacity-90 transition-opacity`}
                                    title={cell?.risks?.map(r => r.title).join(', ') || `Score: ${l * c}`}>
                                    <span className="text-xs font-bold">{l * c}</span>
                                    {count > 0 && (
                                      <span className="absolute top-0.5 right-0.5 bg-white/80 text-gray-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold leading-none">
                                        {count}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          ))}
                        </div>
                        <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">CONSEQUENCE</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4 justify-center text-xs">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Low (1-4)</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Medium (5-9)</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded" /><span className="text-gray-600 dark:text-gray-400">High (10-14)</span></div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /><span className="text-gray-600 dark:text-gray-400">Critical (15+)</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Donut */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-blue-500" />
                      By Category
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Distribution across risk categories</p>
                    <CategoryDonut byCategory={data.byCategory} />
                  </CardContent>
                </Card>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Status Breakdown */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">By Status</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Risk lifecycle stage distribution</p>
                    <StatusBreakdown byStatus={data.byStatus} />
                  </CardContent>
                </Card>

                {/* Level Breakdown */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">By Risk Level</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Residual risk level distribution</p>
                    <div className="mt-3 space-y-2">
                      {['CRITICAL', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                        const count = data.byLevel[level] || 0;
                        const total = Object.values(data.byLevel).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={level}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className={LEVEL_TEXT[level] || 'text-gray-600 dark:text-gray-400'}>{level.replace(/_/g, ' ')}</span>
                              <span className="text-gray-500 dark:text-gray-400 font-medium">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${LEVEL_COLORS[level] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Module Breakdown */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-500" />
                      By Source Module
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Origin of risk entries</p>
                    <div className="mt-3 space-y-2">
                      {(data.moduleBreakdown || []).length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No module data</p>
                      ) : (
                        (data.moduleBreakdown || [])
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 7)
                          .map((mod, idx) => (
                            <div key={mod.module || idx} className="flex items-center justify-between">
                              <span className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                                {(mod.module || 'Unknown').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                              </span>
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100 ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                {mod.count}
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Top 5 Risks by Residual Score
                    </h3>
                    {(data.topRisks || []).length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No data available</p>
                    ) : (
                      <div className="space-y-3">
                        {data.topRisks.map((risk, idx) => (
                          <Link key={risk.id} href={`/risks/${risk.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <span className="text-xl font-bold text-gray-300 dark:text-gray-600 w-6 text-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{risk.referenceNumber}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-opacity-20 ${LEVEL_TEXT[risk.residualRiskLevel] || ''}`}>
                                  {risk.residualRiskLevel}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{risk.title}</p>
                              {risk.ownerName && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{risk.ownerName}</p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={`text-2xl font-bold ${LEVEL_TEXT[risk.residualRiskLevel] || 'text-gray-700 dark:text-gray-300'}`}>
                                {risk.residualScore}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">/25</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recently Changed */}
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Recently Changed
                    </h3>
                    {(data.recentlyChanged || []).length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No recent changes</p>
                    ) : (
                      <div className="space-y-2">
                        {data.recentlyChanged.slice(0, 8).map(risk => (
                          <Link key={risk.id} href={`/risks/${risk.id}`}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${LEVEL_COLORS[risk.residualRiskLevel] || 'bg-gray-400'}`} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                  {risk.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{risk.referenceNumber}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                {risk.status.replace(/_/g, ' ')}
                              </span>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {new Date(risk.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No analytics data available</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add risks to the register to see analytics</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
