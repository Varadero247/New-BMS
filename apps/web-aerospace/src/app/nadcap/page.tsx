'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface NadcapScope {
  id: string;
  supplierId: string;
  supplierName: string;
  accreditationBody: string;
  certifiedCommodities: string[];
  requiredCommodities: string[];
  scopeGaps: string[];
  certificateRef: string | null;
  accreditationDate: string | null;
  expiryDate: string | null;
  status: string;
  lastAuditDate: string | null;
  nextAuditDate: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  VERIFIED_COMPLIANT: 'bg-green-100 text-green-700',
  SCOPE_GAP_IDENTIFIED: 'bg-red-100 text-red-700',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-gray-100 text-gray-600',
  NOT_REQUIRED: 'bg-blue-100 text-blue-700',
};

const COMMODITY_OPTIONS = [
  'Chemical Processing', 'Coatings', 'Composites', 'Elastomer Seals', 'Electronics',
  'Fluid Distribution Systems', 'Heat Treating', 'Materials Testing', 'Measurement & Inspection',
  'Non Destructive Testing', 'Welding',
];

export default function NadcapPage() {
  const [records, setRecords] = useState<NadcapScope[]>([]);
  const [gaps, setGaps] = useState<NadcapScope[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [certifiedInput, setCertifiedInput] = useState<string[]>([]);
  const [requiredInput, setRequiredInput] = useState<string[]>([]);
  const [form, setForm] = useState({
    supplierId: '', supplierName: '', accreditationBody: 'PRI Nadcap',
    certificateRef: '', accreditationDate: '', expiryDate: '', lastAuditDate: '', nextAuditDate: '',
  });

  useEffect(() => { load(); loadGaps(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/nadcap-scope', { params });
      setRecords(res.data.data || []);
    } catch {
      setError('Failed to load Nadcap records');
    } finally {
      setLoading(false);
    }
  }

  async function loadGaps() {
    try {
      const res = await api.get('/nadcap-scope/gaps');
      setGaps(res.data.data || []);
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        certifiedCommodities: certifiedInput,
        requiredCommodities: requiredInput,
        certificateRef: form.certificateRef || undefined,
        accreditationDate: form.accreditationDate || undefined,
        expiryDate: form.expiryDate || undefined,
        lastAuditDate: form.lastAuditDate || undefined,
        nextAuditDate: form.nextAuditDate || undefined,
      };
      await api.post('/nadcap-scope', payload);
      setShowModal(false);
      resetForm();
      await Promise.all([load(), loadGaps()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ supplierId: '', supplierName: '', accreditationBody: 'PRI Nadcap', certificateRef: '', accreditationDate: '', expiryDate: '', lastAuditDate: '', nextAuditDate: '' });
    setCertifiedInput([]);
    setRequiredInput([]);
  }

  function toggleCommodity(list: string[], setList: (v: string[]) => void, c: string) {
    setList(list.includes(c) ? list.filter(x => x !== c) : [...list, c]);
  }

  const filtered = records.filter(r =>
    r.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    r.supplierId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-blue-700" />
            Nadcap Scope Management
          </h1>
          <p className="text-gray-500 mt-1">AS9100D Clause 8.5.1.2 — Special process accreditation verification</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          <Plus className="h-4 w-4" /> Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Suppliers', value: records.length, icon: Award, colour: 'text-blue-600' },
          { label: 'Scope Gaps', value: gaps.length, icon: AlertCircle, colour: 'text-red-600' },
          { label: 'Verified', value: records.filter(r => r.status === 'VERIFIED_COMPLIANT').length, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'Expiring Soon', value: records.filter(r => r.expiryDate && new Date(r.expiryDate) < new Date(Date.now() + 90 * 86400000)).length, icon: Clock, colour: 'text-yellow-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {gaps.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-700">{gaps.length} Scope Gap{gaps.length > 1 ? 's' : ''} Identified</span>
          </div>
          <div className="space-y-1">
            {gaps.slice(0, 3).map(g => (
              <p key={g.id} className="text-sm text-red-600">
                <strong>{g.supplierName}</strong>: Missing commodities — {g.scopeGaps.join(', ')}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {Object.keys(STATUS_COLOURS).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No Nadcap records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Certified</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Required</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Gaps</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.status === 'SCOPE_GAP_IDENTIFIED' ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.supplierName}</div>
                    <div className="text-xs text-gray-400">{r.supplierId}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.certifiedCommodities.length} commodities</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.requiredCommodities.length} commodities</td>
                  <td className="px-4 py-3">
                    {r.scopeGaps.length > 0 ? (
                      <span className="text-red-600 text-xs font-medium">{r.scopeGaps.length} gap(s)</span>
                    ) : (
                      <span className="text-green-600 text-xs">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[r.status] || 'bg-gray-100'}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Nadcap Supplier</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Supplier ID *</label>
                  <input value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Supplier Name *</label>
                  <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Accreditation Body *</label>
                <input value={form.accreditationBody} onChange={e => setForm(f => ({ ...f, accreditationBody: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Certified Commodities * (select all that apply)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMODITY_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleCommodity(certifiedInput, setCertifiedInput, c)}
                      className={`px-2 py-1 rounded text-xs border ${certifiedInput.includes(c) ? 'bg-blue-700 text-white border-blue-700' : 'border-gray-300 text-gray-600'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Required Commodities * (what your processes need)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMODITY_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleCommodity(requiredInput, setRequiredInput, c)}
                      className={`px-2 py-1 rounded text-xs border ${requiredInput.includes(c) ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-600'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Certificate Reference</label>
                <input value={form.certificateRef} onChange={e => setForm(f => ({ ...f, certificateRef: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Accreditation Date</label>
                  <input type="date" value={form.accreditationDate} onChange={e => setForm(f => ({ ...f, accreditationDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-700 text-white rounded text-sm hover:bg-blue-800 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
