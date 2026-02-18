'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  PieChart,
  FileText,
  Database,
  BarChart3,
  Bell,
  Download,
  TrendingUp,
  Users,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  totalReports: number;
  activeDashboards: number;
  datasets: number;
  kpis: number;
  activeAlerts: number;
  scheduledExports: number;
  avgScore: number;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: string;
  name: string;
  module: string;
  time: string;
  color: string;
}

const MOCK_DATA: DashboardData = {
  totalReports: 24,
  activeDashboards: 8,
  datasets: 15,
  kpis: 42,
  activeAlerts: 3,
  scheduledExports: 7,
  avgScore: 84,
  activeUsers: 18,
};

const MOCK_RECENT: RecentActivity[] = [
  {
    id: '1',
    type: 'Report',
    name: 'Q1 2026 Compliance Summary',
    module: 'Quality',
    time: '5m ago',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    type: 'Alert',
    name: 'NCR rate exceeded threshold',
    module: 'Quality',
    time: '22m ago',
    color: 'bg-red-500',
  },
  {
    id: '3',
    type: 'Export',
    name: 'H&S KPI export — Feb 2026',
    module: 'H&S',
    time: '1h ago',
    color: 'bg-green-500',
  },
  {
    id: '4',
    type: 'Dashboard',
    name: 'Executive Overview updated',
    module: 'Cross-module',
    time: '2h ago',
    color: 'bg-purple-500',
  },
  {
    id: '5',
    type: 'Query',
    name: 'Overdue CAPA by department',
    module: 'Quality',
    time: '3h ago',
    color: 'bg-amber-500',
  },
];

const MOCK_KPIS = [
  {
    name: 'Lost Time Injury Rate',
    category: 'H&S',
    value: 0.12,
    target: 0.0,
    trend: 'down',
    unit: 'per 100k hrs',
  },
  {
    name: 'Customer Satisfaction',
    category: 'Quality',
    value: 88,
    target: 90,
    trend: 'up',
    unit: '%',
  },
  {
    name: 'Carbon Intensity',
    category: 'Environmental',
    value: 24.8,
    target: 20,
    trend: 'down',
    unit: 'tCO2/£m',
  },
  {
    name: 'On-Time Delivery',
    category: 'Operations',
    value: 93,
    target: 95,
    trend: 'up',
    unit: '%',
  },
  {
    name: 'CAPA Closure Rate',
    category: 'Quality',
    value: 76,
    target: 85,
    trend: 'stable',
    unit: '%',
  },
  {
    name: 'Supplier Defect Rate',
    category: 'Quality',
    value: 2.1,
    target: 1.0,
    trend: 'down',
    unit: 'ppm',
  },
];

function TrendBadge({ trend }: { trend: string }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <TrendingUp className="h-3 w-3" /> Up
      </span>
    );
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
        <TrendingDown className="h-3 w-3" /> Down
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
      <Minus className="h-3 w-3" /> Flat
    </span>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/dashboard');
        setData(r.data.data);
      } catch {
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const d = data || MOCK_DATA;

  const statCards = [
    {
      title: 'Active Dashboards',
      value: d.activeDashboards,
      icon: PieChart,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      href: '/dashboards',
      change: '+2 this month',
    },
    {
      title: 'Total Reports',
      value: d.totalReports,
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      href: '/reports',
      change: '+5 this month',
    },
    {
      title: 'Datasets',
      value: d.datasets,
      icon: Database,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900',
      href: '/datasets',
      change: 'All connected',
    },
    {
      title: 'KPIs Tracked',
      value: d.kpis,
      icon: BarChart3,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900',
      href: '/kpis',
      change: `${Math.round(d.avgScore)}% avg`,
    },
    {
      title: 'Active Alerts',
      value: d.activeAlerts,
      icon: Bell,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900',
      href: '/alerts',
      change: `${d.activeAlerts} firing`,
    },
    {
      title: 'Scheduled Exports',
      value: d.scheduledExports,
      icon: Download,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900',
      href: '/exports',
      change: 'Auto-running',
    },
    {
      title: 'Avg Performance',
      value: `${d.avgScore}%`,
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900',
      href: '/kpis',
      change: '+3% vs last month',
    },
    {
      title: 'Active Users',
      value: d.activeUsers,
      icon: Users,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900',
      href: '/dashboards',
      change: 'Last 30 days',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Executive Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analytics and business intelligence overview
            </p>
          </div>
          <Link
            href="/nlq"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
                        <Icon className={`h-4 w-4 ${card.iconColor}`} />
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {card.value}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {card.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.change}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPI Snapshot */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Key Performance Indicators
                </span>
                <Link
                  href="/kpis"
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_KPIS.map((kpi) => {
                  const pct =
                    kpi.unit === '%'
                      ? kpi.value
                      : Math.min(100, (kpi.value / (kpi.target || 1)) * 100);
                  const onTarget =
                    kpi.unit === '%' ? kpi.value >= kpi.target : kpi.value <= kpi.target;
                  return (
                    <div key={kpi.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {kpi.name}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded flex-shrink-0">
                              {kpi.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <span
                              className={`text-sm font-bold ${onTarget ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {kpi.value}
                              {kpi.unit === '%' ? '%' : ''}
                            </span>
                            <TrendBadge trend={kpi.trend} />
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${onTarget ? 'bg-green-500' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          Target: {kpi.target}
                          {kpi.unit === '%' ? '%' : ` ${kpi.unit}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-purple-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_RECENT.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${item.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {item.module}
                        </span>
                        <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick access links */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: 'Create Report',
              href: '/reports',
              icon: FileText,
              color:
                'text-blue-600 bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-800',
            },
            {
              label: 'Build Dashboard',
              href: '/dashboards',
              icon: PieChart,
              color:
                'text-purple-600 bg-purple-50 dark:bg-purple-900 border-purple-100 dark:border-purple-800',
            },
            {
              label: 'Set Up Alert',
              href: '/alerts',
              icon: Bell,
              color: 'text-red-600 bg-red-50 dark:bg-red-900 border-red-100 dark:border-red-800',
            },
            {
              label: 'Natural Language Query',
              href: '/nlq',
              icon: Sparkles,
              color:
                'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900 border-fuchsia-100 dark:border-fuchsia-800',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-3 p-4 rounded-xl border ${action.color} hover:shadow-sm transition-shadow`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
