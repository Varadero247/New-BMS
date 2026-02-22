'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Shield, Plus, Search, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

type DsarType = 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION' | 'OBJECTION';

interface DataRequest {
  id: string;
  type: DsarType;
  requesterEmail: string;
  requesterName: string;
  description?: string;
  status: string;
  createdAt: string;
  deadline?: string;
}

interface DsarForm { type: DsarType; requesterEmail: string; requesterName: string; description: string; }
const EMPTY_FORM: DsarForm = { type: 'ACCESS', requesterEmail: '', requesterName: '', description: '' };

const MOCK_REQUESTS: DataRequest[] = [
  { id: '1', type: 'ACCESS', requesterEmail: 'john.doe@gmail.com', requesterName: 'John Doe', description: 'Request for all personal data held', status: 'PROCESSING', createdAt: '2026-02-10T00:00:00Z' },
  { id: '2', type: 'ERASURE', requesterEmail: 'jane.smith@email.com', requesterName: 'Jane Smith', description: 'Right to be forgotten — all records', status: 'RECEIVED', createdAt: '2026-02-15T00:00:00Z' },
  { id: '3', type: 'PORTABILITY', requesterEmail: 'bob.jones@work.com', requesterName: 'Bob Jones', status: 'COMPLETED', createdAt: '2026-01-20T00:00:00Z' },
  { id: '4', type: 'RECTIFICATION', requesterEmail: 'alice@domain.com', requesterName: 'Alice Brown', description: 'Address and contact details incorrect', status: 'VERIFIED', createdAt: '2026-02-18T00:00:00Z' },
];

const TYPE_LABELS: Record<DsarType, string> = {
  ACCESS: 'Right of Access', RECTIFICATION: 'Rectification', ERASURE: 'Right to Erasure',
  PORTABILITY: 'Data Portability', RESTRICTION: 'Restriction', OBJECTION: 'Right to Object',
};

const TYPE_COLORS: Record<DsarType, string> = {
  ACCESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  RECTIFICATION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  ERASURE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  PORTABILITY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  RESTRICTION: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  OBJECTION: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_CONFIG: Record<string, string> = {
  RECEIVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  VERIFIED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  PROCESSING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const STATUS_TRANSITIONS: Record<string, string> = {
  RECEIVED: 'VERIFIED', VERIFIED: 'PROCESSING', PROCESSING: 'COMPLETED',
};

export default function DsarsPage() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DsarForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/dsars');
      setRequests(r.data.data?.requests || MOCK_REQUESTS);
    } catch {
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.requesterEmail || !form.requesterName) return;
    setSaving(true);
    try {
      await api.post('/dsars', { type: form.type, requesterEmail: form.requesterEmail, requesterName: form.requesterName, description: form.description || undefined });
      await load(); setShowModal(false); setForm(EMPTY_FORM);
    } catch { } finally { setSaving(false); }
  }

  async function advanceStatus(id: string, currentStatus: string) {
    const next = STATUS_TRANSITIONS[currentStatus];
    if (!next) return;
    setActionId(id);
    try {
      await api.patch(`/dsars/${id}/status`, { status: next });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: next } : r));
    } catch { } finally { setActionId(null); }
  }

  const filtered = requests.filter((r) => {
    const matchSearch = searchTerm === '' || r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) || r.requesterEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || r.status === statusFilter;
    const matchType = typeFilter === '' || r.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const counts: Record<string, number> = {};
  requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Subject Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage GDPR data subject access and erasure requests (Article 15-22)</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> New Request
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([status, color]) => (
            <div key={status} className={`rounded-lg p-3 ${color}`}>
              <p className="text-2xl font-bold">{counts[status] || 0}</p>
              <p className="text-xs font-medium mt-0.5">{status}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Types</option>
            {(Object.entries(TYPE_LABELS) as [DsarType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-5 w-5 text-purple-600" /> Requests ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      {['Requester', 'Type', 'Description', 'Status', 'Submitted', 'Action'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{r.requesterName}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{r.requesterEmail}</p>
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[r.type]}`}>{TYPE_LABELS[r.type]}</span></td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{r.description || '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[r.status] || 'bg-gray-100 text-gray-700'}`}>{r.status}</span></td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          {STATUS_TRANSITIONS[r.status] && (
                            <button onClick={() => advanceStatus(r.id, r.status)} disabled={actionId === r.id} className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-50 font-medium">
                              <ArrowRight className="h-3 w-3" /> {STATUS_TRANSITIONS[r.status]}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No data subject requests found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New Data Subject Request</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as DsarType })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                  {(Object.entries(TYPE_LABELS) as [DsarType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester Name *</label>
                <input type="text" value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requester Email *</label>
                <input type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Details of the request..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.requesterEmail || !form.requesterName} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
