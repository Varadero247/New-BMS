'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Truck, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SupplierDev {
  id: string;
  devNumber: string;
  supplierName: string;
  supplierCode: string;
  program: string;
  status: string;
  tier: string;
  score: number;
  sqa: string;
  targetDate: string;
  issues: string;
  createdAt: string;
}

const STATUSES = ['ACTIVE', 'UNDER_DEVELOPMENT', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'DISQUALIFIED'];
const TIERS = ['TIER_1', 'TIER_2', 'TIER_3'];
const statusColor = (s: string) => s === 'APPROVED' ? 'bg-green-100 text-green-700' : s === 'SUSPENDED' || s === 'DISQUALIFIED' ? 'bg-red-100 text-red-700' : s === 'CONDITIONAL' ? 'bg-yellow-100 text-yellow-700' : s === 'UNDER_DEVELOPMENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700';
const scoreColor = (n: number) => n >= 85 ? 'text-green-700' : n >= 70 ? 'text-yellow-700' : 'text-red-700';

const emptyForm = { supplierName: '', supplierCode: '', program: '', status: 'UNDER_DEVELOPMENT', tier: 'TIER_1', score: 70, sqa: '', targetDate: '', issues: '' };

export default function SupplierDevPage() {
  const [items, setItems] = useState<SupplierDev[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SupplierDev | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/supplier-dev'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: SupplierDev) {
    setEditItem(item);
    setForm({ supplierName: item.supplierName, supplierCode: item.supplierCode || '', program: item.program || '', status: item.status, tier: item.tier || 'TIER_1', score: item.score || 70, sqa: item.sqa || '', targetDate: item.targetDate ? item.targetDate.slice(0, 10) : '', issues: item.issues || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/supplier-dev/${editItem.id}`, form);
      else await api.post('/supplier-dev', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/supplier-dev/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, approved: items.filter(i => i.status === 'APPROVED').length, developing: items.filter(i => i.status === 'UNDER_DEVELOPMENT').length, avgScore: items.length > 0 ? Math.round(items.reduce((acc, i) => acc + (i.score || 0), 0) / items.length) : 0 };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Supplier Development</h1><p className="text-gray-500 mt-1">IATF 16949 supplier qualification and development</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Supplier</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Suppliers', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-100' },
            { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'In Development', value: stats.developing, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Avg Score', value: `${stats.avgScore}/100`, color: scoreColor(stats.avgScore), bg: 'bg-orange-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Truck className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-orange-600" />Supplier Development ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Dev #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Supplier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Tier</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">SQA</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Target Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{item.devNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.supplierName}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.supplierCode || '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.tier?.replace(/_/g, ' ') || '-'}</td>
                    <td className="py-3 px-4 text-center"><span className={`font-bold ${scoreColor(item.score || 0)}`}>{item.score || '-'}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.sqa || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.targetDate ? new Date(item.targetDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><Truck className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No supplier development records found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Supplier Dev' : 'Add Supplier Development'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label><input type="text" value={form.supplierName} onChange={e => setForm({...form, supplierName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label><input type="text" value={form.supplierCode} onChange={e => setForm({...form, supplierCode: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tier</label><select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{TIERS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Quality Score</label><input type="number" min="0" max="100" value={form.score} onChange={e => setForm({...form, score: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Program</label><input type="text" value={form.program} onChange={e => setForm({...form, program: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">SQA Engineer</label><input type="text" value={form.sqa} onChange={e => setForm({...form, sqa: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label><input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Open Issues</label><textarea value={form.issues} onChange={e => setForm({...form, issues: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.supplierName || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Supplier'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Supplier Dev?</h2>
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
