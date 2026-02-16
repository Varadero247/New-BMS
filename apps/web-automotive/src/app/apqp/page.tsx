'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Layers, X, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface APQPProject {
  id: string;
  projectNumber: string;
  title: string;
  customerName: string;
  partNumber: string;
  phase: string;
  status: string;
  owner: string;
  launchDate: string;
  completionDate: string;
  createdAt: string;
}

const PHASES = ['PHASE_1_PLANNING', 'PHASE_2_DESIGN', 'PHASE_3_PROCESS', 'PHASE_4_VALIDATION', 'PHASE_5_LAUNCH', 'COMPLETE'];
const STATUSES = ['ACTIVE', 'ON_HOLD', 'DELAYED', 'COMPLETE', 'CANCELLED'];
const phaseLabel = (p: string) => ({ PHASE_1_PLANNING: 'Phase 1: Planning', PHASE_2_DESIGN: 'Phase 2: Design', PHASE_3_PROCESS: 'Phase 3: Process', PHASE_4_VALIDATION: 'Phase 4: Validation', PHASE_5_LAUNCH: 'Phase 5: Launch', COMPLETE: 'Complete' }[p] || p);
const phaseColor = (p: string) => p === 'COMPLETE' ? 'bg-green-100 text-green-700' : p === 'PHASE_5_LAUNCH' ? 'bg-blue-100 text-blue-700' : p === 'PHASE_4_VALIDATION' ? 'bg-purple-100 text-purple-700' : p === 'PHASE_3_PROCESS' ? 'bg-indigo-100 text-indigo-700' : p === 'PHASE_2_DESIGN' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';
const statusColor = (s: string) => s === 'COMPLETE' ? 'bg-green-100 text-green-700' : s === 'DELAYED' ? 'bg-red-100 text-red-700' : s === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' : s === 'CANCELLED' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-blue-100 text-blue-700';

const emptyForm = { title: '', customerName: '', partNumber: '', phase: 'PHASE_1_PLANNING', status: 'ACTIVE', owner: '', launchDate: '', completionDate: '' };

export default function APQPPage() {
  const [items, setItems] = useState<APQPProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<APQPProject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/apqp'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: APQPProject) {
    setEditItem(item);
    setForm({ title: item.title, customerName: item.customerName || '', partNumber: item.partNumber || '', phase: item.phase, status: item.status, owner: item.owner || '', launchDate: item.launchDate ? item.launchDate.slice(0, 10) : '', completionDate: item.completionDate ? item.completionDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/apqp/${editItem.id}`, form);
      else await api.post('/apqp', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/apqp/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchPhase = !phaseFilter || item.phase === phaseFilter;
    return matchSearch && matchPhase;
  });

  const stats = { total: items.length, active: items.filter(i => i.status === 'ACTIVE').length, delayed: items.filter(i => i.status === 'DELAYED').length, complete: items.filter(i => i.phase === 'COMPLETE').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">APQP Projects</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Advanced Product Quality Planning — IATF 16949</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New APQP Project</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Projects', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Active', value: stats.active, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Delayed', value: stats.delayed, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Complete', value: stats.complete, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Layers className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search APQP projects..." placeholder="Search APQP projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by phase" value={phaseFilter} onChange={e => setPhaseFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Phases</option>{PHASES.map(p => <option key={p} value={p}>{phaseLabel(p)}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-orange-600" />APQP Projects ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Project #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Part #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phase</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Launch Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.projectNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                    <td className="py-3 px-4 text-gray-600">{item.customerName || '-'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.partNumber || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${phaseColor(item.phase)}`}>{phaseLabel(item.phase)}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.launchDate ? new Date(item.launchDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><Layers className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No APQP projects found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit APQP Project' : 'New APQP Project'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number</label><input type="text" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phase</label><select value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{PHASES.map(p => <option key={p} value={p}>{phaseLabel(p)}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Launch Date</label><input type="date" value={form.launchDate} onChange={e => setForm({...form, launchDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Completion Date</label><input type="date" value={form.completionDate} onChange={e => setForm({...form, completionDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Project'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete APQP Project?</h2>
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
