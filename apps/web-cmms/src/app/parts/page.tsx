'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Ban,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Part {
  id: string;
  partNumber: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  unitCost: number;
  supplier: string;
  description: string;
  status: string;
}

const EMPTY_FORM = {
  partNumber: '',
  name: '',
  category: '',
  quantity: '0',
  minStock: '0',
  maxStock: '100',
  unit: 'EA',
  location: '',
  unitCost: '0',
  supplier: '',
  description: '',
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Part | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/parts');
      setParts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = parts.filter((p) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock =
      !stockFilter ||
      (stockFilter === 'LOW'
        ? p.quantity <= p.minStock
        : stockFilter === 'OUT'
          ? p.quantity === 0
          : true);
    return matchesSearch && matchesStock;
  });

  const stats = {
    total: parts.length,
    lowStock: parts.filter((p) => p.quantity > 0 && p.quantity <= p.minStock).length,
    outOfStock: parts.filter((p) => p.quantity === 0).length,
    totalValue: parts.reduce((s, p) => s + p.quantity * (p.unitCost || 0), 0),
  };

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setError('');
    setCreateOpen(true);
  }
  function openEdit(p: Part) {
    setSelected(p);
    setForm({
      partNumber: p.partNumber || '',
      name: p.name || '',
      category: p.category || '',
      quantity: p.quantity?.toString() || '0',
      minStock: p.minStock?.toString() || '0',
      maxStock: p.maxStock?.toString() || '100',
      unit: p.unit || 'EA',
      location: p.location || '',
      unitCost: p.unitCost?.toString() || '0',
      supplier: p.supplier || '',
      description: p.description || '',
    });
    setError('');
    setEditOpen(true);
  }
  function openDelete(p: Part) {
    setSelected(p);
    setDeleteOpen(true);
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setError('Part name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/parts', {
        ...form,
        quantity: parseInt(form.quantity) || 0,
        minStock: parseInt(form.minStock) || 0,
        maxStock: parseInt(form.maxStock) || 100,
        unitCost: parseFloat(form.unitCost) || 0,
      });
      setCreateOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to create part');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!form.name.trim()) {
      setError('Part name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/parts/${selected!.id}`, {
        ...form,
        quantity: parseInt(form.quantity) || 0,
        minStock: parseInt(form.minStock) || 0,
        maxStock: parseInt(form.maxStock) || 100,
        unitCost: parseFloat(form.unitCost) || 0,
      });
      setEditOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to update part');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.delete(`/parts/${selected!.id}`);
      setDeleteOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Part Number
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.partNumber}
            onChange={(e) => setForm((f) => ({ ...f, partNumber: e.target.value }))}
            placeholder="PRT-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Part name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Bearings, Filters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Supplier
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.supplier}
            onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
            placeholder="Supplier name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          >
            <option value="EA">Each (EA)</option>
            <option value="BOX">Box</option>
            <option value="KG">Kilogram (KG)</option>
            <option value="L">Litre (L)</option>
            <option value="M">Metre (M)</option>
            <option value="SET">Set</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Stock
          </label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.minStock}
            onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Stock
          </label>
          <input
            type="number"
            min="0"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.maxStock}
            onChange={(e) => setForm((f) => ({ ...f, maxStock: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit Cost ($)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.unitCost}
            onChange={(e) => setForm((f) => ({ ...f, unitCost: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Storage Location
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="e.g. Bin A-12, Shelf 3"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          rows={2}
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Part description..."
        />
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Parts Inventory</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage spare parts and supplies</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Part
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Parts',
              value: stats.total,
              icon: Package,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              sub: 'SKUs',
            },
            {
              label: 'Low Stock',
              value: stats.lowStock,
              icon: TrendingDown,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              sub: 'Below minimum',
            },
            {
              label: 'Out of Stock',
              value: stats.outOfStock,
              icon: AlertTriangle,
              color: 'text-red-600',
              bg: 'bg-red-50',
              sub: 'Zero quantity',
            },
            {
              label: 'Total Value',
              value: `$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
              icon: DollarSign,
              color: 'text-green-600',
              bg: 'bg-green-50',
              sub: 'Inventory value',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.sub}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bg}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search parts..."
                  placeholder="Search parts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                aria-label="Filter by stock level"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Stock Levels</option>
                <option value="LOW">Low Stock</option>
                <option value="OUT">Out of Stock</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-600" />
              Parts ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Part #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Qty
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Min
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Location
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Unit Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((part) => {
                      const isLow = part.quantity <= part.minStock && part.quantity > 0;
                      const isOut = part.quantity === 0;
                      return (
                        <tr key={part.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400 text-xs">
                            {part.partNumber}
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {part.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{part.category}</td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'}`}
                          >
                            {part.quantity} {part.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                            {part.minStock}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{part.location || '-'}</td>
                          <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">
                            ${(part.unitCost || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}
                            >
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(part)}
                                className="text-gray-400 dark:text-gray-500 hover:text-amber-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDelete(part)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No parts found</p>
                <p className="text-sm mt-1">Add your first part to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Part" size="lg">
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setCreateOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add Part'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Part" size="lg">
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setEditOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Part" size="sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{selected?.name}</span>?
            This action cannot be undone.
          </p>
        </div>
        <ModalFooter>
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
