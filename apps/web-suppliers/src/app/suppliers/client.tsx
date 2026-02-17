'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, Truck, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['PROSPECTIVE', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'BLACKLISTED', 'INACTIVE'] as const;
const TIERS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

interface Supplier {
  id: string;
  referenceNumber: string;
  name: string;
  tradingName: string;
  registrationNo: string;
  vatNumber: string;
  status: string;
  tier: string;
  category: string;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  notes: string;
  approvedDate: string;
  reviewDate: string;
  annualSpend: number;
  paymentTerms: string;
  tags: string[];
  createdAt: string;
}

interface SupplierForm {
  name: string;
  tradingName: string;
  registrationNo: string;
  vatNumber: string;
  status: string;
  tier: string;
  category: string;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  notes: string;
  approvedDate: string;
  reviewDate: string;
  annualSpend: string;
  paymentTerms: string;
}

const emptyForm: SupplierForm = {
  name: '', tradingName: '', registrationNo: '', vatNumber: '',
  status: 'PROSPECTIVE', tier: 'MEDIUM', category: '',
  primaryContact: '', email: '', phone: '', website: '',
  addressLine1: '', city: '', postcode: '', country: '',
  notes: '', approvedDate: '', reviewDate: '',
  annualSpend: '', paymentTerms: '',
};

export default function SuppliersClient() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SupplierForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/suppliers', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Supplier) {
    setForm({
      name: item.name || '', tradingName: item.tradingName || '',
      registrationNo: item.registrationNo || '', vatNumber: item.vatNumber || '',
      status: item.status || 'PROSPECTIVE', tier: item.tier || 'MEDIUM',
      category: item.category || '', primaryContact: item.primaryContact || '',
      email: item.email || '', phone: item.phone || '', website: item.website || '',
      addressLine1: item.addressLine1 || '', city: item.city || '',
      postcode: item.postcode || '', country: item.country || '',
      notes: item.notes || '',
      approvedDate: item.approvedDate ? item.approvedDate.split('T')[0] : '',
      reviewDate: item.reviewDate ? item.reviewDate.split('T')[0] : '',
      annualSpend: item.annualSpend ? String(item.annualSpend) : '',
      paymentTerms: item.paymentTerms || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        annualSpend: form.annualSpend ? parseFloat(form.annualSpend) : undefined,
        approvedDate: form.approvedDate ? new Date(form.approvedDate).toISOString() : undefined,
        reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : undefined,
      };
      if (editId) {
        await api.put(`/suppliers/${editId}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save supplier:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try { await api.delete(`/suppliers/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'CONDITIONAL': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'BLACKLISTED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  }

  function getTierColor(tier: string) {
    switch (tier) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Suppliers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your supplier registry</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Supplier</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(i => i.status === 'APPROVED').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Approved</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{items.filter(i => i.status === 'PROSPECTIVE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Prospective</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(i => i.tier === 'CRITICAL').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Critical Tier</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search suppliers" placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell><Badge variant="outline">{item.category || '-'}</Badge></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(item.tier)}`}>{item.tier || '-'}</span></TableCell>
                        <TableCell className="text-sm">{item.primaryContact || item.email || '-'}</TableCell>
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
                <Truck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No suppliers found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Supplier</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Supplier' : 'Add Supplier'} size="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Supplier name" /></div>
                <div><Label>Trading Name</Label><Input value={form.tradingName} onChange={e => setForm(p => ({ ...p, tradingName: e.target.value }))} placeholder="Trading name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Registration No.</Label><Input value={form.registrationNo} onChange={e => setForm(p => ({ ...p, registrationNo: e.target.value }))} placeholder="Company registration" /></div>
                <div><Label>VAT Number</Label><Input value={form.vatNumber} onChange={e => setForm(p => ({ ...p, vatNumber: e.target.value }))} placeholder="VAT number" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Tier</Label><Select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. IT, Manufacturing" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Primary Contact</Label><Input value={form.primaryContact} onChange={e => setForm(p => ({ ...p, primaryContact: e.target.value }))} placeholder="Contact name" /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email address" /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" /></div>
              </div>
              <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Address</Label><Input value={form.addressLine1} onChange={e => setForm(p => ({ ...p, addressLine1: e.target.value }))} placeholder="Street address" /></div>
                <div><Label>City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Postcode</Label><Input value={form.postcode} onChange={e => setForm(p => ({ ...p, postcode: e.target.value }))} placeholder="Postcode" /></div>
                <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Country" /></div>
                <div><Label>Payment Terms</Label><Input value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))} placeholder="e.g. Net 30" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Approved Date</Label><Input type="date" value={form.approvedDate} onChange={e => setForm(p => ({ ...p, approvedDate: e.target.value }))} /></div>
                <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} /></div>
                <div><Label>Annual Spend</Label><Input type="number" value={form.annualSpend} onChange={e => setForm(p => ({ ...p, annualSpend: e.target.value }))} placeholder="0.00" /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.name}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
