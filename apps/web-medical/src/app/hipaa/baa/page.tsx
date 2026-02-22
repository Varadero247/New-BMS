'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Users, Plus, X, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface Baa {
  id: string;
  businessAssociate: string;
  contactName?: string;
  contactEmail?: string;
  servicesProvided: string;
  phiAccessed: string[];
  status: string;
  effectiveDate: string;
  expiryDate?: string;
  createdBy: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_SIGNATURE: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  EXPIRED: 'bg-red-100 text-red-700',
  TERMINATED: 'bg-red-200 text-red-800',
};

const emptyForm = {
  businessAssociate: '',
  contactName: '',
  contactEmail: '',
  effectiveDate: '',
  expiryDate: '',
  servicesProvided: '',
  phiAccessed: '',
  createdBy: '',
};

export default function HipaaBaaPage() {
  const [baas, setBaas] = useState<Baa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [renewId, setRenewId] = useState<string | null>(null);
  const [renewDate, setRenewDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBaas = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    api.get(`/hipaa/baa?${params}`)
      .then((r) => setBaas(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBaas(); }, [statusFilter]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/hipaa/baa', {
        ...form,
        phiAccessed: form.phiAccessed.split(',').map((s) => s.trim()).filter(Boolean),
        expiryDate: form.expiryDate || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
      });
      setShowCreate(false);
      setForm(emptyForm);
      fetchBaas();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleRenew = async () => {
    if (!renewId || !renewDate) return;
    await api.put(`/hipaa/baa/${renewId}/renew`, { expiryDate: renewDate });
    setRenewId(null);
    setRenewDate('');
    fetchBaas();
  };

  const terminate = async (id: string) => {
    if (!confirm('Terminate this BAA?')) return;
    await api.delete(`/hipaa/baa/${id}`, { data: { terminationReason: 'Administrative termination' } });
    fetchBaas();
  };

  const daysToExpiry = (date?: string) => {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-purple-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Business Associate Agreements</h1>
            <p className="text-sm text-gray-500">45 CFR §164.308(b) — HIPAA BAA Management</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          <Plus className="w-4 h-4" /> Add BAA
        </button>
      </div>

      <div className="flex gap-3">
        {['ALL', 'ACTIVE', 'EXPIRED', 'PENDING_SIGNATURE', 'DRAFT'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="space-y-3">
          {baas.map((b) => {
            const days = daysToExpiry(b.expiryDate);
            return (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{b.businessAssociate}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{b.servicesProvided}</p>
                      {b.contactName && <p className="text-xs text-gray-400">Contact: {b.contactName} {b.contactEmail ? `(${b.contactEmail})` : ''}</p>}
                      <div className="flex gap-4 text-xs text-gray-400 mt-1">
                        <span>Effective: {new Date(b.effectiveDate).toLocaleDateString()}</span>
                        {b.expiryDate && (
                          <span className={days !== null && days < 0 ? 'text-red-600 font-medium' : days !== null && days <= 90 ? 'text-orange-500' : ''}>
                            Expires: {new Date(b.expiryDate).toLocaleDateString()}
                            {days !== null && ` (${days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`})`}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.phiAccessed.map((phi) => (
                          <span key={phi} className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">{phi}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => { setRenewId(b.id); setRenewDate(''); }}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Renew
                      </button>
                      {b.status !== 'TERMINATED' && (
                        <button onClick={() => terminate(b.id)}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!baas.length && <p className="text-center text-gray-400 text-sm py-8">No BAAs found.</p>}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add Business Associate Agreement</CardTitle>
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Business Associate *', key: 'businessAssociate', type: 'text', placeholder: 'Acme Cloud Services' },
                { label: 'Contact Name', key: 'contactName', type: 'text', placeholder: 'John Smith' },
                { label: 'Contact Email', key: 'contactEmail', type: 'email', placeholder: 'john@acme.com' },
                { label: 'Effective Date *', key: 'effectiveDate', type: 'date', placeholder: '' },
                { label: 'Expiry Date', key: 'expiryDate', type: 'date', placeholder: '' },
                { label: 'Created By *', key: 'createdBy', type: 'text', placeholder: 'privacy@clinic.com' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-700">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-700">Services Provided *</label>
                <textarea value={form.servicesProvided} onChange={(e) => setForm({ ...form, servicesProvided: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 h-16" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">PHI Accessed (comma-separated) *</label>
                <input value={form.phiAccessed} onChange={(e) => setForm({ ...form, phiAccessed: e.target.value })}
                  placeholder="demographics, medical records, billing" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreate} disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Add BAA'}
                </button>
                <button onClick={() => setShowCreate(false)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Renew Modal */}
      {renewId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle className="text-base">Renew BAA</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">New Expiry Date *</label>
                <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleRenew} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">Renew</button>
                <button onClick={() => setRenewId(null)} className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
