'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@ims/ui';
import {
  FlaskConical,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Activity,
  Ban,
  Plus,
  ClipboardCheck,
  Beaker,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface DashboardStats {
  totalChemicals: number;
  highRiskCount: number;
  sdsOverdue: number;
  coshhDueReview: number;
  welExceedances: number;
  incompatibilityAlerts: number;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  chemicalName: string;
  dateOccurred: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalChemicals: 0,
    highRiskCount: 0,
    sdsOverdue: 0,
    coshhDueReview: 0,
    welExceedances: 0,
    incompatibilityAlerts: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, incidentsRes] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/incidents?limit=5&sort=dateOccurred:desc'),
        ]);
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data.data || {});
        }
        if (incidentsRes.status === 'fulfilled') {
          setRecentIncidents(incidentsRes.value.data.data || []);
        }
      } catch (e: any) {
        setError(
          e.response?.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = [
    {
      label: 'Total Chemicals',
      value: stats.totalChemicals ?? 0,
      icon: FlaskConical,
      colorClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconClass: 'text-blue-600',
    },
    {
      label: 'High / Very High Risk',
      value: stats.highRiskCount ?? 0,
      icon: AlertTriangle,
      colorClass: stats.highRiskCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.highRiskCount > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      label: 'SDS Overdue',
      value: stats.sdsOverdue ?? 0,
      icon: FileText,
      colorClass: stats.sdsOverdue > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.sdsOverdue > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      label: 'COSHH Due Review',
      value: stats.coshhDueReview ?? 0,
      icon: ShieldAlert,
      colorClass: stats.coshhDueReview > 0 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.coshhDueReview > 0 ? 'text-amber-600' : 'text-green-600',
    },
    {
      label: 'WEL Exceedances',
      value: stats.welExceedances ?? 0,
      icon: Activity,
      colorClass: stats.welExceedances > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.welExceedances > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      label: 'Incompatibility Alerts',
      value: stats.incompatibilityAlerts ?? 0,
      icon: Ban,
      colorClass: stats.incompatibilityAlerts > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20',
      iconClass: stats.incompatibilityAlerts > 0 ? 'text-red-600' : 'text-green-600',
    },
  ];

  const quickActions = [
    { label: '+ Add Chemical', onClick: () => router.push('/register?action=new'), icon: Plus },
    { label: 'Record COSHH', onClick: () => router.push('/coshh/new'), icon: ClipboardCheck },
    { label: 'Log Monitoring', onClick: () => router.push('/monitoring?action=new'), icon: Beaker },
    { label: 'Report Incident', onClick: () => router.push('/incidents?action=new'), icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Chemical Management Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 11014 / COSHH / GHS Compliance Overview
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                      <div className={`p-3 rounded-lg ${kpi.colorClass}`}>
                        <Icon className={`h-6 w-6 ${kpi.iconClass}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Recent Chemical Incidents
              </h2>
              {recentIncidents.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent incidents recorded.</p>
              ) : (
                <div className="space-y-3">
                  {recentIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => router.push(`/incidents?id=${incident.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            incident.severity === 'CRITICAL' || incident.severity === 'MAJOR'
                              ? 'text-red-500'
                              : incident.severity === 'MODERATE'
                              ? 'text-amber-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {incident.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {incident.chemicalName} - {new Date(incident.dateOccurred).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          incident.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : incident.severity === 'MAJOR'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            : incident.severity === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
