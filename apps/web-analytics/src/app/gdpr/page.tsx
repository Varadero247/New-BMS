'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Lock, Plus, XCircle, Loader2, Database, FileCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface DataCategory {
  id: string;
  category: string;
  legalBasis: string;
  retentionDays?: number;
  systems?: string;
  complianceStatus: string;
}

interface Dpa {
  id: string;
  processorName: string;
  purpose: string;
  dataTypes?: string[];
  signedDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  status?: string;
}

const MOCK_CATEGORIES: DataCategory[] = [
  { id: '1', category: 'Employee Personal Data', legalBasis: 'CONTRACT', retentionDays: 2555, systems: 'HR System, Payroll', complianceStatus: 'COMPLIANT' },
  { id: '2', category: 'Customer Contact Data', legalBasis: 'LEGITIMATE_INTERESTS', retentionDays: 1825, systems: 'CRM', complianceStatus: 'COMPLIANT' },
  { id: '3', category: 'Health & Medical Data', legalBasis: 'LEGAL_OBLIGATION', retentionDays: 3650, systems: 'HR System', complianceStatus: 'REVIEW_NEEDED' },
  { id: '4', category: 'Visitor Log Data', legalBasis: 'LEGITIMATE_INTERESTS', retentionDays: 90, systems: 'Access Control System', complianceStatus: 'COMPLIANT' },
];

const MOCK_DPAS: Dpa[] = [
  { id: '1', processorName: 'AWS', purpose: 'Cloud infrastructure hosting', dataTypes: ['Employee data', 'Customer data'], signedDate: '2024-01-15', expiryDate: '2026-12-31', status: 'ACTIVE' },
  { id: '2', processorName: 'HubSpot', purpose: 'CRM and marketing automation', dataTypes: ['Customer contact data', 'Lead data'], signedDate: '2025-03-01', expiryDate: '2027-03-01', status: 'ACTIVE' },
  { id: '3', processorName: 'Payroll Provider Ltd', purpose: 'Payroll processing', dataTypes: ['Employee financial data', 'Tax data'], signedDate: '2023-04-01', expiryDate: '2025-03-31', status: 'EXPIRED' },
];

const LEGAL_BASES = ['CONTRACT', 'LEGAL_OBLIGATION', 'LEGITIMATE_INTERESTS', 'CONSENT', 'VITAL_INTERESTS', 'PUBLIC_TASK'];

