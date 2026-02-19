'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
} from '@ims/ui';
import { Plus, Search, Link2, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface TraceRecord {
  id: string;
  lotNumber?: string;
  batchNumber?: string;
  product?: string;
  name?: string;
  origin?: string;
  supplier?: string;
  quantity?: number;
  unit?: string;
  productionDate?: string;
  expiryDate?: string;
  status: string;
  createdAt: string;
}

const initialForm = {
  lotNumber: '',
  product: '',
  supplier: '',
  quantity: '',
  unit: 'kg',
  productionDate: '',
  expiryDate: '',
  status: 'ACTIVE',
};

export default function TraceabilityPage() {
  const [items, setItems] = useState<TraceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TraceRecord | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/traceability');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }
  function openEdit(r: TraceRecord) {
    setEditing(r);
    setForm({
      lotNumber: r.lotNumber || r.batchNumber || '',
      product: r.product || r.name || '',
      supplier: r.supplier || r.origin || '',
      quantity: r.quantity?.toString() || '',
      unit: r.unit || 'kg',
      productionDate: r.productionDate ? r.productionDate.split('T')[0] : '',
      expiryDate: r.expiryDate ? r.expiryDate.split('T')[0] : '',
      status: r.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.lotNumber.trim()) {
      setFormError('Lot number is required');
      return;
    }
    if (!form.product.trim()) {
      setFormError('Product is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        lotNumber: form.lotNumber,
        product: form.product,
        status: form.status,
      };
      if (form.supplier) payload.supplier = form.supplier;
      if (form.quantity) payload.quantity = parseFloat(form.quantity);
      if (form.unit) payload.unit = form.unit;
      if (form.productionDate) payload.productionDate = form.productionDate;
      if (form.expiryDate) payload.expiryDate = form.expiryDate;
      if (editing) {
        await api.put(`/traceability/${editing.id}`, payload);
      } else {
        await api.post('/traceability', payload);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setFormError(axios.isAxiosError(e) && e.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/traceability/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Traceability</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Product traceability and lot/batch tracking
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Lots</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Link2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'ACTIVE').length}
                  </p>
                </div>
                <Link2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recalled</p>
                  <p className="text-2xl font-bold text-red-600">
                    {items.filter((i) => i.status === 'RECALLED').length}
                  </p>
                </div>
                <Link2 className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search by lot number, product, supplier..."
                placeholder="Search by lot number, product, supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-orange-600" />
              Traceability Records ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Lot/Batch
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Supplier
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Production
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Expiry
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                          {r.lotNumber || r.batchNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {r.product || r.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.supplier || r.origin || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {r.quantity ? `${r.quantity} ${r.unit || ''}`.trim() : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.productionDate ? new Date(r.productionDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              r.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : r.status === 'RECALLED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Link2 className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No traceability records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Record' : 'Add Traceability Record'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lot/Batch Number *</label>
              <input
                value={form.lotNumber}
                onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                placeholder="LOT-2026-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product *</label>
              <input
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier/Origin</label>
              <input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div className="w-20">
                <label className="block text-sm font-medium mb-1">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="kg"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Production Date</label>
              <input
                type="date"
                value={form.productionDate}
                onChange={(e) => setForm({ ...form, productionDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="QUARANTINE">Quarantine</option>
                <option value="RECALLED">Recalled</option>
                <option value="DISPOSED">Disposed</option>
                <option value="RELEASED">Released</option>
              </select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
