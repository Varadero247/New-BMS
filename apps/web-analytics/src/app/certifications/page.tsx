'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Award, Plus, Search, Edit2, Trash2, XCircle, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Deadline {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  renewalFrequency?: string;
  ownerEmail?: string;
  status: string;
  notes?: string;
  lastCompletedAt?: string;
}

interface DeadlineForm {
  name: string;
  category: string;
  dueDate: string;
  renewalFrequency: string;
  ownerEmail: string;
  status: string;
  notes: string;
}

const EMPTY_FORM: DeadlineForm = { name: '', category: 'ISO', dueDate: '', renewalFrequency: 'ANNUAL', ownerEmail: '', status: 'CURRENT', notes: '' };

const MOCK_DEADLINES: Deadline[] = [
  { id: '1', name: 'ISO 9001 Surveillance Audit', category: 'ISO', dueDate: '2026-05-15', renewalFrequency: 'ANNUAL', ownerEmail: 'quality@company.com', status: 'CURRENT', notes: 'Stage 2 surveillance — BSI' },
  { id: '2', name: 'ISO 14001 Recertification', category: 'ISO', dueDate: '2026-03-10', renewalFrequency: 'THREE_YEARLY', ownerEmail: 'env@company.com', status: 'DUE_SOON', notes: '3-year cycle from 2023' },
  { id: '3', name: 'CREST Penetration Test', category: 'SECURITY', dueDate: '2026-06-30', renewalFrequency: 'ANNUAL', ownerEmail: 'infosec@company.com', status: 'CURRENT' },
  { id: '4', name: 'PAT Testing — Office Equipment', category: 'SAFETY', dueDate: '2026-02-28', renewalFrequency: 'ANNUAL', ownerEmail: 'facilities@company.com', status: 'DUE_SOON', notes: 'Annual PAT inspection' },
  { id: '5', name: 'Fire Risk Assessment', category: 'SAFETY', dueDate: '2025-12-31', renewalFrequency: 'ANNUAL', ownerEmail: 'hs@company.com', status: 'OVERDUE', notes: 'Overdue — reschedule urgently' },
  { id: '6', name: 'Data Protection Officer Registration', category: 'GDPR', dueDate: '2026-08-01', renewalFrequency: 'ANNUAL', ownerEmail: 'dpo@company.com', status: 'CURRENT' },
];

const CATEGORIES = ['ISO', 'SECURITY', 'SAFETY', 'GDPR', 'FINANCIAL', 'ENVIRONMENTAL', 'QUALITY', 'TRAINING', 'LEGAL', 'OTHER'];
const FREQUENCIES = ['ANNUAL', 'SIX_MONTHLY', 'QUARTERLY', 'THREE_YEARLY', 'FIVE_YEARLY', 'ONE_OFF'];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  CURRENT: { label: 'Current', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: Award },
  DUE_SOON: { label: 'Due Soon', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle },
  EXPIRED: { label: 'Expired', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CertificationsPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeadlineForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/certifications');
      setDeadlines(r.data.data?.deadlines || MOCK_DEADLINES);
    } catch {
      setDeadlines(MOCK_DEADLINES);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); }
  function openEdit(d: Deadline) {
    setForm({ name: d.name, category: d.category, dueDate: d.dueDate?.split('T')[0] || '', renewalFrequency: d.renewalFrequency || 'ANNUAL', ownerEmail: d.ownerEmail || '', status: d.status, notes: d.notes || '' });
    setEditingId(d.id); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSave() {
    if (!form.name || !form.dueDate) return;
    setSaving(true);
    try {
      const payload = { name: form.name, category: form.category, dueDate: form.dueDate, renewalFrequency: form.renewalFrequency || undefined, ownerEmail: form.ownerEmail || undefined, status: form.status, notes: form.notes || undefined };
      if (editingId) { await api.patch(`/certifications/${editingId}`, payload); }
      else { await api.post('/certifications', payload); }
      await load(); closeModal();
    } catch { } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/certifications/${id}`);
      setDeadlines((prev) => prev.filter((d) => d.id !== id));
    } catch { } finally { setDeletingId(null); }
  }

  const filtered = deadlines.filter((d) => {
    const matchSearch = searchTerm === '' || d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || d.status === statusFilter;
    const matchCat = categoryFilter === '' || d.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map((s) => [s, deadlines.filter((d) => d.status === s).length]));

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Certifications & Deadlines</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track compliance deadlines and certification renewals</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Deadline
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(Object.entries(STATUS_CONFIG) as [string, typeof STATUS_CONFIG[string]][]).map(([key, cfg]) => (
            <div key={key} className={`rounded-lg p-4 ${cfg.color}`}>
              <p className="text-2xl font-bold">{counts[key] || 0}</p>
              <p className="text-sm font-medium mt-0.5">{cfg.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search deadlines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Award className="h-5 w-5 text-purple-600" /> Compliance Deadlines ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      {['Name', 'Category', 'Due Date', 'Days Until', 'Frequency', 'Owner', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => {
                      const days = daysUntil(d.dueDate);
                      const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.CURRENT;
                      return (
                        <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            <p>{d.name}</p>
                            {d.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">{d.notes}</p>}
                          </td>
                          <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">{d.category}</span></td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(d.dueDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{d.renewalFrequency?.replace('_', ' ') || '—'}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{d.ownerEmail || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(d)} className="p-1 text-gray-400 hover:text-purple-600"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(d.id)} disabled={deletingId === d.id} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No deadlines found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Deadline' : 'Add Deadline'}</h2>
              <button onClick={closeModal}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. ISO 9001 Audit" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Renewal Frequency</label>
                  <select value={form.renewalFrequency} onChange={(e) => setForm({ ...form, renewalFrequency: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {FREQUENCIES.map((f) => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Email</label>
                <input type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="owner@company.com" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.dueDate} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Deadline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
