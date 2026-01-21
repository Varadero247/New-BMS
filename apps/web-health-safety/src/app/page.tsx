'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ComplianceGauge, RiskMatrix, SafetyTrendChart } from '@ims/charts';
import { AlertTriangle, FileWarning, Clock, TrendingUp, Users, Activity } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  compliance: number;
  risks: { total: number; high: number; critical: number };
  incidents: { total: number; open: number; thisMonth: number };
  actions: { overdue: number; dueThisWeek: number };
  metrics: {
    ltifr: number;
    trir: number;
    severityRate: number;
  };
  topRisks: any[];
  recentIncidents: any[];
}

export default function HealthSafetyDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [risksRes, incidentsRes, metricsRes] = await Promise.all([
        api.get('/risks'),
        api.get('/incidents'),
        api.get('/metrics').catch(() => ({ data: { data: null } })),
      ]);

      const risks = risksRes.data.data || [];
      const incidents = incidentsRes.data.data || [];
      const metrics = metricsRes.data?.data;

      setStats({
        compliance: 78,
        risks: {
          total: risks.length,
          high: risks.filter((r: any) => r.riskLevel === 'HIGH').length,
          critical: risks.filter((r: any) => r.riskLevel === 'CRITICAL').length,
        },
        incidents: {
          total: incidents.length,
          open: incidents.filter((i: any) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length,
          thisMonth: incidents.filter((i: any) => {
            const date = new Date(i.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          }).length,
        },
        actions: { overdue: 3, dueThisWeek: 5 },
        metrics: metrics || { ltifr: 0, trir: 0, severityRate: 0 },
        topRisks: risks.slice(0, 5),
        recentIncidents: incidents.slice(0, 5),
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health & Safety Dashboard</h1>
          <p className="text-gray-500 mt-1">ISO 45001 Occupational Health & Safety Management</p>
        </div>

        {/* Compliance & Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ComplianceGauge
                value={stats?.compliance || 0}
                label="ISO 45001"
                color="#ef4444"
                size="md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">LTIFR</p>
                  <p className="text-2xl font-bold">{stats?.metrics.ltifr.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Lost Time Injury Frequency Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">TRIR</p>
                  <p className="text-2xl font-bold">{stats?.metrics.trir.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Total Recordable Incident Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Severity Rate</p>
                  <p className="text-2xl font-bold">{stats?.metrics.severityRate.toFixed(1) || '0.0'}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Days Lost per Incident</p>
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
                  <FileWarning className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.incidents.thisMonth || 0} reported this month
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
                  <p className="text-sm text-gray-500">Total Incidents (YTD)</p>
                  <p className="text-2xl font-bold">{stats?.incidents.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileWarning className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Risks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Top Safety Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topRisks && stats.topRisks.length > 0 ? (
                <div className="space-y-3">
                  {stats.topRisks.map((risk: any) => (
                    <div key={risk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{risk.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          risk.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          risk.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {risk.riskLevel}
                        </span>
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

          {/* Recent Incidents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-yellow-500" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentIncidents.map((incident: any) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{incident.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{incident.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            incident.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                            incident.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No incidents recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
