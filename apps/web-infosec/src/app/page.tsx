'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Server,
  Shield,
  AlertTriangle,
  AlertOctagon,
  UserCheck,
  ClipboardCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalAssets: number;
  controlsImplemented: number;
  controlsTotal: number;
  openRisks: number;
  activeIncidents: number;
  pendingDsars: number;
  upcomingAudits: number;
  riskBreakdown: { level: string; count: number }[];
  recentIncidents: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    reportedDate: string;
  }>;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const riskLevelColors: Record<string, string> = {
  VERY_LOW: 'bg-green-500',
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export default function InfoSecDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setData({
        totalAssets: 0,
        controlsImplemented: 0,
        controlsTotal: 93,
        openRisks: 0,
        activeIncidents: 0,
        pendingDsars: 0,
        upcomingAudits: 0,
        riskBreakdown: [],
        recentIncidents: [],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Assets',
      value: String(data?.totalAssets || 0),
      subtitle: 'Registered assets',
      icon: Server,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-50',
      valueColor: 'text-teal-700',
      href: '/assets',
    },
    {
      title: 'Controls Implemented',
      value: `${data?.controlsImplemented || 0}/${data?.controlsTotal || 93}`,
      subtitle: 'Annex A controls',
      icon: Shield,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      valueColor: 'text-cyan-700',
      href: '/controls',
    },
    {
      title: 'Open Risks',
      value: String(data?.openRisks || 0),
      subtitle: 'Requiring treatment',
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      valueColor: 'text-orange-700',
      href: '/risks',
    },
    {
      title: 'Active Incidents',
      value: String(data?.activeIncidents || 0),
      subtitle: 'Open incidents',
      icon: AlertOctagon,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      valueColor: 'text-red-700',
      href: '/incidents',
    },
    {
      title: 'Pending DSARs',
      value: String(data?.pendingDsars || 0),
      subtitle: 'Awaiting response',
      icon: UserCheck,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      valueColor: 'text-purple-700',
      href: '/privacy/dsar',
    },
    {
      title: 'Upcoming Audits',
      value: String(data?.upcomingAudits || 0),
      subtitle: 'Scheduled',
      icon: ClipboardCheck,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: 'text-blue-700',
      href: '/audits',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">InfoSec Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISMS overview and key metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
                      </div>
                      <div className={`p-3 rounded-full ${card.bgColor}`}>
                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Risk Level Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Risk Level Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.riskBreakdown && data.riskBreakdown.length > 0 ? (
              <div className="space-y-3">
                {data.riskBreakdown.map((item) => {
                  const total = data.riskBreakdown.reduce((sum, r) => sum + r.count, 0);
                  const pct = total > 0 ? (item.count / total) * 100 : 0;
                  return (
                    <div key={item.level} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600 w-24">{item.level.replace('_', ' ')}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${riskLevelColors[item.level] || 'bg-gray-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8 text-right">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No risk data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentIncidents && data.recentIncidents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ref</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentIncidents.map((incident) => (
                      <tr key={incident.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">{incident.referenceNumber}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{incident.title}</td>
                        <td className="py-3 px-4 text-gray-600">{incident.type}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityColors[incident.severity] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {incident.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{incident.status}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(incident.reportedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <AlertOctagon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent incidents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
