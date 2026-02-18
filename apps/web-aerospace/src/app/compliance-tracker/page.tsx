'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FileCheck, X, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ComplianceItem {
  id: string;
  itemNumber: string;
  requirement: string;
  standard: string;
  clause: string;
  complianceStatus: string;
  evidenceRef: string;
  owner: string;
  nextReviewDate: string;
  createdAt: string;
}

const STANDARDS = [
  'AS9100D',
  'AS9102',
  'AS9110',
  'AS9120',
  'NADCAP',
  'FAR_145',
  'EASA_145',
  'DO-178C',
  'MIL-STD-461',
];
const STATUSES = [
  'COMPLIANT',
  'PARTIALLY_COMPLIANT',
  'NON_COMPLIANT',
  'NOT_APPLICABLE',
  'UNDER_REVIEW',
];
const statusColor = (s: string) =>
  s === 'COMPLIANT'
    ? 'bg-green-100 text-green-700'
    : s === 'PARTIALLY_COMPLIANT'
      ? 'bg-yellow-100 text-yellow-700'
      : s === 'NON_COMPLIANT'
        ? 'bg-red-100 text-red-700'
        : s === 'UNDER_REVIEW'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600';

const emptyForm = {
  requirement: '',
  standard: 'AS9100D',
  clause: '',
  complianceStatus: 'UNDER_REVIEW',
  evidenceRef: '',
  owner: '',
  nextReviewDate: '',
};

export default function ComplianceTrackerPage() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ComplianceItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/compliance-tracker');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(item: ComplianceItem) {
    setEditItem(item);
    setForm({
      requirement: item.requirement,
      standard: item.standard,
      clause: item.clause || '',
      complianceStatus: item.complianceStatus,
      evidenceRef: item.evidenceRef || '',
      owner: item.owner || '',
      nextReviewDate: item.nextReviewDate ? item.nextReviewDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/compliance-tracker/${editItem.id}`, form);
      else await api.post('/compliance-tracker', form);
      setModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id: string) {
    try {
      await api.delete(`/compliance-tracker/${id}`);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStd = !standardFilter || item.standard === standardFilter;
    const matchStatus = !statusFilter || item.complianceStatus === statusFilter;
    return matchSearch && matchStd && matchStatus;
  });

  const stats = {
    total: items.length,
    compliant: items.filter((i) => i.complianceStatus === 'COMPLIANT').length,
    partial: items.filter((i) => i.complianceStatus === 'PARTIALLY_COMPLIANT').length,
    nonCompliant: items.filter((i) => i.complianceStatus === 'NON_COMPLIANT').length,
  };
  const complianceRate = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Compliance Tracker
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track compliance against AS9100D and related standards
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Requirement
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Compliance Rate',
              value: `${complianceRate}%`,
              color:
                complianceRate >= 90
                  ? 'text-green-700'
                  : complianceRate >= 70
                    ? 'text-yellow-700'
                    : 'text-red-700',
              bg:
                complianceRate >= 90
                  ? 'bg-green-100'
                  : complianceRate >= 70
                    ? 'bg-yellow-100'
                    : 'bg-red-100',
              icon: CheckCircle,
            },
            {
              label: 'Compliant',
              value: stats.compliant,
              color: 'text-green-700',
              bg: 'bg-green-100',
              icon: CheckCircle,
            },
            {
              label: 'Partial',
              value: stats.partial,
              color: 'text-yellow-700',
              bg: 'bg-yellow-100',
              icon: AlertCircle,
            },
            {
              label: 'Non-Compliant',
              value: stats.nonCompliant,
              color: 'text-red-700',
              bg: 'bg-red-100',
              icon: AlertCircle,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${s.bg}`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search requirements..."
              placeholder="Search requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
          <select
            aria-label="Filter by standard"
            value={standardFilter}
            onChange={(e) => setStandardFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Standards</option>
            {STANDARDS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-600" />
              Requirements ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Req #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Requirement
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Standard
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Clause
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Owner
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Next Review
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{item.itemNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {item.requirement}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-indigo-700">
                          {item.standard.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.clause || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.complianceStatus)}`}
                          >
                            {item.complianceStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.owner || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.nextReviewDate
                            ? new Date(item.nextReviewDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
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
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No compliance requirements found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editItem ? 'Edit Requirement' : 'Add Compliance Requirement'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirement *
                </label>
                <textarea
                  value={form.requirement}
                  onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Standard
                  </label>
                  <select
                    value={form.standard}
                    onChange={(e) => setForm({ ...form, standard: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {STANDARDS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Clause
                  </label>
                  <input
                    type="text"
                    value={form.clause}
                    onChange={(e) => setForm({ ...form, clause: e.target.value })}
                    placeholder="e.g. 8.1.4"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compliance Status
                </label>
                <select
                  value={form.complianceStatus}
                  onChange={(e) => setForm({ ...form, complianceStatus: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Evidence Reference
                </label>
                <input
                  type="text"
                  value={form.evidenceRef}
                  onChange={(e) => setForm({ ...form, evidenceRef: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Next Review Date
                  </label>
                  <input
                    type="date"
                    value={form.nextReviewDate}
                    onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.requirement || saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Requirement'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Requirement?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
