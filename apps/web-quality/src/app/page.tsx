'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ComplianceGauge, COPQChart } from '@ims/charts';
import { Award, AlertOctagon, Clock, Target, TrendingUp, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardStats {
  compliance: number;
  processes: { total: number; atRisk: number };
  nonconformances: { total: number; open: number };
  actions: { overdue: number; dueThisWeek: number };
  metrics: {
    copq: number;
    dpmo: number;
    sigma: number;
    fpy: number;
  };
  topNCs: any[];
  recentComplaints: any[];
}

export default function QualityDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setError('');
    try {
      const [processesRes, ncsRes, metricsRes] = await Promise.all([
        api.get('/processes'),
        api.get('/nonconformances'),
        api.get('/metrics').catch(() => ({ data: { data: null } })),
      ]);

      const processesData = processesRes.data.data;
      const processes = Array.isArray(processesData) ? processesData : processesData?.items || [];
      const ncsData = ncsRes.data.data;
      const ncs = Array.isArray(ncsData) ? ncsData : ncsData?.items || [];
      const metrics = metricsRes.data?.data;

      setStats({
        compliance: 85,
        processes: {
          total: processes.length,
          atRisk: processes.filter((p: any) => p.status === 'AT_RISK').length,
        },
        nonconformances: {
          total: ncs.length,
          open: ncs.filter((nc: any) => nc.status === 'OPEN' || nc.status === 'INVESTIGATING').length,
        },
        actions: { overdue: 4, dueThisWeek: 6 },
        metrics: metrics || {
          copq: 125000,
          dpmo: 3400,
          sigma: 4.2,
          fpy: 96.5,
        },
        topNCs: ncs.slice(0, 5),
        recentComplaints: ncs.filter((nc: any) => nc.ncType === 'CUSTOMER_COMPLAINT').slice(0, 5),
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError('Unable to load quality data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quality Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 9001 Quality Management System</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => { setError(''); setLoading(true); loadStats(); }} className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0">
              Retry
            </button>
          </div>
        )}

        {/* Compliance & Key Metrics */}
        <div data-tour="quality-stats" className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <ComplianceGauge
                value={stats?.compliance || 0}
                label="ISO 9001"
                color="#1E3A8A"
                size="md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">COPQ</p>
                  <p className="text-2xl font-bold">${(stats?.metrics?.copq ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Cost of Poor Quality</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">DPMO</p>
                  <p className="text-2xl font-bold">{(stats?.metrics?.dpmo ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Defects per Million</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertOctagon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sigma Level</p>
                  <p className="text-2xl font-bold">{(stats?.metrics?.sigma ?? 0).toFixed(1)}σ</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Process Capability</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">First Pass Yield</p>
                  <p className="text-2xl font-bold">{(stats?.metrics?.fpy ?? 0).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Right First Time</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div data-tour="quality-ncrs" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Processes</p>
                  <p className="text-2xl font-bold">{stats?.processes.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-red-600 font-medium">{stats?.processes.atRisk || 0} at risk</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open NCs</p>
                  <p className="text-2xl font-bold">{stats?.nonconformances.open || 0}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertOctagon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stats?.nonconformances.total || 0} total NCs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Actions</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.actions.overdue || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Objectives</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div data-tour="quality-capas" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Nonconformances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-yellow-500" />
                Recent Nonconformances
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topNCs && stats.topNCs.length > 0 ? (
                <div className="space-y-3">
                  {stats.topNCs.map((nc: any) => (
                    <div key={nc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{nc.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{nc.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            nc.status === 'OPEN' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            nc.status === 'INVESTIGATING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                            'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          }`}>
                            {nc.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            nc.ncType === 'CUSTOMER_COMPLAINT' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                            nc.ncType === 'INTERNAL_AUDIT' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700'
                          }`}>
                            {nc.ncType?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(nc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No nonconformances recorded</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Complaints */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Customer Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentComplaints.map((complaint: any) => (
                    <div key={complaint.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{complaint.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{complaint.referenceNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            complaint.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            complaint.severity === 'MAJOR' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                            'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {complaint.severity}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600 text-center py-8">No customer complaints</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
