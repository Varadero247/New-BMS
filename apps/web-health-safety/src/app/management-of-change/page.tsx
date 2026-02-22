'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, GitBranch, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MocRecord {
  id: string;
  changeTitle: string;
  changeType: string;
  description: string;
  proposedBy: string;
  status: string;
  riskLevel: string;
  targetDate: string | null;
  approvedBy: string | null;
  createdAt: string;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IMPLEMENTED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const RISK_COLOURS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const CHANGE_TYPES = ['PROCESS', 'EQUIPMENT', 'CHEMICAL', 'PERSONNEL', 'PROCEDURE', 'FACILITY', 'EMERGENCY', 'OTHER'];
const STATUSES = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'CLOSED'];
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ManagementOfChangePage() {
  const [records, setRecords] = useState<MocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<MocRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    changeTitle: '', changeType: 'PROCESS', description: '', proposedBy: '',
    riskLevel: 'MEDIUM', hazardsIntroduced: '', controlMeasures: '', targetDate: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterRisk) params.riskLevel = filterRisk;
      const res = await api.get('/management-of-change', { params });
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
      const payload = {
        ...form,
        targetDate: form.targetDate || undefined,
      };
      if (selected) {
        await api.put(`/management-of-change/${selected.id}`, payload);
      } else {
        await api.post('/management-of-change', payload);
      }
      setShowModal(false);
      setSelected(null);
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ changeTitle: '', changeType: 'PROCESS', description: '', proposedBy: '', riskLevel: 'MEDIUM', hazardsIntroduced: '', controlMeasures: '', targetDate: '' });
  }

  function openEdit(rec: MocRecord) {
    setSelected(rec);
    setForm({
      changeTitle: rec.changeTitle,
      changeType: rec.changeType,
      description: rec.description,
      proposedBy: rec.proposedBy,
      riskLevel: rec.riskLevel,
      hazardsIntroduced: '',
      controlMeasures: '',
      targetDate: rec.targetDate ? rec.targetDate.slice(0, 10) : '',
    });
    setShowModal(true);
  }

  const filtered = records.filter(r =>
    r.changeTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.proposedBy.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: records.length,
    underReview: records.filter(r => r.status === 'UNDER_REVIEW').length,
    approved: records.filter(r => r.status === 'APPROVED').length,
    highRisk: records.filter(r => ['HIGH', 'CRITICAL'].includes(r.riskLevel)).length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-green-600" />
            Management of Change
          </h1>
          <p className="text-gray-500 mt-1">ISO 45001 Clause 8.1.3 — OHS change management</p>
        </div>
        <button
          onClick={() => { resetForm(); setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4" /> New Change Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: GitBranch, colour: 'text-blue-600' },
          { label: 'Under Review', value: stats.underReview, icon: Clock, colour: 'text-yellow-600' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'High/Critical Risk', value: stats.highRisk, icon: AlertTriangle, colour: 'text-red-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-8 w-8 ${colour}`} />
            <div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search changes..." className="flex-1 outline-none text-sm"
          />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Risk Levels</option>
          {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No change requests found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Change Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Proposed By</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Risk</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Target Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(rec => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{rec.changeTitle}</td>
                  <td className="px-4 py-3 text-gray-600">{rec.changeType}</td>
                  <td className="px-4 py-3 text-gray-600">{rec.proposedBy}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_COLOURS[rec.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                      {rec.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[rec.status] || 'bg-gray-100 text-gray-600'}`}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rec.targetDate ? new Date(rec.targetDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(rec)} className="text-green-600 hover:underline text-xs">Edit</button>
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
            <h2 className="text-xl font-bold mb-4">{selected ? 'Edit Change Request' : 'New Change Request'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Change Title *</label>
                <input value={form.changeTitle} onChange={e => setForm(f => ({ ...f, changeTitle: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Brief title" />
              </div>
              <div>
                <label className="text-sm font-medium">Change Type *</label>
                <select value={form.changeType} onChange={e => setForm(f => ({ ...f, changeType: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {CHANGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} placeholder="Describe the change..." />
              </div>
              <div>
                <label className="text-sm font-medium">Proposed By *</label>
                <input value={form.proposedBy} onChange={e => setForm(f => ({ ...f, proposedBy: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="Name of proposer" />
              </div>
              <div>
                <label className="text-sm font-medium">Risk Level *</label>
                <select value={form.riskLevel} onChange={e => setForm(f => ({ ...f, riskLevel: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Hazards Introduced</label>
                <textarea value={form.hazardsIntroduced} onChange={e => setForm(f => ({ ...f, hazardsIntroduced: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} placeholder="Any new hazards..." />
              </div>
              <div>
                <label className="text-sm font-medium">Control Measures</label>
                <textarea value={form.controlMeasures} onChange={e => setForm(f => ({ ...f, controlMeasures: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} placeholder="Controls for new hazards..." />
              </div>
              <div>
                <label className="text-sm font-medium">Target Date</label>
                <input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setSelected(null); }} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
