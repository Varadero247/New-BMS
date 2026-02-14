'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, MapPin, Building2 } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Site {
  id: string;
  name?: string;
  customerName?: string;
  address?: string;
  city?: string;
  postcode?: string;
  type?: string;
  siteType?: string;
  contactName?: string;
  contactPhone?: string;
  accessInstructions?: string;
  status?: string;
  notes?: string;
  [key: string]: any;
}

const emptyForm = {
  name: '', customerName: '', address: '', city: '', postcode: '',
  type: 'COMMERCIAL', contactName: '', contactPhone: '',
  accessInstructions: '', status: 'ACTIVE', notes: '',
};

export default function SitesPage() {
  const [items, setItems] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Site | null>(null);
  const [deleteItem, setDeleteItem] = useState<Site | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/sites'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const q = searchTerm.toLowerCase();
    const t = i.type || i.siteType || '';
    return (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!typeFilter || t === typeFilter);
  });

  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'ACTIVE').length,
    commercial: items.filter(i => (i.type || i.siteType) === 'COMMERCIAL').length,
    industrial: items.filter(i => (i.type || i.siteType) === 'INDUSTRIAL').length,
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: Site) => {
    setEditItem(item);
    setForm({ name: item.name || '', customerName: item.customerName || '', address: item.address || '',
      city: item.city || '', postcode: item.postcode || '', type: item.type || item.siteType || 'COMMERCIAL',
      contactName: item.contactName || '', contactPhone: item.contactPhone || '',
      accessInstructions: item.accessInstructions || '', status: item.status || 'ACTIVE', notes: item.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { setError('Site name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editItem) await api.put(`/sites/${editItem.id}`, form);
      else await api.post('/sites', form);
      setModalOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try { await api.delete(`/sites/${deleteItem.id}`); setDeleteItem(null); await load(); }
    catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8"><div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
        <div className="h-64 bg-gray-200 rounded" />
      </div></main></div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
              <p className="text-gray-500 mt-1">Service locations and site details</p>
            </div>
            <button onClick={openCreate} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium">
              <Plus className="h-5 w-5" /> Add Site
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sites', value: stats.total, icon: MapPin, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
              { label: 'Active', value: stats.active, icon: MapPin, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
              { label: 'Commercial', value: stats.commercial, icon: Building2, bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-200' },
              { label: 'Industrial', value: stats.industrial, icon: Building2, bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-200' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                      <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search sites..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">All Types</option>
              {['COMMERCIAL', 'INDUSTRIAL', 'RESIDENTIAL', 'GOVERNMENT', 'HEALTHCARE', 'EDUCATION'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-sky-600" /> Sites ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Site Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.customerName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{item.address || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.type || item.siteType || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.contactName || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(item)} className="text-sky-600 hover:text-sky-800 text-xs font-medium">Edit</button>
                              <button onClick={() => setDeleteItem(item)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No sites found</p>
                  <p className="text-sm mt-1">Add your first service site to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Site' : 'Add Site'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. Unit 5, Industrial Park" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['COMMERCIAL', 'INDUSTRIAL', 'RESIDENTIAL', 'GOVERNMENT', 'HEALTHCARE', 'EDUCATION'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Street address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
              <input value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Postcode" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Contact</label>
              <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="On-site contact name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="+44 7700 000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Instructions</label>
              <textarea value={form.accessInstructions} onChange={e => setForm(f => ({ ...f, accessInstructions: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Gate codes, access notes..." />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : editItem ? 'Update Site' : 'Add Site'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Site" size="sm">
        <p className="text-sm text-gray-600">Delete <span className="font-semibold">{deleteItem?.name}</span>? This action cannot be undone.</p>
        <ModalFooter>
          <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
