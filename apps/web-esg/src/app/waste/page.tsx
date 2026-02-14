'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Trash2, Pencil, RecycleIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface WasteRecord {
  id: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  disposalMethod: string;
  recycledPercentage: number;
  facility: string;
  date: string;
  status: string;
}

type FormData = Omit<WasteRecord, 'id'>;

const categoryColors: Record<string, string> = {
  HAZARDOUS: 'bg-red-100 text-red-700',
  NON_HAZARDOUS: 'bg-green-100 text-green-700',
  RECYCLABLE: 'bg-blue-100 text-blue-700',
  ORGANIC: 'bg-amber-100 text-amber-700',
  ELECTRONIC: 'bg-purple-100 text-purple-700',
};

const empty: FormData = {
  type: '',
  category: 'NON_HAZARDOUS',
  quantity: 0,
  unit: 'kg',
  disposalMethod: 'RECYCLING',
  recycledPercentage: 0,
  facility: '',
  date: new Date().toISOString().split('T')[0],
  status: 'RECORDED',
};

export default function WastePage() {
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WasteRecord | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    try {
      const res = await api.get('/waste');
      setRecords(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(r: WasteRecord) {
    setEditing(r);
    setForm({ type: r.type, category: r.category, quantity: r.quantity, unit: r.unit, disposalMethod: r.disposalMethod, recycledPercentage: r.recycledPercentage, facility: r.facility, date: r.date?.split('T')[0] || '', status: r.status });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/waste/${editing.id}`, form);
        setRecords(prev => prev.map(r => r.id === editing.id ? res.data.data : r));
      } else {
        const res = await api.post('/waste', form);
        setRecords(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/waste/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = records.filter(r => {
    const matchesSearch = !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !categoryFilter || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalWaste = records.reduce((s, r) => s + (r.quantity || 0), 0);
  const recycled = records.filter(r => r.category === 'RECYCLABLE' || r.recycledPercentage > 50).length;
  const hazardous = records.filter(r => r.category === 'HAZARDOUS').length;
  const avgRecycled = records.length > 0 ? Math.round(records.reduce((s, r) => s + (r.recycledPercentage || 0), 0) / records.length) : 0;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Waste Management</h1>
            <p className="text-gray-500 mt-1">Track waste generation, disposal, and recycling rates</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Log Waste
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Waste', value: `${totalWaste.toLocaleString()} kg`, color: 'text-gray-800', bg: 'bg-gray-50' },
            { label: 'Recyclable Records', value: recycled, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Hazardous Records', value: hazardous, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Avg Recycled %', value: `${avgRecycled}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search waste records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Categories</option>
              <option value="HAZARDOUS">Hazardous</option>
              <option value="NON_HAZARDOUS">Non-Hazardous</option>
              <option value="RECYCLABLE">Recyclable</option>
              <option value="ORGANIC">Organic</option>
              <option value="ELECTRONIC">Electronic</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-green-600" />Waste Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Disposal</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Recycled %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Facility</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{r.type}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[r.category] || 'bg-gray-100 text-gray-700'}`}>{r.category?.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-4 text-right">{r.quantity} {r.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{r.disposalMethod?.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${r.recycledPercentage || 0}%` }} /></div>
                            <span>{r.recycledPercentage || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.facility}</td>
                        <td className="py-3 px-4 text-gray-600">{r.date ? new Date(r.date).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No waste records found</p>
                <p className="text-sm mt-1">Click "Log Waste" to add your first record</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Waste Record' : 'Log Waste Record'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Waste Type *</label>
              <input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Cardboard, Electronic waste" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="NON_HAZARDOUS">Non-Hazardous</option>
                <option value="HAZARDOUS">Hazardous</option>
                <option value="RECYCLABLE">Recyclable</option>
                <option value="ORGANIC">Organic</option>
                <option value="ELECTRONIC">Electronic</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="kg, tonnes, litres" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Recycled %</label>
              <input type="number" min="0" max="100" value={form.recycledPercentage} onChange={e => setForm(f => ({ ...f, recycledPercentage: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Disposal Method</label>
              <select value={form.disposalMethod} onChange={e => setForm(f => ({ ...f, disposalMethod: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="RECYCLING">Recycling</option>
                <option value="LANDFILL">Landfill</option>
                <option value="INCINERATION">Incineration</option>
                <option value="COMPOSTING">Composting</option>
                <option value="REUSE">Reuse</option>
                <option value="HAZARDOUS_TREATMENT">Hazardous Treatment</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
              <input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Site or facility name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="RECORDED">Recorded</option>
                <option value="VERIFIED">Verified</option>
                <option value="DISPOSED">Disposed</option>
              </select></div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.type} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Log Waste'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Waste Record" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this waste record?</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
