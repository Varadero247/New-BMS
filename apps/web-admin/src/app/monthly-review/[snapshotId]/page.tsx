'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import {
  ArrowLeft,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

interface Snapshot {
  id: string;
  month: string;
  monthNumber: number;
  mrr: number;
  arr: number;
  newMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  mrrGrowthPct: number;
  revenueChurnPct: number;
  customers: number;
  newCustomers: number;
  churnedCustomers: number;
  arpu: number;
  ltv: number;
  pipelineValue: number;
  pipelineDeals: number;
  wonDeals: number;
  lostDeals: number;
  avgDealSize: number;
  winRate: number;
  newLeads: number;
  qualifiedLeads: number;
  activeTrials: number;
  trialConversions: number;
  trialConversionPct: number;
  avgHealthScore: number;
  activePartners: number;
  partnerRevenue: number;
  founderSalary: number;
  founderLoanPayment: number;
  founderDividend: number;
  founderSavings: number;
  founderTotalIncome: number;
  aiSummary: string | null;
  aiAlerts: string[] | null;
  aiRecommendations: any[] | null;
  trajectory: string | null;
  targetsApproved: boolean;
  approvedAt: string | null;
}

interface PlanTarget {
  plannedMrr: number;
  plannedCustomers: number;
  plannedNewCustomers: number;
  plannedChurnPct: number;
  plannedArpu: number;
  revisedMrr: number | null;
  revisedCustomers: number | null;
}

