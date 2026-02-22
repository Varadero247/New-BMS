'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Heart, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface HealthScore {
  id: string;
  companyName: string;
  score: number;
  tier: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  mrr: number;
  lastActivity: string;
  npsScore: number | null;
  supportTickets: number;
  usageScore: number;
  engagementScore: number;
  reasons: string[];
}

const MOCK_DATA: HealthScore[] = [
  {
    id: '1',
    companyName: 'Helix Manufacturing Ltd',
    score: 87,
    tier: 'HEALTHY',
    mrr: 1200,
    lastActivity: '2026-02-20',
    npsScore: 9,
    supportTickets: 1,
    usageScore: 92,
    engagementScore: 88,
    reasons: ['High daily active usage', 'Positive NPS', 'Low support load'],
  },
  {
    id: '2',
    companyName: 'BlueSky Logistics',
    score: 58,
    tier: 'AT_RISK',
    mrr: 600,
    lastActivity: '2026-02-11',
    npsScore: 6,
    supportTickets: 5,
    usageScore: 52,
    engagementScore: 49,
    reasons: ['Login frequency down 40%', 'Multiple open support tickets', 'Missed last QBR'],
  },
  {
    id: '3',
    companyName: 'Orion Healthcare',
    score: 91,
    tier: 'HEALTHY',
    mrr: 1800,
    lastActivity: '2026-02-21',
    npsScore: 10,
    supportTickets: 0,
    usageScore: 96,
    engagementScore: 94,
    reasons: ['Power user', 'Referral source', 'Expanding to new modules'],
  },
  {
    id: '4',
    companyName: 'Sterling Facilities',
    score: 31,
    tier: 'CRITICAL',
    mrr: 900,
    lastActivity: '2026-01-28',
    npsScore: 3,
    supportTickets: 11,
    usageScore: 22,
    engagementScore: 18,
    reasons: ['No login in 25 days', 'NPS detractor', 'Escalated support issues', 'Churn risk high'],
  },
  {
    id: '5',
    companyName: 'Vertex Engineering',
    score: 74,
    tier: 'HEALTHY',
    mrr: 2400,
    lastActivity: '2026-02-19',
    npsScore: 8,
    supportTickets: 2,
    usageScore: 78,
    engagementScore: 72,
    reasons: ['Good engagement', 'Minor support tickets resolved'],
  },
];

const TIER_CONFIG = {
  HEALTHY: {
    badge: 'bg-green-900/30 text-green-400 border border-green-700',
    bar: 'bg-green-500',
    icon: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    label: 'Healthy',
  },
  AT_RISK: {
    badge: 'bg-amber-900/30 text-amber-400 border border-amber-700',
    bar: 'bg-amber-500',
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    label: 'At Risk',
  },
  CRITICAL: {
    badge: 'bg-red-900/30 text-red-400 border border-red-700',
    bar: 'bg-red-500',
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    label: 'Critical',
  },
};

export default function HealthScorePage() {
  const [data, setData] = useState<HealthScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tierFilter, setTierFilter] = useState<HealthScore['tier'] | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'mrr'>('score');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/health-score');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Health Score API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (v: number) => `£${v.toLocaleString()}`;

  const filtered = data
    .filter((d) => tierFilter === 'ALL' || d.tier === tierFilter)
    .sort((a, b) => (sortBy === 'score' ? b.score - a.score : b.mrr - a.mrr));

  const counts = {
    HEALTHY: data.filter((d) => d.tier === 'HEALTHY').length,
    AT_RISK: data.filter((d) => d.tier === 'AT_RISK').length,
    CRITICAL: data.filter((d) => d.tier === 'CRITICAL').length,
  };

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Health Scores</h1>
            <p className="text-gray-400 text-sm">Monitor account health and churn risk</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Tier Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(['HEALTHY', 'AT_RISK', 'CRITICAL'] as const).map((tier) => {
            const cfg = TIER_CONFIG[tier];
            return (
              <div key={tier} className="bg-[#112240] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">{cfg.label}</span>
                  {cfg.icon}
                </div>
                <p className="text-3xl font-bold text-white">{counts[tier]}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {data.length > 0 ? Math.round((counts[tier] / data.length) * 100) : 0}% of accounts
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter + Sort */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Filter:</span>
            {(['ALL', 'HEALTHY', 'AT_RISK', 'CRITICAL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tierFilter === t ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'All' : TIER_CONFIG[t].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Sort:</span>
            {(['score', 'mrr'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === s ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                {s === 'score' ? 'Health Score' : 'MRR'}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((account) => {
              const cfg = TIER_CONFIG[account.tier];
              return (
                <div key={account.id} className="bg-[#112240] border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-base">{account.companyName}</h3>
                      <p className="text-gray-400 text-sm mt-0.5">
                        MRR: {fmt(account.mrr)} &middot; Last active:{' '}
                        {new Date(account.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <span className="text-2xl font-bold text-white">{account.score}</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Health Score</span>
                      <span>{account.score}/100</span>
                    </div>
                    <div className="w-full bg-[#0B1E38] rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${cfg.bar}`}
                        style={{ width: `${account.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: 'Usage', val: account.usageScore },
                      { label: 'Engagement', val: account.engagementScore },
                      { label: 'NPS', val: account.npsScore ?? '—' },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-white font-semibold text-lg">{m.val}</p>
                        <p className="text-gray-500 text-xs">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reason tags */}
                  <div className="flex flex-wrap gap-2">
                    {account.reasons.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-full">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
