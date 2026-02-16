'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, FileText, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const TYPES = ['SUPPLIER', 'CUSTOMER', 'SERVICE', 'NDA', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP', 'OTHER'] as const;
const STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'] as const;

interface Contract {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  status: string;
  counterparty: string;
  counterpartyContact: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  noticePeriodDays: number;
  paymentTerms: string;
  owner: string;
  ownerName: string;
  department: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

interface ContractForm {
  title: string;
  description: string;
  type: string;
  status: string;
  counterparty: string;
  counterpartyContact: string;
  value: string;
  currency: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  noticePeriodDays: string;
  paymentTerms: string;
  owner: string;
  ownerName: string;
  department: string;
  notes: string;
}

const emptyForm: ContractForm = {
  title: '', description: '', type: 'SERVICE', status: 'DRAFT',
  counterparty: '', counterpartyContact: '', value: '', currency: 'USD',
  startDate: '', endDate: '', renewalDate: '', autoRenew: false,
  noticePeriodDays: '30', paymentTerms: '', owner: '', ownerName: '',
  department: '', notes: '',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'TERMINATED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'RENEWED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export default function ContractsClient() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ContractForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/contracts', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Contract) {
    setForm({
      title: item.title || '', description: item.description || '', type: item.type || 'SERVICE',
      status: item.status || 'DRAFT', counterparty: item.counterparty || '',
      counterpartyContact: item.counterpartyContact || '',
      value: item.value ? String(item.value) : '', currency: item.currency || 'USD',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      renewalDate: item.renewalDate ? item.renewalDate.split('T')[0] : '',
      autoRenew: item.autoRenew || false,
      noticePeriodDays: item.noticePeriodDays ? String(item.noticePeriodDays) : '30',
      paymentTerms: item.paymentTerms || '', owner: item.owner || '',
      ownerName: item.ownerName || '', department: item.department || '', notes: item.notes || '',
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
        value: form.value ? parseFloat(form.value) : undefined,
        noticePeriodDays: form.noticePeriodDays ? parseInt(form.noticePeriodDays) : undefined,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
        renewalDate: form.renewalDate ? new Date(form.renewalDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/contracts/${editId}`, payload);
      } else {
        await api.post('/contracts', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save contract:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contract?')) return;
    try { await api.delete(`/contracts/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contracts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all contracts and agreements</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Contract</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(c => c.status === 'ACTIVE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Active</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{items.filter(c => c.status === 'PENDING_APPROVAL').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(c => c.status === 'EXPIRED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Expired</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search contracts" placeholder="Search contracts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
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
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell><Badge variant="outline">{item.type?.replace(/_/g, ' ') || '-'}</Badge></TableCell>
                        <TableCell className="text-sm">{item.counterparty || '-'}</TableCell>
                        <TableCell className="text-sm">{item.value ? `${item.currency || '$'}${item.value.toLocaleString()}` : '-'}</TableCell>
                        <TableCell className="text-sm">{item.endDate ? new Date(item.endDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status?.replace(/_/g, ' ')}</span></TableCell>
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
                <p className="text-gray-500 dark:text-gray-400">No contracts found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Contract</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Contract' : 'Add Contract'} size="lg">
            <div className="space-y-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Contract title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>{TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Contract description..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Counterparty</Label><Input value={form.counterparty} onChange={e => setForm(p => ({ ...p, counterparty: e.target.value }))} placeholder="Company name" /></div>
                <div><Label>Contact</Label><Input value={form.counterpartyContact} onChange={e => setForm(p => ({ ...p, counterpartyContact: e.target.value }))} placeholder="Contact person" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Value</Label><Input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="0.00" /></div>
                <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} placeholder="USD" /></div>
                <div><Label>Payment Terms</Label><Input value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))} placeholder="Net 30" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
                <div><Label>Renewal Date</Label><Input type="date" value={form.renewalDate} onChange={e => setForm(p => ({ ...p, renewalDate: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Notice Period (days)</Label><Input type="number" value={form.noticePeriodDays} onChange={e => setForm(p => ({ ...p, noticePeriodDays: e.target.value }))} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" id="autoRenew" checked={form.autoRenew} onChange={e => setForm(p => ({ ...p, autoRenew: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                  <Label htmlFor="autoRenew">Auto-Renew</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Owner Name</Label><Input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="Contract owner" /></div>
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.title}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Contract' : 'Create Contract'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
