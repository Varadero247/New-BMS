'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { GitMerge, Plus, Search, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SodRule {
  id: string;
  role1: string;
  role2: string;
  conflictType?: string;
  description?: string;
  mitigatingControl?: string;
  isActive: boolean;
  createdAt?: string;
}

interface SodForm {
  role1: string;
  role2: string;
  conflictType: string;
  description: string;
  mitigatingControl: string;
  isActive: boolean;
}

const EMPTY_FORM: SodForm = { role1: '', role2: '', conflictType: '', description: '', mitigatingControl: '', isActive: true };

const MOCK_RULES: SodRule[] = [
  { id: '1', role1: 'Accounts Payable Clerk', role2: 'Payment Approver', conflictType: 'FINANCIAL', description: 'Creating payables and approving payment creates fraud risk', mitigatingControl: 'Monthly AP reconciliation reviewed by CFO', isActive: true },
  { id: '2', role1: 'Payroll Administrator', role2: 'HR Data Entry', conflictType: 'PAYROLL', description: 'Ghost employee creation risk if same person manages HR and payroll data', mitigatingControl: 'Dual approval for new payroll additions', isActive: true },
  { id: '3', role1: 'IT Administrator', role2: 'Finance System User', conflictType: 'ACCESS', description: 'System admin can modify financial data and access logs', mitigatingControl: 'Read-only access for IT in production finance systems', isActive: true },
  { id: '4', role1: 'Purchasing Manager', role2: 'Vendor Master Admin', conflictType: 'PROCUREMENT', description: 'Same person can add fraudulent vendors and raise POs to them', mitigatingControl: 'All new vendor additions require CFO approval', isActive: true },
  { id: '5', role1: 'Cash Receipts Clerk', role2: 'Bank Reconciler', conflictType: 'CASH', description: 'Misappropriation of cash receipts possible', mitigatingControl: 'Segregated until quarterly audit', isActive: false },
];

const CONFLICT_COLORS: Record<string, string> = {
  FINANCIAL: 'bg-red-100 text-red-700',
  PAYROLL: 'bg-purple-100 text-purple-700',
  ACCESS: 'bg-blue-100 text-blue-700',
  PROCUREMENT: 'bg-amber-100 text-amber-700',
  CASH: 'bg-orange-100 text-orange-700',
};

export default function SodMatrixPage() {
  const [rules, setRules] = useState<SodRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<SodForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/sod-matrix');
      setRules(r.data.data || MOCK_RULES);
    } catch {
      setRules(MOCK_RULES);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.role1 || !form.role2) return;
    setSaving(true);
    try {
      await api.post('/sod-matrix', form);
      await load(); setShowModal(false); setForm(EMPTY_FORM);
    } catch {
      setRules((prev) => [{ id: Date.now().toString(), ...form }, ...prev]);
      setShowModal(false); setForm(EMPTY_FORM);
    } finally { setSaving(false); }
  }

  const filtered = rules.filter((r) =>
    !search || r.role1.toLowerCase().includes(search.toLowerCase()) || r.role2.toLowerCase().includes(search.toLowerCase()) || (r.conflictType || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = rules.filter((r) => r.isActive).length;
  const conflictTypes = [...new Set(rules.map((r) => r.conflictType).filter(Boolean))];

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Segregation of Duties</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">SOD conflict rules matrix — internal control framework</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> Add Rule
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" /><p className="text-sm font-medium text-red-700 dark:text-red-300">Active Conflicts</p></div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{activeCount}</p>
          </div>
          <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-gray-600 dark:text-gray-400" /><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Inactive Rules</p></div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{rules.length - activeCount}</p>
          </div>
          <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2 mb-1"><GitMerge className="h-4 w-4 text-blue-600 dark:text-blue-400" /><p className="text-sm font-medium text-blue-700 dark:text-blue-300">Conflict Types</p></div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{conflictTypes.length}</p>
          </div>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search rules..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitMerge className="h-5 w-5 text-blue-600" /> SOD Rules ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((r) => (
                <div key={r.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className={`p-1.5 rounded-lg shrink-0 ${r.isActive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <AlertTriangle className={`h-4 w-4 ${r.isActive ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.role1}</span>
                        <span className="text-xs text-gray-400">⟷</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.role2}</span>
                        {r.conflictType && <span className={`text-xs font-medium px-2 py-0.5 rounded ${CONFLICT_COLORS[r.conflictType] || 'bg-gray-100 text-gray-600'}`}>{r.conflictType}</span>}
                        {!r.isActive && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">Inactive</span>}
                      </div>
                      {r.description && <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>}
                      {r.mitigatingControl && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-green-700 dark:text-green-400">{r.mitigatingControl}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500"><GitMerge className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No SOD rules found.</p></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add SOD Rule</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role 1 *</label><input type="text" value={form.role1} onChange={(e) => setForm({ ...form, role1: e.target.value })} placeholder="e.g. AP Clerk" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role 2 *</label><input type="text" value={form.role2} onChange={(e) => setForm({ ...form, role2: e.target.value })} placeholder="e.g. Payment Approver" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Conflict Type</label><input type="text" value={form.conflictType} onChange={(e) => setForm({ ...form, conflictType: e.target.value })} placeholder="FINANCIAL / PAYROLL / ACCESS" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigating Control</label><input type="text" value={form.mitigatingControl} onChange={(e) => setForm({ ...form, mitigatingControl: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /><span className="text-sm text-gray-700 dark:text-gray-300">Active</span></label>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.role1 || !form.role2} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Rule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
