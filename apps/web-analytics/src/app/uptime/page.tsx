'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Activity, CheckCircle, XCircle, AlertTriangle, Clock, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

interface UptimeCheck {
  id: string;
  serviceName: string;
  url?: string;
  checkInterval?: number;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'MAINTENANCE';
  lastChecked?: string;
  responseTimeMs?: number;
  uptimePercent30d?: number;
  incidentCount?: number;
}

interface Incident {
  id: string;
  uptimeCheckId: string;
  startedAt: string;
  resolvedAt?: string;
  duration?: number;
  rootCause?: string;
  resolution?: string;
}

const MOCK_CHECKS: UptimeCheck[] = [
  { id: '1', serviceName: 'API Gateway', url: 'https://api.ims.local/health', checkInterval: 60, status: 'UP', lastChecked: '2026-02-22T08:00:00Z', responseTimeMs: 45, uptimePercent30d: 99.98, incidentCount: 0 },
  { id: '2', serviceName: 'Health & Safety API', url: 'https://api.ims.local/api/health-safety/health', checkInterval: 60, status: 'UP', lastChecked: '2026-02-22T08:00:00Z', responseTimeMs: 62, uptimePercent30d: 99.95, incidentCount: 1 },
  { id: '3', serviceName: 'Analytics API', url: 'https://api.ims.local/api/analytics/health', checkInterval: 60, status: 'UP', lastChecked: '2026-02-22T08:00:00Z', responseTimeMs: 38, uptimePercent30d: 100, incidentCount: 0 },
  { id: '4', serviceName: 'Document Storage', url: 'https://api.ims.local/api/documents/health', checkInterval: 300, status: 'DEGRADED', lastChecked: '2026-02-22T07:55:00Z', responseTimeMs: 1240, uptimePercent30d: 99.1, incidentCount: 3 },
  { id: '5', serviceName: 'CRM Service', url: 'https://api.ims.local/api/crm/health', checkInterval: 60, status: 'UP', lastChecked: '2026-02-22T08:00:00Z', responseTimeMs: 55, uptimePercent30d: 99.92, incidentCount: 1 },
  { id: '6', serviceName: 'Email Notifications', url: 'https://api.ims.local/api/notifications/health', checkInterval: 120, status: 'MAINTENANCE', lastChecked: '2026-02-22T06:00:00Z', responseTimeMs: 0, uptimePercent30d: 98.5, incidentCount: 2 },
  { id: '7', serviceName: 'Payroll API', url: 'https://api.ims.local/api/payroll/health', checkInterval: 60, status: 'UP', lastChecked: '2026-02-22T08:00:00Z', responseTimeMs: 71, uptimePercent30d: 99.99, incidentCount: 0 },
  { id: '8', serviceName: 'External Reg Feed', url: 'https://api.ims.local/api/reg-monitor/health', checkInterval: 600, status: 'DOWN', lastChecked: '2026-02-22T07:30:00Z', responseTimeMs: 0, uptimePercent30d: 97.8, incidentCount: 5 },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', uptimeCheckId: '4', startedAt: '2026-02-20T14:00:00Z', resolvedAt: '2026-02-20T15:30:00Z', duration: 90, rootCause: 'Disk I/O saturation on storage node', resolution: 'Cleared queue, added monitoring alert' },
  { id: 'i2', uptimeCheckId: '8', startedAt: '2026-02-21T09:00:00Z', resolvedAt: '2026-02-21T11:00:00Z', duration: 120, rootCause: 'External API rate limit exceeded', resolution: 'Implemented exponential backoff' },
];

