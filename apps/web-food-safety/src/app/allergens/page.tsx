'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Sparkles, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Allergen {
  id: string;
  name: string;
  category?: string;
  description?: string;
  controls?: string;
  status: string;
  createdAt: string;
}

const initialForm = { name: '', category: 'TREE_NUTS', description: '', controls: '', status: 'ACTIVE' };

const EU_ALLERGENS = ['CELERY','CEREALS_GLUTEN','CRUSTACEANS','EGGS','FISH','LUPIN','MILK','MOLLUSCS','MUSTARD','PEANUTS','SESAME','SOY','SULPHITES','TREE_NUTS'];

export default function AllergensPage() {
  const [items, setItems] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Allergen | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try { const res = await api.get('/allergens'); setItems(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(initialForm); setFormError(''); setModalOpen(true); }
  function openEdit(a: Allergen) {
    setEditing(a);
    setForm({ name: a.name, category: a.category || 'TREE_NUTS', description: a.description || '', controls: a.controls || '', status: a.status });
    setFormError(''); setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true);
    try {
      if (editing) { await api.put(`/allergens/${editing.id}`, form); }
      else { await api.post('/allergens', form); }
      setModalOpen(false); load();
    } catch (e: any) { setFormError(e?.response?.data?.error?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this allergen record?')) return;
    try { await api.delete(`/allergens/${id}`); load(); } catch { alert('Failed'); }
  }

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Allergen Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage the 14 EU allergens across products and processes</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Allergen</Button>
        </div>

        {/* Allergen overview */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">14 Major Allergens (EU Regulation 1169/2011)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EU_ALLERGENS.map(a => (
                <span key={a} className={`px-2 py-1 rounded text-xs font-medium ${items.some(i => (i.category || '').toUpperCase() === a) ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {a.replace(/_/g,' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p><p className="text-2xl font-bold">{items.length}</p></div><Sparkles className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'ACTIVE' || i.status === 'MANAGED').length}</p></div><Sparkles className="h-8 w-8 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Allergen Types</p><p className="text-2xl font-bold text-blue-600">{new Set(items.map(i => i.category)).size}</p></div><AlertTriangle className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
        </div>

        {/* Search */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search allergens..." placeholder="Search allergens..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-orange-600" />Allergen Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Allergen</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Controls</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{a.name}</td>
                        <td className="py-3 px-4"><Badge variant="outline">{(a.category || '').replace(/_/g,' ')}</Badge></td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{a.description || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{a.controls || '—'}</td>
                        <td className="py-3 px-4"><Badge className={a.status === 'ACTIVE' || a.status === 'MANAGED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{a.status}</Badge></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No allergen records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Allergen</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Allergen' : 'Add Allergen'} size="md">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="e.g. Peanuts" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                {EU_ALLERGENS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="MANAGED">Managed</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Control Measures</label>
            <textarea value={form.controls} onChange={e => setForm({...form, controls: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
