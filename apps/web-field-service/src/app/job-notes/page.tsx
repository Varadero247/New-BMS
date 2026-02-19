'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, StickyNote, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface JobNote {
  id: string;
  jobNumber?: string;
  jobId?: string;
  technicianName?: string;
  note?: string;
  content?: string;
  type?: string;
  createdAt?: string;
  isInternal?: boolean;
  [key: string]: any;
}

const typeColors: Record<string, string> = {
  ISSUE: 'bg-red-100 text-red-700',
  RESOLUTION: 'bg-green-100 text-green-700',
  OBSERVATION: 'bg-blue-100 text-blue-700',
  GENERAL: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  HANDOVER: 'bg-purple-100 text-purple-700',
  CUSTOMER_FEEDBACK: 'bg-yellow-100 text-yellow-700',
};

const emptyForm = {
  jobNumber: '',
  technicianName: '',
  note: '',
  type: 'GENERAL',
  isInternal: false,
};

export default function JobNotesPage() {
  const [items, setItems] = useState<JobNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<JobNote | null>(null);
  const [editItem, setEditItem] = useState<JobNote | null>(null);
  const [deleteItem, setDeleteItem] = useState<JobNote | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/job-notes');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const q = searchTerm.toLowerCase();
    return (
      (!q || JSON.stringify(i).toLowerCase().includes(q)) && (!typeFilter || i.type === typeFilter)
    );
  });

  const stats = {
    total: items.length,
    issues: items.filter((i) => i.type === 'ISSUE').length,
    resolutions: items.filter((i) => i.type === 'RESOLUTION').length,
    general: items.filter((i) => !i.type || i.type === 'GENERAL').length,
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: JobNote) => {
    setEditItem(item);
    setForm({
      jobNumber: item.jobNumber || '',
      technicianName: item.technicianName || '',
      note: item.note || item.content || '',
      type: item.type || 'GENERAL',
      isInternal: item.isInternal || false,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.note) {
      setError('Note content is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/job-notes/${editItem.id}`, form);
      else await api.post('/job-notes', form);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setError((e as any)?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/job-notes/${deleteItem.id}`);
      setDeleteItem(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Notes</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Technician notes and service observations
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> Add Note
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Notes',
                value: stats.total,
                icon: StickyNote,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'Issues',
                value: stats.issues,
                icon: AlertCircle,
                bg: 'bg-red-50',
                color: 'text-red-600',
                border: 'border-red-200',
              },
              {
                label: 'Resolutions',
                value: stats.resolutions,
                icon: CheckCircle,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                label: 'General',
                value: stats.general,
                icon: MessageSquare,
                bg: 'bg-gray-50 dark:bg-gray-800',
                color: 'text-gray-600',
                border: 'border-gray-200 dark:border-gray-700',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search notes..."
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              aria-label="Filter by type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Types</option>
              {[
                'ISSUE',
                'RESOLUTION',
                'OBSERVATION',
                'GENERAL',
                'HANDOVER',
                'CUSTOMER_FEEDBACK',
              ].map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <StickyNote className="h-5 w-5 text-sky-600" /> Job Notes ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="divide-y">
                  {filtered.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-sky-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[item.type || 'GENERAL'] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                            >
                              {(item.type || 'GENERAL').replace('_', ' ')}
                            </span>
                            {item.jobNumber && (
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                Job: {item.jobNumber}
                              </span>
                            )}
                            {item.technicianName && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                by {item.technicianName}
                              </span>
                            )}
                            {item.isInternal && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                Internal
                              </span>
                            )}
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                            </span>
                          </div>
                          <p
                            className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 cursor-pointer hover:text-gray-900 dark:text-gray-100"
                            onClick={() => setViewItem(item)}
                          >
                            {item.note || item.content || '-'}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setViewItem(item)}
                            className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteItem(item)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No job notes found</p>
                  <p className="text-sm mt-1">Add your first note to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View Note Modal */}
      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Job Note" size="md">
        {viewItem && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${typeColors[viewItem.type || 'GENERAL'] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
              >
                {(viewItem.type || 'GENERAL').replace('_', ' ')}
              </span>
              {viewItem.jobNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  Job: {viewItem.jobNumber}
                </span>
              )}
              {viewItem.isInternal && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                  Internal
                </span>
              )}
            </div>
            {viewItem.technicianName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {viewItem.technicianName}
                </span>
              </p>
            )}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {viewItem.note || viewItem.content}
              </p>
            </div>
            {viewItem.createdAt && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(viewItem.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
        <ModalFooter>
          <button
            onClick={() => setViewItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Close
          </button>
          {viewItem && (
            <button
              onClick={() => {
                openEdit(viewItem);
                setViewItem(null);
              }}
              className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              Edit
            </button>
          )}
        </ModalFooter>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Note' : 'Add Job Note'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Number
              </label>
              <input
                value={form.jobNumber}
                onChange={(e) => setForm((f) => ({ ...f, jobNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Related job number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technician
              </label>
              <input
                value={form.technicianName}
                onChange={(e) => setForm((f) => ({ ...f, technicianName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Technician name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {[
                  'GENERAL',
                  'ISSUE',
                  'RESOLUTION',
                  'OBSERVATION',
                  'HANDOVER',
                  'CUSTOMER_FEEDBACK',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="internal"
                checked={form.isInternal}
                onChange={(e) => setForm((f) => ({ ...f, isInternal: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-sky-600"
              />
              <label
                htmlFor="internal"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Internal note (not visible to customer)
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note *
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter your note here..."
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editItem ? 'Update Note' : 'Add Note'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Note"
        size="sm"
      >
        <p className="text-sm text-gray-600">Delete this job note? This action cannot be undone.</p>
        <ModalFooter>
          <button
            onClick={() => setDeleteItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
