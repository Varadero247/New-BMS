'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, FolderKanban, CheckCircle, Clock, PlayCircle, XCircle, DollarSign, Zap, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface EnergyProject {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  estimatedSavings?: number;
  actualSavings?: number;
  estimatedCost?: number;
  actualCost?: number;
  unit?: string;
  responsible?: string;
  priority?: string;
}

const PROJECT_TYPES = ['LED_LIGHTING', 'HVAC_UPGRADE', 'INSULATION', 'SOLAR_PV', 'BUILDING_AUTOMATION', 'MOTOR_UPGRADE', 'COMPRESSED_AIR', 'HEAT_RECOVERY', 'OTHER'];
const STATUS_OPTIONS = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PLANNED: { label: 'Planned', className: 'bg-blue-100 text-blue-700', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700', icon: PlayCircle },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  ON_HOLD: { label: 'On Hold', className: 'bg-orange-100 text-orange-700', icon: Clock },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 dark:bg-gray-800 text-gray-500', icon: XCircle },
};

const empty: Partial<EnergyProject> = { name: '', description: '', type: 'LED_LIGHTING', status: 'PLANNED', estimatedSavings: 0, estimatedCost: 0, unit: 'kWh/year', priority: 'MEDIUM', responsible: '' };

export default function ProjectsPage() {
  const [items, setItems] = useState<EnergyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<EnergyProject>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/projects'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase()) && (!filterStatus || i.status === filterStatus));

  const totalSavings = items.filter(i => i.status === 'COMPLETED').reduce((s, i) => s + (i.actualSavings || i.estimatedSavings || 0), 0);
  const stats = {
    total: items.length,
    inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    completed: items.filter(i => i.status === 'COMPLETED').length,
    totalSavings,
  };

  const openCreate = () => { setEditItem({ ...empty }); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: EnergyProject) => {
    setEditItem({
      ...item,
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
    });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) { await api.put(`/projects/${editItem.id}`, editItem); }
      else { await api.post('/projects', editItem); }
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/projects/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Energy improvement projects and initiatives</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Project
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><FolderKanban className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p><p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p></div><div className="p-3 bg-yellow-50 rounded-full"><PlayCircle className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-green-700">{stats.completed}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Savings</p><p className="text-2xl font-bold text-blue-700">{stats.totalSavings.toLocaleString()} kWh</p></div><div className="p-3 bg-blue-50 rounded-full"><Zap className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search projects..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-yellow-600" />Projects ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Est. Savings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Est. Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.PLANNED;
                      const Icon = sc.icon;
                      const priorityColors: Record<string, string> = { LOW: 'bg-gray-100 dark:bg-gray-800 text-gray-600', MEDIUM: 'bg-blue-100 text-blue-700', HIGH: 'bg-orange-100 text-orange-700', CRITICAL: 'bg-red-100 text-red-700' };
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                            {item.responsible && <p className="text-xs text-gray-400 dark:text-gray-500">{item.responsible}</p>}
                          </td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700">{item.type?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority || 'MEDIUM']}`}>{item.priority || 'MEDIUM'}</span></td>
                          <td className="py-3 px-4 text-right font-mono text-green-700 font-medium">{item.estimatedSavings ? Number(item.estimatedSavings).toLocaleString() : '-'} <span className="text-xs text-gray-400 dark:text-gray-500">{item.unit}</span></td>
                          <td className="py-3 px-4 text-right font-mono">{item.estimatedCost ? `$${Number(item.estimatedCost).toLocaleString()}` : '-'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</td>
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
                <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No projects found</p>
                <p className="text-sm mt-1">Create your first energy improvement project</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Project' : 'Add Energy Project'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
            <input value={editItem.name || ''} onChange={e => setEditItem(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. LED Lighting Upgrade - Building A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={editItem.type || 'LED_LIGHTING'} onChange={e => setEditItem(p => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={editItem.priority || 'MEDIUM'} onChange={e => setEditItem(p => ({ ...p, priority: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={editItem.startDate || ''} onChange={e => setEditItem(p => ({ ...p, startDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" value={editItem.endDate || ''} onChange={e => setEditItem(p => ({ ...p, endDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Savings</label>
              <input type="number" value={editItem.estimatedSavings || ''} onChange={e => setEditItem(p => ({ ...p, estimatedSavings: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh/year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Cost ($)</label>
              <input type="number" value={editItem.estimatedCost || ''} onChange={e => setEditItem(p => ({ ...p, estimatedCost: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsible</label>
              <input value={editItem.responsible || ''} onChange={e => setEditItem(p => ({ ...p, responsible: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={editItem.status || 'PLANNED'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.name} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Add Project'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Project" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this project?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
