'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { ShieldCheck, Plus, Search, Loader2, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface FinControl {
  id: string;
  title: string;
  description?: string;
  controlType?: string;
  riskArea?: string;
  owner?: string;
  ownerName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' | 'REMEDIATION';
  frequency?: string;
  lastTestedDate?: string;
  nextTestDate?: string;
  testResult?: string;
  evidence?: string;
  notes?: string;
  createdAt: string;
}

interface ControlForm {
  title: string;
  description: string;
  controlType: string;
  riskArea: string;
  ownerName: string;
  status: FinControl['status'];
  frequency: string;
  testResult: string;
}

const EMPTY_FORM: ControlForm = { title: '', description: '', controlType: '', riskArea: '', ownerName: '', status: 'ACTIVE', frequency: '', testResult: '' };

const MOCK_CONTROLS: FinControl[] = [
  { id: '1', title: 'Purchase Order Approval', description: 'All POs over £5,000 require dual approval', controlType: 'PREVENTIVE', riskArea: 'Procurement', ownerName: 'CFO', status: 'ACTIVE', frequency: 'Per transaction', testResult: 'PASS', createdAt: '2026-01-15T00:00:00Z' },
  { id: '2', title: 'Bank Reconciliation', description: 'Monthly reconciliation of all bank accounts', controlType: 'DETECTIVE', riskArea: 'Cash Management', ownerName: 'Finance Manager', status: 'ACTIVE', frequency: 'Monthly', testResult: 'PASS', createdAt: '2026-01-20T00:00:00Z' },
  { id: '3', title: 'Expense Report Review', description: 'Manager approval for all expense submissions', controlType: 'PREVENTIVE', riskArea: 'Expenses', ownerName: 'HR Director', status: 'UNDER_REVIEW', frequency: 'Per submission', createdAt: '2026-02-01T00:00:00Z' },
  { id: '4', title: 'Journal Entry Authorization', description: 'All manual journal entries require controller sign-off', controlType: 'PREVENTIVE', riskArea: 'General Ledger', ownerName: 'Controller', status: 'ACTIVE', frequency: 'Per entry', testResult: 'PASS', createdAt: '2026-02-10T00:00:00Z' },
  { id: '5', title: 'Vendor Master Data Changes', description: 'New vendor onboarding requires compliance check', controlType: 'PREVENTIVE', riskArea: 'Procurement', ownerName: 'Procurement', status: 'REMEDIATION', frequency: 'Per change', testResult: 'FAIL', createdAt: '2026-02-15T00:00:00Z' },
];

const STATUS_CONFIG: Record<FinControl['status'], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  INACTIVE: { label: 'Inactive', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  REMEDIATION: { label: 'Remediation', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export default function ControlsPage() {
  const [controls, setControls] = useState<FinControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ControlForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/controls');
      setControls(r.data.data || MOCK_CONTROLS);
    } catch {
      setControls(MOCK_CONTROLS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.title) return;
    setSaving(true);
    try {
      await api.post('/controls', form);
      await load();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } catch {
      setControls((prev) => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev]);
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  const filtered = controls.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.riskArea || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = { ACTIVE: 0, INACTIVE: 0, UNDER_REVIEW: 0, REMEDIATION: 0 };
  controls.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Controls</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Internal controls register — SOX & audit readiness</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Control
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(Object.entries(counts) as [FinControl['status'], number][]).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <div key={status} onClick={() => setStatusFilter(statusFilter === status ? '' : status)} className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${statusFilter === status ? 'border-blue-500 shadow' : 'border-transparent'} ${cfg.color} bg-opacity-50`}>
                <div className="flex items-center gap-2 mb-1"><Icon className="h-4 w-4" /><p className="text-sm font-medium">{cfg.label}</p></div>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search controls..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-blue-600" /> Controls ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {['Title', 'Type', 'Risk Area', 'Owner', 'Frequency', 'Status', 'Test Result'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{c.title}</p>
                          {c.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 max-w-xs truncate">{c.description}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{c.controlType || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{c.riskArea || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{c.ownerName || c.owner || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{c.frequency || '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span></td>
                        <td className="py-3 px-4">
                          {c.testResult ? (
                            <span className={`text-xs font-medium ${c.testResult === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>{c.testResult}</span>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500"><ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No controls found.</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Financial Control</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Control Type</label><input type="text" value={form.controlType} onChange={(e) => setForm({ ...form, controlType: e.target.value })} placeholder="PREVENTIVE / DETECTIVE" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Area</label><input type="text" value={form.riskArea} onChange={(e) => setForm({ ...form, riskArea: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label><input type="text" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FinControl['status'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.title} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Control'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
