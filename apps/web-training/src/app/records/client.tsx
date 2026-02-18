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

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'] as const;

interface Record {
  id: string;
  referenceNumber: string;
  courseId: string;
  employeeId: string;
  employeeName: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  expiryDate: string;
  score: number;
  passed: boolean;
  trainer: string;
  trainerName: string;
  location: string;
  certificateUrl: string;
  feedback: string;
  notes: string;
  createdAt: string;
}

interface RecordForm {
  courseId: string;
  employeeId: string;
  employeeName: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  expiryDate: string;
  score: string;
  passed: boolean;
  trainer: string;
  trainerName: string;
  location: string;
  certificateUrl: string;
  feedback: string;
  notes: string;
}

const emptyForm: RecordForm = {
  courseId: '',
  employeeId: '',
  employeeName: '',
  status: 'SCHEDULED',
  scheduledDate: '',
  completedDate: '',
  expiryDate: '',
  score: '',
  passed: false,
  trainer: '',
  trainerName: '',
  location: '',
  certificateUrl: '',
  feedback: '',
  notes: '',
};

export default function RecordsClient() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RecordForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadRecords = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/records', { params });
      setRecords(response.data.data || []);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(rec: Record) {
    setForm({
      courseId: rec.courseId || '',
      employeeId: rec.employeeId || '',
      employeeName: rec.employeeName || '',
      status: rec.status || 'SCHEDULED',
      scheduledDate: rec.scheduledDate ? rec.scheduledDate.split('T')[0] : '',
      completedDate: rec.completedDate ? rec.completedDate.split('T')[0] : '',
      expiryDate: rec.expiryDate ? rec.expiryDate.split('T')[0] : '',
      score: rec.score != null ? String(rec.score) : '',
      passed: rec.passed || false,
      trainer: rec.trainer || '',
      trainerName: rec.trainerName || '',
      location: rec.location || '',
      certificateUrl: rec.certificateUrl || '',
      feedback: rec.feedback || '',
      notes: rec.notes || '',
    });
    setEditId(rec.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.courseId || !form.employeeId) return;
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        score: form.score ? parseFloat(form.score) : undefined,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        completedDate: form.completedDate ? new Date(form.completedDate).toISOString() : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/records/${editId}`, payload);
      } else {
        await api.post('/records', payload);
      }
      setModalOpen(false);
      loadRecords();
    } catch (err) {
      console.error('Failed to save record:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      loadRecords();
    } catch (err) {
      console.error(err);
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
              Training Records
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Employee training history and tracking
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{records.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {records.filter((r) => r.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {records.filter((r) => r.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {records.filter((r) => r.status === 'EXPIRED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search records"
              placeholder="Search records..."
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
            ) : records.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec.id}>
                        <TableCell className="font-mono text-xs">{rec.referenceNumber}</TableCell>
                        <TableCell className="font-medium">
                          {rec.employeeName || rec.employeeId}
                        </TableCell>
                        <TableCell className="text-sm">{rec.courseId}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(rec.status)}>
                            {rec.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {rec.score != null ? `${rec.score}%` : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {rec.scheduledDate
                            ? new Date(rec.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(rec)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(rec.id)}
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
                <p className="text-gray-500 dark:text-gray-400">No training records found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Training Record' : 'Add Training Record'}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course ID *</Label>
                  <Input
                    value={form.courseId}
                    onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
                    placeholder="Course ID"
                  />
                </div>
                <div>
                  <Label>Employee ID *</Label>
                  <Input
                    value={form.employeeId}
                    onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
                    placeholder="Employee ID"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employee Name</Label>
                  <Input
                    value={form.employeeName}
                    onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))}
                    placeholder="Employee name"
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
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Score (%)</Label>
                  <Input
                    type="number"
                    value={form.score}
                    onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
                    placeholder="0-100"
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="passed"
                    checked={form.passed}
                    onChange={(e) => setForm((p) => ({ ...p, passed: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="passed">Passed</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trainer Name</Label>
                  <Input
                    value={form.trainerName}
                    onChange={(e) => setForm((p) => ({ ...p, trainerName: e.target.value }))}
                    placeholder="Trainer name"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Training location"
                  />
                </div>
              </div>
              <div>
                <Label>Certificate URL</Label>
                <Input
                  value={form.certificateUrl}
                  onChange={(e) => setForm((p) => ({ ...p, certificateUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Feedback</Label>
                <Textarea
                  value={form.feedback}
                  onChange={(e) => setForm((p) => ({ ...p, feedback: e.target.value }))}
                  rows={2}
                  placeholder="Training feedback..."
                />
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
                disabled={saving || !form.courseId || !form.employeeId}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Record'
                ) : (
                  'Create Record'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
