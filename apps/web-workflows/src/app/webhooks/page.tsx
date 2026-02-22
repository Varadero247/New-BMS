'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Webhook,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '@/lib/api';

type WebhookEvent =
  | 'INSTANCE_STARTED'
  | 'INSTANCE_COMPLETED'
  | 'INSTANCE_FAILED'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'APPROVAL_NEEDED';

const ALL_EVENTS: WebhookEvent[] = [
  'INSTANCE_STARTED',
  'INSTANCE_COMPLETED',
  'INSTANCE_FAILED',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'APPROVAL_NEEDED',
];

const EVENT_COLORS: Record<WebhookEvent, string> = {
  INSTANCE_STARTED: 'bg-blue-100 text-blue-700',
  INSTANCE_COMPLETED: 'bg-green-100 text-green-700',
  INSTANCE_FAILED: 'bg-red-100 text-red-700',
  TASK_ASSIGNED: 'bg-purple-100 text-purple-700',
  TASK_COMPLETED: 'bg-teal-100 text-teal-700',
  APPROVAL_NEEDED: 'bg-amber-100 text-amber-700',
};

interface WebhookRecord {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: string;
  failureCount: number;
  createdAt?: string;
}

const MOCK_WEBHOOKS: WebhookRecord[] = [
  {
    id: '1',
    url: 'https://hooks.slack.com/services/xxx',
    events: ['INSTANCE_COMPLETED', 'INSTANCE_FAILED'],
    isActive: true,
    failureCount: 0,
  },
  {
    id: '2',
    url: 'https://api.example.com/ims-events',
    events: ['TASK_ASSIGNED', 'APPROVAL_NEEDED'],
    isActive: true,
    failureCount: 2,
    lastTriggered: '2026-02-21T14:00:00Z',
  },
  {
    id: '3',
    url: 'https://old-system.internal/webhook',
    events: ['INSTANCE_STARTED'],
    isActive: false,
    failureCount: 15,
  },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    url: '',
    events: [] as WebhookEvent[],
    secret: '',
    isActive: true,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  async function fetchWebhooks() {
    try {
      setLoading(true);
      const r = await api.get('/webhooks');
      setWebhooks(r.data.data);
    } catch {
      setWebhooks(MOCK_WEBHOOKS);
      setError('Using mock data — API unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/webhooks', form);
      setWebhooks(prev => [...prev, { id: String(Date.now()), ...form, failureCount: 0 }]);
    } catch {
      setWebhooks(prev => [...prev, { id: String(Date.now()), ...form, failureCount: 0 }]);
    } finally {
      setSubmitting(false);
      setShowModal(false);
      setForm({ url: '', events: [], secret: '', isActive: true });
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/webhooks/${id}`);
    } catch {
      // proceed with local delete
    }
    setWebhooks(prev => prev.filter(w => w.id !== id));
    setDeleteId(null);
  }

  function toggleEvent(evt: WebhookEvent) {
    setForm(p => ({
      ...p,
      events: p.events.includes(evt) ? p.events.filter(e => e !== evt) : [...p.events, evt],
    }));
  }

  function maskUrl(url: string) {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}/...`;
    } catch {
      return url.length > 40 ? url.slice(0, 40) + '...' : url;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Webhook className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Webhook Management</h1>
              <p className="text-sm text-gray-500">Configure outgoing webhooks for workflow events</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Webhook
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-purple-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-700">{webhooks.length}</div>
              <div className="text-sm text-gray-500">Total Webhooks</div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-700">{webhooks.filter(w => w.isActive).length}</div>
              <div className="text-sm text-gray-500">Active</div>
            </CardContent>
          </Card>
          <Card className="border-red-100">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-700">{webhooks.reduce((a, w) => a + w.failureCount, 0)}</div>
              <div className="text-sm text-gray-500">Total Failures</div>
            </CardContent>
          </Card>
        </div>

        {/* Webhook Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            webhooks.map(wh => (
              <Card key={wh.id} className={`border-2 ${wh.isActive ? 'border-purple-100' : 'border-gray-100 opacity-60'}`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* URL + status */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${wh.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="font-mono text-sm text-gray-800 truncate">{maskUrl(wh.url)}</span>
                        {wh.failureCount > 0 && (
                          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                            <AlertTriangle className="h-3 w-3" />
                            {wh.failureCount} failures
                          </span>
                        )}
                        {wh.failureCount === 0 && wh.isActive && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Healthy
                          </span>
                        )}
                      </div>

                      {/* Event badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {wh.events.map(evt => (
                          <span key={evt} className={`px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[evt]}`}>
                            {evt.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Secret: {wh.secret ? '••••••••' : 'Not set'}
                        </div>
                        {wh.lastTriggered && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last triggered: {new Date(wh.lastTriggered).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setWebhooks(prev =>
                            prev.map(w => (w.id === wh.id ? { ...w, isActive: !w.isActive } : w))
                          )
                        }
                        className="p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        title={wh.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {wh.isActive ? (
                          <ToggleRight className="h-6 w-6 text-purple-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteId(wh.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete webhook"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          {!loading && webhooks.length === 0 && (
            <Card className="border-gray-100">
              <CardContent className="pt-8 pb-8 text-center text-gray-400">
                No webhooks configured yet. Click "Add Webhook" to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Webhook</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_EVENTS.map(evt => (
                    <label key={evt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.events.includes(evt)}
                        onChange={() => toggleEvent(evt)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${EVENT_COLORS[evt]}`}>
                        {evt.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret (optional)</label>
                <input
                  type="password"
                  value={form.secret}
                  onChange={e => setForm(p => ({ ...p, secret: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Used to sign payloads (HMAC-SHA256)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || form.events.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Webhook</h2>
              </div>
              <p className="text-sm text-gray-600">This webhook will be permanently deleted and will stop receiving events. This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
