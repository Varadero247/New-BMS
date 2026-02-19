'use client';

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
} from '@ims/ui';
import { Plus, Search, GitBranch, Edit, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

interface HaccpStep {
  id: string;
  step?: number;
  stepNumber?: number;
  processStep?: string;
  title?: string;
  name?: string;
  hazards?: string;
  controlMeasures?: string;
  isCCP?: boolean;
  criticalLimit?: string;
  monitoringProcedure?: string;
  correctiveAction?: string;
  verificationProcedure?: string;
  recordKeeping?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const initialForm = {
  processStep: '',
  stepNumber: '',
  isCCP: 'false',
  hazards: '',
  controlMeasures: '',
  criticalLimit: '',
  monitoringProcedure: '',
  correctiveAction: '',
  verificationProcedure: '',
  recordKeeping: '',
  notes: '',
  status: 'ACTIVE',
};

export default function HaccpFlowPage() {
  const [items, setItems] = useState<HaccpStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HaccpStep | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/haccp-flow');
      const data = res.data.data || [];
      setItems(
        data.sort(
          (a: HaccpStep, b: HaccpStep) =>
            (a.step || a.stepNumber || 0) - (b.step || b.stepNumber || 0)
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }
  function openEdit(r: HaccpStep) {
    setEditing(r);
    setForm({
      processStep: r.processStep || r.title || r.name || '',
      stepNumber: (r.step || r.stepNumber || '').toString(),
      isCCP: r.isCCP ? 'true' : 'false',
      hazards: r.hazards || '',
      controlMeasures: r.controlMeasures || '',
      criticalLimit: r.criticalLimit || '',
      monitoringProcedure: r.monitoringProcedure || '',
      correctiveAction: r.correctiveAction || '',
      verificationProcedure: r.verificationProcedure || '',
      recordKeeping: r.recordKeeping || '',
      notes: r.notes || '',
      status: r.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.processStep.trim()) {
      setFormError('Process step is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        processStep: form.processStep,
        isCCP: form.isCCP === 'true',
        status: form.status,
      };
      if (form.stepNumber) payload.stepNumber = parseInt(form.stepNumber);
      if (form.hazards) payload.hazards = form.hazards;
      if (form.controlMeasures) payload.controlMeasures = form.controlMeasures;
      if (form.criticalLimit) payload.criticalLimit = form.criticalLimit;
      if (form.monitoringProcedure) payload.monitoringProcedure = form.monitoringProcedure;
      if (form.correctiveAction) payload.correctiveAction = form.correctiveAction;
      if (form.verificationProcedure) payload.verificationProcedure = form.verificationProcedure;
      if (form.recordKeeping) payload.recordKeeping = form.recordKeeping;
      if (form.notes) payload.notes = form.notes;
      if (editing) {
        await api.put(`/haccp-flow/${editing.id}`, payload);
      } else {
        await api.post('/haccp-flow', payload);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setFormError((e as any)?.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this HACCP step?')) return;
    try {
      await api.delete(`/haccp-flow/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const name = i.processStep || i.title || i.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const ccps = items.filter((i) => i.isCCP);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">HACCP Flow</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Process flow diagram and critical control point mapping
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Process Steps</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <GitBranch className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CCPs Identified</p>
                  <p className="text-2xl font-bold text-red-600">{ccps.length}</p>
                </div>
                <GitBranch className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Non-CCPs</p>
                  <p className="text-2xl font-bold text-blue-600">{items.length - ccps.length}</p>
                </div>
                <GitBranch className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search process steps..."
                placeholder="Search process steps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Flow visualization */}
        {!loading && filtered.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Process Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {filtered.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 ${step.isCCP ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300 bg-white dark:bg-gray-900 text-gray-700'}`}
                    >
                      <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
                        #{step.step || step.stepNumber || idx + 1}
                      </span>
                      {step.processStep || step.title || step.name}
                      {step.isCCP && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                          CCP
                        </span>
                      )}
                    </div>
                    {idx < filtered.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-orange-600" />
              HACCP Steps ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Process Step
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        CCP?
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Hazards
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Critical Limit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => (
                      <tr
                        key={r.id}
                        className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${r.isCCP ? 'bg-red-50' : ''}`}
                      >
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 font-mono">
                          {r.step || r.stepNumber || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {r.processStep || r.title || r.name || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {r.isCCP ? (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                              CCP
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              No
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-xs">
                          {r.hazards || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.criticalLimit || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              r.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No HACCP steps defined</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit HACCP Step' : 'Add HACCP Step'}
        size="lg"
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Process Step *</label>
              <input
                value={form.processStep}
                onChange={(e) => setForm({ ...form, processStep: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Pasteurisation, Cooling, Packaging"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Step Number</label>
              <input
                type="number"
                value={form.stepNumber}
                onChange={(e) => setForm({ ...form, stepNumber: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Is this a CCP?</label>
              <select
                value={form.isCCP}
                onChange={(e) => setForm({ ...form, isCCP: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="false">No — Control Point</option>
                <option value="true">Yes — Critical Control Point (CCP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hazards</label>
            <textarea
              value={form.hazards}
              onChange={(e) => setForm({ ...form, hazards: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="Biological, chemical, physical hazards at this step"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Control Measures</label>
            <textarea
              value={form.controlMeasures}
              onChange={(e) => setForm({ ...form, controlMeasures: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          {form.isCCP === 'true' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Critical Limit</label>
                <input
                  value={form.criticalLimit}
                  onChange={(e) => setForm({ ...form, criticalLimit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  placeholder="e.g. ≥72°C for 15 seconds"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monitoring Procedure</label>
                <textarea
                  value={form.monitoringProcedure}
                  onChange={(e) => setForm({ ...form, monitoringProcedure: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Corrective Action</label>
                <textarea
                  value={form.correctiveAction}
                  onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Verification Procedure</label>
                <textarea
                  value={form.verificationProcedure}
                  onChange={(e) => setForm({ ...form, verificationProcedure: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
