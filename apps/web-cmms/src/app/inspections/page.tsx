'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, ClipboardCheck, Edit2, Trash2, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface Inspection {
  id: string;
  title: string;
  asset: string;
  type: string;
  inspector: string;
  scheduledDate: string;
  completedDate: string;
  result: string;
  findings: string;
  status: string;
}

const statusColors: Record<string, string> = { SCHEDULED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', OVERDUE: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };
const resultColors: Record<string, string> = { PASS: 'bg-green-100 text-green-700', FAIL: 'bg-red-100 text-red-700', CONDITIONAL: 'bg-yellow-100 text-yellow-700' };
const EMPTY_FORM = { title: '', asset: '', type: 'ROUTINE', inspector: '', scheduledDate: '', completedDate: '', result: '', findings: '', status: 'SCHEDULED' };

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/inspections'); setInspections(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = inspections.filter(i => {
    const matchesSearch = !searchTerm || JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    scheduled: inspections.filter(i => i.status === 'SCHEDULED').length,
    completed: inspections.filter(i => i.status === 'COMPLETED').length,
    failed: inspections.filter(i => i.result === 'FAIL').length,
    overdue: inspections.filter(i => i.scheduledDate && new Date(i.scheduledDate) < new Date() && i.status === 'SCHEDULED').length,
  };

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(i: Inspection) {
    setSelected(i);
    setForm({ title: i.title||'', asset: i.asset||'', type: i.type||'ROUTINE', inspector: i.inspector||'', scheduledDate: i.scheduledDate ? i.scheduledDate.slice(0,10) : '', completedDate: i.completedDate ? i.completedDate.slice(0,10) : '', result: i.result||'', findings: i.findings||'', status: i.status||'SCHEDULED' });
    setError(''); setEditOpen(true);
  }
  function openDelete(i: Inspection) { setSelected(i); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try { await api.post('/inspections', form); setCreateOpen(false); await load(); }
    catch (e: unknown) { setError(e?.response?.data?.error || 'Failed to create'); } finally { setSaving(false); }
  }
  async function handleEdit() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try { await api.put(`/inspections/${selected!.id}`, form); setEditOpen(false); await load(); }
    catch (e: unknown) { setError(e?.response?.data?.error || 'Failed to update'); } finally { setSaving(false); }
  }
  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/inspections/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: unknown) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Inspection title" />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} placeholder="Asset name/tag" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="ROUTINE">Routine</option><option value="SAFETY">Safety</option><option value="COMPLIANCE">Compliance</option><option value="ANNUAL">Annual</option><option value="EMERGENCY">Emergency</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inspector</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.inspector} onChange={e => setForm(f => ({ ...f, inspector: e.target.value }))} placeholder="Inspector name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date</label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="SCHEDULED">Scheduled</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Completed Date</label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.completedDate} onChange={e => setForm(f => ({ ...f, completedDate: e.target.value }))} /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
            <option value="">Pending</option><option value="PASS">Pass</option><option value="FAIL">Fail</option><option value="CONDITIONAL">Conditional</option>
          </select>
        </div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Findings</label><textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.findings} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))} placeholder="Inspection findings and observations..." /></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inspections</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Manage equipment inspections</p></div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Schedule Inspection</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Overdue', value: stats.overdue, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(card => {
            const Icon = card.icon;
            return (<Card key={card.label}><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div><div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div></div></CardContent></Card>);
          })}
        </div>

        <Card className="mb-6"><CardContent className="pt-5"><div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search inspections..." placeholder="Search inspections..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Statuses</option><option value="SCHEDULED">Scheduled</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select>
        </div></CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-amber-600" />Inspections ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  {['Title','Asset','Type','Inspector','Scheduled','Result','Status','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>)}
                </tr></thead>
                <tbody>{filtered.map(insp => (
                  <tr key={insp.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{insp.title}</td>
                    <td className="py-3 px-4 text-gray-600">{insp.asset || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{insp.type}</td>
                    <td className="py-3 px-4 text-gray-600">{insp.inspector || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{insp.scheduledDate ? new Date(insp.scheduledDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4">{insp.result ? <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${resultColors[insp.result] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{insp.result}</span> : <span className="text-gray-400 dark:text-gray-500 text-xs">Pending</span>}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[insp.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{insp.status?.replace(/_/g,' ')}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><button onClick={() => openEdit(insp)} className="text-gray-400 dark:text-gray-500 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDelete(insp)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-40" /><p className="font-medium">No inspections found</p><p className="text-sm mt-1">Schedule your first inspection to get started</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Schedule Inspection" size="lg"><FormFields /><ModalFooter><button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Schedule'}</button></ModalFooter></Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Inspection" size="lg"><FormFields /><ModalFooter><button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></ModalFooter></Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Inspection" size="sm"><div className="flex items-start gap-3"><div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div><p className="text-sm text-gray-700 dark:text-gray-300">Delete <span className="font-semibold">{selected?.title}</span>? This cannot be undone.</p></div><ModalFooter><button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button></ModalFooter></Modal>
    </div>
  );
}
