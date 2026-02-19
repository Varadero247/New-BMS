'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ServiceHealth {
  name: string;
  port: number;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
}

interface PlatformStatus {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: ServiceHealth[];
  uptime: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
}

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: typeof CheckCircle; label: string; dot: string }
> = {
  operational: {
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'All Systems Operational',
    dot: 'bg-green-500' },
  degraded: {
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: AlertTriangle,
    label: 'Partial System Degradation',
    dot: 'bg-yellow-500' },
  down: {
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: XCircle,
    label: 'System Outage Detected',
    dot: 'bg-red-500' } };

const SERVICE_DOT: Record<string, string> = {
  operational: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500' };

export default function StatusPage() {
  const [data, setData] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/api/health/status');
      setData(res.data.data);
      setLastRefresh(new Date());
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  if (loading || !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overallConfig = STATUS_CONFIG[data.status] || STATUS_CONFIG.operational;
  const OverallIcon = overallConfig.icon;

  const operationalCount = data.services.filter((s) => s.status === 'operational').length;
  const degradedCount = data.services.filter((s) => s.status === 'degraded').length;
  const downCount = data.services.filter((s) => s.status === 'down').length;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Status</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time health monitoring for all {data.services.length} services
          </p>
        </div>
        <button
          onClick={loadStatus}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-lg border p-5 ${overallConfig.bg}`}>
        <div className="flex items-center gap-3">
          <OverallIcon className={`h-8 w-8 ${overallConfig.color}`} />
          <div>
            <h2 className={`text-lg font-semibold ${overallConfig.color}`}>
              {overallConfig.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {operationalCount} operational, {degradedCount} degraded, {downCount} down
              <span className="mx-2">--</span>
              Last checked: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Uptime Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '24h Uptime', value: data.uptime['24h'] },
          { label: '7d Uptime', value: data.uptime['7d'] },
          { label: '30d Uptime', value: data.uptime['30d'] },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
              {stat.label}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                stat.value >= 99.9
                  ? 'text-green-600 dark:text-green-400'
                  : stat.value >= 99.0
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              }`}
            >
              {stat.value.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Services</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {data.services.map((service) => (
            <div
              key={`${service.name}:${service.port}`}
              className="flex items-center px-4 py-3 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Status Dot */}
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`h-3 w-3 rounded-full ${SERVICE_DOT[service.status] || 'bg-gray-400'}`}
                />
              </div>

              {/* Service Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {service.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    :{service.port}
                  </span>
                </div>
              </div>

              {/* Status Text */}
              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-medium capitalize ${
                    service.status === 'operational'
                      ? 'text-green-600 dark:text-green-400'
                      : service.status === 'degraded'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {service.status}
                </span>

                {/* Latency */}
                <span
                  className={`text-xs font-mono ${
                    service.latencyMs < 20
                      ? 'text-green-500'
                      : service.latencyMs < 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                >
                  {service.latencyMs}ms
                </span>

                {/* Last Checked */}
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 w-32 justify-end">
                  <Clock className="h-3 w-3" />
                  {new Date(service.lastChecked).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <Activity className="h-3.5 w-3.5" />
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
