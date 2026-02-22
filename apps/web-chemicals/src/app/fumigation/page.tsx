'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Wind, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface FumigationRecord {
  id: string;
  location: string;
  fumigantUsed: string;
  targetOrganism: string;
  plannedDate: string;
  completedDate: string | null;
  applicationRate: number | null;
  applicationRateUnit: string | null;
  operatorName: string;
  operatorCertRef: string | null;
  hseNotificationDate: string | null;
  hseNotificationRef: string | null;
  gasFreeDate: string | null;
  gasFreeVerifiedBy: string | null;
  status: string;
}

const STATUS_COLOURS: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-600',
  HSE_NOTIFIED: 'bg-blue-100 text-blue-700',
  GAS_FREE_CERTIFIED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_STEPS = ['PLANNED', 'HSE_NOTIFIED', 'GAS_FREE_CERTIFIED', 'COMPLETED'];

export default function FumigationPage() {
  const [records, setRecords] = useState<FumigationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<FumigationRecord | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'notify-hse' | 'gas-free'>('notify-hse');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    location: '', fumigantUsed: '', targetOrganism: '', plannedDate: '',
    applicationRate: '', applicationRateUnit: 'g/m³', operatorName: '', operatorCertRef: '',
    exposurePeriodHours: '', postFumigationVentilationHours: '', accessRestrictions: '',
  });
  const [actionForm, setActionForm] = useState({
    hseNotificationDate: '', hseNotificationRef: '',
    gasFreeDate: '', gasFreeVerifiedBy: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/fumigation', { params });
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
        applicationRate: form.applicationRate ? parseFloat(form.applicationRate) : undefined,
        exposurePeriodHours: form.exposurePeriodHours ? parseFloat(form.exposurePeriodHours) : undefined,
        postFumigationVentilationHours: form.postFumigationVentilationHours ? parseFloat(form.postFumigationVentilationHours) : undefined,
        operatorCertRef: form.operatorCertRef || undefined,
      };
      await api.post('/fumigation', payload);
      setShowModal(false);
      resetForm();
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAction() {
    if (!selected) return;
    try {
      setSaving(true);
      setError('');
      if (actionType === 'notify-hse') {
        await api.put(`/fumigation/${selected.id}/notify-hse`, {
          hseNotificationDate: actionForm.hseNotificationDate,
          hseNotificationRef: actionForm.hseNotificationRef || undefined,
        });
      } else {
        await api.put(`/fumigation/${selected.id}/gas-free`, {
          gasFreeDate: actionForm.gasFreeDate,
          gasFreeVerifiedBy: actionForm.gasFreeVerifiedBy,
        });
      }
      setShowActionModal(false);
      setSelected(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ location: '', fumigantUsed: '', targetOrganism: '', plannedDate: '', applicationRate: '', applicationRateUnit: 'g/m³', operatorName: '', operatorCertRef: '', exposurePeriodHours: '', postFumigationVentilationHours: '', accessRestrictions: '' });
  }

  function openAction(rec: FumigationRecord, type: 'notify-hse' | 'gas-free') {
    setSelected(rec);
    setActionType(type);
    setActionForm({ hseNotificationDate: '', hseNotificationRef: '', gasFreeDate: '', gasFreeVerifiedBy: '' });
    setShowActionModal(true);
  }

  const filtered = records.filter(r =>
    r.location.toLowerCase().includes(search.toLowerCase()) ||
    r.fumigantUsed.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: records.length,
    planned: records.filter(r => r.status === 'PLANNED').length,
    active: records.filter(r => ['HSE_NOTIFIED', 'GAS_FREE_CERTIFIED'].includes(r.status)).length,
    completed: records.filter(r => r.status === 'COMPLETED').length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wind className="h-8 w-8 text-blue-600" />
            Fumigation Management
          </h1>
          <p className="text-gray-500 mt-1">COSHH Regulation 18 — Fumigation notification and control</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Plan Fumigation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: Wind, colour: 'text-blue-600' },
          { label: 'Planned', value: stats.planned, icon: Clock, colour: 'text-gray-600' },
          { label: 'Active', value: stats.active, icon: AlertTriangle, colour: 'text-yellow-600' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, colour: 'text-green-600' },
        ].map(({ label, value, icon: Icon, colour }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <Icon className={`h-7 w-7 ${colour}`} />
            <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by location or fumigant..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {STATUS_STEPS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No fumigation records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fumigant</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Operator</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Planned Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.location}</td>
                  <td className="px-4 py-3 text-gray-600">{r.fumigantUsed}</td>
                  <td className="px-4 py-3 text-gray-600">{r.operatorName}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.plannedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[r.status] || 'bg-gray-100'}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {r.status === 'PLANNED' && (
                      <button onClick={() => openAction(r, 'notify-hse')} className="text-blue-600 hover:underline text-xs">Notify HSE</button>
                    )}
                    {r.status === 'HSE_NOTIFIED' && (
                      <button onClick={() => openAction(r, 'gas-free')} className="text-green-600 hover:underline text-xs">Gas Free</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Plan Fumigation</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Location *</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Fumigant Used *</label>
                <input value={form.fumigantUsed} onChange={e => setForm(f => ({ ...f, fumigantUsed: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. Methyl Bromide, Phosphine" />
              </div>
              <div>
                <label className="text-sm font-medium">Target Organism *</label>
                <input value={form.targetOrganism} onChange={e => setForm(f => ({ ...f, targetOrganism: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. Grain weevils" />
              </div>
              <div>
                <label className="text-sm font-medium">Planned Date *</label>
                <input type="date" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Application Rate</label>
                  <input type="number" step="0.01" value={form.applicationRate} onChange={e => setForm(f => ({ ...f, applicationRate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <input value={form.applicationRateUnit} onChange={e => setForm(f => ({ ...f, applicationRateUnit: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Operator Name *</label>
                <input value={form.operatorName} onChange={e => setForm(f => ({ ...f, operatorName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Operator Certificate Reference</label>
                <input value={form.operatorCertRef} onChange={e => setForm(f => ({ ...f, operatorCertRef: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Exposure Period (hrs)</label>
                  <input type="number" step="0.5" value={form.exposurePeriodHours} onChange={e => setForm(f => ({ ...f, exposurePeriodHours: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Ventilation Period (hrs)</label>
                  <input type="number" step="0.5" value={form.postFumigationVentilationHours} onChange={e => setForm(f => ({ ...f, postFumigationVentilationHours: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Access Restrictions</label>
                <textarea value={form.accessRestrictions} onChange={e => setForm(f => ({ ...f, accessRestrictions: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
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

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {actionType === 'notify-hse' ? 'Record HSE Notification' : 'Record Gas-Free Certification'}
            </h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              {actionType === 'notify-hse' ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Notification Date *</label>
                    <input type="date" value={actionForm.hseNotificationDate} onChange={e => setActionForm(f => ({ ...f, hseNotificationDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notification Reference</label>
                    <input value={actionForm.hseNotificationRef} onChange={e => setActionForm(f => ({ ...f, hseNotificationRef: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Gas-Free Date *</label>
                    <input type="date" value={actionForm.gasFreeDate} onChange={e => setActionForm(f => ({ ...f, gasFreeDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Verified By *</label>
                    <input value={actionForm.gasFreeVerifiedBy} onChange={e => setActionForm(f => ({ ...f, gasFreeVerifiedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowActionModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleAction} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
