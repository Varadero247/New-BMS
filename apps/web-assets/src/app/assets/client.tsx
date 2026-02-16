'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@ims/ui';
import { Plus, Package, Loader2, Search } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['ACTIVE', 'IN_SERVICE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'DECOMMISSIONED', 'DISPOSED'] as const;
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'] as const;

interface Asset {
  id: string;
  referenceNumber: string;
  name: string;
  description: string;
  assetTag: string;
  serialNumber: string;
  category: string;
  location: string;
  department: string;
  status: string;
  condition: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
}

interface AssetForm {
  name: string;
  description: string;
  assetTag: string;
  serialNumber: string;
  category: string;
  location: string;
  department: string;
  status: string;
  condition: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchaseCost: string;
  currentValue: string;
  warrantyExpiry: string;
  assignedTo: string;
  notes: string;
}

const emptyForm: AssetForm = {
  name: '', description: '', assetTag: '', serialNumber: '',
  category: '', location: '', department: '', status: 'ACTIVE',
  condition: 'GOOD', manufacturer: '', model: '', purchaseDate: '',
  purchaseCost: '', currentValue: '', warrantyExpiry: '', assignedTo: '', notes: '',
};

export default function AssetsClient() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AssetForm>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadItems = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.get('/assets', { params });
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => { loadItems(); }, [loadItems]);

  function openCreate() { setForm({ ...emptyForm }); setEditId(null); setModalOpen(true); }
  function openEdit(item: Asset) {
    setForm({
      name: item.name || '', description: item.description || '',
      assetTag: item.assetTag || '', serialNumber: item.serialNumber || '',
      category: item.category || '', location: item.location || '',
      department: item.department || '', status: item.status || 'ACTIVE',
      condition: item.condition || 'GOOD', manufacturer: item.manufacturer || '',
      model: item.model || '', purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : '',
      purchaseCost: item.purchaseCost?.toString() || '', currentValue: item.currentValue?.toString() || '',
      warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.split('T')[0] : '',
      assignedTo: item.assignedTo || '', notes: item.notes || '',
    });
    setEditId(item.id);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        purchaseCost: form.purchaseCost ? parseFloat(form.purchaseCost) : undefined,
        currentValue: form.currentValue ? parseFloat(form.currentValue) : undefined,
        purchaseDate: form.purchaseDate || undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
      };
      if (editId) {
        await api.put(`/assets/${editId}`, payload);
      } else {
        await api.post('/assets', payload);
      }
      setModalOpen(false);
      loadItems();
    } catch (err) { console.error('Failed to save asset:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try { await api.delete(`/assets/${id}`); loadItems(); } catch (err) { console.error(err); }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'ACTIVE': case 'IN_SERVICE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'MAINTENANCE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'DECOMMISSIONED': case 'DISPOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  function getConditionColor(condition: string) {
    switch (condition) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'GOOD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'POOR': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Asset Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 55001 asset inventory and tracking</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Asset</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{items.length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Assets</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{items.filter(a => a.status === 'ACTIVE' || a.status === 'IN_SERVICE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Active</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{items.filter(a => a.status === 'MAINTENANCE').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">In Maintenance</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-red-600">{items.filter(a => a.condition === 'CRITICAL' || a.condition === 'POOR').length}</p><p className="text-sm text-gray-500 dark:text-gray-400">Poor/Critical</p></CardContent></Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" aria-label="Search assets" placeholder="Search assets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
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
                      <TableHead>Location</TableHead>
                      <TableHead>Condition</TableHead>
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
                        <TableCell className="text-sm">{item.location || '-'}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>{item.condition || '-'}</span></TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status?.replace(/_/g, ' ') || '-'}</span></TableCell>
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
                <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No assets found</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add First Asset</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Asset' : 'Add Asset'} size="lg">
            <div className="space-y-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Asset name" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Describe the asset..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Asset Tag</Label><Input value={form.assetTag} onChange={e => setForm(p => ({ ...p, assetTag: e.target.value }))} placeholder="e.g. TAG-001" /></div>
                <div><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))} placeholder="Serial number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. IT Equipment" /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Building A" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label><Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</Select></div>
                <div><Label>Condition</Label><Select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>{CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => setForm(p => ({ ...p, manufacturer: e.target.value }))} placeholder="Manufacturer" /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Model" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Department" /></div>
                <div><Label>Assigned To</Label><Input value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} placeholder="Assigned person" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))} /></div>
                <div><Label>Purchase Cost</Label><Input type="number" value={form.purchaseCost} onChange={e => setForm(p => ({ ...p, purchaseCost: e.target.value }))} placeholder="0.00" /></div>
                <div><Label>Current Value</Label><Input type="number" value={form.currentValue} onChange={e => setForm(p => ({ ...p, currentValue: e.target.value }))} placeholder="0.00" /></div>
              </div>
              <div><Label>Warranty Expiry</Label><Input type="date" value={form.warrantyExpiry} onChange={e => setForm(p => ({ ...p, warrantyExpiry: e.target.value }))} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." /></div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving || !form.name}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : editId ? 'Update Asset' : 'Create Asset'}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
