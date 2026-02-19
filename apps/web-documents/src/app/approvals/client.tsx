'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
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
  TableCell } from '@ims/ui';
import { Plus, CheckCircle2, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

interface Approval {
  id: string;
  documentId: string;
  approver: string;
  approverName: string;
  status: string;
  comments: string;
  decidedAt: string;
  createdAt: string;
}

interface ApprovalForm {
  documentId: string;
  approver: string;
  approverName: string;
  status: string;
  comments: string;
  decidedAt: string;
}

const emptyForm: ApprovalForm = {
  documentId: '',
  approver: '',
  approverName: '',
  status: 'PENDING',
  comments: '',
  decidedAt: '' };

function getApprovalStatusColor(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function ApprovalsClient() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ApprovalForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadApprovals = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/approvals', { params });
      setApprovals(response.data.data || []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(approval: Approval) {
    setForm({
      documentId: approval.documentId || '',
      approver: approval.approver || '',
      approverName: approval.approverName || '',
      status: approval.status || 'PENDING',
      comments: approval.comments || '',
      decidedAt: approval.decidedAt ? approval.decidedAt.split('T')[0] : '' });
    setEditId(approval.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.documentId || !form.approver) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        decidedAt: form.decidedAt ? new Date(form.decidedAt).toISOString() : undefined };
      if (editId) {
        await api.put(`/approvals/${editId}`, payload);
      } else {
        await api.post('/approvals', payload);
      }
      setModalOpen(false);
      loadApprovals();
    } catch (err) {
      console.error('Failed to save approval:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this approval?')) return;
    try {
      await api.delete(`/approvals/${id}`);
      loadApprovals();
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
              Document Approvals
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Review and approve document changes
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Request Approval
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{approvals.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {approvals.filter((a) => a.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {approvals.filter((a) => a.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {approvals.filter((a) => a.status === 'REJECTED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search approvals"
              placeholder="Search approvals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
                {s}
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
            ) : approvals.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Decided At</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((approval) => (
                      <TableRow key={approval.id}>
                        <TableCell className="font-mono text-xs">
                          {approval.documentId?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {approval.approverName || approval.approver?.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(approval.status)}`}
                          >
                            {approval.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {approval.comments || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {approval.decidedAt
                            ? new Date(approval.decidedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {approval.createdAt
                            ? new Date(approval.createdAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(approval)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(approval.id)}
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
                <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No approvals found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request First Approval
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Approval' : 'Request Approval'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Document ID *</Label>
                <Input
                  value={form.documentId}
                  onChange={(e) => setForm((p) => ({ ...p, documentId: e.target.value }))}
                  placeholder="Document UUID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Approver ID *</Label>
                  <Input
                    value={form.approver}
                    onChange={(e) => setForm((p) => ({ ...p, approver: e.target.value }))}
                    placeholder="Approver user ID"
                  />
                </div>
                <div>
                  <Label>Approver Name</Label>
                  <Input
                    value={form.approverName}
                    onChange={(e) => setForm((p) => ({ ...p, approverName: e.target.value }))}
                    placeholder="Approver name"
                  />
                </div>
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
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Decided At</Label>
                  <Input
                    type="date"
                    value={form.decidedAt}
                    onChange={(e) => setForm((p) => ({ ...p, decidedAt: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Comments</Label>
                <Textarea
                  value={form.comments}
                  onChange={(e) => setForm((p) => ({ ...p, comments: e.target.value }))}
                  rows={3}
                  placeholder="Review comments..."
                />
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !form.documentId || !form.approver}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Approval'
                ) : (
                  'Submit Approval'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
