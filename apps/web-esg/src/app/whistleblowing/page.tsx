'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface WhistleblowingReport {
  id: string;
  referenceNumber: string;
  category: string;
  summary: string;
  reportedDate: string;
  channel: string;
  status: string;
  anonymous: boolean;
  priority: string | null;
}

const STATUS_COLOURS: Record<string, string> = {
  RECEIVED: 'bg-blue-100 text-blue-700',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  ESCALATED: 'bg-red-100 text-red-700',
};

const CATEGORIES = ['FINANCIAL_MISCONDUCT', 'ENVIRONMENTAL', 'SAFETY', 'DISCRIMINATION', 'HARASSMENT', 'CORRUPTION', 'HUMAN_RIGHTS', 'DATA_PROTECTION', 'OTHER'];
const CHANNELS = ['HOTLINE', 'EMAIL', 'WEB_FORM', 'IN_PERSON', 'THIRD_PARTY', 'ANONYMOUS'];
const STATUSES = ['RECEIVED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED', 'ESCALATED'];

export default function WhistleblowingPage() {
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category: 'SAFETY', summary: '', reportedDate: '', channel: 'WEB_FORM',
    anonymous: true, reporterName: '', reporterEmail: '',
  });

  useEffect(() => { load(); loadStats(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      const res = await api.get('/whistleblowing', { params });
      setReports(res.data.data || []);
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await api.get('/whistleblowing/stats');
      setStats(res.data.data || {});
    } catch { /* ignore */ }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        reporterName: form.anonymous ? undefined : form.reporterName,
        reporterEmail: form.anonymous ? undefined : form.reporterEmail,
      };
      await api.post('/whistleblowing', payload);
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
    setForm({ category: 'SAFETY', summary: '', reportedDate: '', channel: 'WEB_FORM', anonymous: true, reporterName: '', reporterEmail: '' });
  }

  const filtered = reports.filter(r =>
    r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            Whistleblowing
          </h1>
          <p className="text-gray-500 mt-1">GRI 2-26 — Mechanisms for seeking advice and raising concerns</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Submit Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reports', value: stats.total || 0, icon: Shield, colour: 'text-blue-600' },
          { label: 'Under Investigation', value: stats.underInvestigation || 0, icon: Clock, colour: 'text-yellow-600' },
          { label: 'Resolved', value: stats.resolved || 0, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'Escalated', value: stats.escalated || 0, icon: AlertTriangle, colour: 'text-red-600' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No reports found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Summary</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Channel</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.referenceNumber}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.category.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{r.summary}</td>
                  <td className="px-4 py-3 text-gray-600">{r.channel}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.reportedDate).toLocaleDateString()}</td>
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
            <h2 className="text-xl font-bold mb-4">Submit Concern Report</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Summary *</label>
                <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={4} placeholder="Describe the concern..." />
              </div>
              <div>
                <label className="text-sm font-medium">Report Date *</label>
                <input type="date" value={form.reportedDate} onChange={e => setForm(f => ({ ...f, reportedDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Channel *</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {CHANNELS.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
                Submit anonymously
              </label>
              {!form.anonymous && (
                <>
                  <div>
                    <label className="text-sm font-medium">Reporter Name</label>
                    <input value={form.reporterName} onChange={e => setForm(f => ({ ...f, reporterName: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reporter Email</label>
                    <input type="email" value={form.reporterEmail} onChange={e => setForm(f => ({ ...f, reporterEmail: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
