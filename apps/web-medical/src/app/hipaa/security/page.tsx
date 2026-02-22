'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Lock, CheckCircle, AlertCircle, XCircle, Sprout } from 'lucide-react';
import { api } from '@/lib/api';

interface SecurityControl {
  id: string;
  cfr45Section: string;
  category: string;
  specification: string;
  title: string;
  description: string;
  implementationStatus: string;
  implementationNotes?: string;
  evidence?: string;
  owner?: string;
  lastAssessed?: string;
}

const STATUS_COLORS: Record<string, string> = {
  FULLY_IMPLEMENTED: 'bg-green-100 text-green-700',
  PARTIALLY_IMPLEMENTED: 'bg-yellow-100 text-yellow-700',
  NOT_IMPLEMENTED: 'bg-red-100 text-red-700',
  NOT_APPLICABLE: 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  FULLY_IMPLEMENTED: <CheckCircle className="w-4 h-4 text-green-600" />,
  PARTIALLY_IMPLEMENTED: <AlertCircle className="w-4 h-4 text-yellow-600" />,
  NOT_IMPLEMENTED: <XCircle className="w-4 h-4 text-red-600" />,
  NOT_APPLICABLE: <XCircle className="w-4 h-4 text-gray-400" />,
};

const CATEGORIES = ['ALL', 'ADMINISTRATIVE', 'PHYSICAL', 'TECHNICAL'];
const STATUSES = ['ALL', 'NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'FULLY_IMPLEMENTED', 'NOT_APPLICABLE'];

export default function HipaaSecurityPage() {
  const [controls, setControls] = useState<SecurityControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editing, setEditing] = useState<SecurityControl | null>(null);
  const [form, setForm] = useState({
    implementationStatus: 'NOT_IMPLEMENTED',
    implementationNotes: '',
    evidence: '',
    owner: '',
    riskIfNotImplemented: '',
  });

  const fetchControls = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (categoryFilter !== 'ALL') params.set('category', categoryFilter);
    if (statusFilter !== 'ALL') params.set('implementationStatus', statusFilter);
    api.get(`/hipaa/security?${params}`)
      .then((r) => setControls(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchControls(); }, [categoryFilter, statusFilter]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post('/hipaa/security/seed');
      fetchControls();
    } catch (e) { console.error(e); }
    setSeeding(false);
  };

  const openEdit = (ctrl: SecurityControl) => {
    setEditing(ctrl);
    setForm({
      implementationStatus: ctrl.implementationStatus,
      implementationNotes: ctrl.implementationNotes ?? '',
      evidence: ctrl.evidence ?? '',
      owner: ctrl.owner ?? '',
      riskIfNotImplemented: '',
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await api.put(`/hipaa/security/${editing.id}/implementation`, form);
    setEditing(null);
    fetchControls();
  };

  const catCounts = (cat: string) => controls.filter((c) => c.category === cat).length;
  const catPct = (cat: string) => {
    const arr = controls.filter((c) => c.category === cat);
    if (!arr.length) return 0;
    return Math.round((arr.filter((c) => c.implementationStatus === 'FULLY_IMPLEMENTED').length / arr.length) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-7 h-7 text-green-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">HIPAA Security Rule Controls</h1>
            <p className="text-sm text-gray-500">45 CFR §164.308 / §164.310 / §164.312 — Administrative, Physical &amp; Technical Safeguards</p>
          </div>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
        >
          <Sprout className="w-4 h-4" />
          {seeding ? 'Seeding…' : 'Seed Controls'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['ADMINISTRATIVE', 'PHYSICAL', 'TECHNICAL'].map((cat) => (
          <Card key={cat}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 capitalize">{cat.toLowerCase()}</p>
              <p className={`text-2xl font-bold ${catPct(cat) >= 80 ? 'text-green-600' : catPct(cat) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {catPct(cat)}%
              </p>
              <p className="text-xs text-gray-400">{catCounts(cat)} controls</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading controls…</p> : (
        <div className="space-y-2">
          {controls.map((ctrl) => (
            <Card key={ctrl.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {STATUS_ICONS[ctrl.implementationStatus]}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-500">{ctrl.cfr45Section}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ctrl.implementationStatus]}`}>
                          {ctrl.implementationStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          {ctrl.specification}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm mt-1">{ctrl.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ctrl.description}</p>
                      {ctrl.owner && <p className="text-xs text-gray-400 mt-1">Owner: {ctrl.owner}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(ctrl)}
                    className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50 text-gray-600 flex-shrink-0"
                  >
                    Update
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!controls.length && (
            <p className="text-center text-gray-400 text-sm py-8">No controls found. Click &quot;Seed Controls&quot; to populate the 41 HIPAA implementation specifications.</p>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-base">Update Implementation — {editing.cfr45Section}</CardTitle>
              <p className="text-sm text-gray-500">{editing.title}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Implementation Status</label>
                <select
                  value={form.implementationStatus}
                  onChange={(e) => setForm({ ...form, implementationStatus: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                >
                  {['NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'FULLY_IMPLEMENTED', 'NOT_APPLICABLE'].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Implementation Notes</label>
                <textarea
                  value={form.implementationNotes}
                  onChange={(e) => setForm({ ...form, implementationNotes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Evidence</label>
                <input
                  value={form.evidence}
                  onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="Policy name, document reference…"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Owner</label>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  placeholder="CISO, Privacy Officer…"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                <button onClick={() => setEditing(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
