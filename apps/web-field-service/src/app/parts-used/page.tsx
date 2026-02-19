'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Package, DollarSign, Hash } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface PartUsed {
  id: string;
  partName?: string;
  name?: string;
  partNumber?: string;
  jobNumber?: string;
  jobId?: string;
  technicianName?: string;
  quantity?: number;
  unitCost?: number;
  cost?: number;
  totalCost?: number;
  date?: string;
  category?: string;
  supplier?: string;
  [key: string]: any;
}

const emptyForm = {
  partName: '',
  partNumber: '',
  jobNumber: '',
  technicianName: '',
  quantity: '1',
  unitCost: '',
  category: '',
  supplier: '',
  date: '',
};

export default function PartsUsedPage() {
  const [items, setItems] = useState<PartUsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartUsed | null>(null);
  const [deleteItem, setDeleteItem] = useState<PartUsed | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/parts-used');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!categoryFilter || i.category === categoryFilter)
    );
  });

  const totalCost = items.reduce((s, i) => s + (Number(i.totalCost || i.cost) || 0), 0);
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))];

  const stats = { total: items.length, totalCost, totalQty };

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: PartUsed) => {
    setEditItem(item);
    setForm({
      partName: item.partName || item.name || '',
      partNumber: item.partNumber || '',
      jobNumber: item.jobNumber || '',
      technicianName: item.technicianName || '',
      quantity: item.quantity || '1',
      unitCost: item.unitCost || item.cost || '',
      category: item.category || '',
      supplier: item.supplier || '',
      date: item.date ? item.date.split('T')[0] : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.partName) {
      setError('Part name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/parts-used/${editItem.id}`, form);
      else await api.post('/parts-used', form);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/parts-used/${deleteItem.id}`);
      setDeleteItem(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Parts Used</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track parts and materials consumed on jobs
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> Log Parts
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Records',
                value: stats.total,
                icon: Package,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'Total Units Used',
                value: stats.totalQty,
                icon: Hash,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
                border: 'border-blue-200',
              },
              {
                label: 'Total Cost',
                value: `$${stats.totalCost.toLocaleString()}`,
                icon: DollarSign,
                bg: 'bg-teal-50',
                color: 'text-teal-600',
                border: 'border-teal-200',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search parts..."
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-sky-600" /> Parts Used ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Part Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Part #</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Job</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Technician
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Qty</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Cost</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.partName || item.name || '-'}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {item.partNumber || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.category || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.jobNumber || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.technicianName || '-'}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            {item.quantity ?? '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {item.totalCost || item.cost
                              ? `$${Number(item.totalCost || item.cost).toLocaleString()}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteItem(item)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No parts usage recorded</p>
                  <p className="text-sm mt-1">Log your first parts record to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Parts Record' : 'Log Parts Used'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Part Name *
              </label>
              <input
                value={form.partName}
                onChange={(e) => setForm((f) => ({ ...f, partName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC Filter 24x24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Part Number
              </label>
              <input
                value={form.partNumber}
                onChange={(e) => setForm((f) => ({ ...f, partNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC-F-2424"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC, Electrical, Plumbing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Number
              </label>
              <input
                value={form.jobNumber}
                onChange={(e) => setForm((f) => ({ ...f, jobNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Related job number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technician
              </label>
              <input
                value={form.technicianName}
                onChange={(e) => setForm((f) => ({ ...f, technicianName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Technician name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                value={form.unitCost}
                onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supplier
              </label>
              <input
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Supplier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Used
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editItem ? 'Update Record' : 'Log Parts'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Record"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Delete parts record for{' '}
          <span className="font-semibold">{deleteItem?.partName || deleteItem?.name}</span>? This
          action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
