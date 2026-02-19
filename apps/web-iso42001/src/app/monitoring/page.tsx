'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Modal } from '@ims/ui';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Filter,
  Gauge,
  RefreshCw,
  Settings,
  Zap,
  XCircle,
  Eye,
  BarChart3,
  Timer,
  ShieldAlert } from 'lucide-react';

interface SystemMetric {
  id: string;
  systemName: string;
  provider: string;
  accuracy: number;
  latency: number;
  throughput: number;
  driftScore: number;
  biasScore: number;
  errorRate: number;
  requestsToday: number;
  pendingReviews: number;
  lastChecked: string;
  status: 'NORMAL' | 'WARNING' | 'ALERT' | 'CRITICAL';
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

interface TimeSeriesPoint {
  timestamp: string;
  accuracy: number;
  driftScore: number;
  biasScore: number;
  errorRate: number;
  latency: number;
}

interface ThresholdConfig {
  driftWarning: number;
  driftCritical: number;
  biasWarning: number;
  biasCritical: number;
  errorWarning: number;
  errorCritical: number;
  latencyWarning: number;
  latencyCritical: number;
  accuracyMinimum: number;
}

function generateTimeSeries(systemName: string): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = Date.now();
  const seed = systemName.charCodeAt(0) + systemName.charCodeAt(1);
  for (let i = 23; i >= 0; i--) {
    const t = now - i * 3600000;
    const jitter = (idx: number) =>
      Math.sin((seed + idx + i) * 0.7) * 0.5 + Math.cos((seed + idx) * i * 0.3) * 0.3;
    points.push({
      timestamp: new Date(t).toISOString(),
      accuracy: 90 + jitter(1) * 5 + Math.random() * 2,
      driftScore: Math.max(0, 0.05 + jitter(2) * 0.08 + Math.random() * 0.03),
      biasScore: Math.max(0, 0.03 + jitter(3) * 0.05 + Math.random() * 0.02),
      errorRate: Math.max(0, 2 + jitter(4) * 1.5 + Math.random() * 0.5),
      latency: Math.max(50, 120 + jitter(5) * 40 + Math.random() * 20) });
  }
  return points;
}

const mockMetrics: SystemMetric[] = [
  {
    id: '1',
    systemName: 'Document Classifier',
    provider: 'Claude',
    accuracy: 94.2,
    latency: 120,
    throughput: 1250,
    driftScore: 0.03,
    biasScore: 0.02,
    errorRate: 1.8,
    requestsToday: 3420,
    pendingReviews: 2,
    lastChecked: new Date().toISOString(),
    status: 'NORMAL' },
  {
    id: '2',
    systemName: 'Risk Scorer',
    provider: 'Claude',
    accuracy: 91.7,
    latency: 85,
    throughput: 3400,
    driftScore: 0.12,
    biasScore: 0.08,
    errorRate: 3.1,
    requestsToday: 8750,
    pendingReviews: 5,
    lastChecked: new Date().toISOString(),
    status: 'WARNING' },
  {
    id: '3',
    systemName: 'Anomaly Detector',
    provider: 'OpenAI',
    accuracy: 88.5,
    latency: 200,
    throughput: 800,
    driftScore: 0.25,
    biasScore: 0.15,
    errorRate: 5.2,
    requestsToday: 1200,
    pendingReviews: 12,
    lastChecked: new Date().toISOString(),
    status: 'CRITICAL' },
  {
    id: '4',
    systemName: 'NLP Summariser',
    provider: 'Claude',
    accuracy: 96.1,
    latency: 350,
    throughput: 450,
    driftScore: 0.01,
    biasScore: 0.01,
    errorRate: 0.9,
    requestsToday: 920,
    pendingReviews: 0,
    lastChecked: new Date().toISOString(),
    status: 'NORMAL' },
  {
    id: '5',
    systemName: 'Predictive Maintenance',
    provider: 'Grok',
    accuracy: 89.3,
    latency: 150,
    throughput: 2100,
    driftScore: 0.08,
    biasScore: 0.04,
    errorRate: 2.4,
    requestsToday: 5100,
    pendingReviews: 3,
    lastChecked: new Date().toISOString(),
    status: 'NORMAL' },
  {
    id: '6',
    systemName: 'Sentiment Analyzer',
    provider: 'OpenAI',
    accuracy: 92.0,
    latency: 95,
    throughput: 5200,
    driftScore: 0.06,
    biasScore: 0.09,
    errorRate: 2.8,
    requestsToday: 11200,
    pendingReviews: 7,
    lastChecked: new Date().toISOString(),
    status: 'ALERT' },
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    systemName: 'Anomaly Detector',
    type: 'DRIFT',
    message: 'Data drift detected: feature distribution shifted >20% from baseline',
    severity: 'critical',
    acknowledged: false,
    createdAt: new Date(Date.now() - 3600000).toISOString() },
  {
    id: '2',
    systemName: 'Risk Scorer',
    type: 'BIAS',
    message: 'Bias metric exceeded threshold for demographic group A (0.08 > 0.05)',
    severity: 'high',
    acknowledged: false,
    createdAt: new Date(Date.now() - 7200000).toISOString() },
  {
    id: '3',
    systemName: 'Sentiment Analyzer',
    type: 'BIAS',
    message: 'Bias score approaching threshold (0.09), monitor closely',
    severity: 'medium',
    acknowledged: false,
    createdAt: new Date(Date.now() - 14400000).toISOString() },
  {
    id: '4',
    systemName: 'Risk Scorer',
    type: 'DRIFT',
    message: 'Model accuracy degraded by 3.2% over past 7 days',
    severity: 'medium',
    acknowledged: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() },
  {
    id: '5',
    systemName: 'Document Classifier',
    type: 'PERFORMANCE',
    message: 'Latency spike detected: p99 reached 450ms',
    severity: 'low',
    acknowledged: true,
    createdAt: new Date(Date.now() - 172800000).toISOString() },
];

