'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, ClipboardCheck, CheckCircle, Clock, AlertTriangle, Calendar, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Audit {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  auditor?: string;
  scope?: string;
  findings?: number;
  nonConformities?: number;
  recommendations?: string;
  description?: string;
}

const AUDIT_TYPES = ['INTERNAL', 'EXTERNAL', 'MANAGEMENT_REVIEW', 'THIRD_PARTY', 'REGULATORY'];
const STATUS_OPTIONS = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  SCHEDULED: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700', icon: Calendar },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 dark:bg-gray-800 text-gray-500', icon: Clock },
  OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const empty: Partial<Audit> = { title: '', type: 'INTERNAL', status: 'SCHEDULED', auditor: '', scope: '', description: '' };

export default function AuditsPage() {
  const [items, setItems] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Audit>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/audits'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mt = !filterType || i.type === filterType;
    return m && ms && mt;
  });

  const stats = {
    total: items.length,
    scheduled: items.filter(i => i.status === 'SCHEDULED').length,
    completed: items.filter(i => i.status === 'COMPLETED').length,
    overdue: items.filter(i => i.status === 'OVERDUE').length,
  };

  const openCreate = () => { setEditItem({ ...empty }); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: Audit) => {
    setEditItem({
      ...item,
      scheduledDate: item.scheduledDate ? new Date(item.scheduledDate).toISOString().slice(0, 10) : '',
      completedDate: item.completedDate ? new Date(item.completedDate).toISOString().slice(0, 10) : '',
    });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) { await api.put(`/audits/${editItem.id}`, editItem); }
      else { await api.post('/audits', editItem); }
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/audits/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Audits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Internal and external energy audit management (ISO 50001 §9.2)</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Schedule Audit
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Audits</p><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><ClipboardCheck className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p><p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p></div><div className="p-3 bg-blue-50 rounded-full"><Calendar className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-green-700">{stats.completed}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p><p className="text-2xl font-bold text-red-700">{stats.overdue}</p></div><div className="p-3 bg-red-50 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search audits..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Types</option>
            {AUDIT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-yellow-600" />Audits ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50 dark:bg-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Auditor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Scheduled</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Findings</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">NCs</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.SCHEDULED;
                      const Icon = sc.icon;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                            {item.scope && <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{item.scope}</p>}
                          </td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{item.type?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{item.auditor || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4 text-center"><span className="font-medium">{item.findings ?? '-'}</span></td>
                          <td className="py-3 px-4 text-center"><span className={`font-medium ${(item.nonConformities || 0) > 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>{item.nonConformities ?? '-'}</span></td>
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
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No audits found</p>
                <p className="text-sm mt-1">Schedule your first energy audit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Audit' : 'Schedule Energy Audit'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input value={editItem.title || ''} onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Annual Internal Energy Audit 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={editItem.type || 'INTERNAL'} onChange={e => setEditItem(p => ({ ...p, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {AUDIT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
            <input value={editItem.scope || ''} onChange={e => setEditItem(p => ({ ...p, scope: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Areas or systems to be audited..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Auditor</label>
              <input value={editItem.auditor || ''} onChange={e => setEditItem(p => ({ ...p, auditor: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date</label>
              <input type="date" value={editItem.scheduledDate || ''} onChange={e => setEditItem(p => ({ ...p, scheduledDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Findings</label>
              <input type="number" value={editItem.findings ?? ''} onChange={e => setEditItem(p => ({ ...p, findings: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Non-Conformities</label>
              <input type="number" value={editItem.nonConformities ?? ''} onChange={e => setEditItem(p => ({ ...p, nonConformities: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={editItem.status || 'SCHEDULED'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recommendations</label>
            <textarea value={editItem.recommendations || ''} onChange={e => setEditItem(p => ({ ...p, recommendations: e.target.value }))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.title} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Schedule Audit'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Audit" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this audit?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
