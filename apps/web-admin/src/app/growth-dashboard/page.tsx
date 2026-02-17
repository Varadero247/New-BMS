'use client';

import { useState, useEffect, useCallback, type ElementType } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CalendarClock,
  RefreshCw,
  BarChart3,
  PieChart,
  Heart,
  Target,
} from 'lucide-react';

interface GrowthMetrics {
  revenue: {
    mrr: number;
    arr: number;
    newMrr: number;
    churnedMrr: number;
  };
  pipeline: {
    stages: { name: string; value: number; count: number }[];
    totalValue: number;
    weightedValue: number;
  };
  leadSources: { source: string; count: number; value: number; percentage: number }[];
  partnerLeaderboard: { name: string; referrals: number; revenue: number; conversionRate: number }[];
  customerHealth: {
    healthy: number;
    atRisk: number;
    critical: number;
    bottomTen: { name: string; score: number; reason: string; mrr: number }[];
  };
  renewals: { name: string; renewalDate: string; mrr: number; riskLevel: string; action: string }[];
}

interface SnapshotRow {
  id: string;
  month: string;
  monthNumber: number;
  mrr: number;
  customers: number;
  founderSalary: number;
  founderLoanPayment: number;
  founderDividend: number;
  founderTotalIncome: number;
  founderDirLoanPayment: number;
  founderDirLoanBalance: number;
  founderStarterLoanPayment: number;
  founderStarterLoanBalance: number;
  trajectory: string | null;
}

interface PlanTargetRow {
  month: string;
  monthNumber: number;
  plannedMrr: number;
  plannedCustomers: number;
  revisedMrr: number | null;
  revisedCustomers: number | null;
}

const EMPTY_METRICS: GrowthMetrics = {
  revenue: { mrr: 0, arr: 0, newMrr: 0, churnedMrr: 0 },
  pipeline: { stages: [], totalValue: 0, weightedValue: 0 },
  leadSources: [],
  partnerLeaderboard: [],
  customerHealth: { healthy: 0, atRisk: 0, critical: 0, bottomTen: [] },
  renewals: [],
};

