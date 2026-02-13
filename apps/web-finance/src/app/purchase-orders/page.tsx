'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter, Input, Label } from '@ims/ui';
import { Plus, Search, ShoppingCart, Eye, Check, Package, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface POLine {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PurchaseOrder {
  id: string;
  reference: string;
  supplierId: string;
  supplierName?: string;
  supplier?: { name: string };
  orderDate: string;
  expectedDate: string;
  total: number;
  status: string;
  notes?: string;
  lines: POLine[];
  createdAt: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-indigo-100 text-indigo-700',
  PARTIALLY_RECEIVED: 'bg-amber-100 text-amber-700',
  RECEIVED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
}

const emptyLine: POLine = { description: '', quantity: 1, unitPrice: 0, amount: 0 };

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formSupplierId, setFormSupplierId] = useState('');
  const [formOrderDate, setFormOrderDate] = useState('');
  const [formExpectedDate, setFormExpectedDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [lines, setLines] = useState<POLine[]>([{ ...emptyLine }]);

  useEffect(() => {
    loadOrders();
    loadSuppliers();
  }, []);

  async function loadOrders() {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/purchase-orders?${params.toString()}`);
      setOrders(res.data.data || []);
    } catch (err) {
      setError('Failed to load purchase orders.');
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
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormExpectedDate('');
    setFormNotes('');
    setLines([{ ...emptyLine }]);
    setFormError('');
    setCreateModalOpen(true);
  }

  function addLine() { setLines(prev => [...prev, { ...emptyLine }]); }
  function removeLine(index: number) { if (lines.length <= 1) return; setLines(prev => prev.filter((_, i) => i !== index)); }
  function updateLine(index: number, field: keyof POLine, value: string | number) {
    setLines(prev => prev.map((line, i) => {
      if (i !== index) return line;
      const updated = { ...line, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      }
      return updated;
    }));
  }

  const poTotal = lines.reduce((sum, l) => sum + (l.amount || 0), 0);

  async function handleCreate() {
    setFormError('');
    if (!formSupplierId) { setFormError('Supplier is required'); return; }
    if (!formOrderDate) { setFormError('Order date is required'); return; }
    if (!formExpectedDate) { setFormError('Expected date is required'); return; }
    const validLines = lines.filter(l => l.description.trim() && l.amount > 0);
    if (validLines.length === 0) { setFormError('At least one line item is required'); return; }

    setSubmitting(true);
    try {
      await api.post('/purchase-orders', {
        supplierId: formSupplierId,
        orderDate: formOrderDate,
        expectedDate: formExpectedDate,
        notes: formNotes || undefined,
        lines: validLines,
      });
      setCreateModalOpen(false);
      loadOrders();
    } catch (err: any) {
      setFormError(err?.response?.data?.error?.message || 'Failed to create purchase order.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.patch(`/purchase-orders/${id}/approve`);
      loadOrders();
    } catch (err) {
      console.error('Error approving PO:', err);
    }
  }

  async function handleReceive(id: string) {
    try {
      await api.patch(`/purchase-orders/${id}/receive`);
      loadOrders();
    } catch (err) {
      console.error('Error receiving PO:', err);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this purchase order?')) return;
    try {
      await api.patch(`/purchase-orders/${id}/cancel`);
      loadOrders();
    } catch (err) {
      console.error('Error cancelling PO:', err);
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchTerm ||
      o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.supplier?.name || o.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
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
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-500 mt-1">Manage purchase orders and procurement</p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" /> New PO
          </Button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search purchase orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option><option value="PENDING_APPROVAL">Pending Approval</option><option value="APPROVED">Approved</option><option value="SENT">Sent</option><option value="PARTIALLY_RECEIVED">Partially Received</option><option value="RECEIVED">Received</option><option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-indigo-600" />Purchase Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Order Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Expected</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-gray-900">{order.reference}</td>
                        <td className="py-3 px-4 text-gray-900">{order.supplier?.name || order.supplierName || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(order.expectedDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
                        <td className="py-3 px-4"><Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-700'}>{order.status.replace('_', ' ')}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setViewOrder(order); setViewModalOpen(true); }} className="text-gray-400 hover:text-indigo-600"><Eye className="h-4 w-4" /></button>
                            {(order.status === 'DRAFT' || order.status === 'PENDING_APPROVAL') && (
                              <button onClick={() => handleApprove(order.id)} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1">
                                <Check className="h-3 w-3" />Approve
                              </button>
                            )}
                            {(order.status === 'APPROVED' || order.status === 'SENT') && (
                              <button onClick={() => handleReceive(order.id)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1">
                                <Package className="h-3 w-3" />Receive
                              </button>
                            )}
                            {order.status === 'DRAFT' && (
                              <button onClick={() => handleCancel(order.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500"><ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No purchase orders found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Purchase Order" size="full">
        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="po-supplier">Supplier *</Label>
              <select id="po-supplier" value={formSupplierId} onChange={(e) => setFormSupplierId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div><Label htmlFor="po-order">Order Date *</Label><Input id="po-order" type="date" value={formOrderDate} onChange={(e) => setFormOrderDate(e.target.value)} /></div>
            <div><Label htmlFor="po-expected">Expected Date *</Label><Input id="po-expected" type="date" value={formExpectedDate} onChange={(e) => setFormExpectedDate(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="po-notes">Notes</Label><textarea id="po-notes" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" /></div>
          <div>
            <div className="flex justify-between items-center mb-2"><Label>Line Items</Label><button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button></div>
            <table className="w-full text-sm border">
              <thead><tr className="bg-gray-50"><th className="text-left py-2 px-3 font-medium text-gray-500">Description</th><th className="text-right py-2 px-3 font-medium text-gray-500 w-24">Qty</th><th className="text-right py-2 px-3 font-medium text-gray-500 w-32">Unit Price</th><th className="text-right py-2 px-3 font-medium text-gray-500 w-32">Amount</th><th className="w-10"></th></tr></thead>
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
                <tr className="border-t bg-gray-50 font-medium"><td colSpan={3} className="py-2 px-3 text-right">Total:</td><td className="py-2 px-3 text-right">{formatCurrency(poTotal)}</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>{submitting ? 'Creating...' : 'Create PO'}</Button>
        </ModalFooter>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`PO: ${viewOrder?.reference || ''}`} size="lg">
        {viewOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-sm text-gray-500">Supplier</p><p className="font-medium">{viewOrder.supplier?.name || viewOrder.supplierName}</p></div>
              <div><p className="text-sm text-gray-500">Order Date</p><p className="font-medium">{new Date(viewOrder.orderDate).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-500">Expected Date</p><p className="font-medium">{new Date(viewOrder.expectedDate).toLocaleDateString()}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{formatCurrency(viewOrder.total)}</p></div>
              <Badge className={statusColors[viewOrder.status]}>{viewOrder.status.replace('_', ' ')}</Badge>
            </div>
            {viewOrder.lines && viewOrder.lines.length > 0 && (
              <table className="w-full text-sm border">
                <thead><tr className="bg-gray-50"><th className="text-left py-2 px-3">Description</th><th className="text-right py-2 px-3">Qty</th><th className="text-right py-2 px-3">Unit Price</th><th className="text-right py-2 px-3">Amount</th></tr></thead>
                <tbody>
                  {viewOrder.lines.map((line, idx) => (
                    <tr key={idx} className="border-t"><td className="py-2 px-3">{line.description}</td><td className="py-2 px-3 text-right">{line.quantity}</td><td className="py-2 px-3 text-right">{formatCurrency(line.unitPrice)}</td><td className="py-2 px-3 text-right">{formatCurrency(line.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            {viewOrder.notes && <div><p className="text-sm text-gray-500">Notes</p><p className="text-gray-700">{viewOrder.notes}</p></div>}
          </div>
        )}
        <ModalFooter><Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button></ModalFooter>
      </Modal>
    </div>
  );
}
