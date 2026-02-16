'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FileCheck, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface PPAPRecord {
  id: string;
  ppapNumber: string;
  partName: string;
  partNumber: string;
  customerName: string;
  submissionLevel: string;
  status: string;
  dispositionCode: string;
  owner: string;
  submittedDate: string;
  approvedDate: string;
  createdAt: string;
}

const LEVELS = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'];
const STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'INTERIM_APPROVED', 'REJECTED', 'RESUBMIT'];
const DISPOSITIONS = ['APPROVED', 'INTERIM_APPROVED', 'REJECTED', 'PENDING'];
const statusColor = (s: string) => s === 'APPROVED' ? 'bg-green-100 text-green-700' : s === 'REJECTED' || s === 'RESUBMIT' ? 'bg-red-100 text-red-700' : s === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : s === 'INTERIM_APPROVED' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600';

const emptyForm = { partName: '', partNumber: '', customerName: '', submissionLevel: 'LEVEL_3', status: 'DRAFT', dispositionCode: 'PENDING', owner: '', submittedDate: '', approvedDate: '' };

export default function PPAPPage() {
  const [items, setItems] = useState<PPAPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PPAPRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/ppap'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: PPAPRecord) {
    setEditItem(item);
    setForm({ partName: item.partName, partNumber: item.partNumber || '', customerName: item.customerName || '', submissionLevel: item.submissionLevel, status: item.status, dispositionCode: item.dispositionCode || 'PENDING', owner: item.owner || '', submittedDate: item.submittedDate ? item.submittedDate.slice(0, 10) : '', approvedDate: item.approvedDate ? item.approvedDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/ppap/${editItem.id}`, form);
      else await api.post('/ppap', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/ppap/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, approved: items.filter(i => i.status === 'APPROVED').length, pending: items.filter(i => i.status === 'SUBMITTED' || i.status === 'DRAFT').length, rejected: items.filter(i => i.status === 'REJECTED' || i.status === 'RESUBMIT').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">PPAP</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Production Part Approval Process submissions</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New PPAP</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Submissions', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'In Progress', value: stats.pending, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><FileCheck className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search PPAP records..." placeholder="Search PPAP records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-orange-600" />PPAP Submissions ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">PPAP #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Part Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Part #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.ppapNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.partName}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.partNumber || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.customerName || '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.submissionLevel.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.submittedDate ? new Date(item.submittedDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><FileCheck className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No PPAP submissions found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit PPAP' : 'New PPAP Submission'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Name *</label><input type="text" value={form.partName} onChange={e => setForm({...form, partName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number</label><input type="text" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submission Level</label><select value={form.submissionLevel} onChange={e => setForm({...form, submissionLevel: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Submitted Date</label><input type="date" value={form.submittedDate} onChange={e => setForm({...form, submittedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved Date</label><input type="date" value={form.approvedDate} onChange={e => setForm({...form, approvedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.partName || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create PPAP'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete PPAP?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This cannot be undone.</p>
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
