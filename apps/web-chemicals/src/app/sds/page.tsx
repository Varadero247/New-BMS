'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Modal } from '@ims/ui';
import { FileText, Search, Plus, Download, ExternalLink } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface SdsRecord {
  id: string;
  chemicalId: string;
  chemicalName: string;
  version: string;
  status: string;
  supplier: string;
  issueDate: string;
  reviewDate: string;
  fileUrl: string;
  language: string;
  sections: number;
}

function getReviewRAG(dateStr: string): { color: string; label: string } {
  if (!dateStr)
    return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', label: 'N/A' };
  const reviewDate = new Date(dateStr);
  const now = new Date();
  const daysUntil = Math.floor((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0)
    return {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      label: 'OVERDUE',
    };
  if (daysUntil <= 30)
    return {
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      label: `${daysUntil}d`,
    };
  return {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    label: 'OK',
  };
}

export default function SdsLibraryPage() {
  const [records, setRecords] = useState<SdsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    chemicalId: '',
    version: '',
    supplier: '',
    issueDate: '',
    reviewDate: '',
    fileUrl: '',
    language: 'en',
  });

  const [chemicals, setChemicals] = useState<{ id: string; name: string }[]>([]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await api.get('/sds', { params });
      setRecords(res.data.data || []);
    } catch (e) {
      setError((e as any)?.response?.status === 401 ? 'Session expired.' : 'Failed to load SDS records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/register?fields=id,name');
        setChemicals(res.data.data || []);
      } catch {
        /* non-critical */
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await api.post('/sds', form);
      setModalOpen(false);
      setForm({
        chemicalId: '',
        version: '',
        supplier: '',
        issueDate: '',
        reviewDate: '',
        fileUrl: '',
        language: 'en',
      });
      fetchRecords();
    } catch (e) {
      setError((e as any)?.response?.data?.message || 'Failed to create SDS record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SDS Library</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Safety Data Sheet management and version control
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload SDS
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by chemical name, supplier or version..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Chemical
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Version
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Supplier
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Review Date
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        RAG
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-12 text-gray-500 dark:text-gray-400"
                        >
                          No SDS records found.
                        </td>
                      </tr>
                    ) : (
                      records.map((sds) => {
                        const rag = getReviewRAG(sds.reviewDate);
                        return (
                          <tr
                            key={sds.id}
                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-red-500" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {sds.chemicalName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                              {sds.version}
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {sds.supplier || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  sds.status === 'CURRENT'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : sds.status === 'SUPERSEDED'
                                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}
                              >
                                {sds.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {sds.reviewDate ? new Date(sds.reviewDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded ${rag.color}`}>
                                {rag.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {sds.fileUrl ? (
                                <a
                                  href={sds.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-xs font-medium"
                                >
                                  <Download className="h-3 w-3" /> Download
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">No file</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Safety Data Sheet"
        size="lg"
      >
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chemical *
            </label>
            <select
              value={form.chemicalId}
              onChange={(e) => setForm({ ...form, chemicalId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select chemical...</option>
              {chemicals.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version *
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="e.g. 4.2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                placeholder="Supplier name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review Date
              </label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File URL
            </label>
            <input
              type="url"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !form.chemicalId || !form.version}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Upload SDS'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
