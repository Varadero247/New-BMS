'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@ims/ui';
import {
  Truck,
  Users,
  Route,
  Calendar,
  FileText,
  ScrollText,
  Package,
  Clock } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Stats {
  totalJobs?: number;
  activeTechnicians?: number;
  openRoutes?: number;
  scheduledToday?: number;
  pendingInvoices?: number;
  activeContracts?: number;
  partsUsed?: number;
  hoursLogged?: number;
}

const kpis = [
  {
    key: 'totalJobs',
    label: 'Total Jobs',
    icon: Truck,
    color: 'text-sky-600',
    bg: 'bg-sky-50 dark:bg-sky-900',
    href: '/jobs' },
  {
    key: 'activeTechnicians',
    label: 'Active Technicians',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900',
    href: '/technicians' },
  {
    key: 'openRoutes',
    label: 'Open Routes',
    icon: Route,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900',
    href: '/routes' },
  {
    key: 'scheduledToday',
    label: 'Scheduled Today',
    icon: Calendar,
    color: 'text-violet-600',
    bg: 'bg-violet-50 dark:bg-violet-900',
    href: '/schedules' },
  {
    key: 'pendingInvoices',
    label: 'Pending Invoices',
    icon: FileText,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900',
    href: '/invoices' },
  {
    key: 'activeContracts',
    label: 'Active Contracts',
    icon: ScrollText,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900',
    href: '/contracts' },
  {
    key: 'partsUsed',
    label: 'Parts Used (MTD)',
    icon: Package,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900',
    href: '/parts-used' },
  {
    key: 'hoursLogged',
    label: 'Hours Logged (MTD)',
    icon: Clock,
    color: 'text-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900',
    href: '/time-entries' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      const r = await api.get('/dashboard/stats');
      setStats(r.data.data || {});
    } catch (e) {
      console.error(e);
      setError('Unable to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
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
              Field Service Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Dispatch board and operations overview
            </p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  loadDashboard();
                }}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Link key={kpi.key} href={kpi.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</p>
                          <p className="text-2xl font-bold mt-1">
                            {String((stats as Record<string, unknown>)[kpi.key] ?? '-')}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${kpi.bg}`}>
                          <Icon className={`h-6 w-6 ${kpi.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