export default function GrowthDashboardPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'plan-vs-actual'>('current');
  const [metrics, setMetrics] = useState<GrowthMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [planTargets, setPlanTargets] = useState<PlanTargetRow[]>([]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await api.get('/api/marketing/growth/metrics');
      setMetrics(response.data.data || EMPTY_METRICS);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('Failed to load growth metrics. The API may not be available yet.');
      // Use demo data if API not available
      setMetrics({
        revenue: { mrr: 0, arr: 0, newMrr: 0, churnedMrr: 0 },
        pipeline: {
          stages: [
            { name: 'Discovery', value: 45000, count: 12 },
            { name: 'Qualified', value: 78000, count: 8 },
            { name: 'Proposal', value: 62000, count: 5 },
            { name: 'Negotiation', value: 34000, count: 3 },
            { name: 'Closed Won', value: 28000, count: 2 },
          ],
          totalValue: 247000,
          weightedValue: 124000,
        },
        leadSources: [],
        partnerLeaderboard: [],
        customerHealth: { healthy: 0, atRisk: 0, critical: 0, bottomTen: [] },
        renewals: [],
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlanData = useCallback(async () => {
    try {
      const res = await api.get('/api/analytics/monthly-review?limit=36');
      const snaps: SnapshotRow[] = res.data.data?.snapshots || [];
      setSnapshots(snaps);

      // Load plan targets from each snapshot's detail endpoint
      const targets: PlanTargetRow[] = [];
      for (const snap of snaps.slice(0, 12)) {
        try {
          const detail = await api.get(`/api/analytics/monthly-review/${snap.id}`);
          if (detail.data.data?.planTarget) {
            targets.push(detail.data.data.planTarget);
          }
        } catch { /* skip */ }
      }
      setPlanTargets(targets);
    } catch {
      // API may not be available
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  useEffect(() => {
    if (activeTab === 'plan-vs-actual') {
      fetchPlanData();
    }
  }, [activeTab, fetchPlanData]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const maxPipelineValue = Math.max(...(metrics.pipeline.stages.map((s) => s.value) || [1]));

  const totalCustomers = metrics.customerHealth.healthy + metrics.customerHealth.atRisk + metrics.customerHealth.critical;

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Growth Dashboard</h1>
            <p className="text-gray-400 dark:text-gray-500 mt-1">Founder overview of key growth metrics</p>
          </div>
          <div className="flex items-center gap-4">
            {lastUpdated && (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchMetrics}
              className="p-2 bg-[#112240] border border-[#1B3A6B]/30 rounded-lg text-gray-400 dark:text-gray-500 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-8 bg-[#112240] rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'current' ? 'bg-[#1B3A6B] text-white' : 'text-gray-400 dark:text-gray-500 hover:text-white'
            }`}
          >
            Current Metrics
          </button>
          <button
            onClick={() => setActiveTab('plan-vs-actual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'plan-vs-actual' ? 'bg-[#1B3A6B] text-white' : 'text-gray-400 dark:text-gray-500 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            Plan vs Actual
          </button>
        </div>

        {activeTab === 'plan-vs-actual' ? (
          <PlanVsActualTab snapshots={snapshots} planTargets={planTargets} />
        ) : (
        <>
        {error && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Section 1: Revenue Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Revenue Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Monthly Recurring Revenue"
              value={formatCurrency(metrics.revenue.mrr)}
              icon={DollarSign}
              color="text-blue-400"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              label="Annual Recurring Revenue"
              value={formatCurrency(metrics.revenue.arr)}
              icon={TrendingUp}
              color="text-green-400"
              bgColor="bg-green-500/10"
            />
            <StatCard
              label="New MRR"
              value={formatCurrency(metrics.revenue.newMrr)}
              icon={TrendingUp}
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
              subtitle="This month"
            />
            <StatCard
              label="Churned MRR"
              value={formatCurrency(metrics.revenue.churnedMrr)}
              icon={TrendingDown}
              color="text-red-400"
              bgColor="bg-red-500/10"
              subtitle="This month"
            />
          </div>
        </div>

        {/* Section 2: Pipeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Pipeline
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">Pipeline by Stage</h3>
              {metrics.pipeline.stages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pipeline data available</p>
              ) : (
                <div className="space-y-4">
                  {metrics.pipeline.stages.map((stage) => (
                    <div key={stage.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">{stage.name}</span>
                        <span className="text-sm text-white font-medium">
                          {formatCurrency(stage.value)} ({stage.count})
                        </span>
                      </div>
                      <div className="w-full bg-[#080B12] rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-[#1B3A6B] to-blue-400 transition-all"
                          style={{ width: `${(stage.value / maxPipelineValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Total Pipeline</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(metrics.pipeline.totalValue)}</p>
              </div>
              <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Weighted Pipeline</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(metrics.pipeline.weightedValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Lead Sources */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-400" />
            Lead Sources
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart (div-based) */}
            <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">Source Breakdown</h3>
              {metrics.leadSources.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No lead source data available</p>
              ) : (
                <div className="space-y-3">
                  {metrics.leadSources.map((source, i) => {
                    const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];
                    return (
                      <div key={source.source} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                        <span className="text-gray-300 text-sm flex-1">{source.source}</span>
                        <div className="w-32 bg-[#080B12] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[i % colors.length]}`}
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span className="text-white text-sm font-medium w-12 text-right">{source.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Table */}
            <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">Source Details</h3>
              {metrics.leadSources.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data</p>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1B3A6B]/30">
                      <th className="text-left py-2 text-gray-400 dark:text-gray-500 font-medium">Source</th>
                      <th className="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">Leads</th>
                      <th className="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.leadSources.map((source) => (
                      <tr key={source.source} className="border-b border-[#1B3A6B]/10">
                        <td className="py-2 text-gray-300">{source.source}</td>
                        <td className="py-2 text-white text-right">{source.count}</td>
                        <td className="py-2 text-white text-right">{formatCurrency(source.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Partner Leaderboard */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Partner Leaderboard
          </h2>
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
            {metrics.partnerLeaderboard.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No partner data available</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1B3A6B]/30">
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Partner</th>
                    <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Referrals</th>
                    <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.partnerLeaderboard.slice(0, 10).map((partner, i) => (
                    <tr key={partner.name} className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10">
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          i === 1 ? 'bg-gray-400/20 text-gray-300' :
                          i === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-[#1B3A6B]/20 text-gray-400'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{partner.name}</td>
                      <td className="py-3 px-4 text-gray-300 text-right">{partner.referrals}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCurrency(partner.revenue)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={partner.conversionRate >= 50 ? 'text-green-400' : partner.conversionRate >= 25 ? 'text-yellow-400' : 'text-red-400'}>
                          {partner.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Customer Health */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-400" />
            Customer Health
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart (div-based) */}
            <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4">Health Distribution</h3>
              {totalCustomers === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No customer data</p>
              ) : (
                <>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {(() => {
                        const healthyPct = (metrics.customerHealth.healthy / totalCustomers) * 100;
                        const atRiskPct = (metrics.customerHealth.atRisk / totalCustomers) * 100;
                        const criticalPct = (metrics.customerHealth.critical / totalCustomers) * 100;
                        const circumference = 2 * Math.PI * 40;
                        return (
                          <>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12"
                              strokeDasharray={`${(healthyPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset="0" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="12"
                              strokeDasharray={`${(atRiskPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset={`${-(healthyPct / 100) * circumference}`} />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12"
                              strokeDasharray={`${(criticalPct / 100) * circumference} ${circumference}`}
                              strokeDashoffset={`${-((healthyPct + atRiskPct) / 100) * circumference}`} />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{totalCustomers}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <HealthRow label="Healthy" count={metrics.customerHealth.healthy} color="bg-green-500" />
                    <HealthRow label="At Risk" count={metrics.customerHealth.atRisk} color="bg-yellow-500" />
                    <HealthRow label="Critical" count={metrics.customerHealth.critical} color="bg-red-500" />
                  </div>
                </>
              )}
            </div>

            {/* Bottom 10 List */}
            <div className="lg:col-span-2 bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
              <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Bottom 10 Accounts
              </h3>
              {metrics.customerHealth.bottomTen.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No at-risk accounts</p>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1B3A6B]/30">
                      <th className="text-left py-2 text-gray-400 dark:text-gray-500 font-medium">Customer</th>
                      <th className="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">Health Score</th>
                      <th className="text-left py-2 text-gray-400 dark:text-gray-500 font-medium">Reason</th>
                      <th className="text-right py-2 text-gray-400 dark:text-gray-500 font-medium">MRR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.customerHealth.bottomTen.map((customer) => (
                      <tr key={customer.name} className="border-b border-[#1B3A6B]/10">
                        <td className="py-2 text-white">{customer.name}</td>
                        <td className="py-2 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            customer.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {customer.score}
                          </span>
                        </td>
                        <td className="py-2 text-gray-400 dark:text-gray-500">{customer.reason}</td>
                        <td className="py-2 text-white text-right">{formatCurrency(customer.mrr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 6: Upcoming Renewals */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-400" />
            Upcoming Renewals & Actions
          </h2>
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
            {metrics.renewals.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming renewals</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1B3A6B]/30">
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Renewal Date</th>
                    <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">MRR</th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Risk</th>
                    <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.renewals.map((renewal) => (
                    <tr key={renewal.name} className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10">
                      <td className="py-3 px-4 text-white font-medium">{renewal.name}</td>
                      <td className="py-3 px-4 text-gray-300">{new Date(renewal.renewalDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-white text-right">{formatCurrency(renewal.mrr)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          renewal.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                          renewal.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {renewal.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{renewal.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plan vs Actual Tab
// ---------------------------------------------------------------------------
function PlanVsActualTab({ snapshots, planTargets }: { snapshots: SnapshotRow[]; planTargets: PlanTargetRow[] }) {
  const fmt = (v: number) => `£${Number(v || 0).toLocaleString()}`;
  const sorted = [...snapshots].sort((a, b) => a.monthNumber - b.monthNumber);

  // Build combined rows: plan targets + actuals
  const allMonths = new Map<string, { month: string; monthNumber: number; plannedMrr: number; actualMrr: number; plannedCust: number; actualCust: number; revisedMrr: number | null; trajectory: string | null; salary: number; loan: number; dividend: number; total: number; dirLoan: number; dirLoanBal: number; starterLoan: number; starterLoanBal: number }>();

  for (const t of planTargets) {
    allMonths.set(t.month, {
      month: t.month,
      monthNumber: t.monthNumber,
      plannedMrr: Number(t.plannedMrr),
      actualMrr: 0,
      plannedCust: t.plannedCustomers,
      actualCust: 0,
      revisedMrr: t.revisedMrr ? Number(t.revisedMrr) : null,
      trajectory: null,
      salary: 0, loan: 0, dividend: 0, total: 0,
      dirLoan: 0, dirLoanBal: 0, starterLoan: 0, starterLoanBal: 0,
    });
  }

  for (const s of sorted) {
    const existing = allMonths.get(s.month);
    if (existing) {
      existing.actualMrr = Number(s.mrr);
      existing.actualCust = s.customers;
      existing.trajectory = s.trajectory;
      existing.salary = Number(s.founderSalary);
      existing.loan = Number(s.founderLoanPayment);
      existing.dividend = Number(s.founderDividend);
      existing.total = Number(s.founderTotalIncome);
      existing.dirLoan = Number(s.founderDirLoanPayment || 0);
      existing.dirLoanBal = Number(s.founderDirLoanBalance || 0);
      existing.starterLoan = Number(s.founderStarterLoanPayment || 0);
      existing.starterLoanBal = Number(s.founderStarterLoanBalance || 0);
    } else {
      allMonths.set(s.month, {
        month: s.month,
        monthNumber: s.monthNumber,
        plannedMrr: 0,
        actualMrr: Number(s.mrr),
        plannedCust: 0,
        actualCust: s.customers,
        revisedMrr: null,
        trajectory: s.trajectory,
        salary: Number(s.founderSalary),
        loan: Number(s.founderLoanPayment),
        dividend: Number(s.founderDividend),
        total: Number(s.founderTotalIncome),
        dirLoan: Number(s.founderDirLoanPayment || 0),
        dirLoanBal: Number(s.founderDirLoanBalance || 0),
        starterLoan: Number(s.founderStarterLoanPayment || 0),
        starterLoanBal: Number(s.founderStarterLoanBalance || 0),
      });
    }
  }

  const rows = Array.from(allMonths.values()).sort((a, b) => a.monthNumber - b.monthNumber);

  const ragColor = (actual: number, planned: number) => {
    if (planned === 0) return 'text-gray-400';
    const ratio = actual / planned;
    if (ratio >= 1.0) return 'text-green-400';
    if (ratio >= 0.85) return 'text-yellow-400';
    return 'text-red-400';
  };

  // MRR bar chart (SVG-based)
  const maxMrr = Math.max(...rows.map(r => Math.max(r.plannedMrr, r.actualMrr, 1)));
  const chartHeight = 200;
  const barWidth = rows.length > 0 ? Math.min(20, 600 / rows.length / 2.5) : 20;

  // Find latest snapshot with loan data
  const latestWithLoans = rows.filter(r => r.dirLoan > 0 || r.starterLoan > 0).slice(-1)[0];
  const dirLoanProgress = latestWithLoans ? ((320000 - latestWithLoans.dirLoanBal) / 320000) * 100 : 0;
  const starterLoanProgress = latestWithLoans ? ((30000 - latestWithLoans.starterLoanBal) / 30000) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Dual Loan Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">Director&apos;s Loan (£320K / 8% / 36mo)</h3>
            <span className="text-white font-semibold text-sm">{dirLoanProgress.toFixed(1)}% repaid</span>
          </div>
          <div className="w-full bg-[#080B12] rounded-full h-3 mb-2">
            <div className="h-3 rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${Math.min(dirLoanProgress, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Balance: {fmt(latestWithLoans?.dirLoanBal || 320000)}</span>
            <span>Payment: {fmt(latestWithLoans?.dirLoan || 0)}/mo</span>
          </div>
        </div>
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">Starter Capital Loan (£30K / 8% / 24mo)</h3>
            <span className="text-white font-semibold text-sm">{starterLoanProgress.toFixed(1)}% repaid</span>
          </div>
          <div className="w-full bg-[#080B12] rounded-full h-3 mb-2">
            <div className="h-3 rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all" style={{ width: `${Math.min(starterLoanProgress, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Balance: {fmt(latestWithLoans?.starterLoanBal || 30000)}</span>
            <span>Payment: {fmt(latestWithLoans?.starterLoan || 0)}/mo</span>
          </div>
        </div>
      </div>

      {/* MRR Chart */}
      <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Plan MRR vs Actual MRR</h2>
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500/50 inline-block" /> Plan</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Actual</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cyan-400 border border-dashed border-cyan-400 inline-block" /> Revised</span>
        </div>
        {rows.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data available. Seed plan targets and trigger a snapshot first.</p>
        ) : (
          <div className="overflow-x-auto">
            <svg width={Math.max(rows.length * (barWidth * 2.5 + 8), 600)} height={chartHeight + 40} className="text-gray-400 dark:text-gray-500">
              {rows.map((r, i) => {
                const x = i * (barWidth * 2.5 + 8) + 20;
                const planH = (r.plannedMrr / maxMrr) * chartHeight;
                const actualH = (r.actualMrr / maxMrr) * chartHeight;
                return (
                  <g key={r.month}>
                    <rect x={x} y={chartHeight - planH} width={barWidth} height={planH} fill="rgba(59,130,246,0.3)" rx={2} />
                    <rect x={x + barWidth + 2} y={chartHeight - actualH} width={barWidth} height={actualH} fill="rgb(96,165,250)" rx={2} />
                    {r.revisedMrr && (
                      <line
                        x1={x - 2} x2={x + barWidth * 2 + 4}
                        y1={chartHeight - (r.revisedMrr / maxMrr) * chartHeight}
                        y2={chartHeight - (r.revisedMrr / maxMrr) * chartHeight}
                        stroke="rgb(34,211,238)" strokeWidth={2} strokeDasharray="4 2"
                      />
                    )}
                    <text x={x + barWidth} y={chartHeight + 16} textAnchor="middle" fill="currentColor" fontSize={9}>
                      M{r.monthNumber}
                    </text>
                  </g>
                );
              })}
              <line x1={18} x2={rows.length * (barWidth * 2.5 + 8) + 20} y1={chartHeight} y2={chartHeight} stroke="currentColor" strokeWidth={0.5} />
            </svg>
          </div>
        )}
      </div>

      {/* Founder Income Stacked Bar Chart */}
      {sorted.length > 0 && (
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Founder Monthly Income</h2>
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Salary</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Dir Loan</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Starter Loan</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Dividend</span>
          </div>
          <div className="overflow-x-auto">
            {(() => {
              const incomeRows = rows.filter(r => r.salary > 0 || r.total !== 0);
              const maxIncome = Math.max(...incomeRows.map(r => r.salary + r.dividend), 1);
              const bw = Math.min(30, 600 / Math.max(incomeRows.length, 1) / 1.5);
              return (
                <svg width={Math.max(incomeRows.length * (bw + 12) + 40, 600)} height={chartHeight + 40} className="text-gray-400 dark:text-gray-500">
                  {incomeRows.map((r, i) => {
                    const x = i * (bw + 12) + 20;
                    const salaryH = (r.salary / maxIncome) * chartHeight;
                    const dividendH = (r.dividend / maxIncome) * chartHeight;
                    const dirH = (r.dirLoan / maxIncome) * chartHeight;
                    const starterH = (r.starterLoan / maxIncome) * chartHeight;
                    return (
                      <g key={r.month}>
                        <rect x={x} y={chartHeight - salaryH} width={bw} height={salaryH} fill="rgb(96,165,250)" rx={2} />
                        <rect x={x} y={chartHeight - salaryH - dividendH} width={bw} height={dividendH} fill="rgb(74,222,128)" rx={2} />
                        <rect x={x} y={chartHeight + 2} width={bw} height={Math.min(dirH, 16)} fill="rgb(239,68,68)" rx={2} />
                        <rect x={x} y={chartHeight + 2 + Math.min(dirH, 16) + 1} width={bw} height={Math.min(starterH, 10)} fill="rgb(251,146,60)" rx={2} />
                        <text x={x + bw / 2} y={chartHeight + 38} textAnchor="middle" fill="currentColor" fontSize={9}>
                          M{r.monthNumber}
                        </text>
                      </g>
                    );
                  })}
                  <line x1={18} x2={incomeRows.length * (bw + 12) + 40} y1={chartHeight} y2={chartHeight} stroke="currentColor" strokeWidth={0.5} />
                </svg>
              );
            })()}
          </div>
        </div>
      )}

      {/* Summary Table with RAG */}
      <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Plan vs Actual Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1B3A6B]/30">
                <th className="text-left py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Month</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Plan MRR</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Actual MRR</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Revised*</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Plan Cust</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Actual Cust</th>
                <th className="text-right py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Net Income</th>
                <th className="text-center py-2 px-3 text-gray-400 dark:text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10">
                  <td className="py-2 px-3 text-white font-medium">
                    {new Date(r.month + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                    <span className="text-gray-500 dark:text-gray-400 text-xs ml-1">M{r.monthNumber}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-400 dark:text-gray-500 text-right">{fmt(r.plannedMrr)}</td>
                  <td className={`py-2 px-3 text-right font-medium ${ragColor(r.actualMrr, r.plannedMrr)}`}>{r.actualMrr > 0 ? fmt(r.actualMrr) : '—'}</td>
                  <td className="py-2 px-3 text-cyan-400 text-right">{r.revisedMrr ? `${fmt(r.revisedMrr)}*` : '—'}</td>
                  <td className="py-2 px-3 text-gray-400 dark:text-gray-500 text-right">{r.plannedCust}</td>
                  <td className={`py-2 px-3 text-right font-medium ${ragColor(r.actualCust, r.plannedCust)}`}>{r.actualCust > 0 ? r.actualCust : '—'}</td>
                  <td className="py-2 px-3 text-blue-400 text-right">{r.total !== 0 ? fmt(r.total) : '—'}</td>
                  <td className="py-2 px-3 text-center">
                    {r.trajectory ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        r.trajectory === 'AHEAD' ? 'bg-green-500/20 text-green-400' :
                        r.trajectory === 'ON_TRACK' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {r.trajectory.replace('_', ' ')}
                      </span>
                    ) : r.actualMrr > 0 ? (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">—</span>
                    ) : (
                      <span className="text-gray-600 text-xs">Future</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-3">* Revised targets are flagged with an asterisk, indicating recalibrated values.</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bgColor, subtitle }: {
  label: string; value: string; icon: ElementType; color: string; bgColor: string; subtitle?: string;
}) {
  return (
    <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 dark:text-gray-500 text-sm">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

function HealthRow({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-gray-300 text-sm">{label}</span>
      </div>
      <span className="text-white text-sm font-medium">{count}</span>
    </div>
  );
}
