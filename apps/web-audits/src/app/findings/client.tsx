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
import { Plus, AlertCircle, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const SEVERITIES = ['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED', 'OVERDUE'] as const;

interface Finding {
  id: string;
  referenceNumber: string;
  auditId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  clauseRef: string;
  evidence: string;
  rootCause: string;
  correctiveAction: string;
  assigneeName: string;
  dueDate: string;
  closedDate: string;
  createdAt: string;
}

interface FindingForm {
  auditId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  clauseRef: string;
  evidence: string;
  rootCause: string;
  correctiveAction: string;
  assigneeName: string;
  dueDate: string;
  notes: string;
}

const emptyForm: FindingForm = {
  auditId: '',
  title: '',
  description: '',
  severity: 'MINOR_NC',
  status: 'OPEN',
  clauseRef: '',
  evidence: '',
  rootCause: '',
  correctiveAction: '',
  assigneeName: '',
  dueDate: '',
  notes: '',
};

function severityColor(severity: string) {
  switch (severity) {
    case 'MAJOR_NC':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'MINOR_NC':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'OBSERVATION':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'OPPORTUNITY':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'POSITIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

function statusVariant(status: string) {
  switch (status) {
    case 'CLOSED':
    case 'VERIFIED':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'OVERDUE':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function FindingsClient() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FindingForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadFindings = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/findings', { params });
      setFindings(response.data.data || []);
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadFindings();
  }, [loadFindings]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(finding: Finding) {
    setForm({
      auditId: finding.auditId || '',
      title: finding.title,
      description: finding.description || '',
      severity: finding.severity || 'MINOR_NC',
      status: finding.status || 'OPEN',
      clauseRef: finding.clauseRef || '',
      evidence: finding.evidence || '',
      rootCause: finding.rootCause || '',
      correctiveAction: finding.correctiveAction || '',
      assigneeName: finding.assigneeName || '',
      dueDate: finding.dueDate ? finding.dueDate.split('T')[0] : '',
      notes: '',
    });
    setEditId(finding.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.auditId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/findings/${editId}`, payload);
      } else {
        await api.post('/findings', payload);
      }
      setModalOpen(false);
      loadFindings();
    } catch (err) {
      console.error('Failed to save finding:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this finding?')) return;
    try {
      await api.delete(`/findings/${id}`);
      loadFindings();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Audit Findings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Non-conformances, observations, and opportunities
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Log Finding
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{findings.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Findings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">
                {findings.filter((f) => f.severity === 'MAJOR_NC').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Major NCs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {findings.filter((f) => f.severity === 'MINOR_NC').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minor NCs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {findings.filter((f) => f.status === 'CLOSED' || f.status === 'VERIFIED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed / Verified</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search findings"
              placeholder="Search findings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            ) : findings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Clause</TableHead>
                      <TableHead>Assignee</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell className="font-mono text-xs">
                          {finding.referenceNumber}
                        </TableCell>
                        <TableCell className="font-medium">{finding.title}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${severityColor(finding.severity)}`}
                          >
                            {finding.severity?.replace(/_/g, ' ') || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {finding.clauseRef || '-'}
                        </TableCell>
                        <TableCell className="text-sm">{finding.assigneeName || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(finding.status)}>
                            {finding.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(finding)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(finding.id)}
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
                <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No findings recorded</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Finding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Finding' : 'Log Finding'}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <Label>Audit ID *</Label>
                <Input
                  value={form.auditId}
                  onChange={(e) => setForm((p) => ({ ...p, auditId: e.target.value }))}
                  placeholder="Audit ID (UUID)"
                />
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Finding title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Select
                    value={form.severity}
                    onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
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
                  placeholder="Describe the finding..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Clause Reference</Label>
                  <Input
                    value={form.clauseRef}
                    onChange={(e) => setForm((p) => ({ ...p, clauseRef: e.target.value }))}
                    placeholder="e.g. 7.1.2"
                  />
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Input
                    value={form.assigneeName}
                    onChange={(e) => setForm((p) => ({ ...p, assigneeName: e.target.value }))}
                    placeholder="Assigned to"
                  />
                </div>
              </div>
              <div>
                <Label>Evidence</Label>
                <Textarea
                  value={form.evidence}
                  onChange={(e) => setForm((p) => ({ ...p, evidence: e.target.value }))}
                  rows={2}
                  placeholder="Evidence of the finding..."
                />
              </div>
              <div>
                <Label>Root Cause</Label>
                <Textarea
                  value={form.rootCause}
                  onChange={(e) => setForm((p) => ({ ...p, rootCause: e.target.value }))}
                  rows={2}
                  placeholder="Root cause analysis..."
                />
              </div>
              <div>
                <Label>Corrective Action</Label>
                <Textarea
                  value={form.correctiveAction}
                  onChange={(e) => setForm((p) => ({ ...p, correctiveAction: e.target.value }))}
                  rows={2}
                  placeholder="Proposed corrective action..."
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
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
              <Button onClick={handleSubmit} disabled={saving || !form.title || !form.auditId}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : editId ? (
                  'Update Finding'
                ) : (
                  'Log Finding'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
