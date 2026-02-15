'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Tags, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  parent?: { id: string; name: string };
  _count?: { products: number };
}

const initialForm = { code: '', name: '', description: '', parentId: '', isActive: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ code: cat.code, name: cat.name, description: cat.description || '', parentId: cat.parent?.id || '', isActive: cat.isActive });
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
      if (form.description) payload.description = form.description;
      if (form.parentId) payload.parentId = form.parentId;
      if (editing) {
        await api.put(`/categories/${editing.id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError(e?.response?.data?.error?.message || 'Failed to save category');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/categories/${id}`); load(); } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Cannot delete category');
    }
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage product categories and hierarchy</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Categories</p><p className="text-2xl font-bold">{categories.length}</p></div>
              <Tags className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-green-600">{categories.filter(c => c.isActive).length}</p></div>
              <Tags className="h-8 w-8 text-green-500" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Root Categories</p><p className="text-2xl font-bold text-blue-600">{categories.filter(c => !c.parent).length}</p></div>
              <Tags className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent></Card>
        </div>

        {/* Search */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </CardContent></Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-purple-500" />
              Categories ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Parent</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Products</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(cat => (
                      <tr key={cat.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-gray-100">{cat.code}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</p>
                            {cat.description && <p className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{cat.parent?.name || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                        <td className="py-3 px-4 text-gray-600">{cat._count?.products ?? 0}</td>
                        <td className="py-3 px-4">
                          <Badge className={cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
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
                <Tags className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No categories found</p>
                <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="md">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="e.g. ELEC" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="Category name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none">
              <option value="">None (top-level)</option>
              {categories.filter(c => c.id !== editing?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
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
