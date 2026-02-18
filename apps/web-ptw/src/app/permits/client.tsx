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
import { Plus, ClipboardList, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = [
  'HOT_WORK',
  'CONFINED_SPACE',
  'WORKING_AT_HEIGHT',
  'ELECTRICAL',
  'EXCAVATION',
  'GENERAL',
] as const;
const STATUSES = [
  'DRAFT',
  'REQUESTED',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'CLOSED',
  'CANCELLED',
] as const;
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

interface Permit {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  location: string;
  area: string;
  requestedByName: string;
  approvedByName: string;
  startDate: string;
  endDate: string;
  hazards: string;
  precautions: string;
  ppe: string;
  emergencyProcedure: string;
  isolations: string;
  gasTestRequired: boolean;
  gasTestResult: string;
  notes: string;
  createdAt: string;
}

interface PermitForm {
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  location: string;
  area: string;
  requestedByName: string;
  approvedByName: string;
  startDate: string;
  endDate: string;
  hazards: string;
  precautions: string;
  ppe: string;
  emergencyProcedure: string;
  isolations: string;
  gasTestRequired: boolean;
  gasTestResult: string;
  notes: string;
}

const emptyForm: PermitForm = {
  title: '',
  description: '',
  type: 'GENERAL',
  status: 'DRAFT',
  priority: 'MEDIUM',
  location: '',
  area: '',
  requestedByName: '',
  approvedByName: '',
  startDate: '',
  endDate: '',
  hazards: '',
  precautions: '',
  ppe: '',
  emergencyProcedure: '',
  isolations: '',
  gasTestRequired: false,
  gasTestResult: '',
  notes: '',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'REQUESTED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'CLOSED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function PermitsClient() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PermitForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadPermits = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/permits', { params });
      setPermits(response.data.data || []);
    } catch (err) {
      console.error('Failed to load permits:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadPermits();
  }, [loadPermits]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(permit: Permit) {
    setForm({
      title: permit.title || '',
      description: permit.description || '',
      type: permit.type || 'GENERAL',
      status: permit.status || 'DRAFT',
      priority: permit.priority || 'MEDIUM',
      location: permit.location || '',
      area: permit.area || '',
      requestedByName: permit.requestedByName || '',
      approvedByName: permit.approvedByName || '',
      startDate: permit.startDate ? permit.startDate.split('T')[0] : '',
      endDate: permit.endDate ? permit.endDate.split('T')[0] : '',
      hazards: permit.hazards || '',
      precautions: permit.precautions || '',
      ppe: permit.ppe || '',
      emergencyProcedure: permit.emergencyProcedure || '',
      isolations: permit.isolations || '',
      gasTestRequired: permit.gasTestRequired || false,
      gasTestResult: permit.gasTestResult || '',
      notes: permit.notes || '',
    });
    setEditId(permit.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/permits/${editId}`, payload);
      } else {
        await api.post('/permits', payload);
      }
      setModalOpen(false);
      loadPermits();
    } catch (err) {
      console.error('Failed to save permit:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this permit?')) return;
    try {
      await api.delete(`/permits/${id}`);
      loadPermits();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Permits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage permits to work</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Permit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {permits.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Permits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {permits.filter((p) => p.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {permits.filter((p) => p.status === 'REQUESTED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {permits.filter((p) => p.status === 'SUSPENDED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suspended</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search permits"
              placeholder="Search permits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            ) : permits.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permits.map((permit) => (
                      <TableRow key={permit.id}>
                        <TableCell className="font-mono text-xs">
                          {permit.referenceNumber}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {permit.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(permit.type || 'GENERAL').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(permit.priority)}`}
                          >
                            {permit.priority || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {permit.location || '-'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}
                          >
                            {permit.status?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(permit)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(permit.id)}
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
                <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No permits found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Permit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Permit' : 'Add Permit'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Permit title"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
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
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the work to be carried out..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Work location"
                  />
                </div>
                <div>
                  <Label>Area</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                    placeholder="Specific area"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested By</Label>
                  <Input
                    value={form.requestedByName}
                    onChange={(e) => setForm((p) => ({ ...p, requestedByName: e.target.value }))}
                    placeholder="Requester name"
                  />
                </div>
                <div>
                  <Label>Approved By</Label>
                  <Input
                    value={form.approvedByName}
                    onChange={(e) => setForm((p) => ({ ...p, approvedByName: e.target.value }))}
                    placeholder="Approver name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Hazards</Label>
                <Textarea
                  value={form.hazards}
                  onChange={(e) => setForm((p) => ({ ...p, hazards: e.target.value }))}
                  rows={2}
                  placeholder="Identified hazards..."
                />
              </div>

              <div>
                <Label>Precautions</Label>
                <Textarea
                  value={form.precautions}
                  onChange={(e) => setForm((p) => ({ ...p, precautions: e.target.value }))}
                  rows={2}
                  placeholder="Required precautions..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PPE Required</Label>
                  <Input
                    value={form.ppe}
                    onChange={(e) => setForm((p) => ({ ...p, ppe: e.target.value }))}
                    placeholder="e.g. Hard hat, gloves, goggles"
                  />
                </div>
                <div>
                  <Label>Isolations</Label>
                  <Input
                    value={form.isolations}
                    onChange={(e) => setForm((p) => ({ ...p, isolations: e.target.value }))}
                    placeholder="Required isolations"
                  />
                </div>
              </div>

              <div>
                <Label>Emergency Procedure</Label>
                <Textarea
                  value={form.emergencyProcedure}
                  onChange={(e) => setForm((p) => ({ ...p, emergencyProcedure: e.target.value }))}
                  rows={2}
                  placeholder="Emergency procedures..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="gasTestRequired"
                    checked={form.gasTestRequired}
                    onChange={(e) => setForm((p) => ({ ...p, gasTestRequired: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <Label htmlFor="gasTestRequired" className="mb-0">
                    Gas Test Required
                  </Label>
                </div>
                <div>
                  <Label>Gas Test Result</Label>
                  <Input
                    value={form.gasTestResult}
                    onChange={(e) => setForm((p) => ({ ...p, gasTestResult: e.target.value }))}
                    placeholder="Gas test result"
                    disabled={!form.gasTestRequired}
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
                  'Update Permit'
                ) : (
                  'Create Permit'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
