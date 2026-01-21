'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ComplianceGauge, RiskMatrix } from '@ims/charts';
import {
  Shield,
  Leaf,
  Award,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  ExternalLink,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const response = await api.get('/api/dashboard/stats');
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
                  color="#ef4444"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.iso14001 || 0}
                  label="Environmental"
                  color="#22c55e"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.iso9001 || 0}
                  label="Quality"
                  color="#3b82f6"
                  size="md"
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex justify-center">
                <ComplianceGauge
                  value={stats?.compliance.overall || 0}
                  label="Overall IMS"
                  color="#8b5cf6"
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

          {/* Module Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="http://localhost:3001"
              className="flex items-center justify-between p-6 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Health & Safety</h3>
                  <p className="text-sm text-red-600">ISO 45001</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-red-400" />
            </a>

            <a
              href="http://localhost:3002"
              className="flex items-center justify-between p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Environmental</h3>
                  <p className="text-sm text-green-600">ISO 14001</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-green-400" />
            </a>

            <a
              href="http://localhost:3003"
              className="flex items-center justify-between p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Quality</h3>
                  <p className="text-sm text-blue-600">ISO 9001</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-blue-400" />
            </a>
          </div>
        </div>
      </main>

      {/* Quick Add FAB */}
      <QuickAddMenu />
    </div>
  );
}
