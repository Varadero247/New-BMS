'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Clock, CheckCircle, Timer } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface TimeEntry {
  id: string;
  technicianName?: string;
  jobNumber?: string;
  jobId?: string;
  date?: string;
  hours?: number;
  overtimeHours?: number;
  type?: string;
  entryType?: string;
  description?: string;
  status?: string;
  billable?: boolean;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
};

const emptyForm = {
  technicianName: '', jobNumber: '', date: '',
  hours: '', overtimeHours: '0', type: 'REGULAR', description: '',
  status: 'PENDING', billable: true,
};

export default function TimeEntriesPage() {
  const [items, setItems] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TimeEntry | null>(null);
  const [deleteItem, setDeleteItem] = useState<TimeEntry | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/time-entries'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const q = searchTerm.toLowerCase();
    return (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter);
  });

  const totalHours = items.reduce((s, i) => s + (Number(i.hours) || 0), 0);
  const totalOT = items.reduce((s, i) => s + (Number(i.overtimeHours) || 0), 0);
  const stats = {
    total: items.length,
    approved: items.filter(i => i.status === 'APPROVED').length,
    pending: items.filter(i => i.status === 'PENDING').length,
    totalHours: Math.round(totalHours * 10) / 10,
    totalOT: Math.round(totalOT * 10) / 10,
  };

  const openCreate = () => { setEditItem(null); setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] }); setError(''); setModalOpen(true); };
  const openEdit = (item: TimeEntry) => {
    setEditItem(item);
    setForm({ technicianName: item.technicianName || '', jobNumber: item.jobNumber || '',
      date: item.date ? item.date.split('T')[0] : '', hours: item.hours || '',
      overtimeHours: item.overtimeHours || '0', type: item.type || item.entryType || 'REGULAR',
      description: item.description || '', status: item.status || 'PENDING', billable: item.billable ?? true });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.technicianName || !form.hours) { setError('Technician and hours are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editItem) await api.put(`/time-entries/${editItem.id}`, form);
      else await api.post('/time-entries', form);
      setModalOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try { await api.delete(`/time-entries/${deleteItem.id}`); setDeleteItem(null); await load(); }
    catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8"><div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
        <div className="h-64 bg-gray-200 rounded" />
      </div></main></div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Time Entries</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Track technician time and labour hours</p>
            </div>
            <button onClick={openCreate} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium">
              <Plus className="h-5 w-5" /> Log Time
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Entries', value: stats.total, icon: Clock, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
              { label: 'Total Hours', value: `${stats.totalHours}h`, icon: Timer, bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-200' },
              { label: 'Overtime Hours', value: `${stats.totalOT}h`, icon: Timer, bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-200' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                      <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" aria-label="Search time entries..." placeholder="Search time entries..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">All Statuses</option>
              {['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-sky-600" /> Time Entries ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Technician</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Job</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Hours</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">OT Hours</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Billable</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.technicianName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.jobNumber || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4 text-right font-medium">{item.hours ?? '-'}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{item.overtimeHours ?? '0'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.type || item.entryType || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.billable ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                              {item.billable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(item)} className="text-sky-600 hover:text-sky-800 text-xs font-medium">Edit</button>
                              <button onClick={() => setDeleteItem(item)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No time entries found</p>
                  <p className="text-sm mt-1">Log your first time entry to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Time Entry' : 'Log Time'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician *</label>
              <input value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Technician name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Number</label>
              <input value={form.jobNumber} onChange={e => setForm(f => ({ ...f, jobNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Related job number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['REGULAR', 'OVERTIME', 'TRAVEL', 'TRAINING', 'ADMIN'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours *</label>
              <input type="number" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0" min="0" step="0.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overtime Hours</label>
              <input type="number" value={form.overtimeHours} onChange={e => setForm(f => ({ ...f, overtimeHours: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0" min="0" step="0.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="billable" checked={form.billable} onChange={e => setForm(f => ({ ...f, billable: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-sky-600" />
              <label htmlFor="billable" className="text-sm font-medium text-gray-700 dark:text-gray-300">Billable to customer</label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Work description..." />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : editItem ? 'Update Entry' : 'Log Time'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Time Entry" size="sm">
        <p className="text-sm text-gray-600">Delete time entry for <span className="font-semibold">{deleteItem?.technicianName}</span>? This action cannot be undone.</p>
        <ModalFooter>
          <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
