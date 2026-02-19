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
import { Plus, Search, TrendingUp, Edit, Trash2, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface Benefit {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  type?: string;
  projectId?: string;
  projectName?: string;
  expectedValue?: number;
  actualValue?: number;
  currency?: string;
  realizationDate?: string;
  responsible?: string;
  status: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  FINANCIAL: 'bg-green-100 text-green-700',
  STRATEGIC: 'bg-blue-100 text-blue-700',
  OPERATIONAL: 'bg-purple-100 text-purple-700',
  CUSTOMER: 'bg-orange-100 text-orange-700',
  RISK_REDUCTION: 'bg-red-100 text-red-700' };

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  REALISED: 'bg-green-100 text-green-700',
  NOT_REALISED: 'bg-red-100 text-red-700',
  DEFERRED: 'bg-gray-100 dark:bg-gray-800 text-gray-700' };

const initialForm = {
  title: '',
  description: '',
  category: 'FINANCIAL',
  projectName: '',
  expectedValue: '',
  currency: 'USD',
  realizationDate: '',
  responsible: '',
  status: 'PLANNED' };

export default function BenefitsPage() {
  const [items, setItems] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Benefit | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/benefits${params}`);
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
  function openEdit(b: Benefit) {
    setEditing(b);
    setForm({
      title: b.title || b.name || '',
      description: b.description || '',
      category: b.category || b.type || 'FINANCIAL',
      projectName: b.projectName || '',
      expectedValue: b.expectedValue?.toString() || '',
      currency: b.currency || 'USD',
      realizationDate: b.realizationDate ? b.realizationDate.split('T')[0] : '',
      responsible: b.responsible || '',
      status: b.status });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Benefit title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, category: form.category, status: form.status };
      if (form.description) payload.description = form.description;
      if (form.projectName) payload.projectName = form.projectName;
      if (form.expectedValue) payload.expectedValue = parseFloat(form.expectedValue);
      if (form.currency) payload.currency = form.currency;
      if (form.realizationDate) payload.realizationDate = form.realizationDate;
      if (form.responsible) payload.responsible = form.responsible;
      if (editing) {
        await api.put(`/benefits/${editing.id}`, payload);
      } else {
        await api.post('/benefits', payload);
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
    if (!confirm('Delete this benefit?')) return;
    try {
      await api.delete(`/benefits/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const title = i.title || i.name || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      (i.category || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalExpected = items.reduce((s, i) => s + (i.expectedValue || 0), 0);
  const totalRealised = items
    .filter((i) => i.status === 'REALISED')
    .reduce((s, i) => s + (i.actualValue || i.expectedValue || 0), 0);

  const formatCurrency = (val: number, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0 }).format(val);
    } catch {
      return `${currency} ${val.toLocaleString()}`;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Benefits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Project benefits tracking and realisation
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Benefit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Benefits</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Realised</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'REALISED').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expected Value</p>
                  <p className="text-xl font-bold text-blue-600">
                    {totalExpected > 0 ? formatCurrency(totalExpected) : '—'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Value Realised</p>
                  <p className="text-xl font-bold text-green-600">
                    {totalRealised > 0 ? formatCurrency(totalRealised) : '—'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
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
                  aria-label="Search benefits..."
                  placeholder="Search benefits..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REALISED">Realised</option>
                <option value="NOT_REALISED">Not Realised</option>
                <option value="DEFERRED">Deferred</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Benefits ({filtered.length})
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
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Expected Value
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Realisation Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Responsible
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
                    {filtered.map((b) => (
                      <tr key={b.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {b.title || b.name || '—'}
                          </p>
                          {b.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {b.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[b.category || b.type || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {(b.category || b.type || '—').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{b.projectName || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {b.expectedValue ? formatCurrency(b.expectedValue, b.currency) : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {b.realizationDate
                            ? new Date(b.realizationDate).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {b.responsible || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(b)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}>
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
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No benefits found</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Benefit' : 'Add Benefit'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Benefit Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Reduced operational costs"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="FINANCIAL">Financial</option>
                <option value="STRATEGIC">Strategic</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="CUSTOMER">Customer</option>
                <option value="RISK_REDUCTION">Risk Reduction</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REALISED">Realised</option>
                <option value="NOT_REALISED">Not Realised</option>
                <option value="DEFERRED">Deferred</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Expected Value</label>
              <input
                type="number"
                value={form.expectedValue}
                onChange={(e) => setForm({ ...form, expectedValue: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Realisation Date</label>
              <input
                type="date"
                value={form.realizationDate}
                onChange={(e) => setForm({ ...form, realizationDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Responsible</label>
              <input
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
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
