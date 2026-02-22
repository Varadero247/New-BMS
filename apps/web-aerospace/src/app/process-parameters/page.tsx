'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Gauge, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProcessParameter {
  id: string;
  processName: string;
  partNumber: string | null;
  workOrderRef: string | null;
  processDate: string;
  operatorId: string;
  parameters: { name: string; value: number; unit: string; min: number; max: number; withinLimits: boolean }[];
  processConforms: boolean;
  requiresRequalification: boolean;
  triggerType: string | null;
  requalificationStatus: string | null;
  verifiedBy: string | null;
  notes: string | null;
}

const PROCESS_TYPES = ['HEAT_TREATMENT', 'SURFACE_TREATMENT', 'WELDING', 'SOLDERING', 'PAINTING', 'PLATING', 'NDT', 'MACHINING', 'COMPOSITE_LAYUP', 'OTHER'];
const TRIGGER_TYPES = ['OUT_OF_TOLERANCE', 'OPERATOR_CHANGE', 'EQUIPMENT_CHANGE', 'PROCESS_CHANGE', 'PERIODIC_REVIEW', 'CUSTOMER_REQUEST', 'REGULATORY', 'INCIDENT', 'OTHER'];

export default function ProcessParametersPage() {
  const [records, setRecords] = useState<ProcessParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProcess, setFilterProcess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [paramRows, setParamRows] = useState([{ name: '', value: '', unit: '', min: '', max: '' }]);
  const [form, setForm] = useState({
    processName: 'HEAT_TREATMENT', partNumber: '', workOrderRef: '', processDate: '',
    operatorId: '', verifiedBy: '', notes: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterProcess) params.processName = filterProcess;
      const res = await api.get('/process-parameters', { params });
      setRecords(res.data.data || []);
    } catch {
      setError('Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const parameters = paramRows
        .filter(p => p.name && p.value)
        .map(p => ({
          name: p.name,
          value: parseFloat(p.value),
          unit: p.unit,
          min: parseFloat(p.min),
          max: parseFloat(p.max),
        }));
      const payload = {
        ...form,
        parameters,
        partNumber: form.partNumber || undefined,
        workOrderRef: form.workOrderRef || undefined,
        verifiedBy: form.verifiedBy || undefined,
        notes: form.notes || undefined,
      };
      await api.post('/process-parameters', payload);
      setShowModal(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ processName: 'HEAT_TREATMENT', partNumber: '', workOrderRef: '', processDate: '', operatorId: '', verifiedBy: '', notes: '' });
    setParamRows([{ name: '', value: '', unit: '', min: '', max: '' }]);
  }

  function addParamRow() {
    setParamRows(prev => [...prev, { name: '', value: '', unit: '', min: '', max: '' }]);
  }

  function updateParamRow(idx: number, field: string, value: string) {
    setParamRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  const filtered = records.filter(r =>
    r.processName.toLowerCase().includes(search.toLowerCase()) ||
    (r.partNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    r.operatorId.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: records.length,
    conforming: records.filter(r => r.processConforms).length,
    nonConforming: records.filter(r => !r.processConforms).length,
    requiresRequalification: records.filter(r => r.requiresRequalification).length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="h-8 w-8 text-blue-700" />
            Process Parameters
          </h1>
          <p className="text-gray-500 mt-1">AS9100D Clause 8.5.1.2 — Special process parameter monitoring and requalification</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          <Plus className="h-4 w-4" /> Record Process
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Records', value: stats.total, icon: Gauge, colour: 'text-blue-600' },
          { label: 'Conforming', value: stats.conforming, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'Non-Conforming', value: stats.nonConforming, icon: AlertTriangle, colour: 'text-red-600' },
          { label: 'Requires Requalification', value: stats.requiresRequalification, icon: RefreshCw, colour: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {stats.requiresRequalification > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-orange-600" />
          <p className="text-orange-700 text-sm"><strong>{stats.requiresRequalification} process{stats.requiresRequalification > 1 ? 'es' : ''}</strong> require requalification due to out-of-tolerance parameters.</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by process, part or operator..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterProcess} onChange={e => { setFilterProcess(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Processes</option>
          {PROCESS_TYPES.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No process parameter records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Process</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Part/WO</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Operator</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Parameters</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Conforms</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Requalification</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className={`hover:bg-gray-50 ${!r.processConforms ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-xs">{r.processName.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.partNumber && <div>{r.partNumber}</div>}
                    {r.workOrderRef && <div className="text-gray-400">{r.workOrderRef}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.processDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{r.operatorId}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.parameters.slice(0, 2).map((p, i) => (
                      <div key={i} className={p.withinLimits ? 'text-green-700' : 'text-red-600 font-medium'}>
                        {p.name}: {p.value} {p.unit} {!p.withinLimits && '⚠'}
                      </div>
                    ))}
                    {r.parameters.length > 2 && <div className="text-gray-400">+{r.parameters.length - 2} more</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.processConforms
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Yes</span>
                      : <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    {r.requiresRequalification
                      ? <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">{r.requalificationStatus || 'OPEN'}</span>
                      : <span className="text-gray-400 text-xs">—</span>}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Record Process Parameters</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Process Type *</label>
                  <select value={form.processName} onChange={e => setForm(f => ({ ...f, processName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {PROCESS_TYPES.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Part Number</label>
                  <input value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Work Order Ref</label>
                  <input value={form.workOrderRef} onChange={e => setForm(f => ({ ...f, workOrderRef: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Process Date *</label>
                  <input type="date" value={form.processDate} onChange={e => setForm(f => ({ ...f, processDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Operator ID *</label>
                  <input value={form.operatorId} onChange={e => setForm(f => ({ ...f, operatorId: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>

              {/* Parameters */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Process Parameters *</label>
                  <button type="button" onClick={addParamRow} className="text-blue-600 text-xs hover:underline">+ Add parameter</button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 font-medium px-1">
                    <span>Parameter Name</span><span>Value</span><span>Unit</span><span>Min</span><span>Max</span>
                  </div>
                  {paramRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <input value={row.name} onChange={e => updateParamRow(idx, 'name', e.target.value)} placeholder="e.g. Temperature" className="border rounded px-2 py-1.5 text-sm" />
                      <input type="number" value={row.value} onChange={e => updateParamRow(idx, 'value', e.target.value)} placeholder="Value" className="border rounded px-2 py-1.5 text-sm" />
                      <input value={row.unit} onChange={e => updateParamRow(idx, 'unit', e.target.value)} placeholder="°C" className="border rounded px-2 py-1.5 text-sm" />
                      <input type="number" value={row.min} onChange={e => updateParamRow(idx, 'min', e.target.value)} placeholder="Min" className="border rounded px-2 py-1.5 text-sm" />
                      <input type="number" value={row.max} onChange={e => updateParamRow(idx, 'max', e.target.value)} placeholder="Max" className="border rounded px-2 py-1.5 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Verified By</label>
                  <input value={form.verifiedBy} onChange={e => setForm(f => ({ ...f, verifiedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
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
