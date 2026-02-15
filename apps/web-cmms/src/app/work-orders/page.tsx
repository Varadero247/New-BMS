'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Wrench, Edit2, Trash2, AlertCircle, Clock, CheckCircle, Ban, PauseCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface WorkOrder {
  id: string;
  woNumber: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  assignedTo: string;
  asset: string;
  location: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  completedDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const EMPTY_FORM = {
  title: '', description: '', type: 'CORRECTIVE', priority: 'MEDIUM', status: 'OPEN',
  assignedTo: '', asset: '', location: '', estimatedHours: '', actualHours: '', dueDate: '',
};

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await api.get('/work-orders');
      setOrders(res.data.data || []);
    } catch (e) {
      console.error('Error loading work orders:', e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders.filter(o => {
    const matchesSearch = !searchTerm || JSON.stringify(o).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesPriority = !priorityFilter || o.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    open: orders.filter(o => o.status === 'OPEN').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    overdue: orders.filter(o => o.dueDate && new Date(o.dueDate) < new Date() && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  };

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }

  function openEdit(wo: WorkOrder) {
    setSelected(wo);
    setForm({
      title: wo.title || '', description: wo.description || '',
      type: wo.type || 'CORRECTIVE', priority: wo.priority || 'MEDIUM',
      status: wo.status || 'OPEN', assignedTo: wo.assignedTo || '',
      asset: wo.asset || '', location: wo.location || '',
      estimatedHours: wo.estimatedHours?.toString() || '',
      actualHours: wo.actualHours?.toString() || '',
      dueDate: wo.dueDate ? wo.dueDate.slice(0, 10) : '',
    });
    setError('');
    setEditOpen(true);
  }

  function openDelete(wo: WorkOrder) { setSelected(wo); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/work-orders', {
        ...form,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
        actualHours: form.actualHours ? parseFloat(form.actualHours) : undefined,
      });
      setCreateOpen(false);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create work order');
    } finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      await api.put(`/work-orders/${selected!.id}`, {
        ...form,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
        actualHours: form.actualHours ? parseFloat(form.actualHours) : undefined,
      });
      setEditOpen(false);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update work order');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.delete(`/work-orders/${selected!.id}`);
      setDeleteOpen(false);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to delete work order');
    } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Work order title" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of work required..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="CORRECTIVE">Corrective</option>
            <option value="PREVENTIVE">Preventive</option>
            <option value="INSPECTION">Inspection</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="PROJECT">Project</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Technician name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} placeholder="Asset tag or name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
          <input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Hours</label>
          <input type="number" step="0.5" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Actual Hours</label>
          <input type="number" step="0.5" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.actualHours} onChange={e => setForm(f => ({ ...f, actualHours: e.target.value }))} placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Work Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage maintenance work orders</p>
          </div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Create Work Order
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Open', value: stats.open, icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder="Search work orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" />
              Work Orders ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">WO #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Asset</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Assigned To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(wo => {
                      const isOverdue = wo.dueDate && new Date(wo.dueDate) < new Date() && wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED';
                      return (
                        <tr key={wo.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 font-mono text-gray-500 dark:text-gray-400 text-xs">{wo.woNumber}</td>
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium max-w-[200px] truncate">{wo.title}</td>
                          <td className="py-3 px-4 text-gray-600">{wo.type}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColors[wo.priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{wo.priority}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{wo.asset || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{wo.assignedTo || '-'}</td>
                          <td className={`py-3 px-4 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '-'}
                            {isOverdue && <span className="ml-1 text-xs">(Overdue)</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[wo.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{wo.status?.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEdit(wo)} className="text-gray-400 dark:text-gray-500 hover:text-amber-600 transition-colors"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => openDelete(wo)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No work orders found</p>
                <p className="text-sm mt-1">Create your first work order to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Work Order" size="lg">
        <FormFields />
        <ModalFooter>
          <button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Work Order'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Work Order" size="lg">
        <FormFields />
        <ModalFooter>
          <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Work Order" size="sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to delete work order <span className="font-semibold">{selected?.title}</span>? This action cannot be undone.</p>
        </div>
        <ModalFooter>
          <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
