'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, HardHat, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Contractor {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  workType: string;
  workLocation: string;
  startDate: string;
  endDate: string | null;
  ohsRequirements: string;
  inductionCompleted: boolean;
  status: string;
  inspections: { id: string; outcome: string; inspectionDate: string }[];
}

const STATUS_COLOURS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  TERMINATED: 'bg-gray-100 text-gray-600',
};

const STATUSES = ['ACTIVE', 'SUSPENDED', 'COMPLETED', 'TERMINATED'];

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, completed: 0, uninductedActive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Contractor | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '', contactName: '', contactEmail: '', contactPhone: '',
    workType: '', workLocation: '', startDate: '', endDate: '',
    ohsRequirements: '', inductionCompleted: false, insuranceRef: '', approvedBy: '',
  });

  useEffect(() => { load(); loadStats(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/contractors', { params });
      setContractors(res.data.data || []);
    } catch {
      setError('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get('/contractors/stats');
      setStats(res.data.data || stats);
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = { ...form, endDate: form.endDate || undefined };
      if (selected) {
        await api.put(`/contractors/${selected.id}`, payload);
      } else {
        await api.post('/contractors', payload);
      }
      setShowModal(false);
      setSelected(null);
      resetForm();
      await Promise.all([load(), loadStats()]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ companyName: '', contactName: '', contactEmail: '', contactPhone: '', workType: '', workLocation: '', startDate: '', endDate: '', ohsRequirements: '', inductionCompleted: false, insuranceRef: '', approvedBy: '' });
  }

  function openEdit(c: Contractor) {
    setSelected(c);
    setForm({
      companyName: c.companyName, contactName: c.contactName || '', contactEmail: c.contactEmail || '',
      contactPhone: '', workType: c.workType, workLocation: c.workLocation,
      startDate: c.startDate.slice(0, 10), endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      ohsRequirements: c.ohsRequirements, inductionCompleted: c.inductionCompleted,
      insuranceRef: '', approvedBy: '',
    });
    setShowModal(true);
  }

  const filtered = contractors.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.workLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HardHat className="h-8 w-8 text-green-600" />
            Contractor Management
          </h1>
          <p className="text-gray-500 mt-1">ISO 45001 Clause 8.1.4 — OHS contractor control</p>
        </div>
        <button
          onClick={() => { resetForm(); setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4" /> Register Contractor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: HardHat, colour: 'text-blue-600' },
          { label: 'Active', value: stats.active, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'Suspended', value: stats.suspended, icon: XCircle, colour: 'text-red-600' },
          { label: 'Uninducted Active', value: stats.uninductedActive, icon: AlertTriangle, colour: 'text-orange-600' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contractors..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No contractors found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Work Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Induction</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Inspection</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.companyName}</div>
                    {c.contactName && <div className="text-xs text-gray-400">{c.contactName}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.workType}</td>
                  <td className="px-4 py-3 text-gray-600">{c.workLocation}</td>
                  <td className="px-4 py-3">
                    {c.inductionCompleted
                      ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Done</span>
                      : <span className="text-orange-500 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOURS[c.status] || 'bg-gray-100'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.inspections?.[0]
                      ? `${new Date(c.inspections[0].inspectionDate).toLocaleDateString()} — ${c.inspections[0].outcome}`
                      : 'No inspections'}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(c)} className="text-green-600 hover:underline text-xs">Edit</button>
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
            <h2 className="text-xl font-bold mb-4">{selected ? 'Edit Contractor' : 'Register Contractor'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              {[
                { field: 'companyName', label: 'Company Name *' },
                { field: 'contactName', label: 'Contact Name' },
                { field: 'contactEmail', label: 'Contact Email', type: 'email' },
                { field: 'contactPhone', label: 'Contact Phone' },
                { field: 'workType', label: 'Work Type *' },
                { field: 'workLocation', label: 'Work Location *' },
                { field: 'insuranceRef', label: 'Insurance Reference' },
                { field: 'approvedBy', label: 'Approved By' },
              ].map(({ field, label, type = 'text' }) => (
                <div key={field}>
                  <label className="text-sm font-medium">{label}</label>
                  <input type={type} value={(form as Record<string, unknown>)[field] as string}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-sm mt-1" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">OHS Requirements *</label>
                <textarea value={form.ohsRequirements} onChange={e => setForm(f => ({ ...f, ohsRequirements: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} placeholder="PPE, training, induction requirements..." />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.inductionCompleted} onChange={e => setForm(f => ({ ...f, inductionCompleted: e.target.checked }))} />
                Induction Completed
              </label>
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
