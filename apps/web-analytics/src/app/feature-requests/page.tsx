'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Lightbulb, Plus, Search, ThumbsUp, XCircle, Loader2, ArrowUp } from 'lucide-react';
import { api } from '@/lib/api';

interface FeatureRequest {
  id: string;
  title: string;
  description?: string;
  requestedBy?: string;
  status: string;
  votes: number;
  priority?: number;
  createdAt: string;
}

interface FRForm { title: string; description: string; requestedBy: string; }
const EMPTY_FORM: FRForm = { title: '', description: '', requestedBy: '' };

const MOCK_REQUESTS: FeatureRequest[] = [
  { id: '1', title: 'AI-powered risk prediction scoring', description: 'Use ML to predict risk likelihood based on historical incident data', requestedBy: 'Risk Manager', status: 'PLANNED', votes: 24, priority: 1, createdAt: '2026-01-15T00:00:00Z' },
  { id: '2', title: 'Mobile app for field inspections', description: 'iOS and Android app for conducting audits and inspections offline', requestedBy: 'Operations Manager', status: 'IN_PROGRESS', votes: 31, priority: 2, createdAt: '2026-01-20T00:00:00Z' },
  { id: '3', title: 'Automated regulatory change alerts', description: 'Push notifications when relevant regulations change in tracked jurisdictions', requestedBy: 'Compliance Team', status: 'SUBMITTED', votes: 18, createdAt: '2026-02-01T00:00:00Z' },
  { id: '4', title: 'Supplier portal bulk upload', description: 'Allow suppliers to bulk upload documents via CSV/XLSX', requestedBy: 'Procurement', status: 'UNDER_REVIEW', votes: 12, createdAt: '2026-02-05T00:00:00Z' },
  { id: '5', title: 'Real-time dashboard WebSocket', description: 'Live updates on dashboard metrics without page refresh', requestedBy: 'IT Director', status: 'COMPLETED', votes: 45, createdAt: '2025-12-01T00:00:00Z' },
  { id: '6', title: 'Two-factor authentication', description: 'TOTP-based 2FA for all user accounts', requestedBy: 'CISO', status: 'COMPLETED', votes: 52, createdAt: '2025-11-15T00:00:00Z' },
  { id: '7', title: 'Contract auto-renewal reminders', description: '60/30/7 day email reminders before contract expiry', requestedBy: 'Legal', status: 'REJECTED', votes: 8, createdAt: '2026-02-10T00:00:00Z' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  PLANNED: { label: 'Planned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FRForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/feature-requests');
      setRequests(r.data.data?.requests || MOCK_REQUESTS);
    } catch {
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.title) return;
    setSaving(true);
    try {
      await api.post('/feature-requests', { title: form.title, description: form.description || undefined, requestedBy: form.requestedBy || undefined });
      await load(); setShowModal(false); setForm(EMPTY_FORM);
    } catch {
      setRequests((prev) => [{ id: Date.now().toString(), title: form.title, description: form.description, requestedBy: form.requestedBy, status: 'SUBMITTED', votes: 0, createdAt: new Date().toISOString() }, ...prev]);
      setShowModal(false); setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  async function vote(id: string) {
    setVotingId(id);
    try {
      await api.post(`/feature-requests/${id}/vote`);
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, votes: r.votes + 1 } : r));
    } catch {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, votes: r.votes + 1 } : r));
    } finally {
      setVotingId(null);
    }
  }

  const filtered = requests.filter((r) => {
    const matchSearch = searchTerm === '' || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => b.votes - a.votes);

  const statusCounts: Record<string, number> = {};
  requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Feature Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Vote on and track platform feature requests</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Request Feature
          </button>
        </div>

        {/* Status pipeline */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className={`rounded-lg p-3 ${cfg.color} cursor-pointer`} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}>
              <p className="text-xl font-bold">{statusCounts[key] || 0}</p>
              <p className="text-xs font-medium mt-0.5">{cfg.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-5 w-5 text-purple-600" /> Feature Requests ({filtered.length}) — sorted by votes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.SUBMITTED;
                  return (
                    <div key={r.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      {/* Vote button */}
                      <button onClick={() => vote(r.id)} disabled={votingId === r.id} className="flex flex-col items-center gap-0.5 min-w-12 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:text-purple-600 transition-colors disabled:opacity-50">
                        <ArrowUp className="h-4 w-4" />
                        <span className="text-sm font-bold">{r.votes}</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          {r.priority && <span className="text-xs text-purple-600 font-medium">P{r.priority}</span>}
                        </div>
                        {r.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.description}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {r.requestedBy && <span className="text-xs text-gray-400 dark:text-gray-500">by {r.requestedBy}</span>}
                          <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ThumbsUp className="h-4 w-4 text-gray-300 dark:text-gray-600 mt-1 shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No feature requests found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request a Feature</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feature Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Brief title for the feature" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="What problem does this solve?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested By</label>
                <input type="text" value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Your name or team" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
