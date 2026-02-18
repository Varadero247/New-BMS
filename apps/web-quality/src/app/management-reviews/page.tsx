'use client';

export const dynamic = 'force-dynamic';

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
} from '@ims/ui';
import { Plus, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ManagementReview {
  id: string;
  referenceNumber: string;
  title: string;
  meetingDate: string;
  chairperson: string | null;
  attendees: string | null;
  status: string;
  previousActions: string | null;
  changesInContext: string | null;
  customerFeedback: string | null;
  qualityObjectives: string | null;
  processPerformance: string | null;
  nonconformanceSummary: string | null;
  auditResults: string | null;
  supplierPerformance: string | null;
  resourceAdequacy: string | null;
  riskAssessment: string | null;
  improvements: string | null;
  resourceNeeds: string | null;
  decisions: string | null;
  actionItems: string | null;
  nextReviewDate: string | null;
  minutes: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const statusColors: Record<string, string> = {
  PLANNED: 'info',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export default function ManagementReviewsPage() {
  const [items, setItems] = useState<ManagementReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ManagementReview | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editItem, setEditItem] = useState<ManagementReview | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  const [form, setForm] = useState({
    title: '',
    meetingDate: '',
    chairperson: '',
    attendees: '',
    previousActions: '',
    changesInContext: '',
    customerFeedback: '',
    qualityObjectives: '',
    processPerformance: '',
    nonconformanceSummary: '',
    auditResults: '',
    supplierPerformance: '',
    resourceAdequacy: '',
    riskAssessment: '',
    improvements: '',
    resourceNeeds: '',
    decisions: '',
    actionItems: '',
    nextReviewDate: '',
    minutes: '',
    notes: '',
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '25' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/management-reviews', { params });
      setItems(res.data.data);
      setPagination((p) => ({
        ...p,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      }));
    } catch {
      /* empty */
    }
    setLoading(false);
  }, [pagination.page, search, filterStatus]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    setForm({
      title: '',
      meetingDate: '',
      chairperson: '',
      attendees: '',
      previousActions: '',
      changesInContext: '',
      customerFeedback: '',
      qualityObjectives: '',
      processPerformance: '',
      nonconformanceSummary: '',
      auditResults: '',
      supplierPerformance: '',
      resourceAdequacy: '',
      riskAssessment: '',
      improvements: '',
      resourceNeeds: '',
      decisions: '',
      actionItems: '',
      nextReviewDate: '',
      minutes: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEdit = (item: ManagementReview) => {
    setEditItem(item);
    setForm({
      title: item.title,
      meetingDate: item.meetingDate?.slice(0, 10) || '',
      chairperson: item.chairperson || '',
      attendees: item.attendees || '',
      previousActions: item.previousActions || '',
      changesInContext: item.changesInContext || '',
      customerFeedback: item.customerFeedback || '',
      qualityObjectives: item.qualityObjectives || '',
      processPerformance: item.processPerformance || '',
      nonconformanceSummary: item.nonconformanceSummary || '',
      auditResults: item.auditResults || '',
      supplierPerformance: item.supplierPerformance || '',
      resourceAdequacy: item.resourceAdequacy || '',
      riskAssessment: item.riskAssessment || '',
      improvements: item.improvements || '',
      resourceNeeds: item.resourceNeeds || '',
      decisions: item.decisions || '',
      actionItems: item.actionItems || '',
      nextReviewDate: item.nextReviewDate?.slice(0, 10) || '',
      minutes: item.minutes || '',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.put(`/management-reviews/${editItem.id}`, form);
      } else {
        await api.post('/management-reviews', form);
      }
      setModalOpen(false);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.put(`/management-reviews/${id}/complete`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this management review?')) return;
    try {
      await api.delete(`/management-reviews/${id}`);
      fetchItems();
    } catch {
      /* empty */
    }
  };

  const viewDetail = (item: ManagementReview) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Management Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 §9.3 — Management review
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {items.filter((i) => i.status === 'PLANNED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Planned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter((i) => i.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {items.filter((i) => i.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            aria-label="Search reviews..."
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button variant="outline" onClick={fetchItems}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Reference
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Meeting Date
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Chairperson
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Next Review
                  </th>
                  <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No management reviews found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:bg-gray-800 cursor-pointer"
                      onClick={() => viewDetail(item)}
                    >
                      <td className="p-3 font-mono text-xs text-blue-600">
                        {item.referenceNumber}
                      </td>
                      <td className="p-3 font-medium">{item.title}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(item.meetingDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-600">{item.chairperson || '—'}</td>
                      <td className="p-3">
                        <Badge variant={statusColors[item.status] as any}>
                          {item.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-600">
                        {item.nextReviewDate
                          ? new Date(item.nextReviewDate).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
                            <Button size="sm" onClick={() => handleComplete(item.id)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Management Review' : 'Schedule Management Review'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>Meeting Date *</Label>
              <Input
                type="date"
                value={form.meetingDate}
                onChange={(e) => setForm((f) => ({ ...f, meetingDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Chairperson</Label>
              <Input
                value={form.chairperson}
                onChange={(e) => setForm((f) => ({ ...f, chairperson: e.target.value }))}
              />
            </div>
            <div>
              <Label>Next Review Date</Label>
              <Input
                type="date"
                value={form.nextReviewDate}
                onChange={(e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Attendees</Label>
            <Textarea
              value={form.attendees}
              onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))}
              rows={2}
            />
          </div>

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pt-2">
            §9.3.2 Review Inputs
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Previous Actions Status</Label>
              <Textarea
                value={form.previousActions}
                onChange={(e) => setForm((f) => ({ ...f, previousActions: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Changes in Context</Label>
              <Textarea
                value={form.changesInContext}
                onChange={(e) => setForm((f) => ({ ...f, changesInContext: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Customer Feedback</Label>
              <Textarea
                value={form.customerFeedback}
                onChange={(e) => setForm((f) => ({ ...f, customerFeedback: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Quality Objectives</Label>
              <Textarea
                value={form.qualityObjectives}
                onChange={(e) => setForm((f) => ({ ...f, qualityObjectives: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Process Performance</Label>
              <Textarea
                value={form.processPerformance}
                onChange={(e) => setForm((f) => ({ ...f, processPerformance: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>NC Summary</Label>
              <Textarea
                value={form.nonconformanceSummary}
                onChange={(e) => setForm((f) => ({ ...f, nonconformanceSummary: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Audit Results</Label>
              <Textarea
                value={form.auditResults}
                onChange={(e) => setForm((f) => ({ ...f, auditResults: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Supplier Performance</Label>
              <Textarea
                value={form.supplierPerformance}
                onChange={(e) => setForm((f) => ({ ...f, supplierPerformance: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider pt-2">
            §9.3.3 Review Outputs
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Improvements</Label>
              <Textarea
                value={form.improvements}
                onChange={(e) => setForm((f) => ({ ...f, improvements: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Resource Needs</Label>
              <Textarea
                value={form.resourceNeeds}
                onChange={(e) => setForm((f) => ({ ...f, resourceNeeds: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Decisions</Label>
              <Textarea
                value={form.decisions}
                onChange={(e) => setForm((f) => ({ ...f, decisions: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Action Items</Label>
              <Textarea
                value={form.actionItems}
                onChange={(e) => setForm((f) => ({ ...f, actionItems: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <div>
            <Label>Minutes</Label>
            <Textarea
              value={form.minutes}
              onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))}
              rows={4}
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editItem ? 'Update' : 'Schedule'}</Button>
        </ModalFooter>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailItem?.title || 'Review Details'}
        size="lg"
      >
        {detailItem && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Reference:</strong> {detailItem.referenceNumber}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge variant={statusColors[detailItem.status] as any}>{detailItem.status}</Badge>
              </div>
              <div>
                <strong>Meeting Date:</strong>{' '}
                {new Date(detailItem.meetingDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Chairperson:</strong> {detailItem.chairperson || '—'}
              </div>
            </div>
            {detailItem.attendees && (
              <div>
                <strong>Attendees:</strong>
                <p className="text-gray-600 mt-1">{detailItem.attendees}</p>
              </div>
            )}
            {detailItem.decisions && (
              <div>
                <strong>Key Decisions:</strong>
                <p className="text-gray-600 mt-1">{detailItem.decisions}</p>
              </div>
            )}
            {detailItem.actionItems && (
              <div>
                <strong>Action Items:</strong>
                <p className="text-gray-600 mt-1">{detailItem.actionItems}</p>
              </div>
            )}
            {detailItem.improvements && (
              <div>
                <strong>Improvements:</strong>
                <p className="text-gray-600 mt-1">{detailItem.improvements}</p>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
