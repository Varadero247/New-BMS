'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, ShieldCheck, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface SupplierScreening {
  id: string;
  supplierName: string;
  supplierCountry: string | null;
  screeningDate: string;
  screenedBy: string;
  criteriaUsed: string[];
  result: string;
  riskRating: string | null;
  actionRequired: string | null;
}

const RESULT_COLOURS: Record<string, string> = {
  PASSED: 'bg-green-100 text-green-700',
  CONDITIONAL_PASS: 'bg-yellow-100 text-yellow-700',
  FAILED: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-gray-100 text-gray-600',
};

const RISK_COLOURS: Record<string, string> = {
  LOW: 'bg-green-50 text-green-600',
  MEDIUM: 'bg-yellow-50 text-yellow-600',
  HIGH: 'bg-orange-50 text-orange-600',
  CRITICAL: 'bg-red-50 text-red-600',
};

const RESULTS = ['PASSED', 'CONDITIONAL_PASS', 'FAILED', 'UNDER_REVIEW', 'PENDING'];
const RISK_RATINGS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CRITERIA_OPTIONS = ['child_labour', 'forced_labour', 'wages', 'health_safety', 'environment', 'discrimination', 'freedom_of_association', 'modern_slavery'];

export default function SupplierScreeningPage() {
  const [screenings, setScreenings] = useState<SupplierScreening[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [form, setForm] = useState({
    supplierName: '', supplierCountry: '', screeningDate: '', screenedBy: '',
    result: 'PENDING', riskRating: '', actionRequired: '',
    childLaborCheck: false, forcedLaborCheck: false, healthSafetyCheck: false, isNewSupplier: false,
  });

  useEffect(() => { load(); loadStats(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterResult) params.result = filterResult;
      if (filterRisk) params.riskRating = filterRisk;
      const res = await api.get('/supplier-social-screening', { params });
      setScreenings(res.data.data || []);
    } catch {
      setError('Failed to load screenings');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get('/supplier-social-screening/stats');
      setStats(res.data.data || {});
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        criteriaUsed: selectedCriteria,
        supplierCountry: form.supplierCountry || undefined,
        riskRating: form.riskRating || undefined,
        actionRequired: form.actionRequired || undefined,
      };
      await api.post('/supplier-social-screening', payload);
      setShowModal(false);
      resetForm();
      await Promise.all([load(), loadStats()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ supplierName: '', supplierCountry: '', screeningDate: '', screenedBy: '', result: 'PENDING', riskRating: '', actionRequired: '', childLaborCheck: false, forcedLaborCheck: false, healthSafetyCheck: false, isNewSupplier: false });
    setSelectedCriteria([]);
  }

  function toggleCriteria(c: string) {
    setSelectedCriteria(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  const filtered = screenings.filter(s =>
    s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    (s.supplierCountry || '').toLowerCase().includes(search.toLowerCase())
  );

  const screeningRate = typeof stats.screeningRate === 'number' ? stats.screeningRate : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            Supplier Social Screening
          </h1>
          <p className="text-gray-500 mt-1">GRI 414-1 — New suppliers screened using social criteria</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Screen Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Screened', value: typeof stats.total === 'number' ? stats.total : 0, icon: ShieldCheck, colour: 'text-blue-600' },
          { label: 'Passed', value: typeof stats.passed === 'number' ? stats.passed : 0, icon: ShieldCheck, colour: 'text-green-600' },
          { label: 'Failed', value: typeof stats.failed === 'number' ? stats.failed : 0, icon: XCircle, colour: 'text-red-600' },
          { label: 'Screening Rate', value: `${screeningRate}%`, icon: TrendingUp, colour: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterResult} onChange={e => { setFilterResult(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Results</option>
          {RESULTS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Risk Levels</option>
          {RISK_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No screenings found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Criteria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Risk</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.supplierCountry || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {s.criteriaUsed.slice(0, 3).map(c => (
                        <span key={c} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">{c.replace(/_/g, ' ')}</span>
                      ))}
                      {s.criteriaUsed.length > 3 && <span className="text-xs text-gray-400">+{s.criteriaUsed.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(s.screeningDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {s.riskRating && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_COLOURS[s.riskRating]}`}>{s.riskRating}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLOURS[s.result] || 'bg-gray-100'}`}>
                      {s.result.replace(/_/g, ' ')}
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
            <h2 className="text-xl font-bold mb-4">Screen Supplier</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Supplier Name *</label>
                <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <input value={form.supplierCountry} onChange={e => setForm(f => ({ ...f, supplierCountry: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Screening Date *</label>
                <input type="date" value={form.screeningDate} onChange={e => setForm(f => ({ ...f, screeningDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Screened By *</label>
                <input value={form.screenedBy} onChange={e => setForm(f => ({ ...f, screenedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Criteria Used * (select at least one)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CRITERIA_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleCriteria(c)}
                      className={`px-2 py-1 rounded text-xs border ${selectedCriteria.includes(c) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 text-gray-600'}`}>
                      {c.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Result *</label>
                <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {RESULTS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Risk Rating</label>
                <select value={form.riskRating} onChange={e => setForm(f => ({ ...f, riskRating: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  <option value="">Select...</option>
                  {RISK_RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Action Required</label>
                <textarea value={form.actionRequired} onChange={e => setForm(f => ({ ...f, actionRequired: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { field: 'childLaborCheck', label: 'Child Labor Check' },
                  { field: 'forcedLaborCheck', label: 'Forced Labor Check' },
                  { field: 'healthSafetyCheck', label: 'Health & Safety Check' },
                  { field: 'isNewSupplier', label: 'New Supplier' },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={(form as Record<string, unknown>)[field] as boolean}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
