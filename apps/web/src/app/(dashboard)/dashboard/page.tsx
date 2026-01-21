'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Bot,
  Plus,
  HardHat,
  Leaf,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ComplianceGauge, RiskMatrix } from '@/components/charts';
import api from '@/lib/api';

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
    byStandard: Record<string, number>;
  };
  incidents: {
    total: number;
    open: number;
    thisMonth: number;
    byStandard: Record<string, number>;
  };
  actions: {
    total: number;
    open: number;
    overdue: number;
    dueThisWeek: number;
  };
  topRisks: Array<{
    id: string;
    title: string;
    standard: string;
    riskScore: number;
    riskLevel: string;
  }>;
  overdueActions: Array<{
    id: string;
    title: string;
    referenceNumber: string;
    dueDate: string;
    owner: { firstName: string; lastName: string };
  }>;
  recentAIInsights: Array<{
    id: string;
    sourceType: string;
    suggestedRootCause: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskMatrix, setRiskMatrix] = useState<Record<string, any[]>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, matrixRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/risks/matrix'),
        ]);

        setStats(statsRes.data.data);
        setRiskMatrix(matrixRes.data.data?.matrix || {});
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case 'ISO_45001':
        return <HardHat className="w-4 h-4 text-red-500" />;
      case 'ISO_14001':
        return <Leaf className="w-4 h-4 text-green-500" />;
      case 'ISO_9001':
        return <Award className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            IMS Dashboard
          </h1>
          <p className="text-muted-foreground">
            Integrated Management System Overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/hs/incidents/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Compliance Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 flex flex-col items-center">
          <ComplianceGauge
            value={stats?.compliance.iso45001 || 0}
            label="ISO 45001 (H&S)"
            color="#ef4444"
            size="md"
          />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <ComplianceGauge
            value={stats?.compliance.iso14001 || 0}
            label="ISO 14001 (Env)"
            color="#22c55e"
            size="md"
          />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <ComplianceGauge
            value={stats?.compliance.iso9001 || 0}
            label="ISO 9001 (Quality)"
            color="#3b82f6"
            size="md"
          />
        </Card>
        <Card className="p-6 flex flex-col items-center">
          <ComplianceGauge
            value={stats?.compliance.overall || 0}
            label="Overall"
            color="#8b5cf6"
            size="md"
          />
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Risks</p>
              <p className="text-2xl font-bold">{stats?.risks.total || 0}</p>
            </div>
            <div className="flex flex-col items-end text-xs">
              <span className="text-orange-500">{stats?.risks.high || 0} High</span>
              <span className="text-red-500">{stats?.risks.critical || 0} Critical</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Incidents</p>
              <p className="text-2xl font-bold">{stats?.incidents.open || 0}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {stats?.incidents.thisMonth || 0} this month
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Actions</p>
              <p className="text-2xl font-bold">{stats?.actions.open || 0}</p>
            </div>
            <div className="flex flex-col items-end text-xs">
              <span className="text-red-500">{stats?.actions.overdue || 0} Overdue</span>
              <span className="text-yellow-500">{stats?.actions.dueThisWeek || 0} Due this week</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Incidents</p>
              <p className="text-2xl font-bold">{stats?.incidents.total || 0}</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="text-red-500">{stats?.incidents.byStandard?.ISO_45001 || 0}</span>
              <span className="text-green-500">{stats?.incidents.byStandard?.ISO_14001 || 0}</span>
              <span className="text-blue-500">{stats?.incidents.byStandard?.ISO_9001 || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Risk Matrix</h2>
            <Link
              href="/hs/risks"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <RiskMatrix data={riskMatrix} />
        </Card>

        {/* Top Risks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top 5 Highest Risks</h2>
          </div>
          <div className="space-y-3">
            {stats?.topRisks?.length ? (
              stats.topRisks.map((risk) => (
                <Link
                  key={risk.id}
                  href={`/hs/risks/${risk.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStandardIcon(risk.standard)}
                    <div>
                      <p className="font-medium text-sm">{risk.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Score: {risk.riskScore}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(
                      risk.riskLevel
                    )}`}
                  >
                    {risk.riskLevel}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active risks found
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overdue Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              Overdue Actions
            </h2>
            <Link
              href="/actions?status=OVERDUE"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.overdueActions?.length ? (
              stats.overdueActions.map((action) => {
                const daysOverdue = Math.floor(
                  (Date.now() - new Date(action.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.referenceNumber} • {action.owner.firstName} {action.owner.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 font-medium">
                        {daysOverdue} days overdue
                      </span>
                      <Link
                        href={`/actions/${action.id}`}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Fix Now
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                No overdue actions
              </div>
            )}
          </div>
        </Card>

        {/* Recent AI Insights */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Latest AI Insights
            </h2>
            <Link
              href="/settings"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Configure AI <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentAIInsights?.length ? (
              stats.recentAIInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary capitalize">
                      {insight.sourceType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">
                    {insight.suggestedRootCause || 'Analysis completed'}
                  </p>
                  <button className="mt-2 text-xs text-primary hover:underline">
                    Apply Suggestions
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bot className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No AI insights yet</p>
                <p className="text-xs">Configure AI in Settings to get started</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Add Floating Menu */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
            <Plus className="w-6 h-6" />
          </button>
          <div className="absolute bottom-16 right-0 hidden group-hover:flex flex-col gap-2 bg-card p-2 rounded-lg shadow-lg border min-w-[160px]">
            <Link
              href="/hs/incidents/new"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
            >
              <HardHat className="w-4 h-4 text-red-500" />
              H&S Incident
            </Link>
            <Link
              href="/environment/events/new"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
            >
              <Leaf className="w-4 h-4 text-green-500" />
              Env Event
            </Link>
            <Link
              href="/quality/ncs/new"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
            >
              <Award className="w-4 h-4 text-blue-500" />
              Quality NC
            </Link>
            <Link
              href="/actions/new"
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
            >
              <CheckCircle className="w-4 h-4 text-primary" />
              New Action
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
