'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import {
  Plus,
  Search,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  Users,
  Clock,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface SequenceStep {
  id?: string;
  stepNumber: number;
  type: string;
  subject?: string;
  body?: string;
  delayDays: number;
}

interface Sequence {
  id: string;
  name: string;
  description?: string;
  status: string;
  stepsCount?: number;
  enrolledCount?: number;
  completedCount?: number;
  openRate?: number;
  replyRate?: number;
  steps?: SequenceStep[];
  _count?: { steps?: number; enrollments?: number };
  createdAt: string;
  updatedAt?: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

const stepTypeLabels: Record<string, string> = {
  EMAIL: 'Email',
  WAIT: 'Wait',
  TASK: 'Task',
  LINKEDIN: 'LinkedIn',
  CALL: 'Call',
};

const stepTypeColors: Record<string, string> = {
  EMAIL: 'bg-blue-100 text-blue-700',
  WAIT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  TASK: 'bg-amber-100 text-amber-700',
  LINKEDIN: 'bg-indigo-100 text-indigo-700',
  CALL: 'bg-green-100 text-green-700',
};

const emptyStep: SequenceStep = {
  stepNumber: 1,
  type: 'EMAIL',
  subject: '',
  body: '',
  delayDays: 1,
};

const initialFormState = {
  name: '',
  description: '',
};

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSequence, setViewSequence] = useState<Sequence | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState(initialFormState);
  const [steps, setSteps] = useState<SequenceStep[]>([{ ...emptyStep }]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSequences();
  }, []);

  async function loadSequences() {
    try {
      setError(null);
      const res = await api.get('/sequences');
      setSequences(res.data.data || []);
    } catch {
      setError('Failed to load email sequences.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function addStep() {
    setSteps((prev) => [...prev, { ...emptyStep, stepNumber: prev.length + 1 }]);
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return;
    setSteps((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  }

  function updateStep(index: number, field: keyof SequenceStep, value: string | number) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function openCreateModal() {
    setFormData(initialFormState);
    setSteps([{ ...emptyStep }]);
    setFormError('');
    setCreateModalOpen(true);
  }

  async function openEditModal(seq: Sequence) {
    setFormData({ name: seq.name, description: seq.description || '' });
    setEditingId(seq.id);
    setFormError('');
    // Load full sequence details with steps
    try {
      const res = await api.get(`/sequences/${seq.id}`);
      const data = res.data.data;
      setSteps(
        data.steps && data.steps.length > 0
          ? data.steps.map((s: SequenceStep, i: number) => ({
              stepNumber: s.stepNumber || i + 1,
              type: s.type || 'EMAIL',
              subject: s.subject || '',
              body: s.body || '',
              delayDays: s.delayDays ?? 1,
            }))
          : [{ ...emptyStep }]
      );
    } catch {
      setSteps([{ ...emptyStep }]);
    }
    setEditModalOpen(true);
  }

  async function openViewModal(seq: Sequence) {
    setViewSequence(seq);
    setViewModalOpen(true);
    try {
      const res = await api.get(`/sequences/${seq.id}`);
      setViewSequence(res.data.data);
    } catch {
      // keep existing data
    }
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Sequence name is required');
      return;
    }
    const validSteps = steps.filter((s) => s.type);
    if (validSteps.length === 0) {
      setFormError('At least one step is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/sequences', {
        name: formData.name,
        description: formData.description || undefined,
        steps: validSteps.map((s) => ({
          stepNumber: s.stepNumber,
          type: s.type,
          subject: s.subject || undefined,
          body: s.body || undefined,
          delayDays: Number(s.delayDays) || 1,
        })),
      });
      setCreateModalOpen(false);
      loadSequences();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to create sequence.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Sequence name is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/sequences/${editingId}`, {
        name: formData.name,
        description: formData.description || undefined,
        steps: steps.map((s) => ({
          stepNumber: s.stepNumber,
          type: s.type,
          subject: s.subject || undefined,
          body: s.body || undefined,
          delayDays: Number(s.delayDays) || 1,
        })),
      });
      setEditModalOpen(false);
      loadSequences();
    } catch (err) {
      setFormError((axios.isAxiosError(err) && err.response?.data?.error?.message) || 'Failed to update sequence.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this sequence?')) return;
    try {
      await api.delete(`/sequences/${id}`);
      loadSequences();
    } catch (err) {
      console.error('Error deleting sequence:', err);
    }
  }

  async function handleActivate(id: string) {
    try {
      await api.patch(`/sequences/${id}/activate`);
      loadSequences();
    } catch (err) {
      console.error('Error activating sequence:', err);
    }
  }

  async function handlePause(id: string) {
    try {
      await api.patch(`/sequences/${id}/pause`);
      loadSequences();
    } catch (err) {
      console.error('Error pausing sequence:', err);
    }
  }

  const filteredSequences = sequences.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary stats
  const totalActive = sequences.filter((s) => s.status === 'ACTIVE').length;
  const totalEnrolled = sequences.reduce(
    (sum, s) => sum + (s.enrolledCount || s._count?.enrollments || 0),
    0
  );
  const _avgOpenRate =
    sequences.length > 0
      ? sequences.reduce((sum, s) => sum + (s.openRate || 0), 0) / sequences.length
      : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Email Sequences</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Automated multi-step email outreach campaigns
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New Sequence
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Sequences</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalActive}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalEnrolled}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Mail className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Sequences</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {sequences.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search sequences..."
                    placeholder="Search sequences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sequences Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-600" />
              Sequences ({filteredSequences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSequences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Steps
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Enrolled
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Completed
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Open Rate
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSequences.map((seq) => (
                      <tr key={seq.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {seq.name}
                            </p>
                            {seq.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {seq.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              statusColors[seq.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {seq.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {seq.stepsCount || seq._count?.steps || 0}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {seq.enrolledCount || seq._count?.enrollments || 0}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-600">
                          {seq.completedCount || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {seq.openRate !== undefined ? (
                            <span
                              className={`font-medium ${seq.openRate >= 30 ? 'text-green-600' : seq.openRate >= 15 ? 'text-amber-600' : 'text-gray-600'}`}
                            >
                              {seq.openRate.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(seq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openViewModal(seq)}
                              className="text-gray-400 dark:text-gray-500 hover:text-violet-600 p-1"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {seq.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handlePause(seq.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-yellow-600 p-1"
                                title="Pause sequence"
                              >
                                <Pause className="h-4 w-4" />
                              </button>
                            ) : seq.status === 'DRAFT' || seq.status === 'PAUSED' ? (
                              <button
                                onClick={() => handleActivate(seq.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-green-600 p-1"
                                title="Activate sequence"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            ) : null}
                            <button
                              onClick={() => openEditModal(seq)}
                              className="text-gray-400 dark:text-gray-500 hover:text-violet-600 p-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(seq.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">No email sequences found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Create your first automated outreach sequence
                </p>
                <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" /> Create Sequence
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Email Sequence"
        size="full"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="name">Sequence Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Cold Outreach - Enterprise"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this sequence for?"
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Steps Builder */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Sequence Steps</Label>
              <button
                onClick={addStep}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <select
                        value={step.type}
                        onChange={(e) => updateStep(idx, 'type', e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="WAIT">Wait</option>
                        <option value="TASK">Task</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="CALL">Call</option>
                      </select>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        Wait
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={step.delayDays}
                          onChange={(e) =>
                            updateStep(idx, 'delayDays', parseInt(e.target.value) || 0)
                          }
                          className="w-14 border rounded px-2 py-0.5 text-sm text-center"
                        />
                        days before this step
                      </div>
                    </div>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {step.type === 'EMAIL' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={step.subject || ''}
                        onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                        placeholder="Email subject line..."
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
                      />
                      <textarea
                        value={step.body || ''}
                        onChange={(e) => updateStep(idx, 'body', e.target.value)}
                        placeholder="Email body... (Use {{firstName}}, {{company}} for personalization)"
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}
                  {(step.type === 'TASK' || step.type === 'LINKEDIN' || step.type === 'CALL') && (
                    <textarea
                      value={step.body || ''}
                      onChange={(e) => updateStep(idx, 'body', e.target.value)}
                      placeholder={`${stepTypeLabels[step.type]} instructions or notes...`}
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Sequence'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Sequence"
        size="full"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="e-name">Sequence Name *</Label>
            <Input id="e-name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="e-description">Description</Label>
            <textarea
              id="e-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Sequence Steps</Label>
              <button
                onClick={addStep}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <select
                        value={step.type}
                        onChange={(e) => updateStep(idx, 'type', e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="WAIT">Wait</option>
                        <option value="TASK">Task</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="CALL">Call</option>
                      </select>
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={step.delayDays}
                          onChange={(e) =>
                            updateStep(idx, 'delayDays', parseInt(e.target.value) || 0)
                          }
                          className="w-14 border rounded px-2 py-0.5 text-sm text-center"
                        />
                        days delay
                      </div>
                    </div>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(idx)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {step.type === 'EMAIL' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={step.subject || ''}
                        onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                        placeholder="Email subject line..."
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <textarea
                        value={step.body || ''}
                        onChange={(e) => updateStep(idx, 'body', e.target.value)}
                        placeholder="Email body..."
                        rows={3}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  {(step.type === 'TASK' || step.type === 'LINKEDIN' || step.type === 'CALL') && (
                    <textarea
                      value={step.body || ''}
                      onChange={(e) => updateStep(idx, 'body', e.target.value)}
                      placeholder="Instructions or notes..."
                      rows={2}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={viewSequence?.name || 'Sequence Details'}
        size="lg"
      >
        {viewSequence && (
          <div className="space-y-5">
            {/* Status & Meta */}
            <div className="flex items-center gap-3">
              <Badge
                className={
                  statusColors[viewSequence.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                }
              >
                {viewSequence.status}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created {new Date(viewSequence.createdAt).toLocaleDateString()}
              </span>
            </div>
            {viewSequence.description && (
              <p className="text-gray-600 text-sm">{viewSequence.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {viewSequence.stepsCount || viewSequence._count?.steps || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Steps</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {viewSequence.enrolledCount || viewSequence._count?.enrollments || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enrolled</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {viewSequence.completedCount || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
              </div>
            </div>

            {/* Steps */}
            {viewSequence.steps && viewSequence.steps.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Sequence Steps
                </h3>
                <div className="space-y-2">
                  {viewSequence.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {step.stepNumber || idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              stepTypeColors[step.type] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {stepTypeLabels[step.type] || step.type}
                          </Badge>
                          {step.delayDays > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {step.delayDays}d delay
                            </span>
                          )}
                        </div>
                        {step.subject && (
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {step.subject}
                          </p>
                        )}
                        {step.body && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{step.body}</p>
                        )}
                      </div>
                      <CheckCircle className="h-4 w-4 text-gray-200 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
          {viewSequence && (
            <Button
              onClick={() => {
                setViewModalOpen(false);
                openEditModal(viewSequence);
              }}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" /> Edit
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
