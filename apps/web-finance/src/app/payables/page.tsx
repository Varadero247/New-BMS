'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, CreditCard, Eye, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface BillLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  accountId?: string;
}

interface Bill {
  id: string;
  reference: string;
  supplierId: string;
  supplierName?: string;
  supplier?: { name: string };
  billDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  notes?: string;
  lines: BillLine[];
  createdAt: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  RECEIVED: 'bg-blue-100 text-blue-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  VOID: 'bg-orange-100 text-orange-700',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

const emptyLine: BillLine = { description: '', quantity: 1, unitPrice: 0, amount: 0 };

export default function PayablesPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formSupplierId, setFormSupplierId] = useState('');
  const [formBillDate, setFormBillDate] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [lines, setLines] = useState<BillLine[]>([{ ...emptyLine }]);

  useEffect(() => {
    loadBills();
    loadSuppliers();
  }, []);

  async function loadBills() {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/payables?${params.toString()}`);
      setBills(res.data.data || []);
    } catch (err) {
      setError('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSuppliers() {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  }

  function openCreateModal() {
    setFormSupplierId('');
    setFormBillDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormNotes('');
    setLines([{ ...emptyLine }]);
    setFormError('');
    setCreateModalOpen(true);
  }

  function addLine() { setLines(prev => [...prev, { ...emptyLine }]); }
  function removeLine(index: number) { if (lines.length <= 1) return; setLines(prev => prev.filter((_, i) => i !== index)); }
  function updateLine(index: number, field: keyof BillLine, value: string | number) {
    setLines(prev => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      }
      return updated;
    }));
  }

  const billTotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  async function handleCreate() {
    setFormError('');
    if (!formSupplierId) { setFormError('Supplier is required'); return; }
    if (!formBillDate) { setFormError('Bill date is required'); return; }
    if (!formDueDate) { setFormError('Due date is required'); return; }
    const validLines = lines.filter(l => l.description.trim() && l.amount > 0);
    if (validLines.length === 0) { setFormError('At least one line item is required'); return; }

    setSubmitting(true);
    try {
      await api.post('/payables', {
        supplierId: formSupplierId,
        billDate: formBillDate,
        dueDate: formDueDate,
        notes: formNotes || undefined,
        lines: validLines,
      });
      setCreateModalOpen(false);
      loadBills();
    } catch (err: unknown) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create bill.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoid(id: string) {
    if (!confirm('Are you sure you want to void this bill?')) return;
    try {
      await api.patch(`/payables/${id}/void`);
      loadBills();
    } catch (err) {
      console.error('Error voiding bill:', err);
    }
  }

  const filteredBills = bills.filter(b => {
    const matchesSearch = !searchTerm ||
      b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.supplier?.name || b.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bills</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage supplier bills and payables</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New Bill
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input type="text" aria-label="Search bills..." placeholder="Search bills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option><option value="RECEIVED">Received</option><option value="PARTIALLY_PAID">Partially Paid</option><option value="PAID">Paid</option><option value="OVERDUE">Overdue</option><option value="VOID">Void</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-indigo-600" />Bills ({filteredBills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBills.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Bill Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Due Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Total</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount Due</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
                      <tr key={bill.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-gray-900 dark:text-gray-100">{bill.reference}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{bill.supplier?.name || bill.supplierName || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(bill.billDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(bill.total)}</td>
                        <td className="py-3 px-4 text-right font-medium text-red-600">{formatCurrency(bill.amountDue)}</td>
                        <td className="py-3 px-4"><Badge className={statusColors[bill.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{bill.status}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setViewBill(bill); setViewModalOpen(true); }} className="text-gray-400 dark:text-gray-500 hover:text-indigo-600"><Eye className="h-4 w-4" /></button>
                            {bill.status === 'DRAFT' && <button onClick={() => handleVoid(bill.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No bills found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Bill" size="full">
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bill-supplier">Supplier *</Label>
              <select id="bill-supplier" value={formSupplierId} onChange={(e) => setFormSupplierId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div><Label htmlFor="bill-date">Bill Date *</Label><Input id="bill-date" type="date" value={formBillDate} onChange={(e) => setFormBillDate(e.target.value)} /></div>
            <div><Label htmlFor="bill-due">Due Date *</Label><Input id="bill-due" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="bill-notes">Notes</Label><textarea id="bill-notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" /></div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Line Items</Label>
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <table className="w-full text-sm border">
              <thead><tr className="bg-gray-50 dark:bg-gray-800"><th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Description</th><th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-24">Qty</th><th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-32">Unit Price</th><th className="text-right py-2 px-3 font-medium text-gray-500 dark:text-gray-400 w-32">Amount</th><th className="w-10"></th></tr></thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 px-3"><input value={line.description} onChange={(e) => updateLine(idx, 'description', e.target.value)} placeholder="Item description" className="w-full border rounded px-2 py-1 text-sm" /></td>
                    <td className="py-2 px-3"><input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-full border rounded px-2 py-1 text-sm text-right" /></td>
                    <td className="py-2 px-3"><input type="number" step="0.01" min="0" value={line.unitPrice || ''} onChange={(e) => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full border rounded px-2 py-1 text-sm text-right" placeholder="0.00" /></td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(line.amount)}</td>
                    <td className="py-2 px-3">{lines.length > 1 && <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td>
                  </tr>
                ))}
                <tr className="border-t bg-gray-50 dark:bg-gray-800 font-medium"><td colSpan={3} className="py-2 px-3 text-right">Total:</td><td className="py-2 px-3 text-right">{formatCurrency(billTotal)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create Bill'}</Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Bill: ${viewBill?.reference || ''}`} size="lg">
        {viewBill && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p><p className="font-medium">{viewBill.supplier?.name || viewBill.supplierName}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Bill Date</p><p className="font-medium">{new Date(viewBill.billDate).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p><p className="font-medium">{new Date(viewBill.dueDate).toLocaleDateString()}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Total</p><p className="font-medium">{formatCurrency(viewBill.total)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Paid</p><p className="font-medium text-green-600">{formatCurrency(viewBill.amountPaid || 0)}</p></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Due</p><p className="font-medium text-red-600">{formatCurrency(viewBill.amountDue)}</p></div>
            </div>
            <Badge className={statusColors[viewBill.status]}>{viewBill.status}</Badge>
          </div>
        )}
        <ModalFooter><Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button></ModalFooter>
      </Modal>
    </div>
  );
}
