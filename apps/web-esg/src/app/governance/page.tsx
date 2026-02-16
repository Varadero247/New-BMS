'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Shield, Pencil, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface GovernanceMetric {
  id: string;
  category: string;
  indicator: string;
  value: string;
  compliance: string;
  lastReview: string;
  nextReview: string;
  responsible: string;
  status: string;
  notes?: string;
}

type FormData = Omit<GovernanceMetric, 'id'>;

const categoryColors: Record<string, string> = {
  BOARD: 'bg-purple-100 text-purple-700',
  RISK: 'bg-red-100 text-red-700',
  ETHICS: 'bg-blue-100 text-blue-700',
  TRANSPARENCY: 'bg-green-100 text-green-700',
  EXECUTIVE_PAY: 'bg-amber-100 text-amber-700',
  ANTI_CORRUPTION: 'bg-rose-100 text-rose-700',
};

const empty: FormData = {
  category: 'BOARD',
  indicator: '',
  value: '',
  compliance: 'COMPLIANT',
  lastReview: new Date().toISOString().split('T')[0],
  nextReview: '',
  responsible: '',
  status: 'ACTIVE',
  notes: '',
};

export default function GovernancePage() {
  const [metrics, setMetrics] = useState<GovernanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GovernanceMetric | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadMetrics(); }, []);

  async function loadMetrics() {
    try {
      const res = await api.get('/governance');
      setMetrics(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(m: GovernanceMetric) {
    setEditing(m);
    setForm({ category: m.category, indicator: m.indicator, value: m.value, compliance: m.compliance, lastReview: m.lastReview?.split('T')[0] || '', nextReview: m.nextReview?.split('T')[0] || '', responsible: m.responsible, status: m.status, notes: m.notes || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/governance/${editing.id}`, form);
        setMetrics(prev => prev.map(m => m.id === editing.id ? res.data.data : m));
      } else {
        const res = await api.post('/governance', form);
        setMetrics(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/governance/${id}`);
      setMetrics(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = metrics.filter(m => {
    const matchesSearch = !searchTerm || JSON.stringify(m).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !categoryFilter || m.category === categoryFilter;
    const matchesComp = !complianceFilter || m.compliance === complianceFilter;
    return matchesSearch && matchesCat && matchesComp;
  });

  const compliant = metrics.filter(m => m.compliance === 'COMPLIANT').length;
  const nonCompliant = metrics.filter(m => m.compliance !== 'COMPLIANT').length;
  const compliancePct = metrics.length > 0 ? Math.round((compliant / metrics.length) * 100) : 0;
  const today = new Date();
  const overdue = metrics.filter(m => m.nextReview && new Date(m.nextReview) < today).length;

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Governance</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track governance metrics, board composition, and compliance indicators</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Indicator
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Indicators', value: metrics.length, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'Compliant', value: compliant, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Non-Compliant', value: nonCompliant, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Overdue Reviews', value: overdue, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              {c.label === 'Compliant' && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{compliancePct}% compliance rate</p>}
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" aria-label="Search governance indicators..." placeholder="Search governance indicators..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Categories</option>
              <option value="BOARD">Board Composition</option>
              <option value="RISK">Risk Management</option>
              <option value="ETHICS">Ethics & Conduct</option>
              <option value="TRANSPARENCY">Transparency</option>
              <option value="EXECUTIVE_PAY">Executive Pay</option>
              <option value="ANTI_CORRUPTION">Anti-Corruption</option>
            </select>
            <select aria-label="Filter by compliance" value={complianceFilter} onChange={e => setComplianceFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Compliance</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" />Governance Indicators ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Indicator</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Compliance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Responsible</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Next Review</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(m => {
                      const isOverdue = m.nextReview && new Date(m.nextReview) < today;
                      return (
                        <tr key={m.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[m.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{m.category?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{m.indicator}</td>
                          <td className="py-3 px-4 text-gray-600">{m.value}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${m.compliance === 'COMPLIANT' ? 'bg-green-100 text-green-700' : m.compliance === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {m.compliance === 'COMPLIANT' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {m.compliance?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{m.responsible}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                              {isOverdue && <Calendar className="h-3 w-3" />}
                              {m.nextReview ? new Date(m.nextReview).toLocaleDateString() : '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${m.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{m.status}</span></td>
                          <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(m)} className="text-gray-400 dark:text-gray-500 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteId(m.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No governance indicators found</p>
                <p className="text-sm mt-1">Click "Add Indicator" to start tracking governance metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Governance Indicator' : 'Add Governance Indicator'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="BOARD">Board Composition</option>
                <option value="RISK">Risk Management</option>
                <option value="ETHICS">Ethics & Conduct</option>
                <option value="TRANSPARENCY">Transparency</option>
                <option value="EXECUTIVE_PAY">Executive Pay</option>
                <option value="ANTI_CORRUPTION">Anti-Corruption</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indicator Name *</label>
              <input value={form.indicator} onChange={e => setForm(f => ({ ...f, indicator: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Board Gender Diversity, Whistleblowing Policy" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value / Measurement</label>
              <input value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 40%, Yes, 5 members" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compliance</label>
              <select value={form.compliance} onChange={e => setForm(f => ({ ...f, compliance: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="COMPLIANT">Compliant</option>
                <option value="PARTIAL">Partial</option>
                <option value="NON_COMPLIANT">Non-Compliant</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsible Person</label>
              <input value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Name or role" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Review Date</label>
              <input type="date" value={form.lastReview} onChange={e => setForm(f => ({ ...f, lastReview: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Review Date</label>
              <input type="date" value={form.nextReview} onChange={e => setForm(f => ({ ...f, nextReview: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Additional notes..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.indicator} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Indicator'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Governance Indicator" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this governance indicator?</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
