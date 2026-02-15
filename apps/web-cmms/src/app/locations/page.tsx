'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, MapPin, Edit2, Trash2, Building2, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  parent: string;
  description: string;
  address: string;
  assetCount: number;
  status: string;
}

const EMPTY_FORM = { name: '', code: '', type: 'BUILDING', parent: '', description: '', address: '', status: 'ACTIVE' };

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/locations'); setLocations(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = locations.filter(l => {
    const matchesSearch = !searchTerm || JSON.stringify(l).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAssets = locations.reduce((s, l) => s + (l.assetCount || 0), 0);

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(l: Location) {
    setSelected(l);
    setForm({ name: l.name||'', code: l.code||'', type: l.type||'BUILDING', parent: l.parent||'', description: l.description||'', address: l.address||'', status: l.status||'ACTIVE' });
    setError(''); setEditOpen(true);
  }
  function openDelete(l: Location) { setSelected(l); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try { await api.post('/locations', form); setCreateOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to create'); } finally { setSaving(false); }
  }
  async function handleEdit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try { await api.put(`/locations/${selected!.id}`, form); setEditOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to update'); } finally { setSaving(false); }
  }
  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/locations/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Location name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="LOC-001" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="BUILDING">Building</option><option value="FLOOR">Floor</option><option value="ROOM">Room</option><option value="ZONE">Zone</option><option value="AREA">Area</option><option value="OUTDOOR">Outdoor</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Location</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} placeholder="Parent location name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address or GPS coordinates" /></div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Location description..." /></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Locations</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Manage facility locations and zones</p></div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Location</button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Locations', value: locations.length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: locations.filter(l => l.status === 'ACTIVE').length, icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Assets', value: totalAssets, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(card => {
            const Icon = card.icon;
            return (<Card key={card.label}><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div><div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div></div></CardContent></Card>);
          })}
        </div>

        <Card className="mb-6"><CardContent className="pt-5"><div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search locations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Types</option><option value="BUILDING">Building</option><option value="FLOOR">Floor</option><option value="ROOM">Room</option><option value="ZONE">Zone</option><option value="AREA">Area</option></select>
        </div></CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-600" />Locations ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">{['Code','Name','Type','Parent','Assets','Status','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>)}</tr></thead>
                <tbody>{filtered.map(loc => (
                  <tr key={loc.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400 text-xs">{loc.code}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{loc.name}</td>
                    <td className="py-3 px-4 text-gray-600">{loc.type}</td>
                    <td className="py-3 px-4 text-gray-600">{loc.parent || '-'}</td>
                    <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{loc.assetCount || 0}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${loc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{loc.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><button onClick={() => openEdit(loc)} className="text-gray-400 dark:text-gray-500 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDelete(loc)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" /><p className="font-medium">No locations found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Location" size="lg"><FormFields /><ModalFooter><button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Location'}</button></ModalFooter></Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Location" size="lg"><FormFields /><ModalFooter><button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></ModalFooter></Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Location" size="sm"><div className="flex items-start gap-3"><div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div><p className="text-sm text-gray-700 dark:text-gray-300">Delete <span className="font-semibold">{selected?.name}</span>?</p></div><ModalFooter><button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button></ModalFooter></Modal>
    </div>
  );
}
