'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FileCheck, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Submission {
  id: string;
  submissionNumber: string;
  title: string;
  submissionType: string;
  regulatoryBody: string;
  status: string;
  deviceName: string;
  deviceClass: string;
  submittedDate: string;
  decisionDate: string;
  owner: string;
}

const SUBMISSION_TYPES = ['PMA', '510K', 'DE_NOVO', 'PDP', 'CE_MARKING', 'MDR_EU', 'PMCF', 'OTHER'];
const REGULATORY_BODIES = ['FDA', 'EMA', 'MHRA', 'TGA', 'PMDA', 'HC', 'ANVISA', 'OTHER'];
const STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
const statusColor = (s: string) => s === 'APPROVED' ? 'bg-green-100 text-green-700' : s === 'REJECTED' ? 'bg-red-100 text-red-700' : s === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' : s === 'SUBMITTED' ? 'bg-teal-100 text-teal-700' : s === 'WITHDRAWN' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700';

const emptyForm = { title: '', submissionType: '510K', regulatoryBody: 'FDA', status: 'DRAFT', deviceName: '', deviceClass: 'CLASS_II', submittedDate: '', decisionDate: '', owner: '' };

export default function SubmissionsPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Submission | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/submissions'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: Submission) {
    setEditItem(item);
    setForm({ title: item.title, submissionType: item.submissionType, regulatoryBody: item.regulatoryBody, status: item.status, deviceName: item.deviceName || '', deviceClass: item.deviceClass || 'CLASS_II', submittedDate: item.submittedDate ? item.submittedDate.slice(0, 10) : '', decisionDate: item.decisionDate ? item.decisionDate.slice(0, 10) : '', owner: item.owner || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/submissions/${editItem.id}`, form);
      else await api.post('/submissions', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/submissions/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, approved: items.filter(i => i.status === 'APPROVED').length, pending: items.filter(i => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW').length, rejected: items.filter(i => i.status === 'REJECTED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Regulatory Submissions</h1><p className="text-gray-500 mt-1">FDA 510(k) / PMA / CE Marking / MDR regulatory submissions</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New Submission</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-100' },
            { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Pending / Review', value: stats.pending, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><FileCheck className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search submissions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-teal-600" />Submissions ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Sub #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Body</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Decision</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{item.submissionNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4 text-xs font-medium text-teal-700">{item.submissionType.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.regulatoryBody}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.deviceName || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.submittedDate ? new Date(item.submittedDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.decisionDate ? new Date(item.decisionDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-teal-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><FileCheck className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No submissions found</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{editItem ? 'Edit Submission' : 'New Submission'}</h2><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.submissionType} onChange={e => setForm({...form, submissionType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{SUBMISSION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Regulatory Body</label><select value={form.regulatoryBody} onChange={e => setForm({...form, regulatoryBody: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{REGULATORY_BODIES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label><input type="date" value={form.submittedDate} onChange={e => setForm({...form, submittedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Decision Date</label><input type="date" value={form.decisionDate} onChange={e => setForm({...form, decisionDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Submission?</h2>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
