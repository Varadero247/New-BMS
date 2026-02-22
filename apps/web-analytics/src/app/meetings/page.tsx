'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, Plus, Search, Trash2, Edit2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

type MeetingType = 'BOARD' | 'MANAGEMENT_REVIEW' | 'DEPARTMENT' | 'SUPPLIER' | 'CUSTOMER' | 'AUDIT' | 'OTHER';

interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  attendees: string[];
  summary?: string;
  actionItems?: unknown[];
  createdAt: string;
}

interface MeetingForm {
  title: string;
  type: MeetingType;
  date: string;
  attendees: string;
  summary: string;
  actionItems: string;
}

const EMPTY_FORM: MeetingForm = { title: '', type: 'MANAGEMENT_REVIEW', date: '', attendees: '', summary: '', actionItems: '' };

const MOCK_MEETINGS: Meeting[] = [
  { id: '1', title: 'Q1 Management Review', type: 'MANAGEMENT_REVIEW', date: '2026-02-20', attendees: ['CEO', 'CFO', 'COO', 'QHSE Manager'], summary: 'Reviewed Q1 KPIs, ISO readiness at 87%, 3 open CAPAs discussed.', actionItems: [], createdAt: '2026-02-20T10:00:00Z' },
  { id: '2', title: 'Board Meeting Feb 2026', type: 'BOARD', date: '2026-02-18', attendees: ['Board Members', 'CEO', 'CFO'], summary: 'Annual strategy approved, budget ratified, ESG roadmap presented.', actionItems: [], createdAt: '2026-02-18T09:00:00Z' },
  { id: '3', title: 'IT Supplier Review — AWS', type: 'SUPPLIER', date: '2026-02-14', attendees: ['IT Director', 'AWS Account Manager'], summary: 'Reviewed SLAs. 99.95% uptime achieved. Discussed cost optimisation.', actionItems: [], createdAt: '2026-02-14T14:00:00Z' },
  { id: '4', title: 'ISO 9001 Internal Audit Debrief', type: 'AUDIT', date: '2026-02-10', attendees: ['Lead Auditor', 'Quality Manager', 'Department Heads'], summary: '2 minor NCRs raised. CAPAs assigned to Quality Manager.', actionItems: [], createdAt: '2026-02-10T16:00:00Z' },
];

const TYPE_LABELS: Record<MeetingType, string> = {
  BOARD: 'Board', MANAGEMENT_REVIEW: 'Mgmt Review', DEPARTMENT: 'Department',
  SUPPLIER: 'Supplier', CUSTOMER: 'Customer', AUDIT: 'Audit', OTHER: 'Other',
};

const TYPE_COLORS: Record<MeetingType, string> = {
  BOARD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  MANAGEMENT_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  DEPARTMENT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  SUPPLIER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  CUSTOMER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  AUDIT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  OTHER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MeetingForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/meetings');
      setMeetings(r.data.data?.meetings || MOCK_MEETINGS);
    } catch {
      setMeetings(MOCK_MEETINGS);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); }
  function openEdit(m: Meeting) {
    setForm({ title: m.title, type: m.type, date: m.date?.split('T')[0] || '', attendees: m.attendees.join(', '), summary: m.summary || '', actionItems: '' });
    setEditingId(m.id); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSave() {
    if (!form.title || !form.type || !form.date) return;
    setSaving(true);
    try {
      const payload = { title: form.title, type: form.type, date: form.date, attendees: form.attendees.split(',').map((s) => s.trim()).filter(Boolean), summary: form.summary || undefined, actionItems: [] };
      if (editingId) {
        await api.put(`/meetings/${editingId}`, payload);
      } else {
        await api.post('/meetings', payload);
      }
      await load();
      closeModal();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/meetings/${id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = meetings.filter((m) => {
    const matchSearch = searchTerm === '' || m.title.toLowerCase().includes(searchTerm.toLowerCase()) || (m.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === '' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meeting Notes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Record and track meeting minutes and action items</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Meeting
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['BOARD', 'MANAGEMENT_REVIEW', 'AUDIT', 'SUPPLIER'].map((type) => (
            <div key={type} className="rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300">
              <p className="text-2xl font-bold">{meetings.filter((m) => m.type === type).length}</p>
              <p className="text-sm font-medium mt-0.5">{TYPE_LABELS[type as MeetingType]}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search meetings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Types</option>
            {(Object.entries(TYPE_LABELS) as [MeetingType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-purple-600" /> Meetings ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Attendees</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Summary</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{m.title}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[m.type]}`}>{TYPE_LABELS[m.type]}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(m.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{m.attendees.slice(0, 3).join(', ')}{m.attendees.length > 3 ? ` +${m.attendees.length - 3}` : ''}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{m.summary || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(m)} className="p-1 text-gray-400 hover:text-purple-600"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No meetings found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Meeting' : 'Add Meeting'}</h2>
              <button onClick={closeModal}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Meeting title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MeetingType })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {(Object.entries(TYPE_LABELS) as [MeetingType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attendees (comma-separated)</label>
                <input type="text" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="CEO, CFO, Quality Manager" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label>
                <textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Key outcomes and decisions..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.date} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
