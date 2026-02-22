'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Breach {
  id: string;
  referenceNumber: string;
  description: string;
  breachType: string;
  individualsAffected: number;
  status: string;
  discoveredDate: string;
  discoveredBy: string;
  individualNotificationDue?: string;
  hhsNotificationDue?: string;
  individualNotifiedAt?: string;
  hhsNotifiedAt?: string;
  closedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  INVESTIGATING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-orange-100 text-orange-700',
  NOTIFICATION_PENDING: 'bg-blue-100 text-blue-700',
  NOTIFICATION_COMPLETE: 'bg-green-100 text-green-700',
  CLOSED_NOT_BREACH: 'bg-gray-100 text-gray-600',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const BREACH_TYPES = [
  'HACKING_IT_INCIDENT', 'UNAUTHORIZED_ACCESS', 'THEFT', 'LOSS',
  'IMPROPER_DISPOSAL', 'UNAUTHORIZED_DISCLOSURE', 'OTHER',
];

const emptyForm = {
  discoveredDate: '',
  description: '',
  phiInvolved: 'demographics',
  individualsAffected: 0,
  breachType: 'UNAUTHORIZED_ACCESS',
  discoveredBy: '',
};

export default function HipaaBreachPage() {
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dashboard, setDashboard] = useState({ total: 0, open: 0, notified: 0, closed: 0 });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/hipaa/breach?limit=100').then((r) => r.data.data),
      api.get('/hipaa/breach/dashboard').then((r) => r.data.data),
    ])
      .then(([list, dash]) => { setBreaches(list); setDashboard(dash); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/hipaa/breach', {
        ...form,
        phiInvolved: form.phiInvolved.split(',').map((s) => s.trim()).filter(Boolean),
        individualsAffected: Number(form.individualsAffected),
      });
      setShowCreate(false);
      setForm(emptyForm);
      fetchAll();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const notifyIndividuals = async (id: string) => {
    await api.put(`/hipaa/breach/${id}/notify-individuals`);
    fetchAll();
  };

  const notifyHHS = async (id: string) => {
    await api.put(`/hipaa/breach/${id}/notify-hhs`);
    fetchAll();
  };

  const closeBreach = async (id: string, status: 'CLOSED' | 'CLOSED_NOT_BREACH') => {
    await api.put(`/hipaa/breach/${id}/close`, { status });
    fetchAll();
  };

  const daysUntil = (date?: string) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-red-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">HIPAA Breach Notification</h1>
            <p className="text-sm text-gray-500">45 CFR §164.400–414 — 60-day notification deadlines</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          <Plus className="w-4 h-4" /> Report Breach
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: dashboard.total, color: 'text-gray-700' },
          { label: 'Active / Open', value: dashboard.open, color: 'text-red-600' },
          { label: 'Notified', value: dashboard.notified, color: 'text-blue-600' },
          { label: 'Closed', value: dashboard.closed, color: 'text-green-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="space-y-3">
          {breaches.map((b) => {
            const indivDays = daysUntil(b.individualNotificationDue);
            const hhsDays = daysUntil(b.hhsNotificationDue);
            return (
              <Card key={b.id} className="border-l-4 border-l-red-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-500">{b.referenceNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                          {b.individualsAffected.toLocaleString()} individuals
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm mt-1">{b.description}</p>
                      <p className="text-xs text-gray-500">
                        Type: {b.breachType.replace(/_/g, ' ')} · Discovered: {new Date(b.discoveredDate).toLocaleDateString()} · By: {b.discoveredBy}
                      </p>
                      {(b.status === 'INVESTIGATING' || b.status === 'CONFIRMED') && (
                        <div className="mt-2 flex gap-4 text-xs">
                          {indivDays !== null && (
                            <span className={indivDays < 0 ? 'text-red-600 font-semibold' : indivDays <= 14 ? 'text-orange-600' : 'text-gray-500'}>
                              Individual deadline: {indivDays < 0 ? `${Math.abs(indivDays)}d overdue` : `${indivDays}d remaining`}
                            </span>
                          )}
                          {hhsDays !== null && (
                            <span className={hhsDays < 0 ? 'text-red-600 font-semibold' : hhsDays <= 14 ? 'text-orange-600' : 'text-gray-500'}>
                              HHS deadline: {hhsDays < 0 ? `${Math.abs(hhsDays)}d overdue` : `${hhsDays}d remaining`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {!b.individualNotifiedAt && b.status !== 'CLOSED' && b.status !== 'CLOSED_NOT_BREACH' && (
                        <button onClick={() => notifyIndividuals(b.id)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                          Notify Individuals
                        </button>
                      )}
                      {!b.hhsNotifiedAt && b.status !== 'CLOSED' && b.status !== 'CLOSED_NOT_BREACH' && (
                        <button onClick={() => notifyHHS(b.id)} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
                          Notify HHS
                        </button>
                      )}
                      {b.status !== 'CLOSED' && b.status !== 'CLOSED_NOT_BREACH' && (
                        <>
                          <button onClick={() => closeBreach(b.id, 'CLOSED')} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100">
                            Close
                          </button>
                          <button onClick={() => closeBreach(b.id, 'CLOSED_NOT_BREACH')} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                            Not a Breach
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!breaches.length && <p className="text-center text-gray-400 text-sm py-8">No breach notifications recorded.</p>}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Report HIPAA Breach</CardTitle>
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Discovery Date *</label>
                <input type="date" value={form.discoveredDate} onChange={(e) => setForm({ ...form, discoveredDate: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-20" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Breach Type *</label>
                <select value={form.breachType} onChange={(e) => setForm({ ...form, breachType: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                  {BREACH_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">PHI Involved (comma-separated) *</label>
                <input value={form.phiInvolved} onChange={(e) => setForm({ ...form, phiInvolved: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="demographics, diagnoses, financial" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Individuals Affected *</label>
                <input type="number" min="0" value={form.individualsAffected}
                  onChange={(e) => setForm({ ...form, individualsAffected: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Discovered By *</label>
                <input value={form.discoveredBy} onChange={(e) => setForm({ ...form, discoveredBy: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                  {saving ? 'Reporting…' : 'Report Breach'}
                </button>
                <button onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
