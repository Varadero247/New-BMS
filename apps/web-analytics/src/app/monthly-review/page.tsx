'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Calendar, TrendingUp, TrendingDown, RefreshCw, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

interface MonthlySnapshot {
  id: string;
  month: string;
  monthNumber: number;
  year?: number;
  revenue?: number;
  grossProfit?: number;
  netProfit?: number;
  cashPosition?: number;
  newCustomers?: number;
  churnedCustomers?: number;
  completedMilestones?: number;
  totalActions?: number;
  openCapas?: number;
  incidentsThisMonth?: number;
  isoReadiness?: number;
  generatedAt: string;
}

const MOCK_SNAPSHOTS: MonthlySnapshot[] = [
  { id: '1', month: 'February 2026', monthNumber: 2, year: 2026, revenue: 485000, grossProfit: 194000, netProfit: 72000, cashPosition: 143000, newCustomers: 12, churnedCustomers: 2, completedMilestones: 27, totalActions: 48, openCapas: 14, incidentsThisMonth: 3, isoReadiness: 87, generatedAt: '2026-02-21T08:00:00Z' },
  { id: '2', month: 'January 2026', monthNumber: 1, year: 2026, revenue: 452000, grossProfit: 181000, netProfit: 65000, cashPosition: 115000, newCustomers: 9, churnedCustomers: 3, completedMilestones: 22, totalActions: 44, openCapas: 16, incidentsThisMonth: 5, isoReadiness: 84, generatedAt: '2026-01-31T08:00:00Z' },
  { id: '3', month: 'December 2025', monthNumber: 12, year: 2025, revenue: 510000, grossProfit: 204000, netProfit: 81000, cashPosition: 98000, newCustomers: 15, churnedCustomers: 1, completedMilestones: 31, totalActions: 52, openCapas: 11, incidentsThisMonth: 2, isoReadiness: 85, generatedAt: '2025-12-31T08:00:00Z' },
];

function fmt(n?: number, currency = true) {
  if (n === undefined || n === null) return '—';
  if (currency) return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
  return n.toLocaleString();
}

export default function MonthlyReviewPage() {
  const [snapshots, setSnapshots] = useState<MonthlySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/monthly-review');
        setSnapshots(r.data.data?.snapshots || MOCK_SNAPSHOTS);
      } catch {
        setSnapshots(MOCK_SNAPSHOTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const triggerRegenerate = async (id: string) => {
    setRegenerating(id);
    try {
      await api.patch(`/monthly-review/${id}/regenerate`);
      const r = await api.get('/monthly-review');
      setSnapshots(r.data.data?.snapshots || snapshots);
    } catch {
      // ignore
    } finally {
      setRegenerating(null);
    }
  };

  const latest = snapshots[0];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Monthly Review</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monthly performance snapshots and business review data</p>
        </div>

        {/* Latest snapshot summary */}
        {latest && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Latest — {latest.month}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Revenue', value: fmt(latest.revenue), trend: latest.revenue && snapshots[1]?.revenue ? latest.revenue - snapshots[1].revenue : undefined },
                { label: 'Net Profit', value: fmt(latest.netProfit) },
                { label: 'ISO Readiness', value: latest.isoReadiness ? `${latest.isoReadiness}%` : '—' },
                { label: 'Open CAPAs', value: latest.openCapas !== undefined ? latest.openCapas.toString() : '—' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
                    {stat.trend !== undefined && (
                      <p className={`text-xs mt-1 flex items-center gap-0.5 ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stat.trend >= 0 ? '+' : ''}{fmt(stat.trend)} vs prev month
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Snapshots list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-purple-600" />
              All Monthly Snapshots ({snapshots.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {snapshots.map((snap) => (
              <div key={snap.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleExpand(snap.id)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{snap.month}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">Generated {new Date(snap.generatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {snap.revenue && <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{fmt(snap.revenue)}</span>}
                    {snap.isoReadiness && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${snap.isoReadiness >= 85 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        ISO {snap.isoReadiness}%
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); triggerRegenerate(snap.id); }}
                      disabled={regenerating === snap.id}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${regenerating === snap.id ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                    {expandedId === snap.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>
                {expandedId === snap.id && (
                  <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                      {[
                        { label: 'Revenue', value: fmt(snap.revenue) },
                        { label: 'Gross Profit', value: fmt(snap.grossProfit) },
                        { label: 'Net Profit', value: fmt(snap.netProfit) },
                        { label: 'Cash Position', value: fmt(snap.cashPosition) },
                        { label: 'New Customers', value: snap.newCustomers !== undefined ? fmt(snap.newCustomers, false) : '—' },
                        { label: 'Churned', value: snap.churnedCustomers !== undefined ? fmt(snap.churnedCustomers, false) : '—' },
                        { label: 'Actions Total', value: snap.totalActions !== undefined ? fmt(snap.totalActions, false) : '—' },
                        { label: 'Incidents', value: snap.incidentsThisMonth !== undefined ? fmt(snap.incidentsThisMonth, false) : '—' },
                      ].map((item) => (
                        <div key={item.label} className="bg-white dark:bg-gray-800 rounded p-3">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
