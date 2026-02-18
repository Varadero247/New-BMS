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
import { Plus, Gauge, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'OVERDUE'] as const;

interface Calibration {
  id: string;
  referenceNumber: string;
  assetId: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  nextDueDate: string;
  technician: string;
  standard: string;
  result: string;
  certificate: string;
  notes: string;
  createdAt: string;
}

interface CalibrationForm {
  assetId: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  nextDueDate: string;
  technician: string;
  standard: string;
  result: string;
  certificate: string;
  notes: string;
}

const emptyForm: CalibrationForm = {
  assetId: '',
  status: 'SCHEDULED',
  scheduledDate: '',
  completedDate: '',
  nextDueDate: '',
  technician: '',
  standard: '',
  result: '',
  certificate: '',
  notes: '',
};

export default function CalibrationsClient() {
  const [items, setItems] = useState<Calibration[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CalibrationForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/calibrations', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load calibrations:', err);
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
  function openEdit(item: Calibration) {
    setForm({
      assetId: item.assetId || '',
      status: item.status || 'SCHEDULED',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      completedDate: item.completedDate ? item.completedDate.split('T')[0] : '',
      nextDueDate: item.nextDueDate ? item.nextDueDate.split('T')[0] : '',
      technician: item.technician || '',
      standard: item.standard || '',
      result: item.result || '',
      certificate: item.certificate || '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.assetId || !form.scheduledDate) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate || undefined,
        completedDate: form.completedDate || undefined,
        nextDueDate: form.nextDueDate || undefined,
      };
      if (editId) {
        await api.put(`/calibrations/${editId}`, payload);
      } else {
        await api.post('/calibrations', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save calibration:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this calibration?')) return;
    try {
      await api.delete(`/calibrations/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SCHEDULED':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'OVERDUE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calibrations</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Asset calibration scheduling and tracking
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Calibration
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
              <p className="text-3xl font-bold text-green-600">
                {items.filter((c) => c.status === 'PASSED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {items.filter((c) => c.status === 'FAILED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {items.filter((c) => c.status === 'OVERDUE').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search calibrations"
              placeholder="Search calibrations..."
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
                      <TableHead>Asset ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-mono text-xs">{item.assetId}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status?.replace(/_/g, ' ') || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.nextDueDate ? new Date(item.nextDueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-sm">{item.technician || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.standard || '-'}</Badge>
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
                <Gauge className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No calibrations found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Calibration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Calibration' : 'Add Calibration'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Asset ID *</Label>
                <Input
                  value={form.assetId}
                  onChange={(e) => setForm((p) => ({ ...p, assetId: e.target.value }))}
                  placeholder="Asset ID"
                />
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Scheduled Date *</Label>
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
                <div>
                  <Label>Next Due Date</Label>
                  <Input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) => setForm((p) => ({ ...p, nextDueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Technician</Label>
                  <Input
                    value={form.technician}
                    onChange={(e) => setForm((p) => ({ ...p, technician: e.target.value }))}
                    placeholder="Technician name"
                  />
                </div>
                <div>
                  <Label>Standard</Label>
                  <Input
                    value={form.standard}
                    onChange={(e) => setForm((p) => ({ ...p, standard: e.target.value }))}
                    placeholder="e.g. ISO 17025"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Result</Label>
                  <Input
                    value={form.result}
                    onChange={(e) => setForm((p) => ({ ...p, result: e.target.value }))}
                    placeholder="Calibration result"
                  />
                </div>
                <div>
                  <Label>Certificate</Label>
                  <Input
                    value={form.certificate}
                    onChange={(e) => setForm((p) => ({ ...p, certificate: e.target.value }))}
                    placeholder="Certificate number"
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
              <Button
                onClick={handleSubmit}
                disabled={saving || !form.assetId || !form.scheduledDate}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Calibration'
                ) : (
                  'Create Calibration'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
