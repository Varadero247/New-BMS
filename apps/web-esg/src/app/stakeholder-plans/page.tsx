'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Users, Calendar, CheckCircle } from 'lucide-react';

interface StakeholderPlan {
  id: string;
  stakeholderGroup: string;
  engagementPurpose: string;
  methods: string[];
  frequency: string;
  responsibleTeam: string;
  status: string | null;
  lastEngagementDate: string | null;
  nextEngagementDate: string | null;
  outcomes: string | null;
}

const FREQUENCIES = ['ONGOING', 'ANNUAL', 'QUARTERLY', 'MONTHLY', 'AD_HOC', 'EVENT_BASED'];
const METHODS_OPTIONS = ['SURVEY', 'INTERVIEW', 'WORKSHOP', 'FOCUS_GROUP', 'PUBLIC_COMMENT', 'ADVISORY_PANEL', 'ANNUAL_REPORT', 'WEBSITE', 'SOCIAL_MEDIA', 'NEWSLETTER', 'MEETING', 'OTHER'];

const FREQ_COLOURS: Record<string, string> = {
  ONGOING: 'bg-blue-100 text-blue-700',
  ANNUAL: 'bg-purple-100 text-purple-700',
  QUARTERLY: 'bg-yellow-100 text-yellow-700',
  MONTHLY: 'bg-orange-100 text-orange-700',
  AD_HOC: 'bg-gray-100 text-gray-600',
  EVENT_BASED: 'bg-green-100 text-green-700',
};

export default function StakeholderPlansPage() {
  const [plans, setPlans] = useState<StakeholderPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterFreq, setFilterFreq] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<StakeholderPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [form, setForm] = useState({
    stakeholderGroup: '', engagementPurpose: '', frequency: 'ANNUAL', responsibleTeam: '',
    nextEngagementDate: '', outcomes: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterFreq) params.frequency = filterFreq;
      const res = await api.get('/stakeholder-plans', { params });
      setPlans(res.data.data || []);
    } catch {
      setError('Failed to load stakeholder plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError('');
      const payload = { ...form, methods: selectedMethods, nextEngagementDate: form.nextEngagementDate || undefined };
      if (selected) {
        await api.put(`/stakeholder-plans/${selected.id}`, payload);
      } else {
        await api.post('/stakeholder-plans', payload);
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
    setForm({ stakeholderGroup: '', engagementPurpose: '', frequency: 'ANNUAL', responsibleTeam: '', nextEngagementDate: '', outcomes: '' });
    setSelectedMethods([]);
  }

  function openEdit(p: StakeholderPlan) {
    setSelected(p);
    setForm({ stakeholderGroup: p.stakeholderGroup, engagementPurpose: p.engagementPurpose, frequency: p.frequency, responsibleTeam: p.responsibleTeam, nextEngagementDate: p.nextEngagementDate ? p.nextEngagementDate.slice(0, 10) : '', outcomes: p.outcomes || '' });
    setSelectedMethods(p.methods || []);
    setShowModal(true);
  }

  function toggleMethod(m: string) {
    setSelectedMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  const filtered = plans.filter(p =>
    p.stakeholderGroup.toLowerCase().includes(search.toLowerCase()) ||
    p.engagementPurpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-emerald-600" />
            Stakeholder Engagement Plans
          </h1>
          <p className="text-gray-500 mt-1">GRI 2-29 — Approach to stakeholder engagement</p>
        </div>
        <button onClick={() => { resetForm(); setSelected(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Plans', value: plans.length, icon: Users, colour: 'text-blue-600' },
          { label: 'Ongoing', value: plans.filter(p => p.frequency === 'ONGOING').length, icon: CheckCircle, colour: 'text-green-600' },
          { label: 'Upcoming', value: plans.filter(p => p.nextEngagementDate && new Date(p.nextEngagementDate) > new Date()).length, icon: Calendar, colour: 'text-yellow-600' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stakeholder groups..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterFreq} onChange={e => { setFilterFreq(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Frequencies</option>
          {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400">No stakeholder plans found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.stakeholderGroup}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.engagementPurpose}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${FREQ_COLOURS[p.frequency] || 'bg-gray-100 text-gray-600'}`}>
                  {p.frequency.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.methods.map(m => (
                  <span key={m} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded">{m.replace(/_/g, ' ')}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Team: {p.responsibleTeam}</span>
                {p.nextEngagementDate && <span>Next: {new Date(p.nextEngagementDate).toLocaleDateString()}</span>}
              </div>
              <button onClick={() => openEdit(p)} className="mt-3 text-emerald-600 hover:underline text-xs">Edit Plan</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selected ? 'Edit Stakeholder Plan' : 'New Stakeholder Plan'}</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Stakeholder Group *</label>
                <input value={form.stakeholderGroup} onChange={e => setForm(f => ({ ...f, stakeholderGroup: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="e.g. Local Community, Investors" />
              </div>
              <div>
                <label className="text-sm font-medium">Engagement Purpose *</label>
                <textarea value={form.engagementPurpose} onChange={e => setForm(f => ({ ...f, engagementPurpose: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Engagement Methods * (select at least one)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {METHODS_OPTIONS.map(m => (
                    <button key={m} type="button" onClick={() => toggleMethod(m)}
                      className={`px-2 py-1 rounded text-xs border ${selectedMethods.includes(m) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 text-gray-600'}`}>
                      {m.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Frequency *</label>
                <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Responsible Team *</label>
                <input value={form.responsibleTeam} onChange={e => setForm(f => ({ ...f, responsibleTeam: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Next Engagement Date</label>
                <input type="date" value={form.nextEngagementDate} onChange={e => setForm(f => ({ ...f, nextEngagementDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Outcomes / Notes</label>
                <textarea value={form.outcomes} onChange={e => setForm(f => ({ ...f, outcomes: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
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
