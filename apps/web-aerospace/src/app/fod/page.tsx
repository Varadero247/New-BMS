'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Eye, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FODEvent {
  id: string;
  eventNumber: string;
  description: string;
  location: string;
  itemFound: string;
  material: string;
  severity: string;
  status: string;
  reportedBy: string;
  foundDate: string;
  rootCause: string;
  correctionAction: string;
  createdAt: string;
}

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['REPORTED', 'INVESTIGATING', 'ROOT_CAUSE_IDENTIFIED', 'CORRECTIVE_ACTION', 'CLOSED'];
const statusColor = (s: string) => s === 'CLOSED' ? 'bg-green-100 text-green-700' : s === 'INVESTIGATING' || s === 'ROOT_CAUSE_IDENTIFIED' ? 'bg-blue-100 text-blue-700' : s === 'CORRECTIVE_ACTION' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700';
const sevColor = (s: string) => s === 'CRITICAL' ? 'bg-red-100 text-red-700' : s === 'HIGH' ? 'bg-orange-100 text-orange-700' : s === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

const emptyForm = { description: '', location: '', itemFound: '', material: '', severity: 'MEDIUM', status: 'REPORTED', reportedBy: '', foundDate: '', rootCause: '', correctionAction: '' };

export default function FODPreventionPage() {
  const [items, setItems] = useState<FODEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FODEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/fod'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: FODEvent) {
    setEditItem(item);
    setForm({ description: item.description, location: item.location || '', itemFound: item.itemFound || '', material: item.material || '', severity: item.severity, status: item.status, reportedBy: item.reportedBy || '', foundDate: item.foundDate ? item.foundDate.slice(0, 10) : '', rootCause: item.rootCause || '', correctionAction: item.correctionAction || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/fod/${editItem.id}`, form);
      else await api.post('/fod', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/fod/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchSev = !severityFilter || item.severity === severityFilter;
    return matchSearch && matchSev;
  });

  const stats = { total: items.length, open: items.filter(i => i.status !== 'CLOSED').length, critical: items.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length, closed: items.filter(i => i.status === 'CLOSED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">FOD Prevention</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Foreign Object Damage / Debris prevention and reporting</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Report FOD Event</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Open', value: stats.open, color: 'text-yellow-700', bg: 'bg-yellow-100' },
            { label: 'High/Critical', value: stats.critical, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Closed', value: stats.closed, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Eye className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search FOD events..." placeholder="Search FOD events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by severity" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Severities</option>{SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-indigo-600" />FOD Events ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Event #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Item Found</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Found Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.eventNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{item.description}</td>
                    <td className="py-3 px-4 text-gray-600">{item.location || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.itemFound || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sevColor(item.severity)}`}>{item.severity}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.foundDate ? new Date(item.foundDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><Eye className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No FOD events reported</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Update FOD Event' : 'Report FOD Event'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label><input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Found Date</label><input type="date" value={form.foundDate} onChange={e => setForm({...form, foundDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Found</label><input type="text" value={form.itemFound} onChange={e => setForm({...form, itemFound: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label><input type="text" value={form.material} onChange={e => setForm({...form, material: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reported By</label><input type="text" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Root Cause</label><textarea value={form.rootCause} onChange={e => setForm({...form, rootCause: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corrective Action</label><textarea value={form.correctionAction} onChange={e => setForm({...form, correctionAction: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.description || saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Update' : 'Report'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete FOD Event?</h2>
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
