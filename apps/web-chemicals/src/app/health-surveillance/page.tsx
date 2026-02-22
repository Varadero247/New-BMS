'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Heart, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SurveillanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  jobRole: string;
  department: string | null;
  substancesExposed: string[];
  surveillanceType: string;
  examinationDate: string;
  conductedBy: string;
  result: string;
  nextSurveillanceDue: string | null;
}

const RESULT_COLOURS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-700',
  BORDERLINE: 'bg-yellow-100 text-yellow-700',
  ABNORMAL: 'bg-orange-100 text-orange-700',
  REQUIRES_FOLLOW_UP: 'bg-red-100 text-red-700',
  UNFIT_FOR_ROLE: 'bg-red-200 text-red-800',
};

const SURVEILLANCE_TYPES = ['LUNG_FUNCTION', 'SKIN_CHECK', 'BLOOD_TEST', 'URINE_TEST', 'AUDIOMETRY', 'VISION_TEST', 'GENERAL_HEALTH', 'BIOLOGICAL_MONITORING', 'OTHER'];
const RESULTS = ['NORMAL', 'BORDERLINE', 'ABNORMAL', 'REQUIRES_FOLLOW_UP', 'UNFIT_FOR_ROLE'];

export default function HealthSurveillancePage() {
  const [records, setRecords] = useState<SurveillanceRecord[]>([]);
  const [dashboard, setDashboard] = useState({ total: 0, abnormal: 0, unfit: 0, overdueForReview: 0, dueSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<SurveillanceRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [substancesInput, setSubstancesInput] = useState('');
  const [form, setForm] = useState({
    employeeId: '', employeeName: '', jobRole: '', department: '',
    surveillanceType: 'LUNG_FUNCTION', examinationDate: '', conductedBy: '',
    result: 'NORMAL', nextSurveillanceDue: '', notes: '',
  });

  useEffect(() => { load(); loadDashboard(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterResult) params.result = filterResult;
      if (filterType) params.surveillanceType = filterType;
      const res = await api.get('/health-surveillance', { params });
      setRecords(res.data.data || []);
    } catch {
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard() {
    try {
      const res = await api.get('/health-surveillance/dashboard');
      setDashboard(res.data.data || dashboard);
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        substancesExposed: substancesInput.split(',').map(s => s.trim()).filter(Boolean),
        nextSurveillanceDue: form.nextSurveillanceDue || undefined,
        department: form.department || undefined,
        notes: form.notes || undefined,
      };
      if (selected) {
        await api.put(`/health-surveillance/${selected.id}`, payload);
      } else {
        await api.post('/health-surveillance', payload);
      }
      setShowModal(false);
      setSelected(null);
      resetForm();
      await Promise.all([load(), loadDashboard()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ employeeId: '', employeeName: '', jobRole: '', department: '', surveillanceType: 'LUNG_FUNCTION', examinationDate: '', conductedBy: '', result: 'NORMAL', nextSurveillanceDue: '', notes: '' });
    setSubstancesInput('');
  }

  function openEdit(rec: SurveillanceRecord) {
    setSelected(rec);
    setForm({ employeeId: rec.employeeId, employeeName: rec.employeeName, jobRole: rec.jobRole, department: rec.department || '', surveillanceType: rec.surveillanceType, examinationDate: rec.examinationDate.slice(0, 10), conductedBy: rec.conductedBy, result: rec.result, nextSurveillanceDue: rec.nextSurveillanceDue ? rec.nextSurveillanceDue.slice(0, 10) : '', notes: '' });
    setSubstancesInput(rec.substancesExposed.join(', '));
    setShowModal(true);
  }

  const filtered = records.filter(r =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    r.jobRole.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-600" />
            Health Surveillance
          </h1>
          <p className="text-gray-500 mt-1">COSHH Regulation 11 — Health surveillance for exposed workers</p>
        </div>
        <button onClick={() => { resetForm(); setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Record
        </button>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total', value: dashboard.total, icon: Heart, colour: 'text-blue-600' },
          { label: 'Abnormal', value: dashboard.abnormal, icon: AlertTriangle, colour: 'text-orange-600' },
          { label: 'Unfit for Role', value: dashboard.unfit, icon: AlertTriangle, colour: 'text-red-600' },
          { label: 'Overdue', value: dashboard.overdueForReview, icon: Clock, colour: 'text-red-500' },
          { label: 'Due Soon', value: dashboard.dueSoon, icon: Clock, colour: 'text-yellow-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-7 w-7 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-xs text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterResult} onChange={e => { setFilterResult(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Results</option>
          {RESULTS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          {SURVEILLANCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No surveillance records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Job Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Substances</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exam Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Result</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Next Due</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.employeeName}</div>
                    <div className="text-xs text-gray-400">{r.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.jobRole}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.substancesExposed.slice(0, 2).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {r.substancesExposed.length > 2 && <span className="text-xs text-gray-400">+{r.substancesExposed.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.surveillanceType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.examinationDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RESULT_COLOURS[r.result] || 'bg-gray-100'}`}>
                      {r.result.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.nextSurveillanceDue ? new Date(r.nextSurveillanceDue).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
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
            <h2 className="text-xl font-bold mb-4">{selected ? 'Edit Surveillance Record' : 'New Surveillance Record'}</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Job Role *</label>
                  <input value={form.jobRole} onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Substances Exposed To * (comma-separated)</label>
                <input value={substancesInput} onChange={e => setSubstancesInput(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Isocyanates, Styrene" />
              </div>
              <div>
                <label className="text-sm font-medium">Surveillance Type *</label>
                <select value={form.surveillanceType} onChange={e => setForm(f => ({ ...f, surveillanceType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {SURVEILLANCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Examination Date *</label>
                  <input type="date" value={form.examinationDate} onChange={e => setForm(f => ({ ...f, examinationDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Next Surveillance Due</label>
                  <input type="date" value={form.nextSurveillanceDue} onChange={e => setForm(f => ({ ...f, nextSurveillanceDue: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Conducted By *</label>
                <input value={form.conductedBy} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Result *</label>
                <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {RESULTS.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setSelected(null); }} className="px-4 py-2 border rounded text-sm">Cancel</button>
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
