'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, DollarSign, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface SpendRecord {
  id: string;
  referenceNumber: string;
  supplierId: string;
  period: string;
  amount: number;
  currency: string;
  category: string;
  poNumber: string;
  notes: string;
  createdAt: string;
}

interface SpendForm {
  supplierId: string;
  period: string;
  amount: string;
  currency: string;
  category: string;
  poNumber: string;
  notes: string;
}

const emptyForm: SpendForm = {
  supplierId: '', period: '', amount: '', currency: 'USD',
  category: '', poNumber: '', notes: '',
};

interface SupplierOption {
  id: string;
  name: string;
  referenceNumber: string;
}

export default function SpendClient() {
  const [items, setItems] = useState<SpendRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SpendForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const [res, suppRes] = await Promise.all([
        api.get('/spend', { params }),
        api.get('/suppliers'),
      ]);
      setItems(res.data.data || []);
      setSuppliers(suppRes.data.data || []);
    } catch (err) {
      console.error('Failed to load spend records:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: SpendRecord) {
    setForm({
      supplierId: item.supplierId || '', period: item.period || '',
      amount: item.amount != null ? String(item.amount) : '',
      currency: item.currency || 'USD', category: item.category || '',
      poNumber: item.poNumber || '', notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.supplierId || !form.period || !form.amount) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        amount: parseFloat(form.amount),
      };
      if (editId) {
        await api.put(`/spend/${editId}`, payload);
      } else {
        await api.post('/spend', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save spend record:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this spend record?')) return;
    try { await api.delete(`/spend/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  function getSupplierName(id: string) {
    const s = suppliers.find(s => s.id === id);
    return s ? s.name : id;
  }

  const totalSpend = items.reduce((sum, i) => sum + (i.amount || 0), 0);
  const avgSpend = items.length > 0 ? totalSpend / items.length : 0;

  function formatCurrency(amount: number, currency?: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 2 }).format(amount);
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Spend Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and analyse supplier spend</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Spend Record</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Records</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-teal-600">{formatCurrency(totalSpend)}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Spend</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{formatCurrency(avgSpend)}</p><p className="text-sm text-gray-500 dark:text-gray-400">Average</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{new Set(items.map(i => i.supplierId)).size}</p><p className="text-sm text-gray-500 dark:text-gray-400">Suppliers</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search spend records" placeholder="Search spend records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
          </div>
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{getSupplierName(item.supplierId)}</TableCell>
                        <TableCell className="text-sm">{item.period}</TableCell>
                        <TableCell className="font-medium text-teal-700 dark:text-teal-300">{formatCurrency(item.amount, item.currency)}</TableCell>
                        <TableCell className="text-sm">{item.currency || 'USD'}</TableCell>
                        <TableCell><Badge variant="outline">{item.category || '-'}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{item.poNumber || '-'}</TableCell>
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
                <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No spend records found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Record</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Spend Record' : 'Add Spend Record'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.referenceNumber})</option>)}
                  </Select>
                </div>
                <div><Label>Period *</Label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. 2026-Q1" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Amount *</Label><Input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
                <div>
                  <Label>Currency</Label>
                  <Select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                  </Select>
                </div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Raw Materials" /></div>
              </div>
              <div><Label>PO Number</Label><Input value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} placeholder="Purchase order number" /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.supplierId || !form.period || !form.amount}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Record' : 'Create Record'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
