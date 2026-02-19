'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, ClipboardCheck, CheckSquare, PlusCircle, X } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Checklist {
  id: string;
  name?: string;
  category?: string;
  itemCount?: number;
  items?: string[];
  checklistItems?: string[];
  lastUsed?: string;
  status?: string;
  description?: string;
  [key: string]: any;
}

const emptyForm = {
  name: '',
  category: 'MAINTENANCE',
  description: '',
  status: 'ACTIVE',
  items: [] as string[],
};

const CATEGORIES = [
  'MAINTENANCE',
  'INSPECTION',
  'SAFETY',
  'INSTALLATION',
  'HANDOVER',
  'COMMISSIONING',
];

export default function ChecklistsPage() {
  const [items, setItems] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Checklist | null>(null);
  const [deleteItem, setDeleteItem] = useState<Checklist | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/checklists');
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

  const stats = {
    total: items.length,
    active: items.filter((i) => i.status === 'ACTIVE').length,
    categories: [...new Set(items.map((i) => i.category).filter(Boolean))].length,
    totalItems: items.reduce(
      (s, i) => s + (i.itemCount ?? i.items?.length ?? i.checklistItems?.length ?? 0),
      0
    ),
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ ...emptyForm, items: [] });
    setNewItem('');
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: Checklist) => {
    setEditItem(item);
    setForm({
      name: item.name || '',
      category: item.category || 'MAINTENANCE',
      description: item.description || '',
      status: item.status || 'ACTIVE',
      items: [...(item.items || item.checklistItems || [])],
    });
    setNewItem('');
    setError('');
    setModalOpen(true);
  };

  const addItem = () => {
    if (newItem.trim()) {
      setForm((f: any) => ({ ...f, items: [...(f.items || []), newItem.trim()] }));
      setNewItem('');
    }
  };
  const removeItem = (idx: number) => {
    setForm((f: any) => ({ ...f, items: f.items.filter((_: any, i: number) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name) {
      setError('Checklist name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/checklists/${editItem.id}`, form);
      else await api.post('/checklists', form);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError((e as any)?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/checklists/${deleteItem.id}`);
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
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Checklists</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Service checklists and inspection forms
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> New Checklist
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Checklists',
                value: stats.total,
                icon: ClipboardCheck,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: CheckSquare,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                label: 'Categories',
                value: stats.categories,
                icon: ClipboardCheck,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
                border: 'border-blue-200',
              },
              {
                label: 'Total Items',
                value: stats.totalItems,
                icon: CheckSquare,
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
                aria-label="Search checklists..."
                placeholder="Search checklists..."
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
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardCheck className="h-5 w-5 text-sky-600" /> Checklists ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Items</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Last Used
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.category || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.itemCount ??
                              item.items?.length ??
                              item.checklistItems?.length ??
                              '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                            >
                              {item.status || '-'}
                            </span>
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
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No checklists found</p>
                  <p className="text-sm mt-1">Create your first checklist to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Checklist' : 'New Checklist'}
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
                Checklist Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC Maintenance Checklist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['ACTIVE', 'DRAFT', 'ARCHIVED'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="What this checklist covers..."
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Checklist Items
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Add a checklist item..."
                />
                <button
                  onClick={addItem}
                  className="px-3 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 flex items-center gap-1 text-sm"
                >
                  <PlusCircle className="h-4 w-4" /> Add
                </button>
              </div>
              {(form.items || []).length > 0 ? (
                <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {(form.items || []).map((it: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                    >
                      <CheckSquare className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
                      <span className="flex-1 text-gray-700 dark:text-gray-300">{it}</span>
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                  No items added yet
                </p>
              )}
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
            {saving ? 'Saving...' : editItem ? 'Update Checklist' : 'Create Checklist'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Checklist"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Delete <span className="font-semibold">{deleteItem?.name}</span>? This action cannot be
          undone.
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
