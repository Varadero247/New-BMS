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
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Plus, ListChecks, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Checklist {
  id: string;
  referenceNumber: string;
  auditId: string;
  title: string;
  standard: string;
  items: string;
  completedItems: number;
  totalItems: number;
  notes: string;
  createdAt: string;
}

interface ChecklistForm {
  auditId: string;
  title: string;
  standard: string;
  items: string;
  completedItems: number;
  totalItems: number;
  notes: string;
}

const emptyForm: ChecklistForm = {
  auditId: '',
  title: '',
  standard: '',
  items: '',
  completedItems: 0,
  totalItems: 0,
  notes: '',
};

export default function ChecklistsClient() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ChecklistForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadChecklists = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/checklists', { params });
      setChecklists(response.data.data || []);
    } catch (err) {
      console.error('Failed to load checklists:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }
  function openEdit(cl: Checklist) {
    setForm({
      auditId: cl.auditId || '',
      title: cl.title,
      standard: cl.standard || '',
      items: cl.items || '',
      completedItems: cl.completedItems || 0,
      totalItems: cl.totalItems || 0,
      notes: cl.notes || '',
    });
    setEditId(cl.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title || !form.auditId) return;
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/checklists/${editId}`, form);
      } else {
        await api.post('/checklists', form);
      }
      setModalOpen(false);
      loadChecklists();
    } catch (err) {
      console.error('Failed to save checklist:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this checklist?')) return;
    try {
      await api.delete(`/checklists/${id}`);
      loadChecklists();
    } catch (err) {
      console.error(err);
    }
  }

  function completionPercent(completed: number, total: number) {
    if (!total) return 0;
    return Math.round((completed / total) * 100);
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Audit Checklists
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage audit checklists and verification items
            </p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Checklist
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{checklists.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Checklists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {
                  checklists.filter((c) => c.totalItems > 0 && c.completedItems === c.totalItems)
                    .length
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {
                  checklists.filter((c) => c.totalItems > 0 && c.completedItems < c.totalItems)
                    .length
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search checklists"
              placeholder="Search checklists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : checklists.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Standard</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checklists.map((cl) => {
                      const pct = completionPercent(cl.completedItems || 0, cl.totalItems || 0);
                      return (
                        <TableRow key={cl.id}>
                          <TableCell className="font-mono text-xs">{cl.referenceNumber}</TableCell>
                          <TableCell className="font-medium">{cl.title}</TableCell>
                          <TableCell className="text-sm">{cl.standard || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {cl.completedItems || 0}/{cl.totalItems || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={pct === 100 ? 'secondary' : pct > 0 ? 'default' : 'outline'}
                            >
                              {pct === 100 ? 'Complete' : pct > 0 ? `${pct}%` : 'Not Started'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEdit(cl)}>
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(cl.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ListChecks className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No checklists created</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Checklist
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editId ? 'Edit Checklist' : 'New Checklist'}
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
                  placeholder="Checklist title"
                />
              </div>
              <div>
                <Label>Standard</Label>
                <Input
                  value={form.standard}
                  onChange={(e) => setForm((p) => ({ ...p, standard: e.target.value }))}
                  placeholder="e.g. ISO 9001:2015"
                />
              </div>
              <div>
                <Label>Items (JSON or comma-separated)</Label>
                <Textarea
                  value={form.items}
                  onChange={(e) => setForm((p) => ({ ...p, items: e.target.value }))}
                  rows={4}
                  placeholder='e.g. "Check document control", "Verify calibration records"'
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Items</Label>
                  <Input
                    type="number"
                    value={String(form.totalItems)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, totalItems: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
                <div>
                  <Label>Completed Items</Label>
                  <Input
                    type="number"
                    value={String(form.completedItems)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, completedItems: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
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
                  'Update Checklist'
                ) : (
                  'Create Checklist'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
