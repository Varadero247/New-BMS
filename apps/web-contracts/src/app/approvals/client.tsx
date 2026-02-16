'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, CheckCircle2, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

interface Approval {
  id: string;
  referenceNumber: string;
  contractId: string;
  approver: string;
  approverName: string;
  status: string;
  comments: string;
  decidedAt: string;
  createdAt: string;
}

interface ApprovalForm {
  contractId: string;
  approver: string;
  approverName: string;
  status: string;
  comments: string;
  decidedAt: string;
}

const emptyForm: ApprovalForm = {
  contractId: '', approver: '', approverName: '', status: 'PENDING',
  comments: '', decidedAt: '',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function ApprovalsClient() {
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ApprovalForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/approvals', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Approval) {
    setForm({
      contractId: item.contractId || '', approver: item.approver || '',
      approverName: item.approverName || '', status: item.status || 'PENDING',
      comments: item.comments || '',
      decidedAt: item.decidedAt ? item.decidedAt.split('T')[0] : '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.contractId || !form.approver) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        decidedAt: form.decidedAt ? new Date(form.decidedAt).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/approvals/${editId}`, payload);
      } else {
        await api.post('/approvals', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save approval:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this approval?')) return;
    try { await api.delete(`/approvals/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Approvals</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Contract approval workflow tracking</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Request Approval</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{items.filter(a => a.status === 'PENDING').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(a => a.status === 'APPROVED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(a => a.status === 'REJECTED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search approvals" placeholder="Search approvals..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />)}</div>
            ) : items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Decided At</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-mono text-xs">{item.contractId?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{item.approverName || item.approver || '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span></TableCell>
                        <TableCell className="text-sm">{item.decidedAt ? new Date(item.decidedAt).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
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
                <CheckCircle2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No approvals found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Request First Approval</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Approval' : 'Request Approval'} size="lg">
            <div className="space-y-4">
              <div><Label>Contract ID *</Label><Input value={form.contractId} onChange={e => setForm(p => ({ ...p, contractId: e.target.value }))} placeholder="Contract ID" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Approver ID *</Label><Input value={form.approver} onChange={e => setForm(p => ({ ...p, approver: e.target.value }))} placeholder="Approver user ID" /></div>
                <div><Label>Approver Name</Label><Input value={form.approverName} onChange={e => setForm(p => ({ ...p, approverName: e.target.value }))} placeholder="Approver name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</Select></div>
                <div><Label>Decided At</Label><Input type="date" value={form.decidedAt} onChange={e => setForm(p => ({ ...p, decidedAt: e.target.value }))} /></div>
              </div>
              <div><Label>Comments</Label><Textarea value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} rows={3} placeholder="Approval comments..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.contractId || !form.approver}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Approval' : 'Submit Approval'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