const defaultThresholds: ThresholdConfig = {
  driftWarning: 10,
  driftCritical: 20,
  biasWarning: 5,
  biasCritical: 10,
  errorWarning: 3,
  errorCritical: 5,
  latencyWarning: 200,
  latencyCritical: 400,
  accuracyMinimum: 85 };

const statusConfig: Record<
  string,
  {
    bg: string;
    dot: string;
    chipBg: string;
    chipText: string;
    label: string;
    icon: typeof Activity;
  }
> = {
  NORMAL: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    dot: 'bg-green-500',
    chipBg: 'bg-green-100 dark:bg-green-900/30',
    chipText: 'text-green-700 dark:text-green-300',
    label: 'Normal',
    icon: CheckCircle2 },
  WARNING: {
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    dot: 'bg-amber-500',
    chipBg: 'bg-amber-100 dark:bg-amber-900/30',
    chipText: 'text-amber-700 dark:text-amber-300',
    label: 'Warning',
    icon: AlertTriangle },
  ALERT: {
    bg: 'bg-orange-50 dark:bg-orange-900/10',
    dot: 'bg-orange-500',
    chipBg: 'bg-orange-100 dark:bg-orange-900/30',
    chipText: 'text-orange-700 dark:text-orange-300',
    label: 'Alert',
    icon: Bell },
  CRITICAL: {
    bg: 'bg-red-50 dark:bg-red-900/10',
    dot: 'bg-red-500',
    chipBg: 'bg-red-100 dark:bg-red-900/30',
    chipText: 'text-red-700 dark:text-red-300',
    label: 'Critical',
    icon: XCircle } };

const severityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };

const dateRangeOptions = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'Last 90d', value: '90d' },
];

const providerOptions = ['All', 'Claude', 'OpenAI', 'Grok'];

