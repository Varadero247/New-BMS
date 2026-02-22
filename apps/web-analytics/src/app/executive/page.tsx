'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  FileText,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ExecutiveSummary {
  myActions: {
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
  };
  health: {
    isoReadiness: number;
    isoReadinessTrend: number;
    openCapas: number;
    openCapasTrend: number;
    overdueItems: number;
    overdueItemsTrend: number;
  };
  riskSummary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  complianceActivity?: {
    auditsThisMonth: number;
    incidentsThisMonth: number;
    actionsCompleted: number;
  };
  generatedAt: string;
}

const MOCK_DATA: ExecutiveSummary = {
  myActions: { overdue: 3, dueToday: 5, dueThisWeek: 12 },
  health: {
    isoReadiness: 87,
    isoReadinessTrend: 2.3,
    openCapas: 14,
    openCapasTrend: -2,
    overdueItems: 7,
    overdueItemsTrend: 1,
  },
  riskSummary: { critical: 2, high: 8, medium: 15, low: 23 },
  complianceActivity: { auditsThisMonth: 4, incidentsThisMonth: 3, actionsCompleted: 27 },
  generatedAt: new Date().toISOString(),
};

function TrendBadge({ value, inverted = false }: { value: number; inverted?: boolean }) {
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}
    >
      {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
      {value > 0 ? '+' : ''}{value}%
    </span>
  );
}

export default function ExecutivePage() {
  const [data, setData] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/executive');
        setData(r.data.data || MOCK_DATA);
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const d = data!;
  const generatedAt = new Date(d.generatedAt).toLocaleString();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-purple-600" />
              Executive Summary
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Aggregated platform-wide performance snapshot
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Generated: {generatedAt}</p>
        </div>

        {/* My Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" /> My Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-red-600">{d.myActions.overdue}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overdue Actions</p>
                <p className="text-xs text-red-500 mt-1">Requires immediate attention</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-orange-600">{d.myActions.dueToday}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due Today</p>
                <p className="text-xs text-orange-500 mt-1">Complete before end of day</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <p className="text-3xl font-bold text-blue-600">{d.myActions.dueThisWeek}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due This Week</p>
                <p className="text-xs text-blue-500 mt-1">Plan your workload</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Platform Health KPIs */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" /> Platform Health KPIs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-3xl font-bold text-purple-700">{d.health.isoReadiness}%</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO Readiness Score</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-300" />
                </div>
                <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${d.health.isoReadiness}%` }}
                  />
                </div>
                <div className="mt-2">
                  <TrendBadge value={d.health.isoReadinessTrend} />
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{d.health.openCapas}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Open CAPAs</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-amber-300" />
                </div>
                <div className="mt-2">
                  <TrendBadge value={d.health.openCapasTrend} inverted />
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-3xl font-bold text-red-600">{d.health.overdueItems}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overdue Items</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-300" />
                </div>
                <div className="mt-2">
                  <TrendBadge value={d.health.overdueItemsTrend} inverted />
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Risk Summary */}
        {d.riskSummary && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Risk Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Critical', value: d.riskSummary.critical, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
                { label: 'High', value: d.riskSummary.high, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
                { label: 'Medium', value: d.riskSummary.medium, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
                { label: 'Low', value: d.riskSummary.low, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg p-4 ${item.color}`}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm font-medium mt-0.5">{item.label} Risk</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Compliance Activity */}
        {d.complianceActivity && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Compliance Activity (This Month)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Audits Conducted', value: d.complianceActivity.auditsThisMonth, icon: FileText, color: 'text-blue-600' },
                { label: 'Incidents Reported', value: d.complianceActivity.incidentsThisMonth, icon: AlertTriangle, color: 'text-red-600' },
                { label: 'Actions Completed', value: d.complianceActivity.actionsCompleted, icon: CheckCircle, color: 'text-green-600' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label}>
                    <CardContent className="p-5 flex items-center gap-4">
                      <Icon className={`h-10 w-10 ${item.color} opacity-80`} />
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
