'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, Wrench, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const PRIORITIES = ['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;

interface WorkOrder {
  id: string;
  referenceNumber: string;
  assetId: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  assignee: string;
  assigneeName: string;
  scheduledDate: string;
  completedDate: string;
  estimatedHours: number;
  actualHours: number;
  cost: number;
  notes: string;
  createdAt: string;
}

interface WorkOrderForm {
  assetId: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  assignee: string;
  assigneeName: string;
  scheduledDate: string;
  completedDate: string;
  estimatedHours: string;
  actualHours: string;
  cost: string;
  notes: string;
}

const emptyForm: WorkOrderForm = {
  assetId: '',
  title: '',
  description: '',
  type: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  assignee: '',
  assigneeName: '',
  scheduledDate: '',
  completedDate: '',
  estimatedHours: '',
  actualHours: '',
  cost: '',
  notes: '',
};

export default function WorkOrdersClient() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WorkOrderForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/work-orders', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item: WorkOrder) {
    setForm({
      assetId: item.assetId || '',
      title: item.title || '',
      description: item.description || '',
      type: item.type || '',
      priority: item.priority || 'MEDIUM',
      status: item.status || 'OPEN',
      assignee: item.assignee || '',
      assigneeName: item.assigneeName || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      completedDate: item.completedDate ? item.completedDate.split('T')[0] : '',
      estimatedHours: item.estimatedHours?.toString() || '',
      actualHours: item.actualHours?.toString() || '',
      cost: item.cost?.toString() || '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.assetId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
        actualHours: form.actualHours ? parseFloat(form.actualHours) : undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        scheduledDate: form.scheduledDate || undefined,
        completedDate: form.completedDate || undefined,
      };
      if (editId) {
        await api.put(`/work-orders/${editId}`, payload);
      } else {
        await api.post('/work-orders', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save work order:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this work order?')) return;
    try {
      await api.delete(`/work-orders/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'ASSIGNED':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'ON_HOLD':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Work Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Maintenance and repair work orders
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Work Order
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {items.filter((w) => w.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {items.filter((w) => w.priority === 'EMERGENCY').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Emergency</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((w) => w.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search work orders"
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status?.replace(/_/g, ' ') || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{item.assigneeName || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No work orders found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Work Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Work Order' : 'Add Work Order'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Work order title"
                />
              </div>
              <div>
                <Label>Asset ID *</Label>
                <Input
                  value={form.assetId}
                  onChange={(e) => setForm((p) => ({ ...p, assetId: e.target.value }))}
                  placeholder="Asset ID"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Describe the work..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Input
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    placeholder="e.g. Preventive"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assignee ID</Label>
                  <Input
                    value={form.assignee}
                    onChange={(e) => setForm((p) => ({ ...p, assignee: e.target.value }))}
                    placeholder="Assignee ID"
                  />
                </div>
                <div>
                  <Label>Assignee Name</Label>
                  <Input
                    value={form.assigneeName}
                    onChange={(e) => setForm((p) => ({ ...p, assigneeName: e.target.value }))}
                    placeholder="Assignee name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Completed Date</Label>
                  <Input
                    type="date"
                    value={form.completedDate}
                    onChange={(e) => setForm((p) => ({ ...p, completedDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    value={form.estimatedHours}
                    onChange={(e) => setForm((p) => ({ ...p, estimatedHours: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Actual Hours</Label>
                  <Input
                    type="number"
                    value={form.actualHours}
                    onChange={(e) => setForm((p) => ({ ...p, actualHours: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Cost</Label>
                  <Input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title || !form.assetId}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Work Order'
                ) : (
                  'Create Work Order'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
