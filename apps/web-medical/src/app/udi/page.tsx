'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Tag, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface UDIRecord {
  id: string;
  udiNumber: string;
  deviceIdentifier: string;
  productionIdentifier: string;
  deviceName: string;
  deviceClass: string;
  status: string;
  issuer: string;
  lotNumber: string;
  serialNumber: string;
  manufactureDate: string;
  expirationDate: string;
}

const DEVICE_CLASSES = ['CLASS_I', 'CLASS_II', 'CLASS_III'];
const ISSUERS = ['GS1', 'HIBCC', 'ICCBBA', 'FDA'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'RECALLED'];
const statusColor = (s: string) => s === 'ACTIVE' ? 'bg-green-100 text-green-700' : s === 'RECALLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600';

const emptyForm = { deviceIdentifier: '', productionIdentifier: '', deviceName: '', deviceClass: 'CLASS_II', status: 'ACTIVE', issuer: 'GS1', lotNumber: '', serialNumber: '', manufactureDate: '', expirationDate: '' };

export default function UDIPage() {
  const [items, setItems] = useState<UDIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<UDIRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/udi'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: UDIRecord) {
    setEditItem(item);
    setForm({ deviceIdentifier: item.deviceIdentifier, productionIdentifier: item.productionIdentifier || '', deviceName: item.deviceName, deviceClass: item.deviceClass, status: item.status, issuer: item.issuer || 'GS1', lotNumber: item.lotNumber || '', serialNumber: item.serialNumber || '', manufactureDate: item.manufactureDate ? item.manufactureDate.slice(0, 10) : '', expirationDate: item.expirationDate ? item.expirationDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/udi/${editItem.id}`, form);
      else await api.post('/udi', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/udi/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, active: items.filter(i => i.status === 'ACTIVE').length, recalled: items.filter(i => i.status === 'RECALLED').length, inactive: items.filter(i => i.status === 'INACTIVE').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">UDI Management</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Unique Device Identifier — FDA GUDID registration</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add UDI</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total UDIs', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Active', value: stats.active, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Recalled', value: stats.recalled, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Inactive', value: stats.inactive, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Tag className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search UDI records..." placeholder="Search UDI records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-teal-600" />UDI Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">UDI #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Device Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">DI</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Issuer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Lot #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Expiry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.udiNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.deviceName}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.deviceIdentifier}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.deviceClass.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.issuer || '-'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.lotNumber || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><Tag className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No UDI records found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit UDI' : 'Add UDI'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name *</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Identifier (DI)</label><input type="text" value={form.deviceIdentifier} onChange={e => setForm({...form, deviceIdentifier: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Production Identifier (PI)</label><input type="text" value={form.productionIdentifier} onChange={e => setForm({...form, productionIdentifier: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Class</label><select value={form.deviceClass} onChange={e => setForm({...form, deviceClass: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{DEVICE_CLASSES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issuer</label><select value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{ISSUERS.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lot Number</label><input type="text" value={form.lotNumber} onChange={e => setForm({...form, lotNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label><input type="text" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manufacture Date</label><input type="date" value={form.manufactureDate} onChange={e => setForm({...form, manufactureDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date</label><input type="date" value={form.expirationDate} onChange={e => setForm({...form, expirationDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.deviceName || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add UDI'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete UDI Record?</h2>
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
