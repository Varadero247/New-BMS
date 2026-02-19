'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import {
  Plus,
  Search,
  ClipboardCheck,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Audit {
  id: string;
  title: string;
  type: string;
  scope: string;
  auditor: string;
  auditLead?: string;
  scheduledDate: string;
  completedDate?: string;
  findings: number;
  criticalFindings?: number;
  status: string;
  framework?: string;
  description?: string;
}

type FormData = Omit<Audit, 'id'>;

const statusColors: Record<string, string> = {
  PLANNED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
  OVERDUE: 'bg-red-100 text-red-700',
};

const typeColors: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-purple-100 text-purple-700',
  THIRD_PARTY: 'bg-orange-100 text-orange-700',
  REGULATORY: 'bg-red-100 text-red-700',
  CERTIFICATION: 'bg-emerald-100 text-emerald-700',
};

const frameworkColors: Record<string, string> = {
  GRI: 'bg-green-100 text-green-700',
  TCFD: 'bg-blue-100 text-blue-700',
  SASB: 'bg-purple-100 text-purple-700',
  CDP: 'bg-emerald-100 text-emerald-700',
  CSRD: 'bg-orange-100 text-orange-700',
  ISO14001: 'bg-teal-100 text-teal-700',
  ISO45001: 'bg-yellow-100 text-yellow-700',
  GENERAL: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const empty: FormData = {
  title: '',
  type: 'INTERNAL',
  scope: '',
  auditor: '',
  auditLead: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  completedDate: '',
  findings: 0,
  criticalFindings: 0,
  status: 'PLANNED',
  framework: 'GENERAL',
  description: '',
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Audit | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  async function loadAudits() {
    try {
      const res = await api.get('/audits');
      setAudits(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  }
  function openEdit(a: Audit) {
    setEditing(a);
    setForm({
      title: a.title,
      type: a.type,
      scope: a.scope,
      auditor: a.auditor,
      auditLead: a.auditLead || '',
      scheduledDate: a.scheduledDate?.split('T')[0] || '',
      completedDate: a.completedDate?.split('T')[0] || '',
      findings: a.findings || 0,
      criticalFindings: a.criticalFindings || 0,
      status: a.status,
      framework: a.framework || 'GENERAL',
      description: a.description || '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/audits/${editing.id}`, form);
        setAudits((prev) => prev.map((a) => (a.id === editing.id ? res.data.data : a)));
      } else {
        const res = await api.post('/audits', form);
        setAudits((prev) => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/audits/${id}`);
      setAudits((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  const today = new Date();

  const filtered = audits.filter((a) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const completed = audits.filter((a) => a.status === 'COMPLETED').length;
  const _inProgress = audits.filter((a) => a.status === 'IN_PROGRESS').length;
  const overdue = audits.filter(
    (a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && new Date(a.scheduledDate) < today
  ).length;
  const totalFindings = audits.reduce((s, a) => s + (a.findings || 0), 0);

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">ESG Audits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Plan, schedule, and track ESG audits and assessments across all frameworks
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Schedule Audit
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Audits',
              value: audits.length,
              color: 'text-gray-800',
              bg: 'bg-gray-50 dark:bg-gray-800',
            },
            { label: 'Completed', value: completed, color: 'text-green-700', bg: 'bg-green-50' },
            {
              label: 'Overdue',
              value: overdue,
              color: overdue > 0 ? 'text-red-700' : 'text-gray-500 dark:text-gray-400',
              bg: overdue > 0 ? 'bg-red-50' : 'bg-gray-50 dark:bg-gray-800',
            },
            {
              label: 'Total Findings',
              value: totalFindings,
              color: 'text-orange-700',
              bg: 'bg-orange-50',
            },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
                  {c.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming audits banner */}
        {audits.filter((a) => a.status === 'PLANNED' && new Date(a.scheduledDate) >= today).length >
          0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">Upcoming Audits</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {audits
                .filter((a) => a.status === 'PLANNED' && new Date(a.scheduledDate) >= today)
                .slice(0, 4)
                .map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-900 border border-blue-200 rounded-full text-xs text-blue-700"
                  >
                    <Clock className="h-3 w-3" />
                    {a.title} — {new Date(a.scheduledDate).toLocaleDateString()}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Overdue audits banner */}
        {overdue > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {overdue} overdue audit{overdue > 1 ? 's' : ''} require attention
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                These audits are past their scheduled date and have not been completed.
              </p>
            </div>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search audits..."
                  placeholder="Search audits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Types</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="THIRD_PARTY">Third Party</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="CERTIFICATION">Certification</option>
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-600" />
              Audits ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Audit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Framework
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Auditor
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Scheduled
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Findings
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
                    {filtered.map((a) => {
                      const isOverdue =
                        a.status !== 'COMPLETED' &&
                        a.status !== 'CANCELLED' &&
                        new Date(a.scheduledDate) < today;
                      return (
                        <tr
                          key={a.id}
                          className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${isOverdue ? 'bg-red-50/40' : ''}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {isOverdue && (
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {a.title}
                                </p>
                                {a.scope && (
                                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs">
                                    {a.scope}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColors[a.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {a.type?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${frameworkColors[a.framework || 'GENERAL'] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {a.framework || 'GENERAL'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <p>{a.auditor}</p>
                            {a.auditLead && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Lead: {a.auditLead}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <p className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {a.scheduledDate
                                ? new Date(a.scheduledDate).toLocaleDateString()
                                : '-'}
                            </p>
                            {a.completedDate && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Done: {new Date(a.completedDate).toLocaleDateString()}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`font-semibold ${(a.findings || 0) > 0 ? 'text-orange-600' : 'text-gray-500 dark:text-gray-400'}`}
                              >
                                {a.findings || 0}
                              </span>
                              {(a.criticalFindings || 0) > 0 && (
                                <span className="text-xs text-red-600">
                                  {a.criticalFindings} critical
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-700' : statusColors[a.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {a.status === 'COMPLETED' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : isOverdue ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {isOverdue ? 'OVERDUE' : a.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEdit(a)}
                                className="text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(a.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No audits found</p>
                <p className="text-sm mt-1">Click "Schedule Audit" to plan your first ESG audit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Audit' : 'Schedule ESG Audit'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Audit Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Annual GRI Compliance Audit 2026"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Audit Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="THIRD_PARTY">Third Party</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="CERTIFICATION">Certification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Framework
              </label>
              <select
                value={form.framework}
                onChange={(e) => setForm((f) => ({ ...f, framework: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="GENERAL">General ESG</option>
                <option value="GRI">GRI</option>
                <option value="TCFD">TCFD</option>
                <option value="SASB">SASB</option>
                <option value="CDP">CDP</option>
                <option value="CSRD">CSRD</option>
                <option value="ISO14001">ISO 14001</option>
                <option value="ISO45001">ISO 45001</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Auditor
              </label>
              <input
                value={form.auditor}
                onChange={(e) => setForm((f) => ({ ...f, auditor: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Auditing firm or person"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Audit Lead (Internal)
              </label>
              <input
                value={form.auditLead}
                onChange={(e) => setForm((f) => ({ ...f, auditLead: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Internal responsible person"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Completed Date
              </label>
              <input
                type="date"
                value={form.completedDate}
                onChange={(e) => setForm((f) => ({ ...f, completedDate: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Findings
              </label>
              <input
                type="number"
                min="0"
                value={form.findings}
                onChange={(e) =>
                  setForm((f) => ({ ...f, findings: parseInt(e.target.value) || 0 }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Critical Findings
              </label>
              <input
                type="number"
                min="0"
                value={form.criticalFindings}
                onChange={(e) =>
                  setForm((f) => ({ ...f, criticalFindings: parseInt(e.target.value) || 0 }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Scope
            </label>
            <input
              value={form.scope}
              onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. All business units, Scope 1 & 2 emissions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Audit objectives and scope of work..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Schedule Audit'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Audit" size="sm">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this audit? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteId && handleDelete(deleteId)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
