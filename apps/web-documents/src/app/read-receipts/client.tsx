'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, BookOpen, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['UNREAD', 'READ', 'ACKNOWLEDGED'] as const;

interface ReadReceipt {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  status: string;
  readAt: string;
  acknowledgedAt: string;
  createdAt: string;
}

interface ReadReceiptForm {
  documentId: string;
  userId: string;
  userName: string;
  status: string;
  readAt: string;
  acknowledgedAt: string;
}

const emptyForm: ReadReceiptForm = {
  documentId: '',
  userId: '',
  userName: '',
  status: 'UNREAD',
  readAt: '',
  acknowledgedAt: '',
};

function getReceiptStatusColor(status: string) {
  switch (status) {
    case 'ACKNOWLEDGED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'READ': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'UNREAD': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function ReadReceiptsClient() {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReadReceiptForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadReceipts = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/read-receipts', { params });
      setReceipts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load read receipts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadReceipts(); }, [loadReceipts]);

  function openCreate() {
    setForm({ ...emptyForm });
    setEditId(null);
    setModalOpen(true);
  }

  function openEdit(receipt: ReadReceipt) {
    setForm({
      documentId: receipt.documentId || '',
      userId: receipt.userId || '',
      userName: receipt.userName || '',
      status: receipt.status || 'UNREAD',
      readAt: receipt.readAt ? receipt.readAt.split('T')[0] : '',
      acknowledgedAt: receipt.acknowledgedAt ? receipt.acknowledgedAt.split('T')[0] : '',
    });
    setEditId(receipt.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.documentId || !form.userId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        readAt: form.readAt ? new Date(form.readAt).toISOString() : undefined,
        acknowledgedAt: form.acknowledgedAt ? new Date(form.acknowledgedAt).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/read-receipts/${editId}`, payload);
      } else {
        await api.post('/read-receipts', payload);
      }
      setModalOpen(false);
      loadReceipts();
    } catch (err) {
      console.error('Failed to save read receipt:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this read receipt?')) return;
    try {
      await api.delete(`/read-receipts/${id}`);
      loadReceipts();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Read Receipts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track document distribution and acknowledgement</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />Add Receipt
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{receipts.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-gray-600">{receipts.filter(r => r.status === 'UNREAD').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Unread</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{receipts.filter(r => r.status === 'READ').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Read</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{receipts.filter(r => r.status === 'ACKNOWLEDGED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Acknowledged</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search read receipts"
              placeholder="Search read receipts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : receipts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Read At</TableHead>
                      <TableHead>Acknowledged At</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map(receipt => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-xs">{receipt.documentId?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{receipt.userName || receipt.userId?.slice(0, 8)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReceiptStatusColor(receipt.status)}`}>
                            {receipt.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{receipt.readAt ? new Date(receipt.readAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{receipt.acknowledgedAt ? new Date(receipt.acknowledgedAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(receipt)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(receipt.id)} className="text-red-600 hover:bg-red-50">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No read receipts found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />Add First Receipt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Read Receipt' : 'Add Read Receipt'} size="lg">
            <div className="space-y-4">
              <div>
                <Label>Document ID *</Label>
                <Input value={form.documentId} onChange={e => setForm(p => ({ ...p, documentId: e.target.value }))} placeholder="Document UUID" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User ID *</Label>
                  <Input value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} placeholder="User UUID" />
                </div>
                <div>
                  <Label>User Name</Label>
                  <Input value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))} placeholder="User name" />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Read At</Label>
                  <Input type="date" value={form.readAt} onChange={e => setForm(p => ({ ...p, readAt: e.target.value }))} />
                </div>
                <div>
                  <Label>Acknowledged At</Label>
                  <Input type="date" value={form.acknowledgedAt} onChange={e => setForm(p => ({ ...p, acknowledgedAt: e.target.value }))} />
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.documentId || !form.userId}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Receipt' : 'Create Receipt'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
