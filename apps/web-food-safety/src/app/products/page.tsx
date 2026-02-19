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
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  ingredients?: string;
  shelfLife?: number;
  shelfLifeUnit?: string;
  storageConditions?: string;
  allergens?: string;
  certifications?: string;
  status: string;
  createdAt: string;
}

const initialForm = {
  name: '',
  sku: '',
  category: 'FINISHED_GOODS',
  description: '',
  ingredients: '',
  shelfLife: '',
  shelfLifeUnit: 'days',
  storageConditions: '',
  allergens: '',
  certifications: '',
  status: 'ACTIVE',
};

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/products');
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
  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category || 'FINISHED_GOODS',
      description: p.description || '',
      ingredients: p.ingredients || '',
      shelfLife: p.shelfLife?.toString() || '',
      shelfLifeUnit: p.shelfLifeUnit || 'days',
      storageConditions: p.storageConditions || '',
      allergens: p.allergens || '',
      certifications: p.certifications || '',
      status: p.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { name: form.name, category: form.category, status: form.status };
      if (form.sku) payload.sku = form.sku;
      if (form.description) payload.description = form.description;
      if (form.ingredients) payload.ingredients = form.ingredients;
      if (form.shelfLife) payload.shelfLife = parseInt(form.shelfLife);
      if (form.shelfLifeUnit) payload.shelfLifeUnit = form.shelfLifeUnit;
      if (form.storageConditions) payload.storageConditions = form.storageConditions;
      if (form.allergens) payload.allergens = form.allergens;
      if (form.certifications) payload.certifications = form.certifications;
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
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
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const matchSearch =
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Product registry and food safety specifications
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Package className="h-8 w-8 text-orange-500" />
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
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Finished Goods</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {items.filter((i) => i.category === 'FINISHED_GOODS').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
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
                  aria-label="Search by name, SKU..."
                  placeholder="Search by name, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="FINISHED_GOODS">Finished Goods</option>
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="PACKAGING">Packaging</option>
                <option value="INGREDIENT">Ingredient</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Products ({filtered.length})
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
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        SKU
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Shelf Life
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Allergens
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
                    {filtered.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {p.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">{p.sku || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{(p.category || '—').replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {p.shelfLife ? `${p.shelfLife} ${p.shelfLifeUnit || ''}`.trim() : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {p.allergens || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              p.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : p.status === 'DISCONTINUED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
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
                <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No products found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono"
                placeholder="SKU-001"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="FINISHED_GOODS">Finished Goods</option>
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="PACKAGING">Packaging</option>
                <option value="INGREDIENT">Ingredient</option>
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
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
                <option value="IN_DEVELOPMENT">In Development</option>
              </select>
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
            <label className="block text-sm font-medium mb-1">Ingredients / Composition</label>
            <textarea
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Shelf Life</label>
              <input
                type="number"
                value={form.shelfLife}
                onChange={(e) => setForm({ ...form, shelfLife: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={form.shelfLifeUnit}
                onChange={(e) => setForm({ ...form, shelfLifeUnit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Storage Conditions</label>
            <input
              value={form.storageConditions}
              onChange={(e) => setForm({ ...form, storageConditions: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. Store at 2-8°C, dry conditions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Allergens</label>
            <input
              value={form.allergens}
              onChange={(e) => setForm({ ...form, allergens: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. Contains: milk, wheat, eggs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Certifications</label>
            <input
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. Organic, Halal, Kosher"
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
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
