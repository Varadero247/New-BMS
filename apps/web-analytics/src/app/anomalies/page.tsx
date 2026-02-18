'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { AlertTriangle, CheckCircle, XCircle, Eye, ShieldAlert, Activity } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnomalyAlert {
  id: string;
  kpiName: string;
  module: string;
  detectedAt: string;
  severity: string;
  status: string;
  description: string;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  unit: string;
  recommendation: string;
  dismissedBy?: string;
  dismissedAt?: string;
  dismissReason?: string;
}

interface MonitoredKpi {
  id: string;
  name: string;
  module: string;
  currentValue: number;
  baselineValue: number;
  upperThreshold: number;
  lowerThreshold: number;
  unit: string;
  status: string;
  lastChecked: string;
  checkFrequency: string;
}

type TabId = 'alerts' | 'kpis';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(s: string): string {
  if (s === 'CRITICAL') return 'bg-red-600 text-white';
  if (s === 'HIGH') return 'bg-red-100 text-red-700';
  if (s === 'MEDIUM') return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
}

function statusColor(s: string): string {
  if (s === 'ACTIVE') return 'bg-red-100 text-red-700';
  if (s === 'ACKNOWLEDGED') return 'bg-blue-100 text-blue-700';
  if (s === 'DISMISSED') return 'bg-gray-100 dark:bg-gray-800 text-gray-500';
  if (s === 'RESOLVED') return 'bg-green-100 text-green-700';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-700';
}

function kpiStatusColor(s: string): string {
  if (s === 'ANOMALY') return 'bg-red-100 text-red-700';
  if (s === 'WARNING') return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnomaliesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('alerts');
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [anomalySummary, setAnomalySummary] = useState<any>(null);
  const [kpis, setKpis] = useState<MonitoredKpi[]>([]);
  const [kpiSummary, setKpiSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [anomRes, kpiRes] = await Promise.all([
          api.get('/anomalies').catch(() => null),
          api.get('/anomalies/kpis').catch(() => null),
        ]);
        if (anomRes) {
          setAnomalies(anomRes.data.data.anomalies || []);
          setAnomalySummary(anomRes.data.data.summary || null);
        }
        if (kpiRes) {
          setKpis(kpiRes.data.data.kpis || []);
          setKpiSummary(kpiRes.data.data.summary || null);
        }
      } catch {
        // graceful fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredAnomalies = anomalies.filter((a) => {
    if (severityFilter && a.severity !== severityFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Anomaly Detection</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Automated monitoring of KPIs with anomaly alerting across all modules
          </p>
        </div>

        {/* Summary Cards */}
        {anomalySummary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="rounded-lg p-4 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
              <p className="text-2xl font-bold">{anomalySummary.total}</p>
              <p className="text-sm font-medium mt-0.5">Total Alerts</p>
            </div>
            <div className="rounded-lg p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <p className="text-2xl font-bold">{anomalySummary.active}</p>
              <p className="text-sm font-medium mt-0.5">Active</p>
            </div>
            <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
              <p className="text-2xl font-bold">{anomalySummary.critical}</p>
              <p className="text-sm font-medium mt-0.5">Critical</p>
            </div>
            <div className="rounded-lg p-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <p className="text-2xl font-bold">{anomalySummary.acknowledged}</p>
              <p className="text-sm font-medium mt-0.5">Acknowledged</p>
            </div>
            <div className="rounded-lg p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              <p className="text-2xl font-bold">{anomalySummary.resolved}</p>
              <p className="text-sm font-medium mt-0.5">Resolved</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'alerts'
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Anomaly Alerts ({anomalies.length})
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'kpis'
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300'
            }`}
          >
            Monitored KPIs ({kpis.length})
          </button>
        </div>

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredAnomalies.map((anomaly) => (
                <Card key={anomaly.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {anomaly.status === 'RESOLVED' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : anomaly.status === 'DISMISSED' ? (
                            <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          ) : anomaly.severity === 'CRITICAL' ? (
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {anomaly.kpiName}
                            </h3>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${severityColor(anomaly.severity)}`}
                            >
                              {anomaly.severity}
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusColor(anomaly.status)}`}
                            >
                              {anomaly.status}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {anomaly.module}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {anomaly.description}
                          </p>

                          {/* Expanded details */}
                          {expandedId === anomaly.id && (
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                                    Expected
                                  </p>
                                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    {anomaly.expectedValue} {anomaly.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 dark:text-gray-500 text-xs">Actual</p>
                                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    {anomaly.actualValue} {anomaly.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                                    Deviation
                                  </p>
                                  <p
                                    className={`font-semibold ${anomaly.deviationPercent > 0 ? 'text-red-600' : 'text-green-600'}`}
                                  >
                                    {anomaly.deviationPercent > 0 ? '+' : ''}
                                    {anomaly.deviationPercent}%
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Recommendation
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                  {anomaly.recommendation}
                                </p>
                              </div>
                              {anomaly.dismissReason && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Dismiss Reason
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {anomaly.dismissReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatDate(anomaly.detectedAt)}
                        </span>
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === anomaly.id ? null : anomaly.id)
                          }
                          className="text-gray-400 dark:text-gray-500 hover:text-purple-600 transition-colors"
                          title="Toggle details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAnomalies.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No anomaly alerts match your filters.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Monitored KPIs Tab */}
        {activeTab === 'kpis' && (
          <>
            {kpiSummary && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg p-4 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-2xl font-bold">{kpiSummary.anomaly}</p>
                  <p className="text-sm font-medium mt-0.5">In Anomaly</p>
                </div>
                <div className="rounded-lg p-4 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                  <p className="text-2xl font-bold">{kpiSummary.warning}</p>
                  <p className="text-sm font-medium mt-0.5">Warning</p>
                </div>
                <div className="rounded-lg p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  <p className="text-2xl font-bold">{kpiSummary.normal}</p>
                  <p className="text-sm font-medium mt-0.5">Normal</p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Monitored KPIs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          KPI
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Module
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Current
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Baseline
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Thresholds
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.map((kpi) => (
                        <tr
                          key={kpi.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {kpi.name}
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                            {kpi.module}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                            {kpi.currentValue}{' '}
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {kpi.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                            {kpi.baselineValue}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-400 dark:text-gray-500 text-xs">
                            {kpi.lowerThreshold} - {kpi.upperThreshold}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${kpiStatusColor(kpi.status)}`}
                            >
                              {kpi.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">
                            {kpi.checkFrequency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
