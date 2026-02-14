'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Clock, AlertTriangle, Edit2, Trash2, Activity, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface DowntimeEvent {
  id: string;
  asset: string;
  assetId: string;
  reason: string;
  category: string;
  startTime: string;
  endTime: string;
  duration: number;
  impact: string;
  rootCause: string;
  corrective: string;
  reportedBy: string;
  status: string;
}

const impactColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  ONGOING: 'bg-red-100 text-red-700',
  RESOLVED: 'bg-green-100 text-green-700',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-700',
};

const EMPTY_FORM = {
  asset: '', category: 'MECHANICAL', reason: '', startTime: '', endTime: '',
  duration: '', impact: 'MEDIUM', rootCause: '', corrective: '', reportedBy: '', status: 'ONGOING',
};

export default function DowntimePage() {
  const [events, setEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [impactFilter, setImpactFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<DowntimeEvent | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/downtime'); setEvents(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = events.filter(e => {
    const matchesSearch = !searchTerm || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesImpact = !impactFilter || e.impact === impactFilter;
    const matchesCategory = !categoryFilter || e.category === categoryFilter;
    return matchesSearch && matchesImpact && matchesCategory;
  });

  const totalHours = events.reduce((s, e) => s + (e.duration || 0), 0);
  const ongoing = events.filter(e => e.status === 'ONGOING' || !e.endTime).length;
  const highImpact = events.filter(e => e.impact === 'HIGH' || e.impact === 'CRITICAL').length;

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(e: DowntimeEvent) {
    setSelected(e);
    setForm({
      asset: e.asset || '', category: e.category || 'MECHANICAL', reason: e.reason || '',
      startTime: e.startTime ? e.startTime.slice(0, 16) : '',
      endTime: e.endTime ? e.endTime.slice(0, 16) : '',
      duration: e.duration?.toString() || '', impact: e.impact || 'MEDIUM',
      rootCause: e.rootCause || '', corrective: e.corrective || '',
      reportedBy: e.reportedBy || '', status: e.status || 'ONGOING',
    });
    setError(''); setEditOpen(true);
  }
  function openDelete(e: DowntimeEvent) { setSelected(e); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.asset.trim()) { setError('Asset is required'); return; }
    if (!form.startTime) { setError('Start time is required'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/downtime', { ...form, duration: parseFloat(form.duration) || 0 });
      setCreateOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to create'); } finally { setSaving(false); }
  }
  async function handleEdit() {
    setSaving(true); setError('');
    try {
      await api.put(`/downtime/${selected!.id}`, { ...form, duration: parseFloat(form.duration) || 0 });
      setEditOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to update'); } finally { setSaving(false); }
  }
  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/downtime/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset *</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} placeholder="Asset name/tag" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="MECHANICAL">Mechanical</option><option value="ELECTRICAL">Electrical</option><option value="OPERATOR">Operator Error</option><option value="PLANNED">Planned</option><option value="EXTERNAL">External</option><option value="SOFTWARE">Software</option>
          </select>
        </div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for downtime" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label><input type="datetime-local" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="datetime-local" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label><input type="number" step="0.1" min="0" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="0.0" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}>
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="ONGOING">Ongoing</option><option value="UNDER_INVESTIGATION">Under Investigation</option><option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.reportedBy} onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))} placeholder="Name" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label><textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.rootCause} onChange={e => setForm(f => ({ ...f, rootCause: e.target.value }))} placeholder="Root cause analysis..." /></div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Corrective Action</label><textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.corrective} onChange={e => setForm(f => ({ ...f, corrective: e.target.value }))} placeholder="Actions taken or planned..." /></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Downtime Analysis</h1><p className="text-gray-500 mt-1">Track and analyse equipment downtime events</p></div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Log Downtime</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Events', value: events.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Ongoing', value: ongoing, icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'High / Critical', value: highImpact, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Hours Lost', value: totalHours.toFixed(1) + 'h', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.label}><CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div>
                  <div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div>
                </div>
              </CardContent></Card>
            );
          })}
        </div>

        <Card className="mb-6"><CardContent className="pt-5"><div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search downtime events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <select value={impactFilter} onChange={e => setImpactFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Impacts</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Categories</option><option value="MECHANICAL">Mechanical</option><option value="ELECTRICAL">Electrical</option><option value="OPERATOR">Operator Error</option><option value="PLANNED">Planned</option><option value="EXTERNAL">External</option><option value="SOFTWARE">Software</option></select>
        </div></CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-600" />Downtime Events ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">{['Asset','Category','Reason','Start','End','Duration','Impact','Status','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{filtered.map(evt => (
                  <tr key={evt.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-medium">{evt.asset}</td>
                    <td className="py-3 px-4 text-gray-600">{evt.category}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{evt.reason || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{evt.startTime ? new Date(evt.startTime).toLocaleString() : '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{evt.endTime ? new Date(evt.endTime).toLocaleString() : <span className="text-red-600 font-medium">Ongoing</span>}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{evt.duration != null ? evt.duration.toFixed(1) + 'h' : '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${impactColors[evt.impact] || 'bg-gray-100 text-gray-700'}`}>{evt.impact}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[evt.status] || 'bg-gray-100 text-gray-700'}`}>{evt.status?.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><button onClick={() => openEdit(evt)} className="text-gray-400 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDelete(evt)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><Clock className="h-12 w-12 mx-auto mb-4 opacity-40" /><p className="font-medium">No downtime events found</p><p className="text-sm mt-1">Log a downtime event to start tracking</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Log Downtime Event" size="lg"><FormFields /><ModalFooter><button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Log Event'}</button></ModalFooter></Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Downtime Event" size="lg"><FormFields /><ModalFooter><button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></ModalFooter></Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Downtime Event" size="sm"><div className="flex items-start gap-3"><div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div><p className="text-sm text-gray-700">Delete downtime event for <span className="font-semibold">{selected?.asset}</span>? This cannot be undone.</p></div><ModalFooter><button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button></ModalFooter></Modal>
    </div>
  );
}