const STATUS_CONFIG: Record<UptimeCheck['status'], { label: string; color: string; bgColor: string; icon: typeof CheckCircle }> = {
  UP: { label: 'Operational', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
  DOWN: { label: 'Down', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
  DEGRADED: { label: 'Degraded', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertTriangle },
  MAINTENANCE: { label: 'Maintenance', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: Clock },
};

export default function UptimePage() {
  const [checks, setChecks] = useState<UptimeCheck[]>([]);
  const [incidents, setIncidents] = useState<Record<string, Incident[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingIncidents, setLoadingIncidents] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/uptime');
      setChecks(r.data.data?.checks || MOCK_CHECKS);
    } catch {
      setChecks(MOCK_CHECKS);
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!incidents[id]) {
      setLoadingIncidents(id);
      try {
        const r = await api.get(`/uptime/${id}/history`);
        setIncidents((prev) => ({ ...prev, [id]: r.data.data?.incidents || [] }));
      } catch {
        setIncidents((prev) => ({ ...prev, [id]: MOCK_INCIDENTS.filter((i) => i.uptimeCheckId === id) }));
      } finally {
        setLoadingIncidents(null);
      }
    }
  }

  const filtered = checks.filter((c) => statusFilter === '' || c.status === statusFilter);

  const upCount = checks.filter((c) => c.status === 'UP').length;
  const downCount = checks.filter((c) => c.status === 'DOWN').length;
  const degradedCount = checks.filter((c) => c.status === 'DEGRADED').length;
  const avgUptime = checks.length > 0 ? (checks.reduce((sum, c) => sum + (c.uptimePercent30d ?? 100), 0) / checks.length).toFixed(2) : '100.00';

  const overallStatus = downCount > 0 ? 'DOWN' : degradedCount > 0 ? 'DEGRADED' : 'UP';
  const overallCfg = STATUS_CONFIG[overallStatus];

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Uptime Monitoring</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Service availability and incident history</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Overall status banner */}
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${overallCfg.bgColor}`}>
          <overallCfg.icon className={`h-6 w-6 ${overallCfg.color}`} />
          <div>
            <p className={`font-semibold ${overallCfg.color}`}>
              {overallStatus === 'UP' ? 'All Systems Operational' : overallStatus === 'DOWN' ? `${downCount} Service${downCount > 1 ? 's' : ''} Down` : `${degradedCount} Service${degradedCount > 1 ? 's' : ''} Degraded`}
            </p>
            <p className={`text-sm ${overallCfg.color} opacity-80`}>30-day average uptime: {avgUptime}%</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Operational', value: upCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Down', value: downCount, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'Degraded', value: degradedCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Avg 30d Uptime', value: `${avgUptime}%`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-sm font-medium ${s.color} opacity-80 mt-0.5`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {(['', 'UP', 'DOWN', 'DEGRADED', 'MAINTENANCE'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${statusFilter === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}>
              {s === '' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Service list */}
        <div className="space-y-3">
          {filtered.map((check) => {
            const cfg = STATUS_CONFIG[check.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === check.id;
            const checkIncidents = incidents[check.id] || [];

            return (
              <Card key={check.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => toggleExpand(check.id)}>
                    <div className={`p-2 rounded-lg ${cfg.bgColor} shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{check.serviceName}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
                        {check.incidentCount !== undefined && check.incidentCount > 0 && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{check.incidentCount} incident{check.incidentCount > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      {check.url && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{check.url}</p>}
                    </div>
                    <div className="flex items-center gap-6 shrink-0 text-right">
                      {check.responseTimeMs !== undefined && check.status === 'UP' && (
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{check.responseTimeMs}ms</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">response</p>
                        </div>
                      )}
                      {check.uptimePercent30d !== undefined && (
                        <div>
                          <p className={`text-sm font-semibold ${check.uptimePercent30d >= 99.9 ? 'text-green-600 dark:text-green-400' : check.uptimePercent30d >= 99 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{check.uptimePercent30d}%</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">30d uptime</p>
                        </div>
                      )}
                      {check.lastChecked && (
                        <div className="hidden md:block">
                          <p className="text-xs text-gray-400 dark:text-gray-500">Last checked</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(check.lastChecked).toLocaleTimeString()}</p>
                        </div>
                      )}
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Incident History
                      </p>
                      {loadingIncidents === check.id ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
                      ) : checkIncidents.length > 0 ? (
                        <div className="space-y-2">
                          {checkIncidents.map((inc) => (
                            <div key={inc.id} className="rounded-lg bg-white dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                  {new Date(inc.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {inc.duration && <span className="text-xs text-gray-400 dark:text-gray-500">{inc.duration} min downtime</span>}
                              </div>
                              {inc.rootCause && <p className="text-xs text-gray-600 dark:text-gray-400">Cause: {inc.rootCause}</p>}
                              {inc.resolution && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">Resolution: {inc.resolution}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No incidents recorded.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No services match the current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
