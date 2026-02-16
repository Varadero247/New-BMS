'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Truck, Edit, Trash2, Mail, Phone, Globe } from 'lucide-react';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  _count?: { products: number };
}

const initialForm = { code: '', name: '', contactName: '', email: '', phone: '', website: '', address: '', city: '', country: '', isActive: true };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditing(s);
    setForm({ code: s.code, name: s.name, contactName: s.contactName || '', email: s.email || '', phone: s.phone || '', website: s.website || '', address: s.address || '', city: s.city || '', country: s.country || '', isActive: s.isActive });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.code.trim()) { setFormError('Code is required'); return; }
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { code: form.code, name: form.name, isActive: form.isActive };
      if (form.contactName) payload.contactName = form.contactName;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.website) payload.website = form.website;
      if (form.address) payload.address = form.address;
      if (form.city) payload.city = form.city;
      if (form.country) payload.country = form.country;
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e?.response?.data?.error?.message || 'Failed to save supplier');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); load(); } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Cannot delete supplier');
    }
  }

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Suppliers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage supplier directory and contacts</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Suppliers</p><p className="text-2xl font-bold">{suppliers.length}</p></div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-green-600">{suppliers.filter(s => s.isActive).length}</p></div>
              <Truck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p><p className="text-2xl font-bold text-gray-400 dark:text-gray-500">{suppliers.filter(s => !s.isActive).length}</p></div>
              <Truck className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
          </CardContent></Card>
        </div>

        {/* Search */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search by name, code, or email..." placeholder="Search by name, code, or email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
        </CardContent></Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-500" />
              Suppliers ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-200 rounded" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Products</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100">{s.code}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                          {s.contactName && <p className="text-xs text-gray-500 dark:text-gray-400">{s.contactName}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {s.email && <div className="flex items-center gap-1 text-gray-600 text-xs"><Mail className="h-3 w-3" />{s.email}</div>}
                            {s.phone && <div className="flex items-center gap-1 text-gray-600 text-xs"><Phone className="h-3 w-3" />{s.phone}</div>}
                            {s.website && <div className="flex items-center gap-1 text-gray-600 text-xs"><Globe className="h-3 w-3" />{s.website}</div>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{[s.city, s.country].filter(Boolean).join(', ') || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">{s._count?.products ?? 0}</td>
                        <td className="py-3 px-4">
                          <Badge className={s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No suppliers found</p>
                <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Supplier</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="SUP-001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Supplier name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input value={form.website} onChange={e => setForm({...form, website: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="https://" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActiveSup" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <label htmlFor="isActiveSup" className="text-sm font-medium">Active</label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
