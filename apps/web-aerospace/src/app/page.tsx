'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Settings,
  GitPullRequest,
  Database,
  Search,
  Shield,
  FileCheck,
  AlertOctagon,
  Zap,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  configurationItems: { total: number; active: number; underReview: number };
  engineeringChanges: { total: number; open: number; pending: number };
  baselines: { total: number; active: number };
  audits: { total: number; pending: number; overdue: number };
  productSafety: { total: number; openIssues: number };
  firstArticle: { total: number; pending: number };
  specialProcesses: { total: number; dueForReview: number };
  counterfeitParts: { total: number; alerts: number };
}

export default function AerospaceDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [recentChanges, setRecentChanges] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [configRes, changesRes] = await Promise.all([
        api.get('/configuration').catch(() => ({ data: { data: [] } })),
        api.get('/changes').catch(() => ({ data: { data: [] } })),
      ]);

      const configItems = configRes.data.data || [];
      const changes = changesRes.data.data || [];

      setRecentItems(configItems.slice(0, 5));
      setRecentChanges(changes.slice(0, 5));

      setStats({
        configurationItems: {
          total: configItems.length,
          active: configItems.filter((ci: any) => ci.status === 'ACTIVE').length,
          underReview: configItems.filter((ci: any) => ci.status === 'UNDER_REVIEW').length,
        },
        engineeringChanges: {
          total: changes.length,
          open: changes.filter((c: any) => c.status === 'OPEN' || c.status === 'IN_REVIEW').length,
          pending: changes.filter((c: any) => c.status === 'PENDING_APPROVAL').length,
        },
        baselines: { total: 0, active: 0 },
        audits: { total: 0, pending: 0, overdue: 0 },
        productSafety: { total: 0, openIssues: 0 },
        firstArticle: { total: 0, pending: 0 },
        specialProcesses: { total: 0, dueForReview: 0 },
        counterfeitParts: { total: 0, alerts: 0 },
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
          <h1 className="text-3xl font-bold text-gray-900">Aerospace Dashboard</h1>
          <p className="text-gray-500 mt-1">AS9100D Aerospace Quality Management System</p>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Configuration Items</p>
                  <p className="text-2xl font-bold">{stats?.configurationItems.total || 0}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Settings className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-indigo-600 font-medium">{stats?.configurationItems.active || 0} active</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-amber-600 font-medium">{stats?.configurationItems.underReview || 0} under review</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open ECPs</p>
                  <p className="text-2xl font-bold text-amber-600">{stats?.engineeringChanges.open || 0}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <GitPullRequest className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.engineeringChanges.pending || 0} pending approval
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Baselines</p>
                  <p className="text-2xl font-bold">{stats?.baselines.active || 0}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-full">
                  <Database className="h-6 w-6 text-slate-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.baselines.total || 0} total baselines
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Audits</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.audits.pending || 0}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Search className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-red-600 font-medium">{stats?.audits.overdue || 0} overdue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Product Safety</p>
                  <p className="text-2xl font-bold">{stats?.productSafety.total || 0}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-amber-600 font-medium">{stats?.productSafety.openIssues || 0} open issues</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">First Article</p>
                  <p className="text-2xl font-bold">{stats?.firstArticle.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileCheck className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.firstArticle.pending || 0} pending review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Special Processes</p>
                  <p className="text-2xl font-bold">{stats?.specialProcesses.total || 0}</p>
                </div>
                <div className="p-3 bg-violet-100 rounded-full">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.specialProcesses.dueForReview || 0} due for review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Counterfeit Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.counterfeitParts.alerts || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertOctagon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {stats?.counterfeitParts.total || 0} tracked parts
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Configuration Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                Recent Configuration Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentItems.length > 0 ? (
                <div className="space-y-3">
                  {recentItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-mono">{item.ciNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            item.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status?.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.type === 'HARDWARE' ? 'bg-indigo-100 text-indigo-700' :
                            item.type === 'SOFTWARE' ? 'bg-purple-100 text-purple-700' :
                            item.type === 'DOCUMENT' ? 'bg-slate-100 text-slate-700' :
                            'bg-cyan-100 text-cyan-700'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No configuration items recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Engineering Changes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-amber-500" />
                Recent Engineering Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentChanges.length > 0 ? (
                <div className="space-y-3">
                  {recentChanges.map((change: any) => (
                    <div key={change.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{change.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-mono">{change.ecpNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            change.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                            change.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' :
                            change.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            change.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {change.status?.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            change.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            change.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            change.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {change.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(change.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No engineering changes recorded</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
