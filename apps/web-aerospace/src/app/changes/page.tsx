'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, GitPullRequest, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface EngineeringChange {
  id: string;
  ecpNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  requestedBy: string;
  affectedCIs: string;
  effectivityDate: string;
  createdAt: string;
}

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'IN_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'IMPLEMENTED', 'REJECTED', 'CLOSED'];

const priorityColor = (p: string) =>
  p === 'CRITICAL' ? 'bg-red-100 text-red-700' : p === 'HIGH' ? 'bg-orange-100 text-orange-700' : p === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700';

const statusColor = (s: string) =>
  s === 'APPROVED' || s === 'IMPLEMENTED' ? 'bg-green-100 text-green-700' : s === 'REJECTED' ? 'bg-red-100 text-red-700' : s === 'IN_REVIEW' || s === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : s === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700';

const emptyForm = { title: '', description: '', priority: 'MEDIUM', status: 'OPEN', requestedBy: '', affectedCIs: '', effectivityDate: '' };

export default function EngineeringChangesPage() {
  const [items, setItems] = useState<EngineeringChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EngineeringChange | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/changes');
      setItems(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: EngineeringChange) {
    setEditItem(item);
    setForm({ title: item.title, description: item.description || '', priority: item.priority, status: item.status, requestedBy: item.requestedBy || '', affectedCIs: item.affectedCIs || '', effectivityDate: item.effectivityDate ? item.effectivityDate.slice(0, 10) : '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/changes/${editItem.id}`, form);
      } else {
        await api.post('/changes', form);
      }
      setModalOpen(false);
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await api.delete(`/changes/${id}`); load(); } catch (e) { console.error(e); }
    finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchPriority = !priorityFilter || item.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'OPEN').length,
    inReview: items.filter(i => i.status === 'IN_REVIEW' || i.status === 'PENDING_APPROVAL').length,
    critical: items.filter(i => i.priority === 'CRITICAL').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Engineering Changes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Engineering Change Proposals (ECP) management</p>
          </div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> New ECP
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total ECPs', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800', icon: GitPullRequest },
            { label: 'Open', value: stats.open, color: 'text-blue-700', bg: 'bg-blue-100', icon: GitPullRequest },
            { label: 'In Review', value: stats.inReview, color: 'text-amber-700', bg: 'bg-amber-100', icon: GitPullRequest },
            { label: 'Critical', value: stats.critical, color: 'text-red-700', bg: 'bg-red-100', icon: AlertTriangle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                    <div className={`p-2 rounded-full ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search ECPs..." placeholder="Search ECPs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select aria-label="Filter by priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-indigo-600" /> Engineering Changes ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ECP #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Requested By</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Effectivity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{item.ecpNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColor(item.priority)}`}>{item.priority}</span></td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-4 text-gray-600">{item.requestedBy || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{item.effectivityDate ? new Date(item.effectivityDate).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <GitPullRequest className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No engineering changes found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Engineering Change' : 'New Engineering Change Proposal'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ECP title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Change description and rationale" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested By</label>
                <input type="text" value={form.requestedBy} onChange={e => setForm({...form, requestedBy: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Originator name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affected Configuration Items</label>
                <input type="text" value={form.affectedCIs} onChange={e => setForm({...form, affectedCIs: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="CI numbers (comma separated)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effectivity Date</label>
                <input type="date" value={form.effectivityDate} onChange={e => setForm({...form, effectivityDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create ECP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete ECP?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
