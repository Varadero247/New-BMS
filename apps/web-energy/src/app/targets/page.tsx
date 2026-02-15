'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Target, TrendingDown, CheckCircle, AlertCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface EnergyTarget {
  id: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  progress?: number;
  status: string;
  startDate?: string;
  targetDate?: string;
  energySource?: string;
  responsible?: string;
}

const STATUS_OPTIONS = ['ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED'];
const ENERGY_SOURCES = ['ELECTRICITY', 'GAS', 'WATER', 'HEAT', 'ALL', 'OTHER'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  ON_TRACK: { label: 'On Track', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  AT_RISK: { label: 'At Risk', className: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  BEHIND: { label: 'Behind', className: 'bg-red-100 text-red-700', icon: AlertCircle },
  ACHIEVED: { label: 'Achieved', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 dark:bg-gray-800 text-gray-500', icon: Clock },
};

const empty: Partial<EnergyTarget> = { name: '', description: '', targetValue: 0, currentValue: 0, unit: 'kWh', status: 'ON_TRACK', energySource: 'ELECTRICITY', responsible: '' };

export default function TargetsPage() {
  const [items, setItems] = useState<EnergyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<EnergyTarget>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/targets'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase()) && (!filterStatus || i.status === filterStatus));

  const stats = {
    total: items.length,
    onTrack: items.filter(i => i.status === 'ON_TRACK').length,
    achieved: items.filter(i => i.status === 'ACHIEVED').length,
    atRisk: items.filter(i => i.status === 'AT_RISK' || i.status === 'BEHIND').length,
    avgProgress: items.length ? Math.round(items.reduce((s, i) => s + (i.progress || 0), 0) / items.length) : 0,
  };

  const openCreate = () => { setEditItem({ ...empty }); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: EnergyTarget) => {
    setEditItem({
      ...item,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
      targetDate: item.targetDate ? new Date(item.targetDate).toISOString().slice(0, 10) : '',
    });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) { await api.put(`/targets/${editItem.id}`, editItem); }
      else { await api.post('/targets', editItem); }
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/targets/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Targets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Energy reduction targets and objectives (ISO 50001 §6.2)</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Set Target
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Targets</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><Target className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">On Track</p><p className="text-2xl font-bold text-green-700">{stats.onTrack}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Achieved</p><p className="text-2xl font-bold text-emerald-700">{stats.achieved}</p></div><div className="p-3 bg-emerald-50 rounded-full"><TrendingDown className="h-6 w-6 text-emerald-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">At Risk / Behind</p><p className="text-2xl font-bold text-red-700">{stats.atRisk}</p></div><div className="p-3 bg-red-50 rounded-full"><AlertCircle className="h-6 w-6 text-red-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search targets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-yellow-600" />Targets ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Target</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Current</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400" style={{ minWidth: 140 }}>Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.ON_TRACK;
                      const Icon = sc.icon;
                      const pct = Math.min(item.progress || 0, 100);
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            {item.responsible && <p className="text-xs text-gray-400 dark:text-gray-500">{item.responsible}</p>}
                          </td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">{item.energySource || '-'}</span></td>
                          <td className="py-3 px-4 text-right font-mono font-medium">{Number(item.targetValue).toLocaleString()} <span className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</span></td>
                          <td className="py-3 px-4 text-right font-mono text-gray-600">{item.currentValue != null ? Number(item.currentValue).toLocaleString() : '-'} <span className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-600 w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.targetDate ? new Date(item.targetDate).toLocaleDateString() : '-'}</td>
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
                <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No targets found</p>
                <p className="text-sm mt-1">Set your first energy reduction target</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Target' : 'Set Energy Target'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Name *</label>
            <input value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Reduce electricity consumption by 15%" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Value *</label>
              <input type="number" value={editItem.targetValue || ''} onChange={e => setEditItem(p => ({ ...p, targetValue: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Value</label>
              <input type="number" value={editItem.currentValue || ''} onChange={e => setEditItem(p => ({ ...p, currentValue: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh, %" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={editItem.startDate || ''} onChange={e => setEditItem(p => ({ ...p, startDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
              <input type="date" value={editItem.targetDate || ''} onChange={e => setEditItem(p => ({ ...p, targetDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energy Source</label>
              <select value={editItem.energySource || 'ELECTRICITY'} onChange={e => setEditItem(p => ({ ...p, energySource: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {ENERGY_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={editItem.status || 'ON_TRACK'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsible Person</label>
            <input value={editItem.responsible || ''} onChange={e => setEditItem(p => ({ ...p, responsible: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Name or role" />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.name} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Set Target'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Target" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this target?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
