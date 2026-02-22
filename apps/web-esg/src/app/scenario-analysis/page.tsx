'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, ThermometerSun, TrendingUp, Globe, CheckCircle } from 'lucide-react';

interface ScenarioAnalysis {
  id: string;
  title: string;
  scenarioType: string;
  baselineScenario: string;
  timeHorizon: string;
  status: string;
  conductedBy: string;
  analysisDate: string;
  reportingYear: number;
  financialImpactLow: number | null;
  financialImpactHigh: number | null;
  financialImpactCurrency: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
};

const TYPE_COLOURS: Record<string, string> = {
  TRANSITION_RISK: 'bg-orange-100 text-orange-700',
  PHYSICAL_RISK: 'bg-red-100 text-red-700',
  COMBINED: 'bg-purple-100 text-purple-700',
  OPPORTUNITY: 'bg-green-100 text-green-700',
};

const SCENARIO_TYPES = ['TRANSITION_RISK', 'PHYSICAL_RISK', 'COMBINED', 'OPPORTUNITY'];
const BASELINE_SCENARIOS = ['1_5C', '2C', '3C', '4C', 'CURRENT_POLICIES', 'NET_ZERO_2050', 'CUSTOM'];
const TIME_HORIZONS = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'];
const STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

export default function ScenarioAnalysisPage() {
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterHorizon, setFilterHorizon] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<ScenarioAnalysis | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [keyVarsInput, setKeyVarsInput] = useState('');
  const [form, setForm] = useState({
    title: '', scenarioType: 'TRANSITION_RISK', baselineScenario: '1_5C', timeHorizon: 'LONG_TERM',
    description: '', assumptions: '', analysisDate: '', conductedBy: '', reportingYear: String(new Date().getFullYear()),
    financialImpactLow: '', financialImpactHigh: '', financialImpactCurrency: 'GBP',
  });

  useEffect(() => { load(); loadSummary(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.scenarioType = filterType;
      if (filterHorizon) params.timeHorizon = filterHorizon;
      const res = await api.get('/scenario-analysis', { params });
      setScenarios(res.data.data || []);
    } catch {
      setError('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const res = await api.get('/scenario-analysis/summary');
      setSummary(res.data.data || {});
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const keyVariables = keyVarsInput.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...form,
        keyVariables,
        reportingYear: parseInt(form.reportingYear, 10),
        financialImpactLow: form.financialImpactLow ? parseFloat(form.financialImpactLow) : undefined,
        financialImpactHigh: form.financialImpactHigh ? parseFloat(form.financialImpactHigh) : undefined,
        financialImpactCurrency: form.financialImpactCurrency || undefined,
      };
      if (selected) {
        await api.put(`/scenario-analysis/${selected.id}`, payload);
      } else {
        await api.post('/scenario-analysis', payload);
      }
      setShowModal(false);
      setSelected(null);
      resetForm();
      await Promise.all([load(), loadSummary()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ title: '', scenarioType: 'TRANSITION_RISK', baselineScenario: '1_5C', timeHorizon: 'LONG_TERM', description: '', assumptions: '', analysisDate: '', conductedBy: '', reportingYear: String(new Date().getFullYear()), financialImpactLow: '', financialImpactHigh: '', financialImpactCurrency: 'GBP' });
    setKeyVarsInput('');
  }

  function openEdit(s: ScenarioAnalysis) {
    setSelected(s);
    setForm({ title: s.title, scenarioType: s.scenarioType, baselineScenario: s.baselineScenario, timeHorizon: s.timeHorizon, description: '', assumptions: '', analysisDate: s.analysisDate.slice(0, 10), conductedBy: s.conductedBy, reportingYear: String(s.reportingYear), financialImpactLow: s.financialImpactLow ? String(s.financialImpactLow) : '', financialImpactHigh: s.financialImpactHigh ? String(s.financialImpactHigh) : '', financialImpactCurrency: s.financialImpactCurrency || 'GBP' });
    setKeyVarsInput('');
    setShowModal(true);
  }

  const filtered = scenarios.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.conductedBy.toLowerCase().includes(search.toLowerCase())
  );

  const total = typeof summary.total === 'number' ? summary.total : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ThermometerSun className="h-8 w-8 text-emerald-600" />
            Climate Scenario Analysis
          </h1>
          <p className="text-gray-500 mt-1">TCFD — Climate-related risk & opportunity scenario analysis</p>
        </div>
        <button onClick={() => { resetForm(); setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> New Analysis
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Analyses', value: total, icon: Globe, colour: 'text-blue-600' },
          { label: 'Transition Risk', value: scenarios.filter(s => s.scenarioType === 'TRANSITION_RISK').length, icon: TrendingUp, colour: 'text-orange-600' },
          { label: 'Physical Risk', value: scenarios.filter(s => s.scenarioType === 'PHYSICAL_RISK').length, icon: ThermometerSun, colour: 'text-red-600' },
          { label: 'Published', value: scenarios.filter(s => s.status === 'PUBLISHED').length, icon: CheckCircle, colour: 'text-green-600' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search analyses..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Types</option>
          {SCENARIO_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterHorizon} onChange={e => { setFilterHorizon(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Horizons</option>
          {TIME_HORIZONS.map(h => <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No scenario analyses found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Baseline</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Horizon</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Year</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOURS[s.scenarioType] || 'bg-gray-100'}`}>
                      {s.scenarioType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.baselineScenario.replace(/_/g, '.')}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.timeHorizon.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{s.reportingYear}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[s.status] || 'bg-gray-100'}`}>
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(s)} className="text-emerald-600 hover:underline text-xs">Edit</button>
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
            <h2 className="text-xl font-bold mb-4">{selected ? 'Edit Analysis' : 'New Scenario Analysis'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. 1.5°C Transition Pathway" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Scenario Type *</label>
                  <select value={form.scenarioType} onChange={e => setForm(f => ({ ...f, scenarioType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {SCENARIO_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Baseline Scenario *</label>
                  <select value={form.baselineScenario} onChange={e => setForm(f => ({ ...f, baselineScenario: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {BASELINE_SCENARIOS.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Time Horizon *</label>
                  <select value={form.timeHorizon} onChange={e => setForm(f => ({ ...f, timeHorizon: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    {TIME_HORIZONS.map(h => <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reporting Year *</label>
                  <input type="number" value={form.reportingYear} onChange={e => setForm(f => ({ ...f, reportingYear: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Assumptions *</label>
                <textarea value={form.assumptions} onChange={e => setForm(f => ({ ...f, assumptions: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Key Variables * (comma-separated)</label>
                <input value={keyVarsInput} onChange={e => setKeyVarsInput(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="carbon price, renewable energy cost" />
              </div>
              <div>
                <label className="text-sm font-medium">Analysis Date *</label>
                <input type="date" value={form.analysisDate} onChange={e => setForm(f => ({ ...f, analysisDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Conducted By *</label>
                <input value={form.conductedBy} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Impact Low</label>
                  <input type="number" value={form.financialImpactLow} onChange={e => setForm(f => ({ ...f, financialImpactLow: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. -500000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Impact High</label>
                  <input type="number" value={form.financialImpactHigh} onChange={e => setForm(f => ({ ...f, financialImpactHigh: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. 100000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <input value={form.financialImpactCurrency} onChange={e => setForm(f => ({ ...f, financialImpactCurrency: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="GBP" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setSelected(null); }} className="px-4 py-2 border rounded text-sm">Cancel</button>
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
