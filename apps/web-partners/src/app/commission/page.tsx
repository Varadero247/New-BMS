'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface CommissionSummary {
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  dealsWon: number;
  dealsInPipeline: number;
  pipelineValue: number;
}

interface CommissionDeal {
  id: string;
  companyName: string;
  actualACV: number | null;
  commissionRate: number;
  commissionValue: number | null;
  commissionPaid: boolean;
  closedAt: string | null;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

export default function CommissionPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [history, setHistory] = useState<CommissionDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('partner_token');
    if (!token) { router.push('/login'); return; }

    Promise.allSettled([
      api.get('/api/commission/summary'),
      api.get('/api/commission/history'),
    ]).then(([sumRes, histRes]) => {
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data.data);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Commission</h1>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-green-400">{fmt(summary.totalEarned)}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-white">{fmt(summary.totalPaid)}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Pending Payout</p>
                <p className="text-2xl font-bold text-yellow-400">{fmt(summary.pendingPayout)}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Deals Won</p>
                <p className="text-2xl font-bold text-green-400">{summary.dealsWon}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">In Pipeline</p>
                <p className="text-2xl font-bold text-blue-400">{summary.dealsInPipeline}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm text-gray-400 mb-1">Pipeline Value</p>
                <p className="text-2xl font-bold text-purple-400">{fmt(summary.pipelineValue)}</p>
              </div>
            </div>
          )}

          {/* Commission History */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Commission History</h2>
            </div>
            {history.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No commission earned yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Deal Value</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Rate</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Commission</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {history.map((deal) => (
                      <tr key={deal.id} className="hover:bg-gray-800/50">
                        <td className="py-3 px-6 text-sm text-white">{deal.companyName}</td>
                        <td className="py-3 px-6 text-sm text-gray-400">{fmt(deal.actualACV || 0)}</td>
                        <td className="py-3 px-6 text-sm text-gray-400">{(deal.commissionRate * 100).toFixed(1)}%</td>
                        <td className="py-3 px-6 text-sm text-green-400">{fmt(deal.commissionValue || 0)}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${deal.commissionPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {deal.commissionPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-sm text-gray-400">
                          {deal.closedAt ? new Date(deal.closedAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
