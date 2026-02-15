'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Shield, Leaf, Award, DollarSign, Users, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle, BarChart3, Activity
} from 'lucide-react';

interface ModuleKPI {
  module: string;
  icon: React.ReactNode;
  color: string;
  kpis: { label: string; value: string; trend: 'up' | 'down' | 'stable'; good: boolean }[];
  status: 'green' | 'amber' | 'red';
  alerts: number;
}

const modules: ModuleKPI[] = [
  {
    module: 'Health & Safety',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    status: 'amber',
    alerts: 2,
    kpis: [
      { label: 'LTIR', value: '0.8', trend: 'down', good: true },
      { label: 'Open Incidents', value: '12', trend: 'down', good: true },
      { label: 'Near Misses (MTD)', value: '28', trend: 'up', good: false },
      { label: 'Training Compliance', value: '94%', trend: 'up', good: true },
    ],
  },
  {
    module: 'Quality',
    icon: <Award className="h-5 w-5" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    status: 'green',
    alerts: 0,
    kpis: [
      { label: 'NCR Rate', value: '1.2%', trend: 'down', good: true },
      { label: 'CAPA On-Time', value: '92%', trend: 'up', good: true },
      { label: 'Customer Complaints', value: '3', trend: 'down', good: true },
      { label: 'Audit Conformance', value: '98%', trend: 'stable', good: true },
    ],
  },
  {
    module: 'Environment & ESG',
    icon: <Leaf className="h-5 w-5" />,
    color: 'text-green-600 bg-green-50 border-green-200',
    status: 'amber',
    alerts: 1,
    kpis: [
      { label: 'CO₂ (tCO₂e MTD)', value: '380', trend: 'down', good: true },
      { label: 'Waste Diverted', value: '89%', trend: 'up', good: true },
      { label: 'Energy Intensity', value: '42 MWh/£M', trend: 'down', good: true },
      { label: 'Water (m³ MTD)', value: '8,500', trend: 'up', good: false },
    ],
  },
  {
    module: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    status: 'green',
    alerts: 0,
    kpis: [
      { label: 'Revenue (MTD)', value: '£2.4M', trend: 'up', good: true },
      { label: 'Gross Margin', value: '42.5%', trend: 'up', good: true },
      { label: 'Cash Position', value: '£8.1M', trend: 'up', good: true },
      { label: 'AR Days', value: '38', trend: 'down', good: true },
    ],
  },
  {
    module: 'Human Resources',
    icon: <Users className="h-5 w-5" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    status: 'green',
    alerts: 0,
    kpis: [
      { label: 'Headcount', value: '342', trend: 'up', good: true },
      { label: 'Turnover (YTD)', value: '12.5%', trend: 'down', good: true },
      { label: 'Open Vacancies', value: '8', trend: 'stable', good: true },
      { label: 'Engagement Score', value: '4.2/5', trend: 'up', good: true },
    ],
  },
  {
    module: 'Operations (CMMS)',
    icon: <Activity className="h-5 w-5" />,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
    status: 'red',
    alerts: 3,
    kpis: [
      { label: 'OEE', value: '78%', trend: 'down', good: false },
      { label: 'MTBF (hrs)', value: '420', trend: 'down', good: false },
      { label: 'PM Compliance', value: '88%', trend: 'down', good: false },
      { label: 'Open WOs', value: '45', trend: 'up', good: false },
    ],
  },
];

const recentAlerts = [
  { id: 1, severity: 'critical', module: 'CMMS', message: 'CNC Mill #3 unplanned downtime — bearing failure', time: '2 hours ago' },
  { id: 2, severity: 'warning', module: 'H&S', message: 'Near-miss rate increased 15% vs. last month', time: '4 hours ago' },
  { id: 3, severity: 'critical', module: 'CMMS', message: 'Compressor #1 oil pressure alarm — maintenance dispatched', time: '6 hours ago' },
  { id: 4, severity: 'warning', module: 'ESG', message: 'Water consumption 12% above monthly target', time: '8 hours ago' },
  { id: 5, severity: 'info', module: 'Quality', message: 'ISO 9001 surveillance audit scheduled for March 15', time: '1 day ago' },
  { id: 6, severity: 'critical', module: 'CMMS', message: 'Packaging line conveyor belt replacement overdue', time: '1 day ago' },
];

export default function ExecutiveSummaryClient() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const totalAlerts = modules.reduce((s, m) => s + m.alerts, 0);
  const greenModules = modules.filter((m) => m.status === 'green').length;
  const amberModules = modules.filter((m) => m.status === 'amber').length;
  const redModules = modules.filter((m) => m.status === 'red').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Executive Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cross-module performance overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500" /> {greenModules} Green
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> {amberModules} Amber
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-red-500" /> {redModules} Red
          </div>
        </div>
      </div>

      {/* RAG Status Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Module Health Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {modules.map((m) => (
            <button
              key={m.module}
              onClick={() => setSelectedModule(selectedModule === m.module ? null : m.module)}
              className={`border rounded-xl p-4 text-left transition-all ${
                selectedModule === m.module ? 'ring-2 ring-offset-1 ring-gray-400' : ''
              } ${m.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                {m.icon}
                <div className={`w-3 h-3 rounded-full ${m.status === 'green' ? 'bg-green-500' : m.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-sm font-semibold">{m.module}</p>
              {m.alerts > 0 && (
                <p className="text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {m.alerts} alert{m.alerts > 1 ? 's' : ''}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — Selected or All */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules
          .filter((m) => !selectedModule || m.module === selectedModule)
          .map((m) => (
            <div key={m.module} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${m.color.split(' ').slice(1).join(' ')}`}>{m.icon}</div>
                <h3 className="text-sm font-semibold text-gray-800">{m.module}</h3>
                <div className={`ml-auto w-2.5 h-2.5 rounded-full ${m.status === 'green' ? 'bg-green-500' : m.status === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {m.kpis.map((kpi) => (
                  <div key={kpi.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{kpi.label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{kpi.value}</span>
                      {kpi.trend === 'up' && <TrendingUp className={`h-3.5 w-3.5 ${kpi.good ? 'text-green-500' : 'text-red-500'}`} />}
                      {kpi.trend === 'down' && <TrendingDown className={`h-3.5 w-3.5 ${kpi.good ? 'text-green-500' : 'text-red-500'}`} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Recent Alerts ({totalAlerts} active)
        </h3>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.severity === 'critical' ? 'bg-red-50' : alert.severity === 'warning' ? 'bg-amber-50' : 'bg-blue-50'}`}>
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{alert.module}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{alert.time}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
