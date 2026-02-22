'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { CalendarClock, AlertTriangle, DollarSign } from 'lucide-react';

interface Renewal {
  id: string;
  companyName: string;
  mrr: number;
  renewalDate: string;
  daysUntilRenewal: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'CHURNED' | 'RENEWED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  action: string;
  csm: string;
}

const MOCK_DATA: Renewal[] = [
  {
    id: '1',
    companyName: 'Sterling Facilities',
    mrr: 900,
    renewalDate: '2026-03-01',
    daysUntilRenewal: 7,
    status: 'AT_RISK',
    riskLevel: 'HIGH',
    action: 'Emergency exec call booked for Feb 24 — escalate to founder',
    csm: 'Sarah Chen',
  },
  {
    id: '2',
    companyName: 'BlueSky Logistics',
    mrr: 600,
    renewalDate: '2026-03-15',
    daysUntilRenewal: 21,
    status: 'ON_TRACK',
    riskLevel: 'LOW',
    action: 'Renewal invoice sent — awaiting signature',
    csm: 'Tom Briggs',
  },
  {
    id: '3',
    companyName: 'Aqua Utilities PLC',
    mrr: 3000,
    renewalDate: '2026-03-20',
    daysUntilRenewal: 26,
    status: 'AT_RISK',
    riskLevel: 'MEDIUM',
    action: 'Onboarding stalled — unblock before renewal conversation',
    csm: 'Priya Sharma',
  },
  {
    id: '4',
    companyName: 'Helix Manufacturing Ltd',
    mrr: 1200,
    renewalDate: '2026-04-01',
    daysUntilRenewal: 38,
    status: 'ON_TRACK',
    riskLevel: 'LOW',
    action: 'Schedule QBR for mid-March',
    csm: 'Sarah Chen',
  },
  {
    id: '5',
    companyName: 'TechForge Labs',
    mrr: 2400,
    renewalDate: '2026-04-15',
    daysUntilRenewal: 52,
    status: 'RENEWED',
    riskLevel: 'LOW',
    action: 'Early renewal signed — upgraded to ENTERPRISE',
    csm: 'Priya Sharma',
  },
];

const STATUS_BADGE: Record<Renewal['status'], string> = {
  ON_TRACK: 'bg-green-900/30 text-green-400 border border-green-700',
  AT_RISK: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  CHURNED: 'bg-red-900/30 text-red-400 border border-red-700',
  RENEWED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
};

const RISK_BADGE: Record<Renewal['riskLevel'], string> = {
  LOW: 'bg-green-900/30 text-green-400 border border-green-700',
  MEDIUM: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  HIGH: 'bg-red-900/30 text-red-400 border border-red-700',
};

function urgencyClass(days: number): string {
  if (days <= 30) return 'text-red-400 font-semibold';
  if (days <= 60) return 'text-amber-400 font-semibold';
  return 'text-gray-300';
}

function urgencyRowBg(days: number, status: Renewal['status']): string {
  if (status === 'CHURNED') return 'bg-red-900/10';
  if (days <= 30) return 'bg-red-900/5';
  if (days <= 60) return 'bg-amber-900/5';
  return '';
}

export default function RenewalPage() {
  const [data, setData] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<Renewal['status'] | 'ALL'>('ALL');
  const [riskFilter, setRiskFilter] = useState<Renewal['riskLevel'] | 'ALL'>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/renewal');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Renewal API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (v: number) => `£${v.toLocaleString()}`;

  const sorted = [...data]
    .filter((d) => statusFilter === 'ALL' || d.status === statusFilter)
    .filter((d) => riskFilter === 'ALL' || d.riskLevel === riskFilter)
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  const mrrAtRisk = data
    .filter((d) => d.status === 'AT_RISK' || d.riskLevel === 'HIGH')
    .reduce((s, d) => s + d.mrr, 0);

  const upcomingIn30 = data.filter((d) => d.daysUntilRenewal <= 30 && d.status !== 'CHURNED' && d.status !== 'RENEWED').length;
  const upcomingIn60 = data.filter((d) => d.daysUntilRenewal <= 60 && d.status !== 'CHURNED' && d.status !== 'RENEWED').length;
  const renewed = data.filter((d) => d.status === 'RENEWED').length;

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <CalendarClock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Renewal Pipeline</h1>
            <p className="text-gray-400 text-sm">Track upcoming renewals and churn risk</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-gray-400 text-sm">MRR at Risk</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{fmt(mrrAtRisk)}</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-red-400" />
              <p className="text-gray-400 text-sm">Due in 30 days</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{upcomingIn30}</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <CalendarClock className="w-4 h-4 text-amber-400" />
              <p className="text-gray-400 text-sm">Due in 60 days</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{upcomingIn60}</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-sm">Renewed</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{renewed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Status:</span>
            {(['ALL', 'ON_TRACK', 'AT_RISK', 'RENEWED', 'CHURNED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Risk:</span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  riskFilter === r ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'All Risk' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Company</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">MRR</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Renewal Date</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Days Left</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Risk</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Action</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">CSM</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.id} className={`border-b border-white/5 ${urgencyRowBg(row.daysUntilRenewal, row.status)}`}>
                      <td className="px-5 py-3 text-white font-medium">{row.companyName}</td>
                      <td className="px-5 py-3 text-green-400 font-semibold text-right">{fmt(row.mrr)}</td>
                      <td className="px-5 py-3 text-gray-300 text-right">
                        {new Date(row.renewalDate).toLocaleDateString()}
                      </td>
                      <td className={`px-5 py-3 text-right ${urgencyClass(row.daysUntilRenewal)}`}>
                        {row.daysUntilRenewal}d
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.status]}`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[row.riskLevel]}`}>
                          {row.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 max-w-[220px]">{row.action}</td>
                      <td className="px-5 py-3 text-gray-300">{row.csm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-900/30 inline-block" />
            Renewal within 30 days
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-900/30 inline-block" />
            Renewal within 31-60 days
          </div>
        </div>
      </div>
    </div>
  );
}
