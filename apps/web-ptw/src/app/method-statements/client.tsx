'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, FileText, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface MethodStatement {
  id: string;
  referenceNumber: string;
  title: string;
  permitId: string;
  steps: string;
  hazards: string;
  controls: string;
  ppe: string;
  approvedBy: string;
  approvedAt: string;
  version: number;
  createdAt: string;
}

interface MethodStatementForm {
  title: string;
  permitId: string;
  steps: string;
  hazards: string;
  controls: string;
  ppe: string;
  approvedBy: string;
  approvedAt: string;
  version: number;
}

const emptyForm: MethodStatementForm = {
  title: '',
  permitId: '',
  steps: '',
  hazards: '',
  controls: '',
  ppe: '',
  approvedBy: '',
  approvedAt: '',
  version: 1,
};

export default function MethodStatementsClient() {
  const [items, setItems] = useState<MethodStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MethodStatementForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await api.get('/method-statements', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load method statements:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(item: MethodStatement) {
    setForm({
      title: item.title || '',
      permitId: item.permitId || '',
      steps: item.steps || '',
      hazards: item.hazards || '',
      controls: item.controls || '',
      ppe: item.ppe || '',
      approvedBy: item.approvedBy || '',
      approvedAt: item.approvedAt ? item.approvedAt.split('T')[0] : '',
      version: item.version || 1,
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        approvedAt: form.approvedAt ? new Date(form.approvedAt).toISOString() : undefined,
        permitId: form.permitId || undefined,
      };
      if (editId) {
        await api.put(`/method-statements/${editId}`, payload);
      } else {
        await api.post('/method-statements', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) {
      console.error('Failed to save method statement:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this method statement?')) return;
    try {
      await api.delete(`/method-statements/${id}`);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Method Statements</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Safe work method statements linked to permits</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />Add Method Statement
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Statements</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(i => i.approvedAt).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{items.filter(i => !i.approvedAt).length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search method statements"
              placeholder="Search method statements..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}
              </div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Approved At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{item.title}</TableCell>
                        <TableCell><Badge variant="outline">v{item.version || 1}</Badge></TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">{item.approvedBy || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {item.approvedAt ? (
                            <span className="text-green-600 dark:text-green-400">{new Date(item.approvedAt).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No method statements found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Method Statement</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Method Statement' : 'Add Method Statement'} size="lg">
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Method statement title" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Permit ID (optional)</Label>
                  <Input value={form.permitId} onChange={e => setForm(p => ({ ...p, permitId: e.target.value }))} placeholder="Link to permit ID" />
                </div>
                <div>
                  <Label>Version</Label>
                  <Input type="number" value={form.version} onChange={e => setForm(p => ({ ...p, version: parseInt(e.target.value) || 1 }))} min={1} />
                </div>
              </div>

              <div>
                <Label>Steps / Method</Label>
                <Textarea value={form.steps} onChange={e => setForm(p => ({ ...p, steps: e.target.value }))} rows={4} placeholder="Step-by-step method of work..." />
              </div>

              <div>
                <Label>Hazards</Label>
                <Textarea value={form.hazards} onChange={e => setForm(p => ({ ...p, hazards: e.target.value }))} rows={3} placeholder="Identified hazards for this work..." />
              </div>

              <div>
                <Label>Controls</Label>
                <Textarea value={form.controls} onChange={e => setForm(p => ({ ...p, controls: e.target.value }))} rows={3} placeholder="Control measures to mitigate hazards..." />
              </div>

              <div>
                <Label>PPE Required</Label>
                <Input value={form.ppe} onChange={e => setForm(p => ({ ...p, ppe: e.target.value }))} placeholder="e.g. Hard hat, safety boots, hi-vis" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Approved By</Label>
                  <Input value={form.approvedBy} onChange={e => setForm(p => ({ ...p, approvedBy: e.target.value }))} placeholder="Approver name" />
                </div>
                <div>
                  <Label>Approved At</Label>
                  <Input type="date" value={form.approvedAt} onChange={e => setForm(p => ({ ...p, approvedAt: e.target.value }))} />
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Statement' : 'Create Statement'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
