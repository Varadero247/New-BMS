'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface DashboardStats {
  totalControls: number;
  activeControls: number;
  underReviewControls: number;
  remediationControls: number;
  activeIr35: number;
  insideIr35: number;
  outsideIr35: number;
  pendingIr35: number;
  totalDeadlines: number;
  upcomingDeadlines: number;
  overdueDeadlines: number;
  sodConflicts: number;
  activeSodRules: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const [controlsRes, ir35Res, hmrcRes, sodRes] = await Promise.all([
          api.get('/controls').catch(() => ({ data: { data: [] } })),
          api.get('/ir35').catch(() => ({ data: { data: [] } })),
          api.get('/hmrc-calendar').catch(() => ({ data: { data: [] } })),
          api.get('/sod-matrix').catch(() => ({ data: { data: [] } })),
        ]);

        const controls = controlsRes.data.data || [];
        const ir35 = ir35Res.data.data || [];
        const hmrc = hmrcRes.data.data || [];
        const sod = sodRes.data.data || [];

        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        setStats({
          totalControls: Array.isArray(controls) ? controls.length : 0,
          activeControls: Array.isArray(controls)
            ? controls.filter((c: any) => c.status === 'ACTIVE').length
            : 0,
          underReviewControls: Array.isArray(controls)
            ? controls.filter((c: any) => c.status === 'UNDER_REVIEW').length
            : 0,
          remediationControls: Array.isArray(controls)
            ? controls.filter((c: any) => c.status === 'REMEDIATION').length
            : 0,
          activeIr35: Array.isArray(ir35) ? ir35.length : 0,
          insideIr35: Array.isArray(ir35)
            ? ir35.filter((a: any) => a.determination === 'INSIDE').length
            : 0,
          outsideIr35: Array.isArray(ir35)
            ? ir35.filter((a: any) => a.determination === 'OUTSIDE').length
            : 0,
          pendingIr35: Array.isArray(ir35)
            ? ir35.filter((a: any) => a.determination === 'PENDING').length
            : 0,
          totalDeadlines: Array.isArray(hmrc) ? hmrc.length : 0,
          upcomingDeadlines: Array.isArray(hmrc)
            ? hmrc.filter(
                (d: any) =>
                  new Date(d.dueDate) >= now &&
                  new Date(d.dueDate) <= in30Days &&
                  d.status !== 'SUBMITTED'
              ).length
            : 0,
          overdueDeadlines: Array.isArray(hmrc)
            ? hmrc.filter(
                (d: any) =>
                  new Date(d.dueDate) < now && d.status !== 'SUBMITTED'
              ).length
            : 0,
          sodConflicts: Array.isArray(sod)
            ? sod.filter((r: any) => r.isActive !== false).length
            : 0,
          activeSodRules: Array.isArray(sod) ? sod.length : 0,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <div>
                  <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Error Loading Dashboard
                  </h2>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Controls',
      value: stats?.totalControls ?? 0,
      sub: `${stats?.activeControls ?? 0} active`,
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Under Review',
      value: stats?.underReviewControls ?? 0,
      sub: `${stats?.remediationControls ?? 0} in remediation`,
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
      bgIcon: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: 'IR35 Assessments',
      value: stats?.activeIr35 ?? 0,
      sub: `${stats?.insideIr35 ?? 0} inside / ${stats?.outsideIr35 ?? 0} outside`,
      icon: <FileCheck2 className="h-6 w-6 text-blue-600" />,
      bgIcon: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Pending IR35',
      value: stats?.pendingIr35 ?? 0,
      sub: 'Awaiting determination',
      icon: <FileCheck2 className="h-6 w-6 text-orange-600" />,
      bgIcon: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'HMRC Deadlines',
      value: stats?.totalDeadlines ?? 0,
      sub: `${stats?.upcomingDeadlines ?? 0} upcoming (30 days)`,
      icon: <CalendarClock className="h-6 w-6 text-emerald-600" />,
      bgIcon: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Overdue Filings',
      value: stats?.overdueDeadlines ?? 0,
      sub: 'Past due date',
      icon: <CalendarClock className="h-6 w-6 text-red-600" />,
      bgIcon: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'SoD Conflicts',
      value: stats?.sodConflicts ?? 0,
      sub: 'Active conflict rules',
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      bgIcon: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'SoD Rules',
      value: stats?.activeSodRules ?? 0,
      sub: 'Total defined rules',
      icon: <AlertTriangle className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
      bgIcon: 'bg-gray-50 dark:bg-gray-800',
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Financial Compliance Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Regulatory controls, tax deadlines, and separation of duties overview
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {kpi.label}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {kpi.sub}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgIcon}`}>
                    {kpi.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
