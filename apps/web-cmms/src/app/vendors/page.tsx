'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Building2, Edit2, Trash2, Star, CheckCircle, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  certifications: string;
  notes: string;
  status: string;
}

const EMPTY_FORM = {
  name: '', category: '', contact: '', phone: '', email: '',
  address: '', rating: '3', certifications: '', notes: '', status: 'ACTIVE',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const res = await api.get('/vendors'); setVendors(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = vendors.filter(v => {
    const matchesSearch = !searchTerm || JSON.stringify(v).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'ACTIVE').length,
    avgRating: vendors.length ? (vendors.reduce((s, v) => s + (v.rating || 0), 0) / vendors.length).toFixed(1) : '0',
    topRated: vendors.filter(v => v.rating >= 4).length,
  };

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(v: Vendor) {
    setSelected(v);
    setForm({ name: v.name||'', category: v.category||'', contact: v.contact||'', phone: v.phone||'', email: v.email||'', address: v.address||'', rating: v.rating?.toString()||'3', certifications: v.certifications||'', notes: v.notes||'', status: v.status||'ACTIVE' });
    setError(''); setEditOpen(true);
  }
  function openDelete(v: Vendor) { setSelected(v); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.name.trim()) { setError('Vendor name is required'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/vendors', { ...form, rating: parseInt(form.rating) || 3 });
      setCreateOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to create vendor'); } finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!form.name.trim()) { setError('Vendor name is required'); return; }
    setSaving(true); setError('');
    try {
      await api.put(`/vendors/${selected!.id}`, { ...form, rating: parseInt(form.rating) || 3 });
      setEditOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to update vendor'); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/vendors/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor Name *</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Vendor name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Electrical, Mechanical" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="Contact name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating (1-5)</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLACKLISTED">Blacklisted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certifications</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.certifications} onChange={e => setForm(f => ({ ...f, certifications: e.target.value }))} placeholder="e.g. ISO 9001, NFPA" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
        <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Vendor address" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional notes..." />
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-8"><div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
      <div className="h-64 bg-gray-200 rounded" />
    </div></div>
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Vendors</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage maintenance vendors and contractors</p>
          </div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Vendor
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Vendors', value: stats.total, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Top Rated', value: stats.topRated, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.label}><CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div>
                  <div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div>
                </div>
              </CardContent></Card>
            );
          })}
        </div>

        <Card className="mb-6"><CardContent className="pt-5">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search vendors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLACKLISTED">Blacklisted</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-600" />Vendors ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(v => (
                      <tr key={v.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{v.name}</td>
                        <td className="py-3 px-4 text-gray-600">{v.category}</td>
                        <td className="py-3 px-4 text-gray-600">{v.contact || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{v.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{v.email || '-'}</td>
                        <td className="py-3 px-4"><StarRating rating={v.rating || 0} /></td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${v.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : v.status === 'BLACKLISTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{v.status}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEdit(v)} className="text-gray-400 dark:text-gray-500 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button>
                            <button onClick={() => openDelete(v)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No vendors found</p>
                <p className="text-sm mt-1">Add your first vendor to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Vendor" size="lg">
        <FormFields />
        <ModalFooter>
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Vendor'}</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Vendor" size="lg">
        <FormFields />
        <ModalFooter>
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Vendor" size="sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-semibold">{selected?.name}</span>? This action cannot be undone.</p>
        </div>
        <ModalFooter>
          <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
