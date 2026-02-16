'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  FileCheck2,
  AlertTriangle,
  Edit2,
} from 'lucide-react';
import { Modal } from '@ims/ui';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Ir35Assessment {
  id: string;
  referenceNumber: string;
  contractorName: string;
  contractorEmail?: string;
  engagementDesc?: string;
  clientName?: string;
  determination: string;
  assessmentDate?: string;
  assessedBy?: string;
  reasoning?: string;
  evidenceUrl?: string;
  reviewDate?: string;
  notes?: string;
  createdAt: string;
}

const DETERMINATIONS = ['PENDING', 'INSIDE', 'OUTSIDE', 'UNKNOWN'] as const;

const determinationColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  INSIDE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  OUTSIDE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  UNKNOWN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const emptyForm = {
  contractorName: '',
  contractorEmail: '',
  engagementDesc: '',
  clientName: '',
  determination: 'PENDING' as string,
  assessmentDate: '',
  assessedBy: '',
  reasoning: '',
  evidenceUrl: '',
  reviewDate: '',
  notes: '',
};

export default function Ir35Client() {
  const [items, setItems] = useState<Ir35Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [detFilter, setDetFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<Ir35Assessment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await api.get('/ir35');
      setItems(res.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load IR35 assessments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.contractorName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        contractorEmail: form.contractorEmail || null,
        assessmentDate: form.assessmentDate
          ? new Date(form.assessmentDate).toISOString()
          : null,
        reviewDate: form.reviewDate
          ? new Date(form.reviewDate).toISOString()
          : null,
      };
      await api.post('/ir35', payload);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.contractorName.toLowerCase().includes(search.toLowerCase()) ||
      item.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchDet = !detFilter || item.determination === detFilter;
    return matchSearch && matchDet;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                IR35 Assessments
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage off-payroll working determinations
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by contractor, client, or reference..."
                aria-label="Search IR35 assessments"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={detFilter}
              onChange={(e) => setDetFilter(e.target.value)}
              aria-label="Filter by determination"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Determinations</option>
              {DETERMINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <FileCheck2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No IR35 assessments found</p>
              <p className="text-sm mt-1">
                {search || detFilter
                  ? 'Try adjusting your filters'
                  : 'Create your first IR35 assessment'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Reference
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Contractor
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Client
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Determination
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Assessment Date
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Review Date
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => setDetailModal(item)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {item.referenceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.contractorName}
                          </p>
                          {item.contractorEmail && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.contractorEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {item.clientName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            determinationColors[item.determination] ||
                            determinationColors.UNKNOWN
                          }`}
                        >
                          {item.determination}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {item.assessmentDate
                          ? new Date(item.assessmentDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {item.reviewDate
                          ? new Date(item.reviewDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModal(item);
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-emerald-600"
                          title="View details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New IR35 Assessment"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contractor Name *
              </label>
              <input
                type="text"
                value={form.contractorName}
                onChange={(e) =>
                  setForm({ ...form, contractorName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Contractor name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contractor Email
              </label>
              <input
                type="email"
                value={form.contractorEmail}
                onChange={(e) =>
                  setForm({ ...form, contractorEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) =>
                  setForm({ ...form, clientName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="End client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Determination
              </label>
              <select
                value={form.determination}
                onChange={(e) =>
                  setForm({ ...form, determination: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                {DETERMINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Engagement Description
            </label>
            <textarea
              value={form.engagementDesc}
              onChange={(e) =>
                setForm({ ...form, engagementDesc: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe the engagement..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assessment Date
              </label>
              <input
                type="date"
                value={form.assessmentDate}
                onChange={(e) =>
                  setForm({ ...form, assessmentDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assessed By
              </label>
              <input
                type="text"
                value={form.assessedBy}
                onChange={(e) =>
                  setForm({ ...form, assessedBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Assessor name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reasoning
            </label>
            <textarea
              value={form.reasoning}
              onChange={(e) =>
                setForm({ ...form, reasoning: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Reasoning for the determination..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence URL
              </label>
              <input
                type="text"
                value={form.evidenceUrl}
                onChange={(e) =>
                  setForm({ ...form, evidenceUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Link to evidence"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Date
              </label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) =>
                  setForm({ ...form, reviewDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.contractorName.trim()}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal ? `IR35 - ${detailModal.referenceNumber}` : ''}
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Contractor
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {detailModal.contractorName}
                </p>
                {detailModal.contractorEmail && (
                  <p className="text-xs text-gray-500">{detailModal.contractorEmail}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Client
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {detailModal.clientName || '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Determination
                </p>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    determinationColors[detailModal.determination] ||
                    determinationColors.UNKNOWN
                  }`}
                >
                  {detailModal.determination}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Assessed By
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {detailModal.assessedBy || '-'}
                </p>
              </div>
            </div>

            {detailModal.engagementDesc && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Engagement Description
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {detailModal.engagementDesc}
                </p>
              </div>
            )}

            {detailModal.reasoning && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Reasoning
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {detailModal.reasoning}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Assessment Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {detailModal.assessmentDate
                    ? new Date(detailModal.assessmentDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Review Date
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {detailModal.reviewDate
                    ? new Date(detailModal.reviewDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {detailModal.notes && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {detailModal.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
