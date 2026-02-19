'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Modal,
  ModalFooter } from '@ims/ui';
import { Plus, Search, RotateCcw, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Recall {
  id: string;
  product?: string;
  productName?: string;
  lotNumber?: string;
  reason?: string;
  recallClass?: string;
  initiatedBy?: string;
  affectedQuantity?: number;
  unit?: string;
  description?: string;
  correctiveAction?: string;
  status: string;
  createdAt: string;
}

const classColors: Record<string, string> = {
  CLASS_I: 'bg-red-100 text-red-700',
  CLASS_II: 'bg-yellow-100 text-yellow-700',
  CLASS_III: 'bg-green-100 text-green-700' };

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-red-100 text-red-700',
  MONITORING: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-green-100 text-green-700',
  MOCK: 'bg-blue-100 text-blue-700' };

const initialForm = {
  product: '',
  lotNumber: '',
  reason: '',
  recallClass: 'CLASS_II',
  initiatedBy: '',
  affectedQuantity: '',
  unit: 'kg',
  description: '',
  correctiveAction: '',
  status: 'ACTIVE' };

export default function RecallsPage() {
  const [items, setItems] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recall | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/recalls${params}`);
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
  function openEdit(r: Recall) {
    setEditing(r);
    setForm({
      product: r.product || r.productName || '',
      lotNumber: r.lotNumber || '',
      reason: r.reason || '',
      recallClass: r.recallClass || 'CLASS_II',
      initiatedBy: r.initiatedBy || '',
      affectedQuantity: r.affectedQuantity?.toString() || '',
      unit: r.unit || 'kg',
      description: r.description || '',
      correctiveAction: r.correctiveAction || '',
      status: r.status });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.product.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (!form.reason.trim()) {
      setFormError('Recall reason is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        product: form.product,
        reason: form.reason,
        recallClass: form.recallClass,
        status: form.status };
      if (form.lotNumber) payload.lotNumber = form.lotNumber;
      if (form.initiatedBy) payload.initiatedBy = form.initiatedBy;
      if (form.affectedQuantity) payload.affectedQuantity = parseFloat(form.affectedQuantity);
      if (form.unit) payload.unit = form.unit;
      if (form.description) payload.description = form.description;
      if (form.correctiveAction) payload.correctiveAction = form.correctiveAction;
      if (editing) {
        await api.put(`/recalls/${editing.id}`, payload);
      } else {
        await api.post('/recalls', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError((e as any)?.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recall record?')) return;
    try {
      await api.delete(`/recalls/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const name = i.product || i.productName || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      (i.lotNumber || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const active = items.filter((i) => i.status === 'ACTIVE');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Product Recalls</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Recall management and traceability
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Initiate Recall
          </Button>
        </div>

        {active.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">
              {active.length} active recall{active.length > 1 ? 's' : ''} in progress — immediate
              action required
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Recalls</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-red-600">{active.length}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class I</p>
                  <p className="text-2xl font-bold text-red-600">
                    {items.filter((i) => i.recallClass === 'CLASS_I').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'CLOSED').length}
                  </p>
                </div>
                <RotateCcw className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search by product, lot number..."
                  placeholder="Search by product, lot number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="MONITORING">Monitoring</option>
                <option value="CLOSED">Closed</option>
                <option value="MOCK">Mock Recall</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Recalls ({filtered.length})
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
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Lot Number
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Class
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Initiated By
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
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
                      <tr
                        key={r.id}
                        className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${r.status === 'ACTIVE' ? 'bg-red-50' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {r.product || r.productName}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">{r.lotNumber || '—'}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                          {r.reason || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${classColors[r.recallClass || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {(r.recallClass || '—').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.initiatedBy || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {r.status}
                          </span>
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
                <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No recalls found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Initiate Recall
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Recall' : 'Initiate Recall'}
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lot Number</label>
              <input
                value={form.lotNumber}
                onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                placeholder="LOT-2026-001"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason *</label>
            <input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. Undeclared allergen, contamination..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recall Class</label>
              <select
                value={form.recallClass}
                onChange={(e) => setForm({ ...form, recallClass: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="CLASS_I">Class I (Health Hazard)</option>
                <option value="CLASS_II">Class II (Remote Hazard)</option>
                <option value="CLASS_III">Class III (Unlikely Hazard)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="MONITORING">Monitoring</option>
                <option value="CLOSED">Closed</option>
                <option value="MOCK">Mock Recall</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Initiated By</label>
              <input
                value={form.initiatedBy}
                onChange={(e) => setForm({ ...form, initiatedBy: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Affected Quantity</label>
              <input
                type="number"
                value={form.affectedQuantity}
                onChange={(e) => setForm({ ...form, affectedQuantity: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="kg, units, cases..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Corrective Action</label>
            <textarea
              value={form.correctiveAction}
              onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
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
            {submitting ? 'Saving...' : editing ? 'Update' : 'Initiate Recall'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
