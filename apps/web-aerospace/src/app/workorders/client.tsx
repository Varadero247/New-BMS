'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, Wrench,
  ClipboardList, CheckCircle2, Clock,
  AlertTriangle, ArrowLeft, Play,
  Eye, Send, PauseCircle,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkOrderTask {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  status: string;
  completedAt?: string;
  completedBy?: string;
}

interface WorkOrder {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  aircraftType: string;
  aircraftReg: string;
  priority: string;
  status: string;
  dueDate?: string;
  tasks?: WorkOrderTask[];
  inspectedAt?: string;
  inspectedBy?: string;
  releasedAt?: string;
  releasedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITIES = ['AOG', 'URGENT', 'ROUTINE', 'DEFERRED'] as const;

const STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'PENDING_INSPECTION',
  'INSPECTED',
  'RELEASED',
  'DEFERRED',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'AOG': return 'bg-red-100 text-red-700 border-red-300';
    case 'URGENT': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'ROUTINE': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'DEFERRED': return 'bg-gray-100 text-gray-600 border-gray-300';
    default: return 'bg-gray-100 text-gray-600 border-gray-300';
  }
}

function getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'secondary' | 'danger' | 'destructive' {
  switch (status) {
    case 'OPEN': return 'secondary';
    case 'IN_PROGRESS': return 'info';
    case 'PENDING_INSPECTION': return 'warning';
    case 'INSPECTED': return 'success';
    case 'RELEASED': return 'success';
    case 'DEFERRED': return 'secondary';
    default: return 'info';
  }
}

function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyWOForm = {
  title: '',
  aircraftType: '',
  aircraftReg: '',
  description: '',
  priority: 'ROUTINE' as string,
  dueDate: '',
};

