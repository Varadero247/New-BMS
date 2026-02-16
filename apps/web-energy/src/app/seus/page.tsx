'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Zap, Activity, AlertTriangle, CheckCircle, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface SEU {
  id: string;
  name: string;
  description?: string;
  type: string;
  location?: string;
  consumption: number;
  unit: string;
  percentageOfTotal?: number;
  status: string;
  responsible?: string;
  controlVariables?: string;
  relevantVariables?: string;
  improvementOpportunities?: string;
}

const SEU_TYPES = ['HVAC', 'LIGHTING', 'COMPRESSED_AIR', 'PRODUCTION', 'REFRIGERATION', 'TRANSPORT', 'IT', 'OTHER'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'OPTIMIZED'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Active', className: 'bg-blue-100 text-blue-700', icon: Activity },
  INACTIVE: { label: 'Inactive', className: 'bg-gray-100 dark:bg-gray-800 text-gray-600', icon: Activity },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  OPTIMIZED: { label: 'Optimized', className: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const empty: Partial<SEU> = { name: '', description: '', type: 'HVAC', location: '', consumption: 0, unit: 'kWh/year', percentageOfTotal: 0, status: 'ACTIVE', responsible: '', improvementOpportunities: '' };

export default function SEUsPage() {
  const [items, setItems] = useState<SEU[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<SEU>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/seus'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mt = !filterType || i.type === filterType;
    return m && ms && mt;
  });

  const totalConsumption = items.reduce((s, i) => s + (Number(i.consumption) || 0), 0);
  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'ACTIVE').length,
    optimized: items.filter(i => i.status === 'OPTIMIZED').length,
    totalConsumption,
  };

  const openCreate = () => { setEditItem({ ...empty }); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: SEU) => { setEditItem({ ...item }); setIsEditing(true); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) { await api.put(`/seus/${editItem.id}`, editItem); }
      else { await api.post('/seus', editItem); }
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/seus/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Significant Energy Uses</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Identify and manage significant energy uses (SEUs) per ISO 50001 §6.3</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add SEU
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total SEUs</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><Zap className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Active</p><p className="text-2xl font-bold text-blue-700">{stats.active}</p></div><div className="p-3 bg-blue-50 rounded-full"><Activity className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Optimized</p><p className="text-2xl font-bold text-green-700">{stats.optimized}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Consumption</p><p className="text-2xl font-bold text-orange-700">{stats.totalConsumption.toLocaleString()}</p></div><div className="p-3 bg-orange-50 rounded-full"><TrendingUp className="h-6 w-6 text-orange-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search SEUs..." placeholder="Search SEUs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select aria-label="Filter by type" value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Types</option>
            {SEU_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-600" />SEUs ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Location</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Consumption</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400" style={{ minWidth: 120 }}>Share of Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.ACTIVE;
                      const Icon = sc.icon;
                      const share = item.percentageOfTotal || (totalConsumption > 0 ? Math.round((item.consumption / totalConsumption) * 100) : 0);
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            {item.responsible && <p className="text-xs text-gray-400 dark:text-gray-500">{item.responsible}</p>}
                          </td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">{item.type?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.location || '-'}</td>
                          <td className="py-3 px-4 text-right font-mono font-medium">{Number(item.consumption).toLocaleString()} <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">{item.unit}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(share, 100)}%` }} /></div>
                              <span className="text-xs font-medium w-8 text-right">{share}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}><Icon className="h-3 w-3" />{sc.label}</span></td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => { setDeleteId(item.id); setDeleteModal(true); }} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 className="h-4 w-4" /></button>
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
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No SEUs found</p>
                <p className="text-sm mt-1">Add your significant energy uses to identify improvement opportunities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit SEU' : 'Add Significant Energy Use'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. HVAC System" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={editItem.type || 'HVAC'} onChange={e => setEditItem(p => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {SEU_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumption *</label>
              <input type="number" value={editItem.consumption || ''} onChange={e => setEditItem(p => ({ ...p, consumption: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh/year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">% of Total</label>
              <input type="number" value={editItem.percentageOfTotal || ''} onChange={e => setEditItem(p => ({ ...p, percentageOfTotal: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="%" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input value={editItem.location || ''} onChange={e => setEditItem(p => ({ ...p, location: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={editItem.status || 'ACTIVE'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Improvement Opportunities</label>
            <textarea value={editItem.improvementOpportunities || ''} onChange={e => setEditItem(p => ({ ...p, improvementOpportunities: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Describe potential improvements..." />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.name} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Add SEU'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete SEU" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this SEU?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
