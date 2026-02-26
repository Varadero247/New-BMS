'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { FileText, Plus, Search, Edit2, Trash2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Contract {
  id: string;
  name: string;
  vendor: string;
  category: string;
  startDate: string;
  endDate: string;
  annualCost?: number;
  status: string;
  notes?: string;
}

interface ContractForm {
  name: string;
  vendor: string;
  category: string;
  startDate: string;
  endDate: string;
  annualCost: string;
  status: string;
  notes: string;
}

const EMPTY_FORM: ContractForm = { name: '', vendor: '', category: 'SOFTWARE', startDate: '', endDate: '', annualCost: '', status: 'ACTIVE', notes: '' };

const MOCK_CONTRACTS: Contract[] = [
  { id: '1', name: 'Nexara IMS Platform', vendor: 'Nexara DMCC', category: 'SOFTWARE', startDate: '2026-01-01', endDate: '2026-12-31', annualCost: 48000, status: 'ACTIVE' },
  { id: '2', name: 'AWS Cloud Infrastructure', vendor: 'Amazon Web Services', category: 'CLOUD', startDate: '2025-06-01', endDate: '2026-05-31', annualCost: 36000, status: 'EXPIRING_SOON', notes: 'Renewal negotiation in progress' },
  { id: '3', name: 'Cleaning & Facilities Management', vendor: 'CleanPro Ltd', category: 'FACILITIES', startDate: '2024-04-01', endDate: '2027-03-31', annualCost: 24000, status: 'ACTIVE' },
  { id: '4', name: 'Legal Advisory Retainer', vendor: 'Morrison & Partners LLP', category: 'PROFESSIONAL', startDate: '2026-01-01', endDate: '2026-12-31', annualCost: 60000, status: 'ACTIVE' },
  { id: '5', name: 'Legacy ERP System', vendor: 'OldSoft Inc', category: 'SOFTWARE', startDate: '2020-01-01', endDate: '2025-12-31', annualCost: 15000, status: 'EXPIRED', notes: 'Migration to new system complete' },
];

const CATEGORIES = ['SOFTWARE', 'CLOUD', 'FACILITIES', 'PROFESSIONAL', 'MAINTENANCE', 'SECURITY', 'MARKETING', 'LOGISTICS', 'INSURANCE', 'OTHER'];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  EXPIRING_SOON: { label: 'Expiring Soon', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  EXPIRED: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  DRAFT: { label: 'Draft', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

function fmt(n?: number) {
  if (!n) return '—';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

function daysUntilExpiry(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/contracts');
      setContracts(r.data.data?.contracts || MOCK_CONTRACTS);
    } catch {
      setContracts(MOCK_CONTRACTS);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); }
  function openEdit(c: Contract) {
    setForm({ name: c.name, vendor: c.vendor, category: c.category, startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '', annualCost: c.annualCost?.toString() || '', status: c.status, notes: c.notes || '' });
    setEditingId(c.id); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditingId(null); setForm(EMPTY_FORM); }

  async function handleSave() {
    if (!form.name || !form.vendor || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      const payload = { name: form.name, vendor: form.vendor, category: form.category, startDate: form.startDate, endDate: form.endDate, annualCost: form.annualCost ? parseFloat(form.annualCost) : undefined, status: form.status, notes: form.notes || undefined };
      if (editingId) { await api.put(`/contracts/${editingId}`, payload); }
      else { await api.post('/contracts', payload); }
      await load(); closeModal();
    } catch { } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/contracts/${id}`);
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch { } finally { setDeletingId(null); }
  }

  const filtered = contracts.filter((c) => {
    const matchSearch = searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === '' || c.status === statusFilter;
    const matchCat = categoryFilter === '' || c.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  }).sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  const totalValue = contracts.filter((c) => c.status === 'ACTIVE').reduce((s, c) => s + (c.annualCost || 0), 0);
  const expiringSoon = contracts.filter((c) => c.status === 'EXPIRING_SOON').length;
  const active = contracts.filter((c) => c.status === 'ACTIVE').length;

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contracts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage supplier and vendor contracts</p>
          </div>
          <button onClick={openAdd} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Contract
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Annual Value', value: fmt(totalValue), color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
            { label: 'Active Contracts', value: active.toString(), color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
            { label: 'Expiring Soon', value: expiringSoon.toString(), color: expiringSoon > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
            { label: 'Total Contracts', value: contracts.length.toString(), color: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search contracts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-purple-600" /> Contracts ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      {['Contract', 'Vendor', 'Category', 'End Date', 'Days Left', 'Annual Cost', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const days = daysUntilExpiry(c.endDate);
                      const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.ACTIVE;
                      return (
                        <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs">
                            <p>{c.name}</p>
                            {c.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.notes}</p>}
                          </td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-sm">{c.vendor}</td>
                          <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">{c.category}</span></td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(c.endDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium flex items-center gap-1 ${days < 0 ? 'text-red-600' : days <= 60 ? 'text-amber-600' : 'text-gray-500'}`}>
                              {days < 0 ? (<><AlertTriangle className="h-3 w-3" /> Expired</>) : days <= 60 ? (<><AlertTriangle className="h-3 w-3" /> {days}d</>) : `${days}d`}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{fmt(c.annualCost)}</td>
                          <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(c)} className="p-1 text-gray-400 hover:text-purple-600"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No contracts found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Contract' : 'Add Contract'}</h2>
              <button onClick={closeModal}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. Software Licence Agreement" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor *</label>
                  <input type="text" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Supplier name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Cost (£)</label>
                  <input type="number" step="0.01" value={form.annualCost} onChange={(e) => setForm({ ...form, annualCost: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Additional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.vendor || !form.startDate || !form.endDate} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
