'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, Plus, Search, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface Ir35Assessment {
  id: string;
  contractorName: string;
  contractorEmail?: string;
  engagementDesc?: string;
  clientName?: string;
  determination: 'PENDING' | 'INSIDE' | 'OUTSIDE';
  assessmentDate?: string;
  assessedBy?: string;
  reasoning?: string;
  reviewDate?: string;
  notes?: string;
  createdAt: string;
}

interface Ir35Form {
  contractorName: string;
  contractorEmail: string;
  engagementDesc: string;
  clientName: string;
  determination: Ir35Assessment['determination'];
  assessedBy: string;
  reasoning: string;
}

const EMPTY_FORM: Ir35Form = { contractorName: '', contractorEmail: '', engagementDesc: '', clientName: '', determination: 'PENDING', assessedBy: '', reasoning: '' };

const MOCK_ASSESSMENTS: Ir35Assessment[] = [
  { id: '1', contractorName: 'James Richardson', contractorEmail: 'james@consulting.co.uk', engagementDesc: 'Senior software developer — backend services', clientName: 'Nexara IMS Ltd', determination: 'OUTSIDE', assessmentDate: '2026-01-15T00:00:00Z', assessedBy: 'HR Director', reasoning: 'Contractor operates through limited company, uses own equipment, has multiple clients', createdAt: '2026-01-15T00:00:00Z' },
  { id: '2', contractorName: 'Sarah Williams', contractorEmail: 'sarah.w@mail.com', engagementDesc: 'Project manager — compliance programme', clientName: 'Nexara IMS Ltd', determination: 'INSIDE', assessmentDate: '2026-02-01T00:00:00Z', assessedBy: 'Finance Director', reasoning: 'Embedded in client team, supervised, single client, no substitution right', createdAt: '2026-02-01T00:00:00Z' },
  { id: '3', contractorName: 'Michael Chen', contractorEmail: 'm.chen@dev.io', engagementDesc: 'Data analyst — 6 month contract', clientName: 'Nexara Analytics', determination: 'PENDING', createdAt: '2026-02-10T00:00:00Z' },
];

const DET_CONFIG: Record<Ir35Assessment['determination'], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  OUTSIDE: { label: 'Outside IR35', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  INSIDE: { label: 'Inside IR35', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: AlertTriangle },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
};

export default function Ir35Page() {
  const [assessments, setAssessments] = useState<Ir35Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detFilter, setDetFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Ir35Form>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.get('/ir35');
      setAssessments(r.data.data || MOCK_ASSESSMENTS);
    } catch {
      setAssessments(MOCK_ASSESSMENTS);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.contractorName) return;
    setSaving(true);
    try {
      await api.post('/ir35', form);
      await load(); setShowModal(false); setForm(EMPTY_FORM);
    } catch {
      setAssessments((prev) => [{ id: Date.now().toString(), ...form, createdAt: new Date().toISOString() }, ...prev]);
      setShowModal(false); setForm(EMPTY_FORM);
    } finally { setSaving(false); }
  }

  const filtered = assessments.filter((a) => {
    const matchSearch = !search || a.contractorName.toLowerCase().includes(search.toLowerCase()) || (a.clientName || '').toLowerCase().includes(search.toLowerCase());
    const matchDet = !detFilter || a.determination === detFilter;
    return matchSearch && matchDet;
  });

  const counts = { OUTSIDE: 0, INSIDE: 0, PENDING: 0 };
  assessments.forEach((a) => { counts[a.determination] = (counts[a.determination] || 0) + 1; });

  if (loading) return <div className="p-8 flex items-center justify-center min-h-96"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">IR35 Assessments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">UK off-payroll working rules — contractor determinations</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus className="h-4 w-4" /> New Assessment
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {(Object.entries(DET_CONFIG) as [Ir35Assessment['determination'], typeof DET_CONFIG[keyof typeof DET_CONFIG]][]).map(([det, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={det} onClick={() => setDetFilter(detFilter === det ? '' : det)} className={`rounded-xl p-4 cursor-pointer border-2 transition-all ${detFilter === det ? 'border-blue-500 shadow' : 'border-transparent'} ${cfg.color}`}>
                <div className="flex items-center gap-2 mb-1"><Icon className="h-4 w-4" /><p className="text-sm font-medium">{cfg.label}</p></div>
                <p className="text-2xl font-bold">{counts[det]}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search contractors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
          </div>
          <select value={detFilter} onChange={(e) => setDetFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
            <option value="">All Determinations</option>
            {Object.entries(DET_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-5 w-5 text-blue-600" /> Assessments ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {['Contractor', 'Engagement', 'Client', 'Determination', 'Assessed By', 'Date'].map((h) => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const cfg = DET_CONFIG[a.determination];
                    const Icon = cfg.icon;
                    return (
                      <tr key={a.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{a.contractorName}</p>
                          {a.contractorEmail && <p className="text-xs text-gray-400 dark:text-gray-500">{a.contractorEmail}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-xs truncate">{a.engagementDesc || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{a.clientName || '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}><Icon className="h-3 w-3" />{cfg.label}</span></td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">{a.assessedBy || '—'}</td>
                        <td className="py-3 px-4 text-gray-400 dark:text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500"><Users className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No assessments found.</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">New IR35 Assessment</h2>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Name *</label><input type="text" value={form.contractorName} onChange={(e) => setForm({ ...form, contractorName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={form.contractorEmail} onChange={(e) => setForm({ ...form, contractorEmail: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Engagement Description</label><input type="text" value={form.engagementDesc} onChange={(e) => setForm({ ...form, engagementDesc: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Determination</label><select value={form.determination} onChange={(e) => setForm({ ...form, determination: e.target.value as Ir35Assessment['determination'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">{Object.entries(DET_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assessed By</label><input type="text" value={form.assessedBy} onChange={(e) => setForm({ ...form, assessedBy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reasoning</label><textarea rows={3} value={form.reasoning} onChange={(e) => setForm({ ...form, reasoning: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.contractorName} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add Assessment'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
