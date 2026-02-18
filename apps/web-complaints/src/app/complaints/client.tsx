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
import { Plus, MessageSquareWarning, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const CHANNELS = ['EMAIL', 'PHONE', 'WEB_FORM', 'SOCIAL_MEDIA', 'IN_PERSON', 'LETTER'] as const;
const CATEGORIES = [
  'PRODUCT',
  'SERVICE',
  'DELIVERY',
  'BILLING',
  'SAFETY',
  'ENVIRONMENTAL',
  'REGULATORY',
  'OTHER',
] as const;
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const STATUSES = [
  'NEW',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'RESOLVED',
  'CLOSED',
  'ESCALATED',
] as const;

interface Complaint {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  channel: string;
  category: string;
  priority: string;
  status: string;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  assigneeName: string;
  department: string;
  productRef: string;
  orderRef: string;
  isRegulatory: boolean;
  regulatoryBody: string;
  slaDeadline: string;
  rootCause: string;
  resolution: string;
  preventiveAction: string;
  customerSatisfied: boolean;
  notes: string;
  createdAt: string;
}

interface ComplaintForm {
  title: string;
  description: string;
  channel: string;
  category: string;
  priority: string;
  status: string;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  assigneeName: string;
  department: string;
  productRef: string;
  orderRef: string;
  isRegulatory: boolean;
  regulatoryBody: string;
  slaDeadline: string;
  rootCause: string;
  resolution: string;
  preventiveAction: string;
  customerSatisfied: boolean;
  notes: string;
}

const emptyForm: ComplaintForm = {
  title: '',
  description: '',
  channel: 'EMAIL',
  category: 'OTHER',
  priority: 'MEDIUM',
  status: 'NEW',
  complainantName: '',
  complainantEmail: '',
  complainantPhone: '',
  assigneeName: '',
  department: '',
  productRef: '',
  orderRef: '',
  isRegulatory: false,
  regulatoryBody: '',
  slaDeadline: '',
  rootCause: '',
  resolution: '',
  preventiveAction: '',
  customerSatisfied: false,
  notes: '',
};

function getPriorityColor(p: string) {
  switch (p) {
    case 'CRITICAL':
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

export default function ComplaintsClient() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ComplaintForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/complaints', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(item: Complaint) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      channel: item.channel || 'EMAIL',
      category: item.category || 'OTHER',
      priority: item.priority || 'MEDIUM',
      status: item.status || 'NEW',
      complainantName: item.complainantName || '',
      complainantEmail: item.complainantEmail || '',
      complainantPhone: item.complainantPhone || '',
      assigneeName: item.assigneeName || '',
      department: item.department || '',
      productRef: item.productRef || '',
      orderRef: item.orderRef || '',
      isRegulatory: item.isRegulatory || false,
      regulatoryBody: item.regulatoryBody || '',
      slaDeadline: item.slaDeadline ? item.slaDeadline.split('T')[0] : '',
      rootCause: item.rootCause || '',
      resolution: item.resolution || '',
      preventiveAction: item.preventiveAction || '',
      customerSatisfied: item.customerSatisfied || false,
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        slaDeadline: form.slaDeadline ? new Date(form.slaDeadline).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/complaints/${editId}`, payload);
      } else {
        await api.post('/complaints', payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save complaint:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Complaints</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage customer complaints and issues
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Complaint
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
              <p className="text-3xl font-bold text-red-600">
                {items.filter((i) => i.priority === 'CRITICAL').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {items.filter((i) => i.status === 'ESCALATED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escalated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resolved/Closed</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search complaints"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                      <TableHead>Category</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Complainant</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(item.category || '').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {(item.channel || '').replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 'RESOLVED' || item.status === 'CLOSED'
                                ? 'secondary'
                                : item.status === 'ESCALATED'
                                  ? 'destructive'
                                  : 'default'
                            }
                          >
                            {(item.status || '').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.complainantName || '-'}</TableCell>
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
                <MessageSquareWarning className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No complaints found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Complaint
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Complaint' : 'New Complaint'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Complaint title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Channel</Label>
                  <Select
                    value={form.channel}
                    onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {c.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
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
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the complaint..."
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  Complainant Details
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={form.complainantName}
                      onChange={(e) => setForm((p) => ({ ...p, complainantName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.complainantEmail}
                      onChange={(e) => setForm((p) => ({ ...p, complainantEmail: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={form.complainantPhone}
                      onChange={(e) => setForm((p) => ({ ...p, complainantPhone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assignee</Label>
                  <Input
                    value={form.assigneeName}
                    onChange={(e) => setForm((p) => ({ ...p, assigneeName: e.target.value }))}
                    placeholder="Assigned to"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="Department"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Ref</Label>
                  <Input
                    value={form.productRef}
                    onChange={(e) => setForm((p) => ({ ...p, productRef: e.target.value }))}
                    placeholder="Product reference"
                  />
                </div>
                <div>
                  <Label>Order Ref</Label>
                  <Input
                    value={form.orderRef}
                    onChange={(e) => setForm((p) => ({ ...p, orderRef: e.target.value }))}
                    placeholder="Order reference"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SLA Deadline</Label>
                  <Input
                    type="date"
                    value={form.slaDeadline}
                    onChange={(e) => setForm((p) => ({ ...p, slaDeadline: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.isRegulatory}
                      onChange={(e) => setForm((p) => ({ ...p, isRegulatory: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    Regulatory Complaint
                  </label>
                </div>
              </div>
              {form.isRegulatory && (
                <div>
                  <Label>Regulatory Body</Label>
                  <Input
                    value={form.regulatoryBody}
                    onChange={(e) => setForm((p) => ({ ...p, regulatoryBody: e.target.value }))}
                    placeholder="Regulatory body name"
                  />
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  Resolution
                </p>
                <div>
                  <Label>Root Cause</Label>
                  <Textarea
                    value={form.rootCause}
                    onChange={(e) => setForm((p) => ({ ...p, rootCause: e.target.value }))}
                    rows={2}
                    placeholder="Root cause analysis..."
                  />
                </div>
                <div className="mt-3">
                  <Label>Resolution</Label>
                  <Textarea
                    value={form.resolution}
                    onChange={(e) => setForm((p) => ({ ...p, resolution: e.target.value }))}
                    rows={2}
                    placeholder="Resolution details..."
                  />
                </div>
                <div className="mt-3">
                  <Label>Preventive Action</Label>
                  <Textarea
                    value={form.preventiveAction}
                    onChange={(e) => setForm((p) => ({ ...p, preventiveAction: e.target.value }))}
                    rows={2}
                    placeholder="Preventive measures..."
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-3">
                  <input
                    type="checkbox"
                    checked={form.customerSatisfied}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, customerSatisfied: e.target.checked }))
                    }
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  Customer Satisfied
                </label>
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
                  'Update Complaint'
                ) : (
                  'Create Complaint'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
