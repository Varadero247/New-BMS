'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { Truck, ClipboardCheck, FileText, DollarSign } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/dashboard/stats');
        setStats(r.data.data || {});
      } catch (e) {
        setError(
          axios.isAxiosError(e) && e.response?.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = [
    { label: 'Total Suppliers', value: stats.totalSuppliers ?? 0, icon: Truck, color: 'teal' },
    { label: 'Scorecards', value: stats.totalScorecards ?? 0, icon: ClipboardCheck, color: 'blue' },
    { label: 'Documents', value: stats.totalDocuments ?? 0, icon: FileText, color: 'amber' },
    { label: 'Total Spend', value: stats.totalSpend ?? '-', icon: DollarSign, color: 'green' },
  ];

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Management Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Supplier lifecycle and performance overview
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
                        <p className="text-2xl font-bold mt-1">{String(kpi.value)}</p>
                      </div>
                      <div
                        className={`p-3 rounded-lg bg-${kpi.color}-50 dark:bg-${kpi.color}-900/20`}
                      >
                        <Icon className={`h-6 w-6 text-${kpi.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats)
                .filter(
                  ([k]) =>
                    !['totalSuppliers', 'totalScorecards', 'totalDocuments', 'totalSpend'].includes(
                      k
                    )
                )
                .map(([key, value]) => (
                  <Card key={key} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold mt-1">{String(value)}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
