'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Truck, Plus, Search, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface Supplier {
  id: string;
  name: string;
  referenceNumber: string;
  classification: string;
  qualificationStatus: string;
  iso13485Certified: boolean;
  lastAuditDate: string | null;
  nextAuditDate: string | null;
  riskLevel: string;
  products: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  QUALIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONDITIONAL: 'bg-orange-100 text-orange-700',
  DISQUALIFIED: 'bg-red-100 text-red-700',
};

const riskColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', classification: 'CRITICAL', products: '', iso13485Certified: false,
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await api.post('/suppliers', form);
      setCreateModalOpen(false);
      loadSuppliers();
    } catch (err) {
      console.error('Failed to create supplier:', err);
    } finally {
      setSaving(false);
    }
  }

  const filtered = suppliers.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.qualificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Supplier Controls</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">ISO 13485 supplier qualification and monitoring</p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => { setForm({ name: '', classification: 'CRITICAL', products: '', iso13485Certified: false }); setCreateModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Supplier
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input type="text" aria-label="Search suppliers..." placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm" />
              </div>
              <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm">
                <option value="">All Status</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PENDING">Pending</option>
                <option value="CONDITIONAL">Conditional</option>
                <option value="DISQUALIFIED">Disqualified</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-teal-600" />
              Suppliers ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ref</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Classification</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ISO 13485</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Risk</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Next Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs text-gray-600">{s.referenceNumber}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{s.name}</td>
                        <td className="py-3 px-4 text-gray-600">{s.classification}</td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[s.qualificationStatus] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{s.qualificationStatus}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.iso13485Certified ? <FileCheck className="h-4 w-4 text-green-600 mx-auto" /> : <span className="text-gray-400 dark:text-gray-500">-</span>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={riskColors[s.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>{s.riskLevel}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{s.nextAuditDate ? new Date(s.nextAuditDate).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No suppliers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add Supplier" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classification</label>
              <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm">
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Products/Services</label>
              <input type="text" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.iso13485Certified} onChange={(e) => setForm({ ...form, iso13485Certified: e.target.checked })} className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">ISO 13485 certified</span>
          </label>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
            {saving ? 'Adding...' : 'Add Supplier'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
