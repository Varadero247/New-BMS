'use client';

import { useState, useEffect } from 'react';
import {
  Webhook, Plus, Trash2, Send, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Clock, Copy, Eye, EyeOff,
  ToggleLeft, ToggleRight, ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  headers: Record<string, string>;
  lastTriggeredAt: string | null;
  failureCount: number;
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  responseCode: number | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  attempts: number;
  createdAt: string;
}

const WEBHOOK_EVENTS = [
  'ncr.created', 'ncr.status_changed', 'ncr.closed',
  'capa.created', 'capa.status_changed', 'capa.closed', 'capa.overdue',
  'audit.created', 'audit.finding_added', 'audit.complete',
  'csat.complaint_received', 'csat.escalated',
  'risk.score_changed', 'risk.treatment_changed',
  'certificate.expiring', 'certificate.expired',
  'ai.analysis_complete', 'ai.review_required',
  'user.created', 'user.deactivated',
  'trial.expiring', 'trial.expired',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);

  useEffect(() => {
    loadEndpoints();
  }, []);

  async function loadEndpoints() {
    try {
      const res = await api.get('/api/admin/webhooks');
      setEndpoints(res.data.data || []);
    } catch {
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  }

  async function createWebhook() {
    if (!formName || !formUrl || formEvents.length === 0) return;
    try {
      const res = await api.post('/api/admin/webhooks', {
        name: formName,
        url: formUrl,
        events: formEvents,
      });
      const created = res.data.data;
      setNewSecret(created.secret);
      setEndpoints(prev => [created, ...prev]);
      setFormName('');
      setFormUrl('');
      setFormEvents([]);
      setShowCreateModal(false);
    } catch {
      // Handle error silently
    }
  }

  async function deleteWebhook(id: string) {
    try {
      await api.delete(`/api/admin/webhooks/${id}`);
      setEndpoints(prev => prev.filter(ep => ep.id !== id));
    } catch {
      // Handle error silently
    }
  }

  async function toggleWebhook(id: string, currentEnabled: boolean) {
    try {
      await api.patch(`/api/admin/webhooks/${id}`, { enabled: !currentEnabled });
      setEndpoints(prev => prev.map(ep =>
        ep.id === id ? { ...ep, enabled: !currentEnabled } : ep
      ));
    } catch {
      // Optimistic update
      setEndpoints(prev => prev.map(ep =>
        ep.id === id ? { ...ep, enabled: !currentEnabled } : ep
      ));
    }
  }

  async function testWebhook(id: string) {
    try {
      await api.post(`/api/admin/webhooks/${id}/test`);
      // Reload deliveries
      loadDeliveries(id);
    } catch {
      // Handle error silently
    }
  }

  async function loadDeliveries(id: string) {
    try {
      const res = await api.get(`/api/admin/webhooks/${id}/deliveries?limit=20`);
      setDeliveries(prev => ({ ...prev, [id]: res.data.data || [] }));
    } catch {
      setDeliveries(prev => ({ ...prev, [id]: [] }));
    }
  }

  function handleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadDeliveries(id);
    }
  }

  function toggleEvent(event: string) {
    setFormEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  }

  function truncateUrl(url: string, max: number = 45): string {
    return url.length > max ? url.substring(0, max) + '...' : url;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Webhooks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Send real-time event notifications to external services
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Endpoint
        </button>
      </div>

      {/* Secret Display (shown after creation) */}
      {newSecret && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            Webhook signing secret (shown once -- save it now):
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono text-gray-900">
              {showSecret ? newSecret : newSecret.substring(0, 10) + '*'.repeat(30)}
            </code>
            <button onClick={() => setShowSecret(!showSecret)} className="p-2 text-gray-500 hover:text-gray-700">
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(newSecret)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => { setNewSecret(null); setShowSecret(false); }}
            className="mt-2 text-xs text-yellow-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Endpoints Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {endpoints.length === 0 ? (
          <div className="text-center py-12">
            <Webhook className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No webhook endpoints configured</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Create your first webhook
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">URL</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Events</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Triggered</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {endpoints.map(ep => (
                <>
                  <tr
                    key={ep.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!ep.enabled ? 'opacity-60' : ''}`}
                    onClick={() => handleExpand(ep.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{ep.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500 font-mono">{truncateUrl(ep.url)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ep.events.length} events
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {ep.lastTriggeredAt
                        ? new Date(ep.lastTriggeredAt).toLocaleString()
                        : <span className="text-gray-300 dark:text-gray-600">Never</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWebhook(ep.id, ep.enabled); }}
                      >
                        {ep.enabled ? (
                          <ToggleRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); testWebhook(ep.id); }}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                          title="Send test ping"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteWebhook(ep.id); }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Delivery Log */}
                  {expandedId === ep.id && (
                    <tr key={`${ep.id}-deliveries`}>
                      <td colSpan={6} className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent Deliveries</h4>
                        {(deliveries[ep.id] || []).length === 0 ? (
                          <p className="text-xs text-gray-400 py-2">No deliveries yet</p>
                        ) : (
                          <div className="space-y-1.5">
                            {(deliveries[ep.id] || []).map(d => (
                              <div key={d.id} className="flex items-center gap-3 text-xs">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.status]}`}>
                                  {d.status === 'SUCCESS' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {d.status === 'FAILED' && <XCircle className="h-3 w-3 mr-1" />}
                                  {d.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                                  {d.status}
                                </span>
                                <span className="font-mono text-gray-600 dark:text-gray-400">{d.event}</span>
                                <span className="text-gray-400">
                                  {d.responseCode ? `HTTP ${d.responseCode}` : '--'}
                                </span>
                                <span className="text-gray-400">
                                  Attempts: {d.attempts}
                                </span>
                                <span className="text-gray-400 ml-auto">
                                  {new Date(d.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Webhook Endpoint</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Slack NCR Alerts"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                  placeholder="https://example.com/webhooks/ims"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Events ({formEvents.length} selected)
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5">
                  {WEBHOOK_EVENTS.map(event => (
                    <label key={event} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-mono">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                A signing secret will be auto-generated and shown once after creation.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={createWebhook}
                disabled={!formName || !formUrl || formEvents.length === 0}
                className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
