'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Route, MapPin, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface ServiceRoute {
  id: string;
  name?: string;
  technicianName?: string;
  technician?: string;
  stops?: number;
  stopCount?: number;
  date?: string;
  estimatedDuration?: number;
  totalDistance?: number;
  status?: string;
  region?: string;
  notes?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
};

const emptyForm = {
  name: '', technicianName: '', date: '', stops: '',
  estimatedDuration: '', totalDistance: '', region: '', status: 'PLANNED', notes: '',
};

export default function RoutesPage() {
  const [items, setItems] = useState<ServiceRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceRoute | null>(null);
  const [deleteItem, setDeleteItem] = useState<ServiceRoute | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/routes'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const q = searchTerm.toLowerCase();
    return (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter);
  });

  const stats = {
    total: items.length,
    planned: items.filter(i => i.status === 'PLANNED').length,
    inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    completed: items.filter(i => i.status === 'COMPLETED').length,
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: ServiceRoute) => {
    setEditItem(item);
    setForm({ name: item.name || '', technicianName: item.technicianName || item.technician || '',
      date: item.date ? item.date.split('T')[0] : '', stops: item.stops || item.stopCount || '',
      estimatedDuration: item.estimatedDuration || '', totalDistance: item.totalDistance || '',
      region: item.region || '', status: item.status || 'PLANNED', notes: item.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { setError('Route name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editItem) await api.put(`/routes/${editItem.id}`, form);
      else await api.post('/routes', form);
      setModalOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try { await api.delete(`/routes/${deleteItem.id}`); setDeleteItem(null); await load(); }
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
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Routes</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Plan and optimize service routes</p>
            </div>
            <button onClick={openCreate} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium">
              <Plus className="h-5 w-5" /> Plan Route
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Routes', value: stats.total, icon: Route, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
              { label: 'Planned', value: stats.planned, icon: MapPin, bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-200' },
              { label: 'In Progress', value: stats.inProgress, icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600', border: 'border-yellow-200' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                      <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search routes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">All Statuses</option>
              {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Route className="h-5 w-5 text-sky-600" /> Routes ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Route Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Technician</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Region</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Stops</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Est. Duration</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.name || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.technicianName || item.technician || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.region || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.stops ?? item.stopCount ?? '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.date ? new Date(item.date).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.estimatedDuration ? `${item.estimatedDuration}h` : '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                              {item.status?.replace('_', ' ') || '-'}
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
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Route className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No routes found</p>
                  <p className="text-sm mt-1">Plan your first route to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Route' : 'Plan Route'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. North Industrial Route" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician</label>
              <input value={form.technicianName} onChange={e => setForm(f => ({ ...f, technicianName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Assigned technician" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
              <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. North" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Stops</label>
              <input type="number" value={form.stops} onChange={e => setForm(f => ({ ...f, stops: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Duration (hrs)</label>
              <input type="number" value={form.estimatedDuration} onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0" min="0" step="0.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Distance (km)</label>
              <input type="number" value={form.totalDistance} onChange={e => setForm(f => ({ ...f, totalDistance: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Route instructions or notes..." />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : editItem ? 'Update Route' : 'Plan Route'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Route" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete route <span className="font-semibold">{deleteItem?.name}</span>? This action cannot be undone.</p>
        <ModalFooter>
          <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
