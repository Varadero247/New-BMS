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
import { Plus, SearchCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'] as const;

interface TNA {
  id: string;
  referenceNumber: string;
  title: string;
  department: string;
  role: string;
  priority: string;
  identifiedGap: string;
  recommendedTraining: string;
  targetDate: string;
  status: string;
  assignee: string;
  assigneeName: string;
  budget: number;
  approvedBy: string;
  notes: string;
  createdAt: string;
}

interface TNAForm {
  title: string;
  department: string;
  role: string;
  priority: string;
  identifiedGap: string;
  recommendedTraining: string;
  targetDate: string;
  status: string;
  assignee: string;
  assigneeName: string;
  budget: string;
  approvedBy: string;
  notes: string;
}

const emptyForm: TNAForm = {
  title: '',
  department: '',
  role: '',
  priority: 'MEDIUM',
  identifiedGap: '',
  recommendedTraining: '',
  targetDate: '',
  status: 'SCHEDULED',
  assignee: '',
  assigneeName: '',
  budget: '',
  approvedBy: '',
  notes: '',
};

export default function TnaClient() {
  const [tnas, setTnas] = useState<TNA[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<TNAForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTnas = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/tna', { params });
      setTnas(response.data.data || []);
    } catch (err) {
      console.error('Failed to load TNAs:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadTnas();
  }, [loadTnas]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(tna: TNA) {
    setForm({
      title: tna.title || '',
      department: tna.department || '',
      role: tna.role || '',
      priority: tna.priority || 'MEDIUM',
      identifiedGap: tna.identifiedGap || '',
      recommendedTraining: tna.recommendedTraining || '',
      targetDate: tna.targetDate ? tna.targetDate.split('T')[0] : '',
      status: tna.status || 'SCHEDULED',
      assignee: tna.assignee || '',
      assigneeName: tna.assigneeName || '',
      budget: tna.budget != null ? String(tna.budget) : '',
      approvedBy: tna.approvedBy || '',
      notes: tna.notes || '',
    });
    setEditId(tna.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        budget: form.budget ? parseFloat(form.budget) : undefined,
        targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/tna/${editId}`, payload);
      } else {
        await api.post('/tna', payload);
      }
      setModalOpen(false);
      loadTnas();
    } catch (err) {
      console.error('Failed to save TNA:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this training need?')) return;
    try {
      await api.delete(`/tna/${id}`);
      loadTnas();
    } catch (err) {
      console.error(err);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
    if (status === 'COMPLETED') return 'secondary';
    if (status === 'IN_PROGRESS') return 'default';
    return 'outline';
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Training Needs Analysis
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Identify and address competency gaps
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add TNA
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{tnas.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total TNAs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {tnas.filter((t) => t.priority === 'CRITICAL').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {tnas.filter((t) => t.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {tnas.filter((t) => t.status === 'COMPLETED').length}
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
              aria-label="Search training needs"
              placeholder="Search training needs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            ) : tnas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tnas.map((tna) => (
                      <TableRow key={tna.id}>
                        <TableCell className="font-mono text-xs">{tna.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{tna.title}</TableCell>
                        <TableCell className="text-sm">{tna.department || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(tna.priority)}`}
                          >
                            {tna.priority || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(tna.status)}>
                            {tna.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tna.targetDate ? new Date(tna.targetDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {tna.assigneeName || tna.assignee || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(tna)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(tna.id)}
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
                <SearchCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No training needs found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First TNA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Training Need' : 'Add Training Need'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Training need title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="Department"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Job role"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Identified Gap</Label>
                <Textarea
                  value={form.identifiedGap}
                  onChange={(e) => setForm((p) => ({ ...p, identifiedGap: e.target.value }))}
                  rows={2}
                  placeholder="Describe the identified competency gap..."
                />
              </div>
              <div>
                <Label>Recommended Training</Label>
                <Textarea
                  value={form.recommendedTraining}
                  onChange={(e) => setForm((p) => ({ ...p, recommendedTraining: e.target.value }))}
                  rows={2}
                  placeholder="Recommended training to address the gap..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={form.targetDate}
                    onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assignee Name</Label>
                  <Input
                    value={form.assigneeName}
                    onChange={(e) => setForm((p) => ({ ...p, assigneeName: e.target.value }))}
                    placeholder="Assignee name"
                  />
                </div>
                <div>
                  <Label>Approved By</Label>
                  <Input
                    value={form.approvedBy}
                    onChange={(e) => setForm((p) => ({ ...p, approvedBy: e.target.value }))}
                    placeholder="Approver name"
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
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update TNA'
                ) : (
                  'Create TNA'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