const emptyTaskForm = {
  title: '',
  description: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkOrdersClient() {
  // Data state
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Detail view state
  const [selectedItem, setSelectedItem] = useState<WorkOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyWOForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/workorders');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/workorders/${id}`);
      setSelectedItem(response.data.data);
    } catch (err) {
      console.error('Failed to load work order detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/workorders', {
        ...form,
        dueDate: form.dueDate || undefined,
      });
      setShowCreateModal(false);
      setForm(emptyWOForm);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create work order');
      console.error('Failed to create work order:', err);
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchItems]);

  const handleAddTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/workorders/${selectedItem.id}/tasks`, taskForm);
      setShowAddTaskModal(false);
      setTaskForm(emptyTaskForm);
      await fetchDetail(selectedItem.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add task');
      console.error('Failed to add task:', err);
    } finally {
      setSubmitting(false);
    }
  }, [selectedItem, taskForm, fetchDetail]);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!selectedItem) return;
    try {
      await api.put(`/workorders/${selectedItem.id}/tasks/${taskId}/complete`);
      await fetchDetail(selectedItem.id);
    } catch (err: any) {
      console.error('Failed to complete task:', err);
      alert(err.response?.data?.message || 'Failed to complete task');
    }
  }, [selectedItem, fetchDetail]);

  const handleInspect = useCallback(async () => {
    if (!selectedItem) return;
    if (!confirm('Mark this work order as inspected?')) return;
    try {
      await api.post(`/workorders/${selectedItem.id}/inspect`);
      await fetchDetail(selectedItem.id);
      fetchItems();
    } catch (err: any) {
      console.error('Failed to inspect work order:', err);
      alert(err.response?.data?.message || 'Failed to inspect work order');
    }
  }, [selectedItem, fetchDetail, fetchItems]);

  const handleRelease = useCallback(async () => {
    if (!selectedItem) return;
    if (!confirm('Release this work order? This certifies it as airworthy.')) return;
    try {
      await api.post(`/workorders/${selectedItem.id}/release`);
      await fetchDetail(selectedItem.id);
      fetchItems();
    } catch (err: any) {
      console.error('Failed to release work order:', err);
      alert(err.response?.data?.message || 'Failed to release work order');
    }
  }, [selectedItem, fetchDetail, fetchItems]);

  const handleDefer = useCallback(async () => {
    if (!selectedItem) return;
    if (!confirm('Defer this work order?')) return;
    try {
      await api.post(`/workorders/${selectedItem.id}/defer`);
      await fetchDetail(selectedItem.id);
      fetchItems();
    } catch (err: any) {
      console.error('Failed to defer work order:', err);
      alert(err.response?.data?.message || 'Failed to defer work order');
    }
  }, [selectedItem, fetchDetail, fetchItems]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredItems = useMemo(() => items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !item.title.toLowerCase().includes(query) &&
        !item.refNumber.toLowerCase().includes(query) &&
        !(item.aircraftType || '').toLowerCase().includes(query) &&
        !(item.aircraftReg || '').toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    return true;
  }), [items, statusFilter, priorityFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const summaryStats = useMemo(() => ({
    total: items.length,
    open: items.filter(i => i.status === 'OPEN').length,
    inProgress: items.filter(i => i.status === 'IN_PROGRESS').length,
    released: items.filter(i => i.status === 'RELEASED').length,
  }), [items]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="ml-3 text-gray-500">Loading MRO Work Orders...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Detail View
  // ---------------------------------------------------------------------------

  if (selectedItem) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button + header */}
          <div className="mb-6">
            <button
              onClick={() => { setSelectedItem(null); fetchItems(); }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </button>

            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <span className="ml-2 text-gray-500">Loading...</span>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{selectedItem.title}</h1>
                    <p className="text-sm font-mono text-indigo-600 mt-1">{selectedItem.refNumber}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant={getStatusVariant(selectedItem.status)}>
                        {selectedItem.status?.replace(/_/g, ' ')}
                      </Badge>
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getPriorityColor(selectedItem.priority)}`}>
                        {selectedItem.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItem.status !== 'RELEASED' && selectedItem.status !== 'DEFERRED' && (
                      <Button
                        variant="outline"
                        onClick={() => { setTaskForm(emptyTaskForm); setError(''); setShowAddTaskModal(true); }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    )}
                    {(selectedItem.status === 'IN_PROGRESS' || selectedItem.status === 'PENDING_INSPECTION') && (
                      <Button
                        onClick={handleInspect}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Inspect
                      </Button>
                    )}
                    {selectedItem.status === 'INSPECTED' && (
                      <Button
                        onClick={handleRelease}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Release
                      </Button>
                    )}
                    {selectedItem.status !== 'RELEASED' && selectedItem.status !== 'DEFERRED' && (
                      <Button
                        variant="outline"
                        onClick={handleDefer}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <PauseCircle className="h-4 w-4" />
                        Defer
                      </Button>
                    )}
                  </div>
                </div>

                {/* WO metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Aircraft Type</p>
                    <p className="text-sm font-medium mt-1">{selectedItem.aircraftType || '--'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Aircraft Registration</p>
                    <p className="text-sm font-mono font-medium mt-1">{selectedItem.aircraftReg || '--'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-medium mt-1">
                      {selectedItem.dueDate ? new Date(selectedItem.dueDate).toLocaleDateString() : '--'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium mt-1">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedItem.description && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedItem.description}</p>
                  </div>
                )}

                {/* Release/Inspect info */}
                {selectedItem.inspectedAt && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-700">
                      Inspected on {new Date(selectedItem.inspectedAt).toLocaleDateString()}
                      {selectedItem.inspectedBy && ` by ${selectedItem.inspectedBy}`}
                    </p>
                  </div>
                )}
                {selectedItem.releasedAt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700">
                      Released on {new Date(selectedItem.releasedAt).toLocaleDateString()}
                      {selectedItem.releasedBy && ` by ${selectedItem.releasedBy}`}
                    </p>
                  </div>
                )}

                {/* Task Cards */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tasks ({selectedItem.tasks?.length || 0})
                  </h3>
                  {selectedItem.tasks && selectedItem.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedItem.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-mono text-gray-400">#{task.taskNumber}</span>
                                <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${getTaskStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                              )}
                              {task.completedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  Completed {new Date(task.completedAt).toLocaleDateString()}
                                  {task.completedBy && ` by ${task.completedBy}`}
                                </p>
                              )}
                            </div>
                            {task.status !== 'COMPLETED' && selectedItem.status !== 'RELEASED' && (
                              <Button
                                variant="outline"
                                onClick={() => handleCompleteTask(task.id)}
                                className="text-xs flex items-center gap-1 ml-4"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                      <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No tasks added yet.</p>
                      <p className="text-xs mt-1">Click "Add Task" to create work order tasks.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Task Modal */}
        <Modal isOpen={showAddTaskModal} onClose={() => setShowAddTaskModal(false)} title="Add Task" size="lg">
          <form onSubmit={handleAddTask}>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <Label htmlFor="task-title">Task Title *</Label>
                <Input
                  id="task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  placeholder="e.g. Remove and replace landing gear actuator"
                />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={4}
                  placeholder="Detailed task instructions..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddTaskModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Adding...</span>
                ) : 'Add Task'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // List View (main render)
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MRO Work Orders</h1>
          <p className="text-gray-500 mt-1">Maintenance, Repair & Overhaul work order management</p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total WOs</p>
                  <p className="text-3xl font-bold">{summaryStats.total}</p>
                </div>
                <Wrench className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-3xl font-bold text-amber-600">{summaryStats.open}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{summaryStats.inProgress}</p>
                </div>
                <Play className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Released</p>
                  <p className="text-3xl font-bold text-green-600">{summaryStats.released}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-36"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, ref number, aircraft..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => { setForm(emptyWOForm); setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Create Work Order
          </Button>
        </div>

        {/* Content */}
        {loading ? <LoadingSpinner /> : filteredItems.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ref Number</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Title</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Aircraft Type</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Registration</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Priority</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => fetchDetail(item.id)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-indigo-600 font-medium">{item.refNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{item.aircraftType || '--'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono text-gray-700">{item.aircraftReg || '--'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="h-4 w-4 text-gray-400 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16">
            <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Orders found</h3>
            <p className="text-gray-500 mb-6">
              Create a work order to begin tracking MRO activities.
            </p>
            <Button
              onClick={() => { setForm(emptyWOForm); setError(''); setShowCreateModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Work Order
            </Button>
          </div>
        )}

        {/* Results count */}
        {!loading && items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredItems.length} of {items.length} work orders
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Work Order                                             */}
      {/* ==================================================================== */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create MRO Work Order" size="lg">
        <form onSubmit={handleCreate}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Work Order Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wo-title">Title *</Label>
                  <Input
                    id="wo-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Engine Boroscope Inspection - CFM56-7B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wo-aircraftType">Aircraft Type *</Label>
                    <Input
                      id="wo-aircraftType"
                      value={form.aircraftType}
                      onChange={(e) => setForm({ ...form, aircraftType: e.target.value })}
                      required
                      placeholder="e.g. B737-800, A320neo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wo-aircraftReg">Aircraft Registration *</Label>
                    <Input
                      id="wo-aircraftReg"
                      value={form.aircraftReg}
                      onChange={(e) => setForm({ ...form, aircraftReg: e.target.value })}
                      required
                      placeholder="e.g. EI-ABC, G-XLEA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="wo-description">Description</Label>
                  <Textarea
                    id="wo-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Detailed description of the maintenance work required..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="wo-priority">Priority *</Label>
                    <Select
                      id="wo-priority"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">
                      AOG = Aircraft on Ground (highest), DEFERRED = Scheduled later
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="wo-dueDate">Due Date</Label>
                    <Input
                      id="wo-dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create Work Order'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
