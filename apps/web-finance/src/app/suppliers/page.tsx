'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, Building2, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt: string;
}

const initialFormState = {
  code: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  taxId: '',
  paymentTerms: 'NET_30',
  isActive: true,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      setError(null);
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      setError('Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setFormError('');
    setCreateModalOpen(true);
  }

  function openEditModal(supplier: Supplier) {
    setFormData({
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      country: supplier.country || '',
      taxId: supplier.taxId || '',
      paymentTerms: supplier.paymentTerms || 'NET_30',
      isActive: supplier.isActive,
    });
    setEditingId(supplier.id);
    setFormError('');
    setEditModalOpen(true);
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.code.trim()) { setFormError('Supplier code is required'); return; }
    if (!formData.name.trim()) { setFormError('Supplier name is required'); return; }
    if (!formData.email.trim()) { setFormError('Email is required'); return; }

    setSubmitting(true);
    try {
      await api.post('/suppliers', formData);
      setCreateModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create supplier.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.code.trim()) { setFormError('Supplier code is required'); return; }
    if (!formData.name.trim()) { setFormError('Supplier name is required'); return; }

    setSubmitting(true);
    try {
      await api.put(`/suppliers/${editingId}`, formData);
      setEditModalOpen(false);
      loadSuppliers();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to update supplier.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      loadSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    !searchTerm ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Suppliers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your supplier directory</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" aria-label="Search suppliers..." placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-600" />Suppliers ({filteredSuppliers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Payment Terms</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">{supplier.code}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{supplier.name}</td>
                        <td className="py-3 px-4 text-gray-600"><div className="flex items-center gap-1"><Mail className="h-3 w-3" />{supplier.email}</div></td>
                        <td className="py-3 px-4 text-gray-600">{supplier.phone ? <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{supplier.phone}</div> : '-'}</td>
                        <td className="py-3 px-4"><Badge className="bg-indigo-100 text-indigo-700">{supplier.paymentTerms?.replace('_', ' ') || 'NET 30'}</Badge></td>
                        <td className="py-3 px-4"><Badge className={supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}>{supplier.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEditModal(supplier)} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(supplier.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No suppliers found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Supplier" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="s-code">Supplier Code *</Label><Input id="s-code" name="code" value={formData.code} onChange={handleChange} placeholder="e.g. SUP-001" /></div>
            <div><Label htmlFor="s-name">Name *</Label><Input id="s-name" name="name" value={formData.name} onChange={handleChange} placeholder="Company name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="s-email">Email *</Label><Input id="s-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="contact@supplier.com" /></div>
            <div><Label htmlFor="s-phone">Phone</Label><Input id="s-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" /></div>
          </div>
          <div><Label htmlFor="s-address">Address</Label><Input id="s-address" name="address" value={formData.address} onChange={handleChange} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="s-city">City</Label><Input id="s-city" name="city" value={formData.city} onChange={handleChange} /></div>
            <div><Label htmlFor="s-country">Country</Label><Input id="s-country" name="country" value={formData.country} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="s-taxId">Tax ID</Label><Input id="s-taxId" name="taxId" value={formData.taxId} onChange={handleChange} /></div>
            <div>
              <Label htmlFor="s-paymentTerms">Payment Terms</Label>
              <select id="s-paymentTerms" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="NET_7">Net 7</option><option value="NET_14">Net 14</option><option value="NET_30">Net 30</option><option value="NET_60">Net 60</option><option value="NET_90">Net 90</option><option value="DUE_ON_RECEIPT">Due on Receipt</option>
              </select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create Supplier'}</Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Supplier" size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="es-code">Supplier Code *</Label><Input id="es-code" name="code" value={formData.code} onChange={handleChange} /></div>
            <div><Label htmlFor="es-name">Name *</Label><Input id="es-name" name="name" value={formData.name} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="es-email">Email</Label><Input id="es-email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
            <div><Label htmlFor="es-phone">Phone</Label><Input id="es-phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
          </div>
          <div><Label htmlFor="es-address">Address</Label><Input id="es-address" name="address" value={formData.address} onChange={handleChange} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="es-city">City</Label><Input id="es-city" name="city" value={formData.city} onChange={handleChange} /></div>
            <div><Label htmlFor="es-country">Country</Label><Input id="es-country" name="country" value={formData.country} onChange={handleChange} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="es-taxId">Tax ID</Label><Input id="es-taxId" name="taxId" value={formData.taxId} onChange={handleChange} /></div>
            <div>
              <Label htmlFor="es-paymentTerms">Payment Terms</Label>
              <select id="es-paymentTerms" name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="NET_7">Net 7</option><option value="NET_14">Net 14</option><option value="NET_30">Net 30</option><option value="NET_60">Net 60</option><option value="NET_90">Net 90</option><option value="DUE_ON_RECEIPT">Due on Receipt</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="es-isActive" checked={formData.isActive as any} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
            <Label htmlFor="es-isActive">Active</Label>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
