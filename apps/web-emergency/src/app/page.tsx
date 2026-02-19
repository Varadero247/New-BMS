'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  AlertTriangle,
  FileSearch,
  Users,
  GraduationCap,
  Wrench,
  CalendarX,
  BookX,
  Flame,
  Clock,
  Bell,
} from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  activeIncidents: number;
  fraOverdue: number;
  peepReviewsDue: number;
  wardenTrainingExpiring: number;
  equipmentServiceDue: number;
  drillsOverdue: number;
  bcpsNotTested: number;
  recentIncidents: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    premisesName: string;
    createdAt: string;
  }>;
  criticalAlerts: Array<{
    id: string;
    type: string;
    message: string;
    premisesName: string;
    dueDate: string;
  }>;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

function elapsed(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/analytics/dashboard');
        setData(r.data.data);
      } catch (e) {
        setError(
          axios.isAxiosError(e) && e.response?.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load dashboard data.'
        );
        // Use fallback empty data so the page still renders
        setData({
          activeIncidents: 0,
          fraOverdue: 0,
          peepReviewsDue: 0,
          wardenTrainingExpiring: 0,
          equipmentServiceDue: 0,
          drillsOverdue: 0,
          bcpsNotTested: 0,
          recentIncidents: [],
          criticalAlerts: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = data
    ? [
        {
          label: 'Active Incidents',
          value: data.activeIncidents,
          icon: Flame,
          urgent: data.activeIncidents > 0,
          href: '/incidents',
          description: 'Currently active emergency incidents',
        },
        {
          label: 'FRA Overdue',
          value: data.fraOverdue,
          icon: FileSearch,
          urgent: data.fraOverdue > 0,
          href: '/fra',
          description: 'Fire Risk Assessments past review date',
        },
        {
          label: 'PEEP Reviews Due',
          value: data.peepReviewsDue,
          icon: Users,
          urgent: data.peepReviewsDue > 0,
          href: '/peep',
          description: 'Personal Emergency Evacuation Plans needing review',
        },
        {
          label: 'Warden Training Expiring',
          value: data.wardenTrainingExpiring,
          icon: GraduationCap,
          urgent: data.wardenTrainingExpiring > 0,
          href: '/drills',
          description: 'Fire warden training certificates expiring within 30 days',
        },
        {
          label: 'Equipment Service Due',
          value: data.equipmentServiceDue,
          icon: Wrench,
          urgent: data.equipmentServiceDue > 0,
          href: '/equipment',
          description: 'Fire safety equipment requiring service',
        },
        {
          label: 'Drills Overdue',
          value: data.drillsOverdue,
          icon: CalendarX,
          urgent: data.drillsOverdue > 0,
          href: '/drills',
          description: 'Evacuation drills past scheduled date',
        },
        {
          label: 'BCPs Not Tested',
          value: data.bcpsNotTested,
          icon: BookX,
          urgent: data.bcpsNotTested > 0,
          href: '/bcp',
          description: 'Business Continuity Plans with no test in 12 months',
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Emergency Management Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Fire, Emergency &amp; Business Continuity overview
              </p>
            </div>
            <Link
              href="/incidents/declare"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#F04B5A' }}
            >
              <Flame className="h-5 w-5" />
              Declare Emergency
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
              {error}
            </div>
          )}

          {/* Active Incident Alert Banner */}
          {data && data.activeIncidents > 0 && (
            <div
              className="mb-6 p-4 rounded-lg border-2 flex items-center gap-4 animate-pulse"
              style={{ backgroundColor: '#FEE2E4', borderColor: '#F04B5A' }}
            >
              <div
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg" style={{ color: '#B91C2A' }}>
                  {data.activeIncidents} Active Emergency
                  {data.activeIncidents > 1 ? ' Incidents' : ' Incident'}
                </p>
                <p className="text-sm" style={{ color: '#F04B5A' }}>
                  Emergency response protocols are in effect. Check the Incidents tab for details.
                </p>
              </div>
              <Link
                href="/incidents"
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
                style={{ backgroundColor: '#F04B5A' }}
              >
                View Incidents
              </Link>
            </div>
          )}

          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Link key={kpi.label} href={kpi.href}>
                  <Card
                    className={`hover:shadow-md transition-all cursor-pointer h-full ${
                      kpi.urgent ? 'ring-2' : ''
                    }`}
                    style={
                      kpi.urgent ? { borderColor: '#F04B5A' } : undefined
                    }
                  >
                    <CardContent className="p-4">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                        style={{
                          backgroundColor: kpi.urgent ? '#FEE2E4' : '#F3F4F6',
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: kpi.urgent ? '#F04B5A' : '#9CA3AF' }}
                        />
                      </div>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: kpi.urgent ? '#F04B5A' : undefined }}
                      >
                        {kpi.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                        {kpi.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Recent Incidents + Critical Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Incidents Feed */}
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" style={{ color: '#F04B5A' }} />
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                      Recent Incidents
                    </h2>
                  </div>
                  <Link
                    href="/incidents"
                    className="text-xs font-medium hover:underline"
                    style={{ color: '#F04B5A' }}
                  >
                    View all
                  </Link>
                </div>
                {data && data.recentIncidents.length > 0 ? (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.recentIncidents.map((incident) => (
                      <li key={incident.id}>
                        <Link
                          href={`/incidents/${incident.id}`}
                          className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div
                            className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                incident.status === 'ACTIVE'
                                  ? '#F04B5A'
                                  : incident.status === 'CONTROLLED'
                                    ? '#F59E0B'
                                    : '#10B981',
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {incident.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {incident.premisesName} &bull; {incident.type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.MEDIUM
                              }`}
                            >
                              {incident.severity}
                            </span>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {elapsed(incident.createdAt)}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recent incidents</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Bell className="h-5 w-5" style={{ color: '#F04B5A' }} />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                    Critical Alerts
                  </h2>
                </div>
                {data && data.criticalAlerts.length > 0 ? (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {data.criticalAlerts.map((alert) => (
                      <li key={alert.id} className="p-4 flex items-start gap-3">
                        <div
                          className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#FEE2E4' }}
                        >
                          <Bell className="h-4 w-4" style={{ color: '#F04B5A' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {alert.premisesName}
                          </p>
                          {alert.dueDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                Due: {new Date(alert.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span
                          className="flex-shrink-0 text-xs px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: '#FEE2E4', color: '#B91C2A' }}
                        >
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No critical alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
