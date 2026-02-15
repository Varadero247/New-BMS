'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { CalendarCheck, ChevronRight, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Snapshot {
  id: string;
  month: string;
  monthNumber: number;
  mrr: number;
  customers: number;
  trajectory: string | null;
  targetsApproved: boolean;
  createdAt: string;
}

export default function MonthlyReviewListPage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/api/analytics/monthly-review');
        setSnapshots(res.data.data?.snapshots || []);
      } catch {
        // API may not be available
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCurrency = (v: number) => `£${Number(v || 0).toLocaleString()}`;
  const formatMonth = (m: string) => new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

  const trajectoryBadge = (t: string | null) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      AHEAD: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Ahead' },
      ON_TRACK: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'On Track' },
      BEHIND: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Behind' },
    };
    const style = map[t || 'ON_TRACK'] || map.ON_TRACK;
    const Icon = t === 'AHEAD' ? ArrowUpRight : t === 'BEHIND' ? ArrowDownRight : Minus;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {style.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CalendarCheck className="w-6 h-6 text-blue-400" />
              Monthly Reviews
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mt-1">Performance snapshots and target approvals</p>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-12">Loading...</div>
        ) : snapshots.length === 0 ? (
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500">No monthly snapshots yet.</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Snapshots are generated on the 1st of each month, or triggered manually.</p>
          </div>
        ) : (
          <div className="bg-[#112240] rounded-xl border border-[#1B3A6B]/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Month</th>
                  <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">MRR</th>
                  <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Customers</th>
                  <th className="text-center py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Trajectory</th>
                  <th className="text-center py-3 px-4 text-gray-400 dark:text-gray-500 font-medium">Approved</th>
                  <th className="text-right py-3 px-4 text-gray-400 dark:text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10">
                    <td className="py-3 px-4 text-white font-medium">
                      {formatMonth(s.month)}
                      <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">M{s.monthNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-white text-right">{formatCurrency(s.mrr)}</td>
                    <td className="py-3 px-4 text-gray-300 text-right">{s.customers}</td>
                    <td className="py-3 px-4 text-center">{trajectoryBadge(s.trajectory)}</td>
                    <td className="py-3 px-4 text-center">
                      {s.targetsApproved ? (
                        <span className="text-green-400 text-xs">Approved</span>
                      ) : (
                        <span className="text-yellow-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a href={`/monthly-review/${s.id}`} className="text-blue-400 hover:text-blue-300">
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
