'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ComplianceGauge, RiskMatrix } from '@ims/charts';
import {
  Shield,
  Leaf,
  Award,
  Package,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  Wallet,
  GitBranch,
  FolderKanban,
  Car,
  Stethoscope,
  Plane,
  PiggyBank,
  UserCircle,
  ShieldCheck,
  TreePine,
  Wrench,
  Building2,
  Truck,
  BarChart3,
  UtensilsCrossed,
  Zap,
  Brain,
  Scale,
  Briefcase,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { QuickAddMenu } from '@/components/quick-add-menu';

interface DashboardStats {
  compliance: {
    iso45001: number;
    iso14001: number;
    iso9001: number;
    overall: number;
  };
  risks: {
    total: number;
    high: number;
    critical: number;
  };
  incidents: {
    total: number;
    open: number;
    thisMonth: number;
  };
  actions: {
    total: number;
    open: number;
    overdue: number;
    dueThisWeek: number;
  };
  topRisks: any[];
  overdueActions: any[];
  recentAIInsights: any[];
}

interface ModuleCard {
  name: string;
  subtitle: string;
  port: number;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  textColor: string;
  subtitleColor: string;
  iconBg: string;
}

const isoModules: ModuleCard[] = [
  { name: 'Health & Safety', subtitle: 'ISO 45001', port: 3001, icon: Shield, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', hoverBg: 'hover:bg-red-100', textColor: 'text-red-900', subtitleColor: 'text-red-600', iconBg: 'bg-red-100' },
  { name: 'Environmental', subtitle: 'ISO 14001', port: 3002, icon: Leaf, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', hoverBg: 'hover:bg-green-100', textColor: 'text-green-900', subtitleColor: 'text-green-600', iconBg: 'bg-green-100' },
  { name: 'Quality', subtitle: 'ISO 9001', port: 3003, icon: Award, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', hoverBg: 'hover:bg-blue-100', textColor: 'text-blue-900', subtitleColor: 'text-blue-600', iconBg: 'bg-blue-100' },
  { name: 'ESG', subtitle: 'Sustainability', port: 3016, icon: TreePine, color: 'teal', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', hoverBg: 'hover:bg-teal-100', textColor: 'text-teal-900', subtitleColor: 'text-teal-600', iconBg: 'bg-teal-100' },
  { name: 'Food Safety', subtitle: 'HACCP / ISO 22000', port: 3020, icon: UtensilsCrossed, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', hoverBg: 'hover:bg-amber-100', textColor: 'text-amber-900', subtitleColor: 'text-amber-600', iconBg: 'bg-amber-100' },
  { name: 'Energy', subtitle: 'ISO 50001', port: 3021, icon: Zap, color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', hoverBg: 'hover:bg-yellow-100', textColor: 'text-yellow-900', subtitleColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  { name: 'ISO 42001 (AI)', subtitle: 'AI Management', port: 3024, icon: Brain, color: 'fuchsia', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200', hoverBg: 'hover:bg-fuchsia-100', textColor: 'text-fuchsia-900', subtitleColor: 'text-fuchsia-600', iconBg: 'bg-fuchsia-100' },
  { name: 'ISO 37001', subtitle: 'Anti-Bribery', port: 3025, icon: Scale, color: 'rose', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', hoverBg: 'hover:bg-rose-100', textColor: 'text-rose-900', subtitleColor: 'text-rose-600', iconBg: 'bg-rose-100' },
  { name: 'InfoSec', subtitle: 'ISO 27001', port: 3015, icon: ShieldCheck, color: 'cyan', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', hoverBg: 'hover:bg-cyan-100', textColor: 'text-cyan-900', subtitleColor: 'text-cyan-600', iconBg: 'bg-cyan-100' },
  { name: 'Aerospace', subtitle: 'AS9100', port: 3012, icon: Plane, color: 'slate', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', hoverBg: 'hover:bg-slate-100', textColor: 'text-slate-900', subtitleColor: 'text-slate-600', iconBg: 'bg-slate-100' },
];

const operationsModules: ModuleCard[] = [
  { name: 'Inventory', subtitle: 'Stock Control', port: 3005, icon: Package, color: 'sky', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', hoverBg: 'hover:bg-sky-100', textColor: 'text-sky-900', subtitleColor: 'text-sky-600', iconBg: 'bg-sky-100' },
  { name: 'HR Management', subtitle: 'Employee & Performance', port: 3006, icon: Users, color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', hoverBg: 'hover:bg-orange-100', textColor: 'text-orange-900', subtitleColor: 'text-orange-600', iconBg: 'bg-orange-100' },
  { name: 'Payroll', subtitle: 'Compensation & Benefits', port: 3007, icon: Wallet, color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', hoverBg: 'hover:bg-emerald-100', textColor: 'text-emerald-900', subtitleColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  { name: 'Workflows', subtitle: 'Process Automation', port: 3008, icon: GitBranch, color: 'indigo', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', hoverBg: 'hover:bg-indigo-100', textColor: 'text-indigo-900', subtitleColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
  { name: 'Project Management', subtitle: 'Tasks & Milestones', port: 3009, icon: FolderKanban, color: 'violet', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', hoverBg: 'hover:bg-violet-100', textColor: 'text-violet-900', subtitleColor: 'text-violet-600', iconBg: 'bg-violet-100' },
  { name: 'Finance', subtitle: 'Accounts & Budgets', port: 3013, icon: PiggyBank, color: 'lime', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', hoverBg: 'hover:bg-lime-100', textColor: 'text-lime-900', subtitleColor: 'text-lime-600', iconBg: 'bg-lime-100' },
  { name: 'CRM', subtitle: 'Customer Relations', port: 3014, icon: UserCircle, color: 'pink', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', hoverBg: 'hover:bg-pink-100', textColor: 'text-pink-900', subtitleColor: 'text-pink-600', iconBg: 'bg-pink-100' },
  { name: 'CMMS', subtitle: 'Maintenance', port: 3017, icon: Wrench, color: 'stone', bgColor: 'bg-stone-50', borderColor: 'border-stone-200', hoverBg: 'hover:bg-stone-100', textColor: 'text-stone-900', subtitleColor: 'text-stone-600', iconBg: 'bg-stone-100' },
  { name: 'Field Service', subtitle: 'Job Dispatch', port: 3023, icon: Truck, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', hoverBg: 'hover:bg-blue-100', textColor: 'text-blue-900', subtitleColor: 'text-blue-600', iconBg: 'bg-blue-100' },
  { name: 'Analytics', subtitle: 'Reports & Dashboards', port: 3022, icon: BarChart3, color: 'purple', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', hoverBg: 'hover:bg-purple-100', textColor: 'text-purple-900', subtitleColor: 'text-purple-600', iconBg: 'bg-purple-100' },
];

const portalModules: ModuleCard[] = [
  { name: 'Customer Portal', subtitle: 'Client Access', port: 3018, icon: Building2, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', hoverBg: 'hover:bg-blue-100', textColor: 'text-blue-900', subtitleColor: 'text-blue-600', iconBg: 'bg-blue-100' },
  { name: 'Supplier Portal', subtitle: 'Vendor Access', port: 3019, icon: Briefcase, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', hoverBg: 'hover:bg-amber-100', textColor: 'text-amber-900', subtitleColor: 'text-amber-600', iconBg: 'bg-amber-100' },
  { name: 'Medical Devices', subtitle: 'ISO 13485', port: 3011, icon: Stethoscope, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', hoverBg: 'hover:bg-red-100', textColor: 'text-red-900', subtitleColor: 'text-red-600', iconBg: 'bg-red-100' },
  { name: 'Automotive', subtitle: 'IATF 16949', port: 3010, icon: Car, color: 'gray', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', hoverBg: 'hover:bg-gray-100', textColor: 'text-gray-900', subtitleColor: 'text-gray-600', iconBg: 'bg-gray-100' },
];

function ModuleCardLink({ mod }: { mod: ModuleCard }) {
  const Icon = mod.icon;
  return (
    <a
      href={`http://localhost:${mod.port}`}
      className={`flex items-center justify-between p-5 ${mod.bgColor} rounded-lg border ${mod.borderColor} ${mod.hoverBg} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 ${mod.iconBg} rounded-full`}>
          <Icon className={`h-5 w-5 text-${mod.color}-600`} />
        </div>
        <div>
          <h3 className={`font-semibold ${mod.textColor}`}>{mod.name}</h3>
          <p className={`text-sm ${mod.subtitleColor}`}>{mod.subtitle}</p>
        </div>
      </div>
      <ExternalLink className={`h-4 w-4 text-${mod.color}-400`} />
    </a>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">IMS Dashboard</h1>
            <p className="text-gray-500 mt-1">Integrated Management System Overview</p>
          </div>

          {/* Compliance Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.iso45001 || 0}
                  label="Health & Safety"
                  color="#DC2626"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.iso14001 || 0}
                  label="Environmental"
                  color="#10B981"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.iso9001 || 0}
                  label="Quality"
                  color="#1E3A8A"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.overall || 0}
                  label="Overall IMS"
                  color="#8B5CF6"
                  size="md"
                />
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Risks</p>
                    <p className="text-2xl font-bold">{stats?.risks.total || 0}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-red-600 font-medium">{stats?.risks.critical || 0} critical</span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-orange-600 font-medium">{stats?.risks.high || 0} high</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Open Incidents</p>
                    <p className="text-2xl font-bold">{stats?.incidents.open || 0}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Shield className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats?.incidents.thisMonth || 0} this month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Overdue Actions</p>
                    <p className="text-2xl font-bold text-red-600">{stats?.actions.overdue || 0}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats?.actions.dueThisWeek || 0} due this week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">AI Insights</p>
                    <p className="text-2xl font-bold">{stats?.recentAIInsights?.length || 0}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Latest analyses
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Report Incident', href: 'http://localhost:3001/incidents', color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200' },
                  { label: 'Raise NCR', href: 'http://localhost:3003/nonconformances', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                  { label: 'New CAPA', href: 'http://localhost:3003/capa', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
                  { label: 'Log Environmental Event', href: 'http://localhost:3002/events', color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' },
                  { label: 'Create Work Order', href: 'http://localhost:3017/work-orders', color: 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200' },
                  { label: 'New Risk Assessment', href: 'http://localhost:3001/risks', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200' },
                ].map(action => (
                  <a key={action.label} href={action.href} className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md border transition-colors ${action.color}`}>
                    {action.label}
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Cross-Module Activity Feed */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { module: 'Quality', action: 'NCR created', detail: 'NCR-2026-0042 — Supplier material out of spec', time: '5m ago', color: 'bg-blue-500' },
                    { module: 'H&S', action: 'Incident resolved', detail: 'INC-2026-0118 — Slip hazard in warehouse', time: '22m ago', color: 'bg-red-500' },
                    { module: 'CMMS', action: 'PM completed', detail: 'WO-2026-0315 — HVAC quarterly maintenance', time: '45m ago', color: 'bg-stone-500' },
                    { module: 'Environment', action: 'Aspect reviewed', detail: 'ENV-ASP-2026-012 — Water discharge monitoring', time: '1h ago', color: 'bg-green-500' },
                    { module: 'CRM', action: 'Deal closed', detail: 'Enterprise license — Acme Corp ($48,000)', time: '2h ago', color: 'bg-pink-500' },
                    { module: 'InfoSec', action: 'Risk mitigated', detail: 'ISR-2026-008 — Endpoint encryption deployed', time: '3h ago', color: 'bg-cyan-500' },
                    { module: 'Field Service', action: 'Job dispatched', detail: 'FSJ-2026-0089 — Emergency repair at Site 7', time: '4h ago', color: 'bg-blue-500' },
                    { module: 'Finance', action: 'Invoice approved', detail: 'INV-2026-0401 — Q1 supplier payment batch', time: '5h ago', color: 'bg-lime-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex flex-col items-center">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        {i < 7 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase">{item.module}</span>
                          <span className="text-xs text-gray-500">{item.action}</span>
                          <span className="text-[10px] text-gray-400 ml-auto shrink-0">{item.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 truncate">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Top 5 Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.topRisks && stats.topRisks.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topRisks.map((risk: any) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{risk.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              risk.standard === 'ISO_45001' ? 'bg-red-100 text-red-700' :
                              risk.standard === 'ISO_14001' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {risk.standard.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              risk.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {risk.riskLevel}
                            </span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-400">{risk.riskScore}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active risks</p>
                )}
              </CardContent>
            </Card>

            {/* Overdue Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Overdue CAPA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.overdueActions && stats.overdueActions.length > 0 ? (
                  <div className="space-y-3">
                    {stats.overdueActions.map((action: any) => (
                      <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{action.referenceNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              action.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                              action.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {action.priority}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-red-600">
                          {new Date(action.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-600 text-center py-8">No overdue actions</p>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Latest AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentAIInsights && stats.recentAIInsights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.recentAIInsights.slice(0, 4).map((insight: any) => (
                      <div key={insight.id} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-purple-600 font-medium">{insight.sourceType}</p>
                            <p className="text-sm mt-1">{insight.suggestedRootCause || 'Analysis available'}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(insight.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No AI insights yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ISO Compliance Modules */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ISO Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isoModules.map((mod) => (
                <ModuleCardLink key={mod.port} mod={mod} />
              ))}
            </div>
          </div>

          {/* Operations Modules */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {operationsModules.map((mod) => (
                <ModuleCardLink key={mod.port} mod={mod} />
              ))}
            </div>
          </div>

          {/* Portals & Specialist Modules */}
          <div className="mt-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Portals & Specialist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {portalModules.map((mod) => (
                <ModuleCardLink key={mod.port} mod={mod} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Add FAB */}
      <QuickAddMenu />
    </div>
  );
}