export default function SnapshotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const snapshotId = params.snapshotId as string;

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [planTarget, setPlanTarget] = useState<PlanTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [overrideMrr, setOverrideMrr] = useState('');
  const [overrideCustomers, setOverrideCustomers] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/analytics/monthly-review/${snapshotId}`);
        setSnapshot(res.data.data?.snapshot || null);
        setPlanTarget(res.data.data?.planTarget || null);
      } catch {
        // API may not be available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [snapshotId]);

  const handleApprove = async (action: 'approve' | 'override' | 'keep-original') => {
    setApproving(true);
    try {
      const body: any = { action };
      if (action === 'override') {
        body.overrides = {};
        if (overrideMrr) body.overrides.revisedMrr = parseFloat(overrideMrr);
        if (overrideCustomers) body.overrides.revisedCustomers = parseInt(overrideCustomers);
      }
      const res = await api.post(`/api/analytics/monthly-review/${snapshotId}/approve`, body);
      setSnapshot(res.data.data?.snapshot || snapshot);
    } catch {
      // Handle error
    } finally {
      setApproving(false);
    }
  };

  const fmt = (v: any) => `£${Number(v || 0).toLocaleString()}`;
  const pct = (v: any) => `${Number(v || 0).toFixed(1)}%`;

  const varColor = (actual: number, planned: number) => {
    if (planned === 0) return 'text-gray-400';
    const ratio = actual / planned;
    if (ratio >= 1.05) return 'text-green-400';
    if (ratio >= 0.95) return 'text-gray-300';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1929]">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="text-gray-400 text-center py-12">Loading snapshot...</div>
        </main>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-[#0A1929]">
        <Sidebar />
        <main className="ml-64 p-8">
          <div className="text-gray-400 text-center py-12">Snapshot not found</div>
        </main>
      </div>
    );
  }

  const monthLabel = new Date(snapshot.month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const alerts: string[] = Array.isArray(snapshot.aiAlerts) ? snapshot.aiAlerts : [];
  const recommendations: any[] = Array.isArray(snapshot.aiRecommendations) ? snapshot.aiRecommendations : [];

  return (
    <div className="min-h-screen bg-[#0A1929]">
      <Sidebar />
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/monthly-review')} className="p-2 bg-[#112240] border border-[#1B3A6B]/30 rounded-lg text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CalendarCheck className="w-6 h-6 text-blue-400" />
              {monthLabel} — Month {snapshot.monthNumber}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <TrajectoryBadge trajectory={snapshot.trajectory} />
              {snapshot.targetsApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  <CheckCircle className="w-3 h-3" /> Approved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI Scorecard */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">KPI Scorecard</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Metric</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Plan</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Actual</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                <KpiRow label="MRR" actual={fmt(snapshot.mrr)} plan={planTarget ? fmt(planTarget.plannedMrr) : '—'} variance={planTarget ? `${((Number(snapshot.mrr) - Number(planTarget.plannedMrr)) / Math.max(1, Number(planTarget.plannedMrr)) * 100).toFixed(1)}%` : '—'} colorClass={planTarget ? varColor(Number(snapshot.mrr), Number(planTarget.plannedMrr)) : 'text-gray-400'} />
                <KpiRow label="ARR" actual={fmt(snapshot.arr)} plan={planTarget ? fmt(Number(planTarget.plannedMrr) * 12) : '—'} variance="—" colorClass="text-gray-400" />
                <KpiRow label="Customers" actual={String(snapshot.customers)} plan={planTarget ? String(planTarget.plannedCustomers) : '—'} variance={planTarget ? String(snapshot.customers - planTarget.plannedCustomers) : '—'} colorClass={planTarget ? varColor(snapshot.customers, planTarget.plannedCustomers) : 'text-gray-400'} />
                <KpiRow label="New Customers" actual={String(snapshot.newCustomers)} plan={planTarget ? String(planTarget.plannedNewCustomers) : '—'} variance="—" colorClass="text-gray-400" />
                <KpiRow label="Revenue Churn" actual={pct(snapshot.revenueChurnPct)} plan={planTarget ? pct(planTarget.plannedChurnPct) : '—'} variance="—" colorClass="text-gray-400" />
                <KpiRow label="Pipeline" actual={fmt(snapshot.pipelineValue)} plan="—" variance="—" colorClass="text-gray-400" />
                <KpiRow label="Win Rate" actual={pct(snapshot.winRate)} plan="—" variance="—" colorClass="text-gray-400" />
                <KpiRow label="ARPU" actual={fmt(snapshot.arpu)} plan={planTarget ? fmt(planTarget.plannedArpu) : '—'} variance="—" colorClass="text-gray-400" />
                <KpiRow label="LTV" actual={fmt(snapshot.ltv)} plan="—" variance="—" colorClass="text-gray-400" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* AI Summary */}
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              AI Executive Summary
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {snapshot.aiSummary || 'AI analysis not available for this snapshot.'}
            </p>
          </div>

          {/* Alerts */}
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alerts & Red Flags
            </h2>
            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm">No alerts this month.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((a, i) => (
                  <li key={i} className="text-sm text-yellow-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">&#x2022;</span>
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recalibration Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recalibration Proposals</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Metric</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Current</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Suggested</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-[#1B3A6B]/10">
                    <td className="py-2 px-3 text-white">{r.metric}</td>
                    <td className="py-2 px-3 text-gray-300 text-right">{fmt(r.current)}</td>
                    <td className="py-2 px-3 text-blue-400 text-right font-medium">{fmt(r.suggested)}</td>
                    <td className="py-2 px-3 text-gray-400 text-xs">{r.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Founder Income */}
        <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Founder Income
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <IncomeCard label="Salary" value={fmt(snapshot.founderSalary)} color="text-white" />
            <IncomeCard label="Loan Payment" value={`-${fmt(snapshot.founderLoanPayment)}`} color="text-red-400" />
            <IncomeCard label="Dividend" value={fmt(snapshot.founderDividend)} color="text-green-400" />
            <IncomeCard label="Savings Interest" value={fmt(snapshot.founderSavings)} color="text-cyan-400" />
            <IncomeCard label="Net Total" value={fmt(snapshot.founderTotalIncome)} color="text-blue-400" large />
          </div>
        </div>

        {/* Approval Section */}
        {!snapshot.targetsApproved && (
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Approve Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Override MRR Target</label>
                <input
                  type="number"
                  value={overrideMrr}
                  onChange={(e) => setOverrideMrr(e.target.value)}
                  placeholder="Leave blank to use AI suggestion"
                  className="w-full bg-[#0A1929] border border-[#1B3A6B]/30 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Override Customer Target</label>
                <input
                  type="number"
                  value={overrideCustomers}
                  onChange={(e) => setOverrideCustomers(e.target.value)}
                  placeholder="Leave blank to use AI suggestion"
                  className="w-full bg-[#0A1929] border border-[#1B3A6B]/30 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove('approve')}
                disabled={approving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Approve as Proposed
              </button>
              <button
                onClick={() => handleApprove('override')}
                disabled={approving || (!overrideMrr && !overrideCustomers)}
                className="px-4 py-2 bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Customise & Approve
              </button>
              <button
                onClick={() => handleApprove('keep-original')}
                disabled={approving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Keep Original
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiRow({ label, actual, plan, variance, colorClass }: { label: string; actual: string; plan: string; variance: string; colorClass: string }) {
  return (
    <tr className="border-b border-[#1B3A6B]/10">
      <td className="py-2 px-3 text-gray-300">{label}</td>
      <td className="py-2 px-3 text-gray-500 text-right">{plan}</td>
      <td className="py-2 px-3 text-white text-right font-medium">{actual}</td>
      <td className={`py-2 px-3 text-right font-medium ${colorClass}`}>{variance}</td>
    </tr>
  );
}

function IncomeCard({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div className={`${large ? 'bg-[#1B3A6B]/20 border border-[#1B3A6B]/40' : ''} rounded-lg p-3`}>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`${large ? 'text-xl' : 'text-lg'} font-bold ${color} mt-1`}>{value}</p>
    </div>
  );
}

function TrajectoryBadge({ trajectory }: { trajectory: string | null }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    AHEAD: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ahead of Plan' },
    ON_TRACK: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'On Track' },
    BEHIND: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Behind Plan' },
  };
  const style = map[trajectory || 'ON_TRACK'] || map.ON_TRACK;
  const Icon = trajectory === 'AHEAD' ? TrendingUp : trajectory === 'BEHIND' ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {style.label}
    </span>
  );
}
