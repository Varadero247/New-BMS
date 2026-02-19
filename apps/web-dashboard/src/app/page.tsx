'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, TourManager, useTour } from '@ims/ui';
import { ComplianceGauge } from '@ims/charts';
import { useRBACContext } from '@ims/rbac/react';
import { PermissionLevel } from '@ims/rbac';
import { useWelcomeWizard } from '@/hooks/use-welcome-wizard';
import { WelcomeWizardModal } from '@/components/welcome-wizard/welcome-wizard-modal';
import { WizardChecklist } from '@/components/welcome-wizard/wizard-checklist';
import { WizardFab } from '@/components/welcome-wizard/wizard-fab';
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
  SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { QuickAddMenu } from '@/components/quick-add-menu';
import { CustomizeModal } from '@/components/customize-modal';
import { useDashboardStore } from '@/lib/dashboard-store';
import { MODULE_RBAC_MAP, SECTION_IDS, type SectionId } from '@/lib/dashboard-config';

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
  {
    name: 'Health & Safety',
    subtitle: 'ISO 45001',
    port: 3001,
    icon: Shield,
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900',
    textColor: 'text-red-900 dark:text-red-100',
    subtitleColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900' },
  {
    name: 'Environmental',
    subtitle: 'ISO 14001',
    port: 3002,
    icon: Leaf,
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900',
    textColor: 'text-green-900 dark:text-green-100',
    subtitleColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900' },
  {
    name: 'Quality',
    subtitle: 'ISO 9001',
    port: 3003,
    icon: Award,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    textColor: 'text-blue-900 dark:text-blue-100',
    subtitleColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900' },
  {
    name: 'ESG',
    subtitle: 'Sustainability',
    port: 3016,
    icon: TreePine,
    color: 'teal',
    bgColor: 'bg-teal-50 dark:bg-teal-950',
    borderColor: 'border-teal-200 dark:border-teal-800',
    hoverBg: 'hover:bg-teal-100 dark:hover:bg-teal-900',
    textColor: 'text-teal-900 dark:text-teal-100',
    subtitleColor: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900' },
  {
    name: 'Food Safety',
    subtitle: 'HACCP / ISO 22000',
    port: 3020,
    icon: UtensilsCrossed,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900',
    textColor: 'text-amber-900 dark:text-amber-100',
    subtitleColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900' },
  {
    name: 'Energy',
    subtitle: 'ISO 50001',
    port: 3021,
    icon: Zap,
    color: 'yellow',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900',
    textColor: 'text-yellow-900 dark:text-yellow-100',
    subtitleColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900' },
  {
    name: 'ISO 42001 (AI)',
    subtitle: 'AI Management',
    port: 3024,
    icon: Brain,
    color: 'fuchsia',
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950',
    borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
    hoverBg: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900',
    textColor: 'text-fuchsia-900 dark:text-fuchsia-100',
    subtitleColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-900' },
  {
    name: 'ISO 37001',
    subtitle: 'Anti-Bribery',
    port: 3025,
    icon: Scale,
    color: 'rose',
    bgColor: 'bg-rose-50 dark:bg-rose-950',
    borderColor: 'border-rose-200 dark:border-rose-800',
    hoverBg: 'hover:bg-rose-100 dark:hover:bg-rose-900',
    textColor: 'text-rose-900 dark:text-rose-100',
    subtitleColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-900' },
  {
    name: 'InfoSec',
    subtitle: 'ISO 27001',
    port: 3015,
    icon: ShieldCheck,
    color: 'cyan',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-900',
    textColor: 'text-cyan-900 dark:text-cyan-100',
    subtitleColor: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900' },
  {
    name: 'Aerospace',
    subtitle: 'AS9100',
    port: 3012,
    icon: Plane,
    color: 'slate',
    bgColor: 'bg-slate-50 dark:bg-slate-950',
    borderColor: 'border-slate-200 dark:border-slate-800',
    hoverBg: 'hover:bg-slate-100 dark:hover:bg-slate-900',
    textColor: 'text-slate-900 dark:text-slate-100',
    subtitleColor: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-900' },
];

const operationsModules: ModuleCard[] = [
  {
    name: 'Inventory',
    subtitle: 'Stock Control',
    port: 3005,
    icon: Package,
    color: 'sky',
    bgColor: 'bg-sky-50 dark:bg-sky-950',
    borderColor: 'border-sky-200 dark:border-sky-800',
    hoverBg: 'hover:bg-sky-100 dark:hover:bg-sky-900',
    textColor: 'text-sky-900 dark:text-sky-100',
    subtitleColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900' },
  {
    name: 'HR Management',
    subtitle: 'Employee & Performance',
    port: 3006,
    icon: Users,
    color: 'orange',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    hoverBg: 'hover:bg-orange-100 dark:hover:bg-orange-900',
    textColor: 'text-orange-900 dark:text-orange-100',
    subtitleColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900' },
  {
    name: 'Payroll',
    subtitle: 'Compensation & Benefits',
    port: 3007,
    icon: Wallet,
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-900',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    subtitleColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900' },
  {
    name: 'Workflows',
    subtitle: 'Process Automation',
    port: 3008,
    icon: GitBranch,
    color: 'indigo',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900',
    textColor: 'text-indigo-900 dark:text-indigo-100',
    subtitleColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900' },
  {
    name: 'Project Management',
    subtitle: 'Tasks & Milestones',
    port: 3009,
    icon: FolderKanban,
    color: 'violet',
    bgColor: 'bg-violet-50 dark:bg-violet-950',
    borderColor: 'border-violet-200 dark:border-violet-800',
    hoverBg: 'hover:bg-violet-100 dark:hover:bg-violet-900',
    textColor: 'text-violet-900 dark:text-violet-100',
    subtitleColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900' },
  {
    name: 'Finance',
    subtitle: 'Accounts & Budgets',
    port: 3013,
    icon: PiggyBank,
    color: 'lime',
    bgColor: 'bg-lime-50 dark:bg-lime-950',
    borderColor: 'border-lime-200 dark:border-lime-800',
    hoverBg: 'hover:bg-lime-100 dark:hover:bg-lime-900',
    textColor: 'text-lime-900 dark:text-lime-100',
    subtitleColor: 'text-lime-600 dark:text-lime-400',
    iconBg: 'bg-lime-100 dark:bg-lime-900' },
  {
    name: 'CRM',
    subtitle: 'Customer Relations',
    port: 3014,
    icon: UserCircle,
    color: 'pink',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
    borderColor: 'border-pink-200 dark:border-pink-800',
    hoverBg: 'hover:bg-pink-100 dark:hover:bg-pink-900',
    textColor: 'text-pink-900 dark:text-pink-100',
    subtitleColor: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900' },
  {
    name: 'CMMS',
    subtitle: 'Maintenance',
    port: 3017,
    icon: Wrench,
    color: 'stone',
    bgColor: 'bg-stone-50 dark:bg-stone-950',
    borderColor: 'border-stone-200 dark:border-stone-800',
    hoverBg: 'hover:bg-stone-100 dark:hover:bg-stone-900',
    textColor: 'text-stone-900 dark:text-stone-100',
    subtitleColor: 'text-stone-600 dark:text-stone-400',
    iconBg: 'bg-stone-100 dark:bg-stone-900' },
  {
    name: 'Field Service',
    subtitle: 'Job Dispatch',
    port: 3023,
    icon: Truck,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    textColor: 'text-blue-900 dark:text-blue-100',
    subtitleColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900' },
  {
    name: 'Analytics',
    subtitle: 'Reports & Dashboards',
    port: 3022,
    icon: BarChart3,
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900',
    textColor: 'text-purple-900 dark:text-purple-100',
    subtitleColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900' },
];

const portalModules: ModuleCard[] = [
  {
    name: 'Customer Portal',
    subtitle: 'Client Access',
    port: 3018,
    icon: Building2,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900',
    textColor: 'text-blue-900 dark:text-blue-100',
    subtitleColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900' },
  {
    name: 'Supplier Portal',
    subtitle: 'Vendor Access',
    port: 3019,
    icon: Briefcase,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-900',
    textColor: 'text-amber-900 dark:text-amber-100',
    subtitleColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900' },
  {
    name: 'Medical Devices',
    subtitle: 'ISO 13485',
    port: 3011,
    icon: Stethoscope,
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900',
    textColor: 'text-red-900 dark:text-red-100',
    subtitleColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900' },
  {
    name: 'Automotive',
    subtitle: 'IATF 16949',
    port: 3010,
    icon: Car,
    color: 'gray',
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-900',
    textColor: 'text-gray-900 dark:text-gray-100',
    subtitleColor: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-800' },
];

const SECTION_MODULE_MAP: Record<SectionId, ModuleCard[]> = {
  'iso-compliance': isoModules,
  operations: operationsModules,
  'portals-specialist': portalModules };

const SECTION_LABELS: Record<SectionId, string> = {
  'iso-compliance': 'ISO Compliance',
  operations: 'Operations',
  'portals-specialist': 'Portals & Specialist' };

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

function ModuleCardLink({ mod }: { mod: ModuleCard }) {
  const Icon = mod.icon;
  return (
    <a
      href={`${APP_BASE}:${mod.port}`}
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
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { config, openCustomize, hydrate, hydrated } = useDashboardStore();
  const { hasPermission, permissions } = useRBACContext();
  const wizard = useWelcomeWizard();
  const tour = useTour('home-dashboard');

  const handleStartTour = useCallback(() => {
    tour.startTour();
  }, [tour]);

  // Listen for sidebar "Help & Discovery" event
  useEffect(() => {
    const handler = () => wizard.reopen();
    window.addEventListener('nexara:open-discovery-guide', handler);
    return () => window.removeEventListener('nexara:open-discovery-guide', handler);
  }, [wizard.reopen]);

  useEffect(() => {
    // Check if setup wizard needs to be shown
    api
      .get('/wizard/status')
      .then((res) => {
        const data = res.data.data;
        if (!data.exists || (data.status !== 'COMPLETED' && data.status !== 'SKIPPED')) {
          router.replace('/setup');
        }
      })
      .catch(() => {
        // If wizard service unavailable, continue to dashboard
      });
  }, []);

  useEffect(() => {
    hydrate();
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Unable to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const isModuleAllowed = (moduleName: string): boolean => {
    const rbacModule = MODULE_RBAC_MAP[moduleName];
    if (!rbacModule) return true;
    // If no permissions resolved (no token/roles), show everything
    if (permissions && !hasPermission(rbacModule, PermissionLevel.VIEW)) return false;
    if (config.hiddenModules.includes(moduleName)) return false;
    return true;
  };

  const isWidgetVisible = (widgetId: keyof typeof config.widgets): boolean => {
    return config.widgets[widgetId]?.visible ?? true;
  };

  const sortedSections = useMemo(
    () =>
      [...SECTION_IDS].sort(
        (a, b) => (config.sections[a]?.order ?? 0) - (config.sections[b]?.order ?? 0)
      ),
    [config.sections]
  );

  const visibleSections = useMemo(
    () =>
      sortedSections.filter((id) => {
        if (!config.sections[id]?.visible) return false;
        const modules = SECTION_MODULE_MAP[id];
        return modules.some((m) => isModuleAllowed(m.name));
      }),
    [sortedSections, config, hasPermission]
  );

  const hasAnyContent =
    isWidgetVisible('compliance-gauges') ||
    isWidgetVisible('stat-cards') ||
    isWidgetVisible('quick-actions') ||
    isWidgetVisible('activity-feed') ||
    isWidgetVisible('top-risks') ||
    isWidgetVisible('overdue-capa') ||
    isWidgetVisible('ai-insights') ||
    visibleSections.length > 0;

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">IMS Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Integrated Management System Overview
              </p>
            </div>
            <button
              onClick={openCustomize}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Customize
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  loadStats();
                }}
                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {!hasAnyContent && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <SlidersHorizontal className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your dashboard is empty
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                All widgets and sections are hidden. Customize your dashboard to show the content
                you need.
              </p>
              <button
                onClick={openCustomize}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Customize Dashboard
              </button>
            </div>
          )}

          {/* Compliance Gauges */}
          {isWidgetVisible('compliance-gauges') && (
            <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          )}

          {/* Stats Cards */}
          {isWidgetVisible('stat-cards') && (
            <div aria-live="polite" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Risks</p>
                      <p className="text-2xl font-bold">{stats?.risks.total || 0}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-red-600 font-medium">
                      {stats?.risks.critical || 0} critical
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 mx-1">|</span>
                    <span className="text-orange-600 font-medium">
                      {stats?.risks.high || 0} high
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Open Incidents</p>
                      <p className="text-2xl font-bold">{stats?.incidents.open || 0}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Shield className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {stats?.incidents.thisMonth || 0} this month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Actions</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.actions.overdue || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {stats?.actions.dueThisWeek || 0} due this week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">AI Insights</p>
                      <p className="text-2xl font-bold">{stats?.recentAIInsights?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Latest analyses
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions + Activity Feed */}
          {(isWidgetVisible('quick-actions') || isWidgetVisible('activity-feed')) && (
            <div
              data-tour="dashboard-actions"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            >
              {/* Quick Actions */}
              {isWidgetVisible('quick-actions') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      {
                        label: 'Report Incident',
                        href: `${APP_BASE}:3001/incidents`,
                        color:
                          'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 border-red-200 dark:border-red-800' },
                      {
                        label: 'Raise NCR',
                        href: `${APP_BASE}:3003/nonconformances`,
                        color:
                          'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800' },
                      {
                        label: 'New CAPA',
                        href: `${APP_BASE}:3003/capa`,
                        color:
                          'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900 border-orange-200 dark:border-orange-800' },
                      {
                        label: 'Log Environmental Event',
                        href: `${APP_BASE}:3002/events`,
                        color:
                          'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 border-green-200 dark:border-green-800' },
                      {
                        label: 'Create Work Order',
                        href: `${APP_BASE}:3017/work-orders`,
                        color:
                          'bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 border-stone-200 dark:border-stone-800' },
                      {
                        label: 'New Risk Assessment',
                        href: `${APP_BASE}:3001/risks`,
                        color:
                          'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900 border-yellow-200 dark:border-yellow-800' },
                    ].map((action) => (
                      <a
                        key={action.label}
                        href={action.href}
                        className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-md border transition-colors ${action.color}`}
                      >
                        {action.label}
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Cross-Module Activity Feed */}
              {isWidgetVisible('activity-feed') && (
                <Card
                  className={isWidgetVisible('quick-actions') ? 'lg:col-span-2' : 'lg:col-span-3'}
                >
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          module: 'Quality',
                          action: 'NCR created',
                          detail: 'NCR-2026-0042 — Supplier material out of spec',
                          time: '5m ago',
                          color: 'bg-blue-500' },
                        {
                          module: 'H&S',
                          action: 'Incident resolved',
                          detail: 'INC-2026-0118 — Slip hazard in warehouse',
                          time: '22m ago',
                          color: 'bg-red-500' },
                        {
                          module: 'CMMS',
                          action: 'PM completed',
                          detail: 'WO-2026-0315 — HVAC quarterly maintenance',
                          time: '45m ago',
                          color: 'bg-stone-500' },
                        {
                          module: 'Environment',
                          action: 'Aspect reviewed',
                          detail: 'ENV-ASP-2026-012 — Water discharge monitoring',
                          time: '1h ago',
                          color: 'bg-green-500' },
                        {
                          module: 'CRM',
                          action: 'Deal closed',
                          detail: 'Enterprise license — Acme Corp ($48,000)',
                          time: '2h ago',
                          color: 'bg-pink-500' },
                        {
                          module: 'InfoSec',
                          action: 'Risk mitigated',
                          detail: 'ISR-2026-008 — Endpoint encryption deployed',
                          time: '3h ago',
                          color: 'bg-cyan-500' },
                        {
                          module: 'Field Service',
                          action: 'Job dispatched',
                          detail: 'FSJ-2026-0089 — Emergency repair at Site 7',
                          time: '4h ago',
                          color: 'bg-blue-500' },
                        {
                          module: 'Finance',
                          action: 'Invoice approved',
                          detail: 'INV-2026-0401 — Q1 supplier payment batch',
                          time: '5h ago',
                          color: 'bg-lime-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 flex flex-col items-center">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                            {i < 7 && (
                              <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
                                {item.module}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.action}
                              </span>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto shrink-0">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Main Content Grid */}
          {(isWidgetVisible('top-risks') ||
            isWidgetVisible('overdue-capa') ||
            isWidgetVisible('ai-insights')) && (
            <div data-tour="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Risks */}
              {isWidgetVisible('top-risks') && (
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
                          <div
                            key={risk.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{risk.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    risk.standard === 'ISO_45001'
                                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                      : risk.standard === 'ISO_14001'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {risk.standard.replace('_', ' ')}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    risk.riskLevel === 'CRITICAL'
                                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                      : risk.riskLevel === 'HIGH'
                                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                  }`}
                                >
                                  {risk.riskLevel}
                                </span>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                              {risk.riskScore}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No active risks
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Overdue Actions */}
              {isWidgetVisible('overdue-capa') && (
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
                          <div
                            key={action.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{action.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {action.referenceNumber}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    action.priority === 'CRITICAL'
                                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                      : action.priority === 'HIGH'
                                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                  }`}
                                >
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
              )}

              {/* AI Insights */}
              {isWidgetVisible('ai-insights') && (
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
                          <div
                            key={insight.id}
                            className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-100 dark:border-purple-800"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                  {insight.sourceType}
                                </p>
                                <p className="text-sm mt-1">
                                  {insight.suggestedRootCause || 'Analysis available'}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(insight.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No AI insights yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Module Sections (ordered by user preference) */}
          {visibleSections.map((sectionId) => {
            const modules = SECTION_MODULE_MAP[sectionId];
            const filteredModules = modules.filter((m) => isModuleAllowed(m.name));
            if (filteredModules.length === 0) return null;

            return (
              <div
                key={sectionId}
                className={
                  sectionId === visibleSections[visibleSections.length - 1] ? 'mt-8 mb-8' : 'mt-8'
                }
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {SECTION_LABELS[sectionId]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredModules.map((mod) => (
                    <ModuleCardLink key={mod.port} mod={mod} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Quick Add FAB */}
      <QuickAddMenu />

      {/* Customize Modal */}
      <CustomizeModal />

      {/* Welcome Discovery Wizard */}
      <WelcomeWizardModal
        isOpen={wizard.isOpen}
        step={wizard.state.lastSeenStep}
        onStepChange={wizard.setStep}
        onMinimize={wizard.minimize}
        onDismiss={wizard.dismiss}
        onComplete={wizard.complete}
        onStartTour={handleStartTour}
      />
      <WizardFab show={wizard.showFab} onClick={wizard.expand} />
      <WizardChecklist
        show={wizard.showChecklist}
        completedItems={wizard.state.checklistItems}
        onDismiss={wizard.dismissChecklist}
        onItemClick={wizard.completeChecklistItem}
      />

      {/* Dashboard Tour */}
      {tour.isActive && (
        <TourManager
          tourId="home-dashboard"
          isActive={tour.isActive}
          currentStep={tour.currentStep}
          onNext={tour.nextStep}
          onBack={tour.prevStep}
          onSkip={tour.skipTour}
        >
          <span />
        </TourManager>
      )}
    </div>
  );
}
