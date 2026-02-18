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
import { Plus, ClipboardCheck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

interface Review {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  status: string;
  scheduledDate: string;
  conductedDate: string;
  chairpersonName: string;
  attendees: string[];
  standards: string[];
  riskSummary: string;
  auditSummary: string;
  incidentSummary: string;
  capaSummary: string;
  kpiSummary: string;
  customerFeedback: string;
  supplierPerformance: string;
  trainingStatus: string;
  complianceStatus: string;
  decisions: string;
  actions: string;
  nextReviewDate: string;
  minutesUrl: string;
  notes: string;
  createdAt: string;
}

interface ReviewForm {
  title: string;
  description: string;
  status: string;
  scheduledDate: string;
  conductedDate: string;
  chairpersonName: string;
  attendees: string;
  standards: string;
  riskSummary: string;
  auditSummary: string;
  incidentSummary: string;
  capaSummary: string;
  kpiSummary: string;
  customerFeedback: string;
  supplierPerformance: string;
  trainingStatus: string;
  complianceStatus: string;
  decisions: string;
  actions: string;
  nextReviewDate: string;
  minutesUrl: string;
  notes: string;
}

const emptyForm: ReviewForm = {
  title: '',
  description: '',
  status: 'DRAFT',
  scheduledDate: '',
  conductedDate: '',
  chairpersonName: '',
  attendees: '',
  standards: '',
  riskSummary: '',
  auditSummary: '',
  incidentSummary: '',
  capaSummary: '',
  kpiSummary: '',
  customerFeedback: '',
  supplierPerformance: '',
  trainingStatus: '',
  complianceStatus: '',
  decisions: '',
  actions: '',
  nextReviewDate: '',
  minutesUrl: '',
  notes: '',
};

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'COMPLETED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function ReviewsClient() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReviewForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/reviews', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
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
  function openEdit(item: Review) {
    setForm({
      title: item.title || '',
      description: item.description || '',
      status: item.status || 'DRAFT',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      conductedDate: item.conductedDate ? item.conductedDate.split('T')[0] : '',
      chairpersonName: item.chairpersonName || '',
      attendees: (item.attendees || []).join(', '),
      standards: (item.standards || []).join(', '),
      riskSummary: item.riskSummary || '',
      auditSummary: item.auditSummary || '',
      incidentSummary: item.incidentSummary || '',
      capaSummary: item.capaSummary || '',
      kpiSummary: item.kpiSummary || '',
      customerFeedback: item.customerFeedback || '',
      supplierPerformance: item.supplierPerformance || '',
      trainingStatus: item.trainingStatus || '',
      complianceStatus: item.complianceStatus || '',
      decisions: item.decisions || '',
      actions: item.actions || '',
      nextReviewDate: item.nextReviewDate ? item.nextReviewDate.split('T')[0] : '',
      minutesUrl: item.minutesUrl || '',
      notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        status: form.status,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        conductedDate: form.conductedDate ? new Date(form.conductedDate).toISOString() : undefined,
        chairpersonName: form.chairpersonName || undefined,
        attendees: form.attendees
          ? form.attendees
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        standards: form.standards
          ? form.standards
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        riskSummary: form.riskSummary || undefined,
        auditSummary: form.auditSummary || undefined,
        incidentSummary: form.incidentSummary || undefined,
        capaSummary: form.capaSummary || undefined,
        kpiSummary: form.kpiSummary || undefined,
        customerFeedback: form.customerFeedback || undefined,
        supplierPerformance: form.supplierPerformance || undefined,
        trainingStatus: form.trainingStatus || undefined,
        complianceStatus: form.complianceStatus || undefined,
        decisions: form.decisions || undefined,
        actions: form.actions || undefined,
        nextReviewDate: form.nextReviewDate
          ? new Date(form.nextReviewDate).toISOString()
          : undefined,
        minutesUrl: form.minutesUrl || undefined,
        notes: form.notes || undefined,
      };
      if (editId) {
        await api.put(`/reviews/${editId}`, payload);
      } else {
        await api.post('/reviews', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this management review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Management Reviews
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 9001 Clause 9.3 -- Schedule and conduct management reviews
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Review
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {items.filter((r) => r.status === 'SCHEDULED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {items.filter((r) => r.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {items.filter((r) => r.status === 'COMPLETED').length}
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
              aria-label="Search reviews"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                      <TableHead>Chairperson</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Next Review</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-sm">{item.chairpersonName || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>
                            {(item.status || '-').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.nextReviewDate
                            ? new Date(item.nextReviewDate).toLocaleDateString()
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
                <ClipboardCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No management reviews found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Management Review' : 'Add Management Review'}
            size="lg"
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Review title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Chairperson</Label>
                  <Input
                    value={form.chairpersonName}
                    onChange={(e) => setForm((p) => ({ ...p, chairpersonName: e.target.value }))}
                    placeholder="Chairperson name"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  placeholder="Review description..."
                />
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
                  <Label>Conducted Date</Label>
                  <Input
                    type="date"
                    value={form.conductedDate}
                    onChange={(e) => setForm((p) => ({ ...p, conductedDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Next Review Date</Label>
                  <Input
                    type="date"
                    value={form.nextReviewDate}
                    onChange={(e) => setForm((p) => ({ ...p, nextReviewDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Attendees (comma separated)</Label>
                  <Input
                    value={form.attendees}
                    onChange={(e) => setForm((p) => ({ ...p, attendees: e.target.value }))}
                    placeholder="e.g. John, Jane, Bob"
                  />
                </div>
                <div>
                  <Label>Standards (comma separated)</Label>
                  <Input
                    value={form.standards}
                    onChange={(e) => setForm((p) => ({ ...p, standards: e.target.value }))}
                    placeholder="e.g. ISO 9001, ISO 14001"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Review Inputs (Clause 9.3.2)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Risk Summary</Label>
                  <Textarea
                    value={form.riskSummary}
                    onChange={(e) => setForm((p) => ({ ...p, riskSummary: e.target.value }))}
                    rows={2}
                    placeholder="Summary of risk register..."
                  />
                </div>
                <div>
                  <Label>Audit Summary</Label>
                  <Textarea
                    value={form.auditSummary}
                    onChange={(e) => setForm((p) => ({ ...p, auditSummary: e.target.value }))}
                    rows={2}
                    placeholder="Internal/external audit results..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Incident Summary</Label>
                  <Textarea
                    value={form.incidentSummary}
                    onChange={(e) => setForm((p) => ({ ...p, incidentSummary: e.target.value }))}
                    rows={2}
                    placeholder="Incident/NC trends..."
                  />
                </div>
                <div>
                  <Label>CAPA Summary</Label>
                  <Textarea
                    value={form.capaSummary}
                    onChange={(e) => setForm((p) => ({ ...p, capaSummary: e.target.value }))}
                    rows={2}
                    placeholder="CAPA status and effectiveness..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>KPI Summary</Label>
                  <Textarea
                    value={form.kpiSummary}
                    onChange={(e) => setForm((p) => ({ ...p, kpiSummary: e.target.value }))}
                    rows={2}
                    placeholder="Key performance indicators..."
                  />
                </div>
                <div>
                  <Label>Customer Feedback</Label>
                  <Textarea
                    value={form.customerFeedback}
                    onChange={(e) => setForm((p) => ({ ...p, customerFeedback: e.target.value }))}
                    rows={2}
                    placeholder="Customer satisfaction data..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Performance</Label>
                  <Textarea
                    value={form.supplierPerformance}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, supplierPerformance: e.target.value }))
                    }
                    rows={2}
                    placeholder="Supplier evaluation results..."
                  />
                </div>
                <div>
                  <Label>Training Status</Label>
                  <Textarea
                    value={form.trainingStatus}
                    onChange={(e) => setForm((p) => ({ ...p, trainingStatus: e.target.value }))}
                    rows={2}
                    placeholder="Competence and training..."
                  />
                </div>
              </div>
              <div>
                <Label>Compliance Status</Label>
                <Textarea
                  value={form.complianceStatus}
                  onChange={(e) => setForm((p) => ({ ...p, complianceStatus: e.target.value }))}
                  rows={2}
                  placeholder="Regulatory compliance status..."
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Review Outputs (Clause 9.3.3)
                </p>
              </div>
              <div>
                <Label>Decisions</Label>
                <Textarea
                  value={form.decisions}
                  onChange={(e) => setForm((p) => ({ ...p, decisions: e.target.value }))}
                  rows={2}
                  placeholder="Decisions and directions..."
                />
              </div>
              <div>
                <Label>Actions</Label>
                <Textarea
                  value={form.actions}
                  onChange={(e) => setForm((p) => ({ ...p, actions: e.target.value }))}
                  rows={2}
                  placeholder="Action items arising..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minutes URL</Label>
                  <Input
                    value={form.minutesUrl}
                    onChange={(e) => setForm((p) => ({ ...p, minutesUrl: e.target.value }))}
                    placeholder="Link to meeting minutes"
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
                  'Update Review'
                ) : (
                  'Create Review'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
