'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Search, Users, MessageSquare, BarChart2, AlertCircle } from 'lucide-react';

interface Consultation {
  id: string;
  title: string;
  topic: string;
  method: string;
  consultationDate: string;
  facilitatedBy: string;
  participantCount: number;
  outcomeSummary: string | null;
  feedbackProvidedBack: boolean;
}

const TOPICS = ['HAZARD_IDENTIFICATION', 'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'POLICY_REVIEW', 'OBJECTIVES', 'CONTROLS', 'EMERGENCY_PLANNING', 'TRAINING_NEEDS', 'OTHER'];
const METHODS = ['MEETING', 'SURVEY', 'TOOLBOX_TALK', 'COMMITTEE', 'SUGGESTION_BOX', 'DIGITAL', 'OTHER'];
const BARRIER_TYPES = ['LANGUAGE', 'SHIFT_PATTERN', 'REMOTE_WORK', 'LITERACY', 'FEAR_OF_REPRISAL', 'DISABILITY', 'CULTURAL', 'OTHER'];

export default function WorkerConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBarrierModal, setShowBarrierModal] = useState(false);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', topic: 'HAZARD_IDENTIFICATION', description: '', consultationDate: '',
    workerReps: '', method: 'MEETING', facilitatedBy: '', participantCount: '1',
    location: '', outcomeSummary: '', actionsTaken: '', feedbackProvidedBack: false,
  });
  const [barrierForm, setBarrierForm] = useState({
    consultationId: '', barrierType: 'LANGUAGE', description: '', mitigationAction: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterTopic) params.topic = filterTopic;
      const res = await api.get('/worker-consultation', { params });
      setConsultations(res.data.data || []);
    } catch {
      setError('Failed to load consultations');
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
        workerRepresentatives: form.workerReps.split(',').map(s => s.trim()).filter(Boolean),
        participantCount: parseInt(form.participantCount, 10),
      };
      if (selected) {
        await api.put(`/worker-consultation/${selected.id}`, payload);
      } else {
        await api.post('/worker-consultation', payload);
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

  async function handleBarrierSave() {
    try {
      setSaving(true);
      setError('');
      await api.post('/barriers', barrierForm);
      setShowBarrierModal(false);
      setBarrierForm({ consultationId: '', barrierType: 'LANGUAGE', description: '', mitigationAction: '' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({ title: '', topic: 'HAZARD_IDENTIFICATION', description: '', consultationDate: '', workerReps: '', method: 'MEETING', facilitatedBy: '', participantCount: '1', location: '', outcomeSummary: '', actionsTaken: '', feedbackProvidedBack: false });
  }

  function openBarrierModal(c: Consultation) {
    setBarrierForm(f => ({ ...f, consultationId: c.id }));
    setShowBarrierModal(true);
  }

  const filtered = consultations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.facilitatedBy.toLowerCase().includes(search.toLowerCase())
  );

  const totalParticipants = consultations.reduce((s, c) => s + c.participantCount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-green-600" />
            Worker Consultation
          </h1>
          <p className="text-gray-500 mt-1">ISO 45001 Clause 5.4 — Worker participation and consultation</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBarrierModal(true)} className="flex items-center gap-2 border border-orange-400 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50">
            <AlertCircle className="h-4 w-4" /> Record Barrier
          </button>
          <button onClick={() => { resetForm(); setSelected(null); setShowModal(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" /> New Consultation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Consultations', value: consultations.length, icon: MessageSquare, colour: 'text-blue-600' },
          { label: 'Total Participants', value: totalParticipants, icon: Users, colour: 'text-green-600' },
          { label: 'Feedback Provided', value: consultations.filter(c => c.feedbackProvidedBack).length, icon: BarChart2, colour: 'text-purple-600' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search consultations..." className="flex-1 outline-none text-sm" />
        </div>
        <select value={filterTopic} onChange={e => { setFilterTopic(e.target.value); load(); }} className="border rounded px-3 py-1.5 text-sm">
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No consultations found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Topic</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Participants</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Feedback</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.topic.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{c.method}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(c.consultationDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">{c.participantCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.feedbackProvidedBack ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.feedbackProvidedBack ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openBarrierModal(c)} className="text-orange-500 hover:underline text-xs">+ Barrier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Consultation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">New Consultation Record</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Topic *</label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {TOPICS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Consultation Date *</label>
                <input type="date" value={form.consultationDate} onChange={e => setForm(f => ({ ...f, consultationDate: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Worker Representatives * (comma-separated)</label>
                <input value={form.workerReps} onChange={e => setForm(f => ({ ...f, workerReps: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="John Smith, Jane Doe" />
              </div>
              <div>
                <label className="text-sm font-medium">Method *</label>
                <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Facilitated By *</label>
                <input value={form.facilitatedBy} onChange={e => setForm(f => ({ ...f, facilitatedBy: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Participant Count *</label>
                <input type="number" min="1" value={form.participantCount} onChange={e => setForm(f => ({ ...f, participantCount: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Outcome Summary</label>
                <textarea value={form.outcomeSummary} onChange={e => setForm(f => ({ ...f, outcomeSummary: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.feedbackProvidedBack} onChange={e => setForm(f => ({ ...f, feedbackProvidedBack: e.target.checked }))} />
                Feedback provided back to workers
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barrier Modal */}
      {showBarrierModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Record Participation Barrier</h2>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Barrier Type *</label>
                <select value={barrierForm.barrierType} onChange={e => setBarrierForm(f => ({ ...f, barrierType: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1">
                  {BARRIER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea value={barrierForm.description} onChange={e => setBarrierForm(f => ({ ...f, description: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Mitigation Action</label>
                <textarea value={barrierForm.mitigationAction} onChange={e => setBarrierForm(f => ({ ...f, mitigationAction: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBarrierModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={handleBarrierSave} disabled={saving} className="px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Record Barrier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