function MetricBar({
  value,
  max,
  thresholds,
  unit }: {
  value: number;
  max: number;
  thresholds: { warning: number; critical: number };
  unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value >= thresholds.critical
      ? 'bg-red-500'
      : value >= thresholds.warning
        ? 'bg-yellow-500'
        : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground">
        {typeof value === 'number' ? value.toFixed(1) : value}
        {unit}
      </span>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MonitoringDashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(mockMetrics);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvider, setFilterProvider] = useState('All');
  const [dateRange, setDateRange] = useState('24h');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [timeSeries, setTimeSeries] = useState<Record<string, TimeSeriesPoint[]>>({});
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [thresholds, setThresholds] = useState<ThresholdConfig>({ ...defaultThresholds });
  const [thresholdForm, setThresholdForm] = useState<ThresholdConfig>({ ...defaultThresholds });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const ts: Record<string, TimeSeriesPoint[]> = {};
    mockMetrics.forEach((m) => {
      ts[m.systemName] = generateTimeSeries(m.systemName);
    });
    setTimeSeries(ts);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Computed stats
  const totalRequestsToday = metrics.reduce((s, m) => s + m.requestsToday, 0);
  const avgLatency =
    metrics.length > 0
      ? Math.round(metrics.reduce((s, m) => s + m.latency, 0) / metrics.length)
      : 0;
  const totalPendingReviews = metrics.reduce((s, m) => s + m.pendingReviews, 0);
  const avgErrorRate =
    metrics.length > 0 ? metrics.reduce((s, m) => s + m.errorRate, 0) / metrics.length : 0;
  const normalCount = metrics.filter((m) => m.status === 'NORMAL').length;
  const avgAccuracy =
    metrics.length > 0 ? metrics.reduce((s, m) => s + m.accuracy, 0) / metrics.length : 0;
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  const handleSaveThresholds = () => {
    setThresholds({ ...thresholdForm });
    setThresholdModalOpen(false);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  });

  const filteredMetrics = metrics.filter((m) => {
    if (filterStatus && m.status !== filterStatus) return false;
    if (filterProvider !== 'All' && m.provider !== filterProvider) return false;
    return true;
  });

  const selectedTimeSeries = selectedSystem ? timeSeries[selectedSystem] || [] : [];

  return (
    <div className="p-6 bg-background min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Monitoring Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 42001:2023 -- Real-time AI system performance and compliance monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setThresholdForm({ ...thresholds });
              setThresholdModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            Thresholds
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {totalRequestsToday.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Requests Today</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{avgLatency}ms</div>
              <div className="text-xs text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalPendingReviews}</div>
              <div className="text-xs text-muted-foreground">Pending Reviews</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg ${avgErrorRate >= 3 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center`}
            >
              <ShieldAlert
                className={`h-5 w-5 ${avgErrorRate >= 3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
              />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{avgErrorRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Avg Error Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-xl font-bold text-foreground">{metrics.length}</div>
          <div className="text-[10px] text-muted-foreground">Systems</div>
        </div>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = metrics.filter((m) => m.status === key).length;
          return (
            <div key={key} className="bg-card rounded-lg border border-border p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                <span className="text-xl font-bold text-foreground">{count}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{config.label}</div>
            </div>
          );
        })}
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <div className="text-xl font-bold text-foreground">{avgAccuracy.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground">Avg Accuracy</div>
        </div>
      </div>

      {/* Unacknowledged alerts banner */}
      {unacknowledgedAlerts > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              {unacknowledgedAlerts} unacknowledged alert{unacknowledgedAlerts > 1 ? 's' : ''}{' '}
              requiring attention
            </span>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filters:
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                dateRange === opt.value
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
          {providerOptions.map((prov) => (
            <button
              key={prov}
              onClick={() => setFilterProvider(prov)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterProvider === prov
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="NORMAL">Normal</option>
          <option value="WARNING">Warning</option>
          <option value="ALERT">Alert</option>
          <option value="CRITICAL">Critical</option>
        </select>
        {(filterStatus || filterProvider !== 'All' || dateRange !== '24h') && (
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterProvider('All');
              setDateRange('24h');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* System Metrics Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            System Performance Metrics
          </h2>
          <span className="text-xs text-muted-foreground">{filteredMetrics.length} systems</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">System</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">
                  Provider
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">
                  Accuracy
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Drift</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Bias</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">
                  Error Rate
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Latency</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">
                  Requests
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMetrics.map((m) => {
                const sc = statusConfig[m.status];
                const ts = timeSeries[m.systemName] || [];
                const trendColor =
                  m.status === 'CRITICAL'
                    ? '#DC2626'
                    : m.status === 'ALERT'
                      ? '#F97316'
                      : m.status === 'WARNING'
                        ? '#F59E0B'
                        : '#10B981';
                const StatusIcon = sc.icon;
                return (
                  <tr
                    key={m.id}
                    className={`${sc.bg} hover:opacity-90 cursor-pointer transition-opacity ${selectedSystem === m.systemName ? 'ring-2 ring-inset ring-indigo-500' : ''}`}
                    onClick={() =>
                      setSelectedSystem(selectedSystem === m.systemName ? null : m.systemName)
                    }
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${sc.dot}`} />
                        <span className="font-medium text-foreground">{m.systemName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {m.provider}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sc.chipBg} ${sc.chipText}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <MetricBar
                        value={m.accuracy}
                        max={100}
                        thresholds={{ warning: 0, critical: 0 }}
                        unit="%"
                      />
                    </td>
                    <td className="p-3">
                      <MetricBar
                        value={m.driftScore * 100}
                        max={50}
                        thresholds={{
                          warning: thresholds.driftWarning,
                          critical: thresholds.driftCritical }}
                        unit="%"
                      />
                    </td>
                    <td className="p-3">
                      <MetricBar
                        value={m.biasScore * 100}
                        max={50}
                        thresholds={{
                          warning: thresholds.biasWarning,
                          critical: thresholds.biasCritical }}
                        unit="%"
                      />
                    </td>
                    <td className="p-3">
                      <MetricBar
                        value={m.errorRate}
                        max={10}
                        thresholds={{
                          warning: thresholds.errorWarning,
                          critical: thresholds.errorCritical }}
                        unit="%"
                      />
                    </td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">{m.latency}ms</td>
                    <td className="p-3 text-xs font-mono text-muted-foreground">
                      {m.requestsToday.toLocaleString()}
                    </td>
                    <td className="p-3">
                      {ts.length > 0 && (
                        <MiniSparkline data={ts.map((p) => p.accuracy)} color={trendColor} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time-series detail panel */}
      {selectedSystem && selectedTimeSeries.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Time Series -- {selectedSystem} (Last 24 Hours)
            </h2>
            <button
              onClick={() => setSelectedSystem(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'Accuracy (%)',
                  key: 'accuracy' as const,
                  base: 80,
                  range: 20,
                  color: 'bg-indigo-400 dark:bg-indigo-500' },
                {
                  label: 'Drift Score',
                  key: 'driftScore' as const,
                  base: 0,
                  range: 0.3,
                  color: '',
                  thresholdBased: true },
                {
                  label: 'Bias Score',
                  key: 'biasScore' as const,
                  base: 0,
                  range: 0.2,
                  color: '',
                  thresholdBased: true },
                {
                  label: 'Latency (ms)',
                  key: 'latency' as const,
                  base: 0,
                  range: 400,
                  color: '',
                  latencyBased: true },
              ].map((chart) => (
                <div key={chart.key} className="border border-border rounded-lg p-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">{chart.label}</h4>
                  <div className="flex items-end gap-0.5 h-16">
                    {selectedTimeSeries.map((p, i) => {
                      const val = p[chart.key];
                      const h = chart.range > 0 ? ((val - chart.base) / chart.range) * 100 : 50;
                      let barColor = chart.color;
                      if (chart.thresholdBased) {
                        const pct = val * 100;
                        const warnThreshold =
                          chart.key === 'driftScore'
                            ? thresholds.driftWarning
                            : thresholds.biasWarning;
                        const critThreshold =
                          chart.key === 'driftScore'
                            ? thresholds.driftCritical
                            : thresholds.biasCritical;
                        barColor =
                          pct > (critThreshold / 100) * 100
                            ? 'bg-red-400'
                            : pct > (warnThreshold / 100) * 100
                              ? 'bg-yellow-400'
                              : 'bg-green-400';
                      }
                      if (chart.latencyBased) {
                        barColor =
                          val > thresholds.latencyCritical
                            ? 'bg-red-400'
                            : val > thresholds.latencyWarning
                              ? 'bg-yellow-400'
                              : 'bg-blue-400';
                      }
                      return (
                        <div
                          key={i}
                          className={`flex-1 ${barColor} rounded-t-sm hover:opacity-80 transition-colors`}
                          style={{ height: `${Math.max(Math.min(h, 100), 2)}%` }}
                          title={`${new Date(p.timestamp).toLocaleTimeString()}: ${typeof val === 'number' && val < 1 ? (val * 100).toFixed(1) + '%' : chart.key === 'latency' ? val.toFixed(0) + 'ms' : val.toFixed(1) + '%'}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                    <span>
                      {new Date(selectedTimeSeries[0].timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit' })}
                    </span>
                    <span>Now</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-red-500" />
            Threshold Breach Alerts
          </h2>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="divide-y divide-border">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No alerts</div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 px-4 py-3 ${!alert.acknowledged ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
              >
                <span
                  className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${severityColors[alert.severity]}`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {alert.type}
                    </span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="text-xs text-muted-foreground">{alert.systemName}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {!alert.acknowledged ? (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="shrink-0 px-2 py-1 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="shrink-0 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ack
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Threshold config info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-indigo-500" />
          Active Monitoring Thresholds (ISO 42001 A.6.2.5)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Drift:</span> W&gt;
            {thresholds.driftWarning}%, C&gt;{thresholds.driftCritical}%
          </div>
          <div>
            <span className="font-medium text-foreground">Bias:</span> W&gt;{thresholds.biasWarning}
            %, C&gt;{thresholds.biasCritical}%
          </div>
          <div>
            <span className="font-medium text-foreground">Error:</span> W&gt;
            {thresholds.errorWarning}%, C&gt;{thresholds.errorCritical}%
          </div>
          <div>
            <span className="font-medium text-foreground">Latency:</span> W&gt;
            {thresholds.latencyWarning}ms, C&gt;{thresholds.latencyCritical}ms
          </div>
          <div>
            <span className="font-medium text-foreground">Accuracy:</span> Min{' '}
            {thresholds.accuracyMinimum}%
          </div>
        </div>
        <div className="flex gap-4 mt-3">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
              {config.label}
            </div>
          ))}
        </div>
      </div>

      {/* Threshold Configuration Modal */}
      <Modal
        isOpen={thresholdModalOpen}
        onClose={() => setThresholdModalOpen(false)}
        title="Alert Threshold Configuration"
        size="md"
      >
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Configure warning and critical thresholds for AI monitoring metrics. Changes apply
            immediately to all monitored systems.
          </p>

          {[
            {
              label: 'Data Drift',
              wKey: 'driftWarning' as const,
              cKey: 'driftCritical' as const,
              unit: '%' },
            {
              label: 'Bias Score',
              wKey: 'biasWarning' as const,
              cKey: 'biasCritical' as const,
              unit: '%' },
            {
              label: 'Error Rate',
              wKey: 'errorWarning' as const,
              cKey: 'errorCritical' as const,
              unit: '%' },
            {
              label: 'Latency',
              wKey: 'latencyWarning' as const,
              cKey: 'latencyCritical' as const,
              unit: 'ms' },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <label className="text-sm font-medium text-foreground">{item.label}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Warning ({item.unit})</label>
                  <input
                    type="number"
                    value={thresholdForm[item.wKey]}
                    onChange={(e) =>
                      setThresholdForm({ ...thresholdForm, [item.wKey]: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Critical ({item.unit})</label>
                  <input
                    type="number"
                    value={thresholdForm[item.cKey]}
                    onChange={(e) =>
                      setThresholdForm({ ...thresholdForm, [item.cKey]: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Minimum Accuracy (%)</label>
            <input
              type="number"
              value={thresholdForm.accuracyMinimum}
              onChange={(e) =>
                setThresholdForm({ ...thresholdForm, accuracyMinimum: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setThresholdForm({ ...defaultThresholds })}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setThresholdModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThresholds}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
