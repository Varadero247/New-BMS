'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface SystemMetric {
  id: string;
  systemName: string;
  accuracy: number;
  latency: number;
  throughput: number;
  driftScore: number;
  biasScore: number;
  errorRate: number;
  lastChecked: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  systemName: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  createdAt: string;
}

const mockMetrics: SystemMetric[] = [
  { id: '1', systemName: 'Document Classifier', accuracy: 94.2, latency: 120, throughput: 1250, driftScore: 0.03, biasScore: 0.02, errorRate: 1.8, lastChecked: new Date().toISOString(), status: 'healthy' },
  { id: '2', systemName: 'Risk Scorer', accuracy: 91.7, latency: 85, throughput: 3400, driftScore: 0.12, biasScore: 0.08, errorRate: 3.1, lastChecked: new Date().toISOString(), status: 'warning' },
  { id: '3', systemName: 'Anomaly Detector', accuracy: 88.5, latency: 200, throughput: 800, driftScore: 0.25, biasScore: 0.15, errorRate: 5.2, lastChecked: new Date().toISOString(), status: 'critical' },
  { id: '4', systemName: 'NLP Summariser', accuracy: 96.1, latency: 350, throughput: 450, driftScore: 0.01, biasScore: 0.01, errorRate: 0.9, lastChecked: new Date().toISOString(), status: 'healthy' },
  { id: '5', systemName: 'Predictive Maintenance', accuracy: 89.3, latency: 150, throughput: 2100, driftScore: 0.08, biasScore: 0.04, errorRate: 2.4, lastChecked: new Date().toISOString(), status: 'healthy' },
];

const mockAlerts: Alert[] = [
  { id: '1', systemName: 'Anomaly Detector', type: 'DRIFT', message: 'Data drift detected: feature distribution shifted >20% from baseline', severity: 'critical', acknowledged: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', systemName: 'Risk Scorer', type: 'BIAS', message: 'Bias metric exceeded threshold for demographic group A (0.08 > 0.05)', severity: 'high', acknowledged: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', systemName: 'Risk Scorer', type: 'DRIFT', message: 'Model accuracy degraded by 3.2% over past 7 days', severity: 'medium', acknowledged: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', systemName: 'Document Classifier', type: 'PERFORMANCE', message: 'Latency spike detected: p99 reached 450ms', severity: 'low', acknowledged: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const severityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, { bg: string; dot: string }> = {
  healthy: { bg: 'bg-green-50', dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  critical: { bg: 'bg-red-50', dot: 'bg-red-500' },
};

function MetricBar({ value, max, thresholds, unit }: { value: number; max: number; thresholds: { warning: number; critical: number }; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= thresholds.critical ? 'bg-red-500' : value >= thresholds.warning ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-600">{value}{unit}</span>
    </div>
  );
}

export default function MonitoringDashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filterSeverity, setFilterSeverity] = useState('');

  const healthySystems = metrics.filter(m => m.status === 'healthy').length;
  const warningSystems = metrics.filter(m => m.status === 'warning').length;
  const criticalSystems = metrics.filter(m => m.status === 'critical').length;
  const avgAccuracy = metrics.length > 0 ? (metrics.reduce((s, m) => s + m.accuracy, 0) / metrics.length).toFixed(1) : '0';
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const filteredAlerts = filterSeverity ? alerts.filter(a => a.severity === filterSeverity) : alerts;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Monitoring Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">ISO 42001:2023 — Real-time AI system performance and compliance monitoring</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-indigo-600">{metrics.length}</div>
          <div className="text-sm text-gray-500">AI Systems</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{healthySystems}</div>
          <div className="text-sm text-gray-500">Healthy</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">{warningSystems}</div>
          <div className="text-sm text-gray-500">Warning</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{criticalSystems}</div>
          <div className="text-sm text-gray-500">Critical</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{avgAccuracy}%</div>
          <div className="text-sm text-gray-500">Avg Accuracy</div>
        </div>
      </div>

      {/* Unacknowledged alerts banner */}
      {unacknowledgedAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="text-sm font-medium text-red-800">{unacknowledgedAlerts} unacknowledged alert{unacknowledgedAlerts > 1 ? 's' : ''} requiring attention</span>
          </div>
        </div>
      )}

      {/* System Metrics Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">System Performance Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-700">System</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
                <th className="text-left p-3 font-medium text-gray-700">Accuracy</th>
                <th className="text-left p-3 font-medium text-gray-700">Drift Score</th>
                <th className="text-left p-3 font-medium text-gray-700">Bias Score</th>
                <th className="text-left p-3 font-medium text-gray-700">Error Rate</th>
                <th className="text-left p-3 font-medium text-gray-700">Latency</th>
                <th className="text-left p-3 font-medium text-gray-700">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {metrics.map(m => {
                const sc = statusColors[m.status];
                return (
                  <tr key={m.id} className={`${sc.bg} hover:opacity-90`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${sc.dot}`} />
                        <span className="font-medium text-gray-900">{m.systemName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        m.status === 'healthy' ? 'bg-green-100 text-green-700' :
                        m.status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{m.status}</span>
                    </td>
                    <td className="p-3">
                      <MetricBar value={m.accuracy} max={100} thresholds={{ warning: 0, critical: 0 }} unit="%" />
                    </td>
                    <td className="p-3">
                      <MetricBar value={m.driftScore * 100} max={50} thresholds={{ warning: 10, critical: 20 }} unit="%" />
                    </td>
                    <td className="p-3">
                      <MetricBar value={m.biasScore * 100} max={50} thresholds={{ warning: 5, critical: 10 }} unit="%" />
                    </td>
                    <td className="p-3">
                      <MetricBar value={m.errorRate} max={10} thresholds={{ warning: 3, critical: 5 }} unit="%" />
                    </td>
                    <td className="p-3 text-xs font-mono text-gray-600">{m.latency}ms</td>
                    <td className="p-3 text-xs font-mono text-gray-600">{m.throughput.toLocaleString()}/h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Alerts & Notifications</h2>
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="divide-y">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No alerts</div>
          ) : filteredAlerts.map(alert => (
            <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 ${!alert.acknowledged ? 'bg-red-50/30' : ''}`}>
              <span className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[alert.severity]}`}>
                {alert.severity.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400 uppercase">{alert.type}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{alert.systemName}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5">{alert.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="shrink-0 px-2 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds info */}
      <div className="bg-gray-50 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Monitoring Thresholds (ISO 42001 A.6.2.5)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
          <div><span className="font-medium text-gray-700">Drift Score:</span> Warning &gt;10%, Critical &gt;20%</div>
          <div><span className="font-medium text-gray-700">Bias Score:</span> Warning &gt;5%, Critical &gt;10%</div>
          <div><span className="font-medium text-gray-700">Error Rate:</span> Warning &gt;3%, Critical &gt;5%</div>
          <div><span className="font-medium text-gray-700">Accuracy:</span> Minimum 85% for production systems</div>
        </div>
      </div>
    </div>
  );
}
