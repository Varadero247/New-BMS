'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import {
  Activity, AlertTriangle, Clock, TrendingUp, TrendingDown,
  RefreshCw, CalendarClock,
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface KriRisk {
  id: string;
  title: string;
  referenceNumber: string;
  residualRiskLevel?: string;
}

interface Kri {
  id: string;
  riskId: string;
  name: string;
  description?: string;
  unit?: string;
  currentValue?: number;
  currentStatus?: 'RED' | 'AMBER' | 'GREEN' | string;
  greenThreshold?: number;
  amberThreshold?: number;
  redThreshold?: number;
  thresholdDirection?: 'INCREASING_IS_WORSE' | 'DECREASING_IS_WORSE';
  measurementFrequency?: string;
  nextMeasurementDue?: string;
  lastMeasuredAt?: string;
  risk: KriRisk;
}

const STATUS_COLORS: Record<string, string> = {
  RED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  AMBER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  GREEN: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const STATUS_DOT: Record<string, string> = {
  RED: 'bg-red-500',
  AMBER: 'bg-amber-500',
  GREEN: 'bg-green-500',
};

function KriStatusBadge({ status }: { status?: string }) {
  const s = status || 'GREEN';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[s] || STATUS_COLORS.GREEN}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s] || 'bg-gray-400'}`} />
      {s}
    </span>
  );
}

function isDueSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7 && diff >= 0;
}

function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function KriPage() {
  const [breaches, setBreaches] = useState<Kri[]>([]);
  const [due, setDue] = useState<Kri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashStats, setDashStats] = useState<{ red: number; amber: number; green: number }>({ red: 0, amber: 0, green: 0 });

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [breachRes, dueRes, statsRes] = await Promise.all([
        api.get('/risks/kri/breaches'),
        api.get('/risks/kri/due'),
        api.get('/dashboard/stats').catch(() => ({ data: { data: {} } })),
      ]);
      const breachData: Kri[] = breachRes.data.data || [];
      setBreaches(breachData);
      setDue(dueRes.data.data || []);
      const stats = statsRes.data.data || {};
      setDashStats({
        red: stats.kriRed ?? breachData.filter(k => k.currentStatus === 'RED').length,
        amber: stats.kriAmber ?? breachData.filter(k => k.currentStatus === 'AMBER').length,
        green: stats.kriGreen ?? 0,
      });
    } catch (e: unknown) {
      setError(e.response?.status === 401 ? 'Session expired. Please log in.' : 'Failed to load KRI data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const redBreaches = breaches.filter(k => k.currentStatus === 'RED');
  const amberBreaches = breaches.filter(k => k.currentStatus === 'AMBER');

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">KRI Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Key Risk Indicator monitoring and threshold breaches</p>
            </div>
            <button onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Red KRIs</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                      {loading ? '—' : dashStats.red || redBreaches.length}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Threshold breached</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Amber KRIs</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {loading ? '—' : dashStats.amber || amberBreaches.length}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Warning level</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <Activity className="h-7 w-7 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Due This Week</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {loading ? '—' : due.length}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Readings required</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Clock className="h-7 w-7 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breaches Table */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Threshold Breaches
              {breaches.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">
                  {breaches.length}
                </span>
              )}
            </h2>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="animate-pulse space-y-3 p-5">
                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />)}
                  </div>
                ) : breaches.length === 0 ? (
                  <div className="py-12 text-center">
                    <Activity className="h-10 w-10 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No threshold breaches</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All KRIs are within acceptable limits</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">KRI Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Value</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Threshold</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direction</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                        {breaches.map(kri => (
                          <tr key={kri.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${kri.currentStatus === 'RED' ? 'bg-red-50/30 dark:bg-red-900/10' : 'bg-amber-50/30 dark:bg-amber-900/10'}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{kri.name}</p>
                              {kri.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-xs">{kri.description}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <Link href={`/risks/${kri.riskId}`} className="hover:underline">
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{kri.risk?.referenceNumber}</span>
                                <p className="text-gray-700 dark:text-gray-300 text-xs mt-0.5 max-w-[160px] truncate">{kri.risk?.title}</p>
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-gray-900 dark:text-gray-100">
                                {kri.currentValue != null ? kri.currentValue : '—'}
                                {kri.unit && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{kri.unit}</span>}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                              {kri.currentStatus === 'RED'
                                ? (kri.redThreshold != null ? kri.redThreshold : '—')
                                : (kri.amberThreshold != null ? kri.amberThreshold : '—')}
                              {kri.unit && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{kri.unit}</span>}
                            </td>
                            <td className="px-4 py-3">
                              {kri.thresholdDirection === 'INCREASING_IS_WORSE'
                                ? <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><TrendingUp className="h-3.5 w-3.5" />Increasing worse</div>
                                : <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><TrendingDown className="h-3.5 w-3.5" />Decreasing worse</div>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <KriStatusBadge status={kri.currentStatus} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Due for Reading Table */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-500" />
              Due for Reading (Next 7 Days)
              {due.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  {due.length}
                </span>
              )}
            </h2>

            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="animate-pulse space-y-3 p-5">
                    {[1, 2].map(i => <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded" />)}
                  </div>
                ) : due.length === 0 ? (
                  <div className="py-10 text-center">
                    <Clock className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No KRI readings due this week</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">KRI Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Measurement Due</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequency</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                        {due.map(kri => {
                          const overdue = isOverdue(kri.nextMeasurementDue);
                          return (
                            <tr key={kri.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${overdue ? 'bg-red-50/20 dark:bg-red-900/10' : ''}`}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{kri.name}</p>
                                {kri.unit && <p className="text-xs text-gray-400 dark:text-gray-500">Unit: {kri.unit}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <Link href={`/risks/${kri.riskId}`} className="hover:underline">
                                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{kri.risk?.referenceNumber}</span>
                                  <p className="text-gray-700 dark:text-gray-300 text-xs mt-0.5 max-w-[160px] truncate">{kri.risk?.title}</p>
                                </Link>
                              </td>
                              <td className="px-4 py-3">
                                {kri.nextMeasurementDue ? (
                                  <div>
                                    <p className={`font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                      {new Date(kri.nextMeasurementDue).toLocaleDateString()}
                                    </p>
                                    {overdue && (
                                      <span className="text-xs text-red-500 font-medium">Overdue</span>
                                    )}
                                  </div>
                                ) : '—'}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                {kri.measurementFrequency || '—'}
                              </td>
                              <td className="px-4 py-3">
                                <KriStatusBadge status={kri.currentStatus} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
