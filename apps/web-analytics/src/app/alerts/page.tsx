'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Bell, AlertTriangle, CheckCircle, XCircle, BellOff } from 'lucide-react';
import { api } from '@/lib/api';

interface AlertItem {
  id: string;
  name: string;
  condition: string;
  metric: string;
  threshold: number | string;
  severity: string;
  status: string;
  lastTriggered: string | null;
  triggerCount: number;
  owner: string;
  module: string;
  enabled: boolean;
}

const MOCK_ALERTS: AlertItem[] = [
  { id: '1', name: 'NCR Rate Exceeded', condition: 'NCR rate > 5 per week', metric: 'NCR Rate', threshold: 5, severity: 'CRITICAL', status: 'FIRING', lastTriggered: '2026-02-14T08:30:00Z', triggerCount: 3, owner: 'Ivan Quality', module: 'Quality', enabled: true },
  { id: '2', name: 'CAPA Overdue Threshold', condition: 'Overdue CAPAs > 10', metric: 'Overdue CAPAs', threshold: 10, severity: 'WARNING', status: 'FIRING', lastTriggered: '2026-02-13T14:00:00Z', triggerCount: 7, owner: 'Alice Johnson', module: 'Quality', enabled: true },
  { id: '3', name: 'Carbon Intensity Spike', condition: 'Carbon intensity > 30 tCO2/£m', metric: 'Carbon Intensity', threshold: 30, severity: 'WARNING', status: 'OK', lastTriggered: '2026-01-20T09:00:00Z', triggerCount: 2, owner: 'Eve Green', module: 'ESG', enabled: true },
  { id: '4', name: 'Lost Time Injury Recorded', condition: 'LTI count increases', metric: 'LTI Count', threshold: 0, severity: 'CRITICAL', status: 'FIRING', lastTriggered: '2026-02-12T11:15:00Z', triggerCount: 1, owner: 'Bob Smith', module: 'H&S', enabled: true },
  { id: '5', name: 'Supplier On-Time Delivery Drop', condition: 'OTD < 85%', metric: 'Supplier OTD', threshold: 85, severity: 'WARNING', status: 'OK', lastTriggered: '2026-01-28T16:00:00Z', triggerCount: 4, owner: 'Karl Procurement', module: 'Supply Chain', enabled: true },
  { id: '6', name: 'Energy Consumption Limit', condition: 'Monthly energy > 1500 MWh', metric: 'Energy MWh', threshold: 1500, severity: 'INFO', status: 'OK', lastTriggered: null, triggerCount: 0, owner: 'Heidi Energy', module: 'Energy', enabled: false },
  { id: '7', name: 'Training Completion Below Target', condition: 'Completion rate < 90%', metric: 'Training Completion', threshold: 90, severity: 'INFO', status: 'OK', lastTriggered: '2026-02-01T08:00:00Z', triggerCount: 1, owner: 'Jane HR', module: 'HR', enabled: true },
  { id: '8', name: 'High-Risk Assessment Created', condition: 'Risk score > 20 on new assessment', metric: 'Risk Score', threshold: 20, severity: 'WARNING', status: 'FIRING', lastTriggered: '2026-02-14T10:45:00Z', triggerCount: 2, owner: 'Frank Security', module: 'InfoSec', enabled: true },
];

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  WARNING: 'bg-yellow-100 text-yellow-700',
  INFO: 'bg-blue-100 text-blue-700',
};

const STATUS_STYLES: Record<string, string> = {
  FIRING: 'bg-red-100 text-red-700',
  OK: 'bg-green-100 text-green-700',
  SILENCED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'FIRING') return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (status === 'OK') return <CheckCircle className="h-4 w-4 text-green-500" />;
  return <BellOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
}

export default function AlertsPage() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/alerts');
        setItems(r.data.data || MOCK_ALERTS);
      } catch {
        setItems(MOCK_ALERTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = searchTerm === '' ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = severityFilter === '' || i.severity === severityFilter;
    const matchStatus = statusFilter === '' || i.status === statusFilter;
    const matchModule = moduleFilter === '' || i.module === moduleFilter;
    return matchSearch && matchSeverity && matchStatus && matchModule;
  });

  const modules = [...new Set(items.map(i => i.module))].sort();
  const firing = items.filter(i => i.status === 'FIRING').length;
  const critical = items.filter(i => i.severity === 'CRITICAL').length;
  const enabled = items.filter(i => i.enabled).length;

  async function toggleAlert(id: string, current: boolean) {
    setItems(prev => prev.map(a => a.id === id ? { ...a, enabled: !current } : a));
    try {
      await api.put(`/alerts/${id}`, { enabled: !current });
    } catch {
      // optimistic update kept
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Alerts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Data-driven threshold alerts and notifications</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Create Alert
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Alerts', value: items.length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Currently Firing', value: firing, color: 'bg-red-50 text-red-700' },
            { label: 'Critical Severity', value: critical, color: 'bg-orange-50 text-orange-700' },
            { label: 'Enabled', value: enabled, color: 'bg-green-50 text-green-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Firing alerts banner */}
        {firing > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">{firing} alert{firing > 1 ? 's are' : ' is'} currently firing</p>
              <p className="text-xs text-red-600 mt-0.5">Review and acknowledge the conditions below to resolve.</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search alerts..." placeholder="Search alerts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select aria-label="Filter by severity" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Status</option>
            <option value="FIRING">Firing</option>
            <option value="OK">OK</option>
            <option value="SILENCED">Silenced</option>
          </select>
          <select aria-label="Filter by module" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Alerts table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-5 w-5 text-purple-600" />
              Alerts ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No alerts match your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Alert</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Condition</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Module</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Triggers</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Last Fired</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Enabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(alert => (
                      <tr key={alert.id} className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${!alert.enabled ? 'opacity-60' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon status={alert.status} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{alert.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{alert.owner}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs">{alert.condition}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded">{alert.module}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[alert.severity] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[alert.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">{alert.triggerCount}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                          {alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleString() : <span className="text-gray-300 dark:text-gray-600">Never</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleAlert(alert.id, alert.enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${alert.enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-gray-900 shadow transition-transform ${alert.enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Alert Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Alert</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Name</label>
                  <input type="text" placeholder="e.g. NCR Rate Exceeded" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>CRITICAL</option>
                      <option>WARNING</option>
                      <option>INFO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {modules.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                  <input type="text" placeholder="e.g. NCR rate > 5 per week" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Threshold</label>
                    <input type="number" placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
                    <input type="text" placeholder="Assignee name" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
                <button className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Create Alert</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
