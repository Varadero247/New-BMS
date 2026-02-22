'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface BioMonitoringRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  substance: string;
  biologicalMarker: string;
  sampleType: string;
  sampleDate: string;
  measuredValue: number;
  unit: string;
  biologicalGuidanceValue: number | null;
  exceedsBGV: boolean;
  sampledBy: string;
  laboratoryRef: string | null;
}

const SAMPLE_TYPES = ['BLOOD', 'URINE', 'EXHALED_AIR', 'HAIR', 'SALIVA', 'SWEAT'];

export default function BiologicalMonitoringPage() {
  const [records, setRecords] = useState<BioMonitoringRecord[]>([]);
  const [alerts, setAlerts] = useState<{ exceedingBGV: number; overdueMonitoring: number }>({ exceedingBGV: 0, overdueMonitoring: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    employeeId: '', employeeName: '', substance: '', biologicalMarker: '', sampleType: 'BLOOD',
    sampleDate: '', measuredValue: '', unit: 'mg/L', biologicalGuidanceValue: '', sampledBy: '', laboratoryRef: '',
  });

  useEffect(() => { load(); loadAlerts(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.sampleType = filterType;
      const res = await api.get('/biological-monitoring', { params });
      setRecords(res.data.data || []);
    } catch {
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  async function loadAlerts() {
    try {
      const res = await api.get('/biological-monitoring/alerts');
      setAlerts(res.data.data || alerts);
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        measuredValue: parseFloat(form.measuredValue),
        biologicalGuidanceValue: form.biologicalGuidanceValue ? parseFloat(form.biologicalGuidanceValue) : undefined,
        laboratoryRef: form.laboratoryRef || undefined,
      };
      await api.post('/biological-monitoring', payload);
      setShowModal(false);
      resetForm();
      await Promise.all([load(), loadAlerts()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ employeeId: '', employeeName: '', substance: '', biologicalMarker: '', sampleType: 'BLOOD', sampleDate: '', measuredValue: '', unit: 'mg/L', biologicalGuidanceValue: '', sampledBy: '', laboratoryRef: '' });
  }

  const filtered = records.filter(r =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.substance.toLowerCase().includes(search.toLowerCase()) ||
    r.biologicalMarker.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            Biological Monitoring
          </h1>
          <p className="text-gray-500 mt-1">COSHH Regulation 14 — Biological monitoring for chemical exposure</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Sample
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Samples', value: records.length, icon: Activity, colour: 'text-blue-600' },
          { label: 'Exceeding BGV', value: alerts.exceedingBGV, icon: AlertTriangle, colour: 'text-red-600' },
          { label: 'Within BGV', value: records.filter(r => !r.exceedsBGV).length, icon: CheckCircle, colour: 'text-green-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {alerts.exceedingBGV > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm"><strong>{alerts.exceedingBGV} workers</strong> have biological measurements exceeding the Biological Guidance Value (BGV). Immediate review required.</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee or substance..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Sample Types</option>
          {SAMPLE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No biological monitoring records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Substance</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Marker</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sample</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">BGV Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${r.exceedsBGV ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.employeeName}</div>
                    <div className="text-xs text-gray-400">{r.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.substance}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.biologicalMarker}</td>
                  <td className="px-4 py-3 text-gray-600">{r.sampleType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.sampleDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {r.measuredValue} {r.unit}
                    {r.biologicalGuidanceValue && <span className="text-xs text-gray-400 ml-1">(BGV: {r.biologicalGuidanceValue})</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.exceedsBGV ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" /> Exceeds BGV
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" /> Within BGV
                      </span>
                    )}
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
            <h2 className="text-xl font-bold mb-4">Record Biological Sample</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Employee ID *</label>
                  <input value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Employee Name *</label>
                  <input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Substance *</label>
                <input value={form.substance} onChange={e => setForm(f => ({ ...f, substance: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. Lead, Mercury" />
              </div>
              <div>
                <label className="text-sm font-medium">Biological Marker *</label>
                <input value={form.biologicalMarker} onChange={e => setForm(f => ({ ...f, biologicalMarker: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. Blood Lead, Urinary Mercury" />
              </div>
              <div>
                <label className="text-sm font-medium">Sample Type *</label>
                <select value={form.sampleType} onChange={e => setForm(f => ({ ...f, sampleType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {SAMPLE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sample Date *</label>
                <input type="date" value={form.sampleDate} onChange={e => setForm(f => ({ ...f, sampleDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Measured Value *</label>
                  <input type="number" step="0.001" value={form.measuredValue} onChange={e => setForm(f => ({ ...f, measuredValue: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit *</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="mg/L" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Biological Guidance Value (BGV)</label>
                <input type="number" step="0.001" value={form.biologicalGuidanceValue} onChange={e => setForm(f => ({ ...f, biologicalGuidanceValue: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Sampled By *</label>
                <input value={form.sampledBy} onChange={e => setForm(f => ({ ...f, sampledBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Laboratory Reference</label>
                <input value={form.laboratoryRef} onChange={e => setForm(f => ({ ...f, laboratoryRef: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