const STATUS_COLORS: Record<string, string> = {
  COMPLIANT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  NON_COMPLIANT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  REVIEW_NEEDED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  EXPIRED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  DRAFT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

type Tab = 'categories' | 'dpas';

export default function GdprPage() {
  const [tab, setTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<DataCategory[]>([]);
  const [dpas, setDpas] = useState<Dpa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showDpaModal, setShowDpaModal] = useState(false);
  const [catForm, setCatForm] = useState({ category: '', legalBasis: 'CONTRACT', retentionDays: '', systems: '', complianceStatus: 'COMPLIANT' });
  const [dpaForm, setDpaForm] = useState({ processorName: '', purpose: '', dataTypes: '', signedDate: '', expiryDate: '', documentUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, dpaRes] = await Promise.allSettled([api.get('/gdpr/categories'), api.get('/gdpr/dpas')]);
        setCategories(catRes.status === 'fulfilled' ? (catRes.value.data.data?.categories || MOCK_CATEGORIES) : MOCK_CATEGORIES);
        setDpas(dpaRes.status === 'fulfilled' ? (dpaRes.value.data.data?.dpas || MOCK_DPAS) : MOCK_DPAS);
      } catch {
        setCategories(MOCK_CATEGORIES); setDpas(MOCK_DPAS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createCategory() {
    if (!catForm.category || !catForm.legalBasis) return;
    setSaving(true);
    try {
      await api.post('/gdpr/categories', { category: catForm.category, legalBasis: catForm.legalBasis, retentionDays: catForm.retentionDays ? parseInt(catForm.retentionDays) : undefined, systems: catForm.systems || undefined, complianceStatus: catForm.complianceStatus });
      setShowCatModal(false);
      const r = await api.get('/gdpr/categories');
      setCategories(r.data.data?.categories || categories);
    } catch { } finally { setSaving(false); }
  }

  async function createDpa() {
    if (!dpaForm.processorName || !dpaForm.purpose) return;
    setSaving(true);
    try {
      await api.post('/gdpr/dpas', { processorName: dpaForm.processorName, purpose: dpaForm.purpose, dataTypes: dpaForm.dataTypes ? dpaForm.dataTypes.split(',').map((s) => s.trim()) : undefined, signedDate: dpaForm.signedDate || undefined, expiryDate: dpaForm.expiryDate || undefined, documentUrl: dpaForm.documentUrl || undefined });
      setShowDpaModal(false);
      const r = await api.get('/gdpr/dpas');
      setDpas(r.data.data?.dpas || dpas);
    } catch { } finally { setSaving(false); }
  }

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>;

  const compliant = categories.filter((c) => c.complianceStatus === 'COMPLIANT').length;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">GDPR Data Governance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Data categories, legal bases, retention periods and processor agreements</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Data Categories', value: categories.length, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
            { label: 'Compliant', value: compliant, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
            { label: 'Review Needed', value: categories.filter((c) => c.complianceStatus === 'REVIEW_NEEDED').length, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
            { label: 'Active DPAs', value: dpas.filter((d) => d.status === 'ACTIVE').length, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          {([['categories', 'Data Categories', Database], ['dpas', 'Data Processing Agreements', FileCheck]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'categories' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowCatModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Database className="h-5 w-5 text-purple-600" /> Data Categories ({categories.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {['Category', 'Legal Basis', 'Retention (days)', 'Systems', 'Status'].map((h) => (
                          <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{c.category}</td>
                          <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">{c.legalBasis?.replace(/_/g, ' ')}</span></td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{c.retentionDays ? `${c.retentionDays} days (${Math.round(c.retentionDays / 365)} yrs)` : '—'}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{c.systems || '—'}</td>
                          <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[c.complianceStatus] || 'bg-gray-100 text-gray-700'}`}>{c.complianceStatus}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {tab === 'dpas' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowDpaModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
                <Plus className="h-4 w-4" /> Add DPA
              </button>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileCheck className="h-5 w-5 text-purple-600" /> Data Processing Agreements ({dpas.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {['Processor', 'Purpose', 'Data Types', 'Signed', 'Expires', 'Status'].map((h) => (
                          <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dpas.map((d) => (
                        <tr key={d.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{d.processorName}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs">{d.purpose}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{d.dataTypes?.join(', ') || '—'}</td>
                          <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{d.signedDate ? new Date(d.signedDate).toLocaleDateString() : '—'}</td>
                          <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : '—'}</td>
                          <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.status || ''] || 'bg-gray-100 text-gray-700'}`}>{d.status || 'UNKNOWN'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Data Category</h2>
              <button onClick={() => setShowCatModal(false)}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name *</label>
                <input type="text" value={catForm.category} onChange={(e) => setCatForm({ ...catForm, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. Customer Contact Data" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Basis</label>
                  <select value={catForm.legalBasis} onChange={(e) => setCatForm({ ...catForm, legalBasis: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                    {LEGAL_BASES.map((b) => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retention (days)</label>
                  <input type="number" value={catForm.retentionDays} onChange={(e) => setCatForm({ ...catForm, retentionDays: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. 1825" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Systems</label>
                <input type="text" value={catForm.systems} onChange={(e) => setCatForm({ ...catForm, systems: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. CRM, HR System" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCatModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={createCategory} disabled={saving || !catForm.category} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DPA Modal */}
      {showDpaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Data Processing Agreement</h2>
              <button onClick={() => setShowDpaModal(false)}><XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Processor Name *</label>
                <input type="text" value={dpaForm.processorName} onChange={(e) => setDpaForm({ ...dpaForm, processorName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="e.g. AWS, HubSpot" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose *</label>
                <input type="text" value={dpaForm.purpose} onChange={(e) => setDpaForm({ ...dpaForm, purpose: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Purpose of processing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Types (comma-separated)</label>
                <input type="text" value={dpaForm.dataTypes} onChange={(e) => setDpaForm({ ...dpaForm, dataTypes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" placeholder="Employee data, Customer data" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signed Date</label>
                  <input type="date" value={dpaForm.signedDate} onChange={(e) => setDpaForm({ ...dpaForm, signedDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input type="date" value={dpaForm.expiryDate} onChange={(e) => setDpaForm({ ...dpaForm, expiryDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDpaModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={createDpa} disabled={saving || !dpaForm.processorName || !dpaForm.purpose} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add DPA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
