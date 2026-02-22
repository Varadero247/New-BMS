'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Rocket, Plus, X, CheckCircle2, Clock } from 'lucide-react';

interface Onboarding {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'STALLED';
  progress: number;
  startDate: string;
  targetDate: string;
  completedSteps: string[];
  pendingSteps: string[];
  csm: string;
}

const MOCK_DATA: Onboarding[] = [
  {
    id: '1',
    companyName: 'Helix Manufacturing Ltd',
    contactName: 'Alan Davies',
    contactEmail: 'adavies@helix.co.uk',
    plan: 'ENTERPRISE',
    status: 'IN_PROGRESS',
    progress: 65,
    startDate: '2026-02-01',
    targetDate: '2026-03-01',
    completedSteps: ['Account setup', 'Admin user created', 'SSO configured', 'Data import'],
    pendingSteps: ['Staff training', 'Go-live review', 'Documentation handover'],
    csm: 'Sarah Chen',
  },
  {
    id: '2',
    companyName: 'BlueSky Logistics',
    contactName: 'Tom Parsons',
    contactEmail: 'tom@bluesky.co.uk',
    plan: 'STARTER',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2026-01-15',
    targetDate: '2026-02-01',
    completedSteps: ['Account setup', 'Admin user created', 'Module configured', 'Go-live review'],
    pendingSteps: [],
    csm: 'James Okafor',
  },
  {
    id: '3',
    companyName: 'Aqua Utilities PLC',
    contactName: 'Fiona Grant',
    contactEmail: 'fgrant@aquautilities.com',
    plan: 'PROFESSIONAL',
    status: 'STALLED',
    progress: 30,
    startDate: '2026-01-20',
    targetDate: '2026-02-20',
    completedSteps: ['Account setup', 'Admin user created'],
    pendingSteps: ['SSO configuration', 'Data import', 'Staff training', 'Go-live review'],
    csm: 'Priya Sharma',
  },
  {
    id: '4',
    companyName: 'TechForge Labs',
    contactName: 'Ravi Patel',
    contactEmail: 'ravi@techforge.io',
    plan: 'PROFESSIONAL',
    status: 'NOT_STARTED',
    progress: 0,
    startDate: '2026-02-22',
    targetDate: '2026-03-22',
    completedSteps: [],
    pendingSteps: ['Account setup', 'Admin user created', 'Module configured', 'Staff training', 'Go-live review'],
    csm: 'Sarah Chen',
  },
];

const STATUS_BADGE: Record<Onboarding['status'], string> = {
  NOT_STARTED: 'bg-gray-700/40 text-gray-400 border border-gray-600',
  IN_PROGRESS: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  COMPLETED: 'bg-green-900/30 text-green-400 border border-green-700',
  STALLED: 'bg-red-900/30 text-red-400 border border-red-700',
};

const PLAN_BADGE: Record<Onboarding['plan'], string> = {
  STARTER: 'bg-gray-700/40 text-gray-300 border border-gray-600',
  PROFESSIONAL: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  ENTERPRISE: 'bg-purple-900/30 text-purple-400 border border-purple-700',
};

const PROGRESS_BAR: Record<Onboarding['status'], string> = {
  NOT_STARTED: 'bg-gray-600',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  STALLED: 'bg-red-500',
};

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  plan: 'STARTER' as Onboarding['plan'],
  startDate: '',
  targetDate: '',
  csm: '',
};

export default function OnboardingPage() {
  const [data, setData] = useState<Onboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<Onboarding['status'] | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/onboarding');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Onboarding API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post('/api/marketing/onboarding', form);
      setData((prev) => [...prev, r.data.data]);
    } catch {
      setData((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          status: 'NOT_STARTED' as Onboarding['status'],
          progress: 0,
          completedSteps: [],
          pendingSteps: ['Account setup', 'Admin user created', 'Module configured', 'Go-live review'],
        } as Onboarding,
      ]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm(EMPTY_FORM);
    }
  }

  const filtered = data.filter((d) => statusFilter === 'ALL' || d.status === statusFilter);

  const stats = {
    completed: data.filter((d) => d.status === 'COMPLETED').length,
    inProgress: data.filter((d) => d.status === 'IN_PROGRESS').length,
    stalled: data.filter((d) => d.status === 'STALLED').length,
    notStarted: data.filter((d) => d.status === 'NOT_STARTED').length,
  };

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Customer Onboarding</h1>
              <p className="text-gray-400 text-sm">Track customer onboarding progress</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Completed', value: stats.completed, color: 'text-green-400' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-blue-400' },
            { label: 'Stalled', value: stats.stalled, color: 'text-red-400' },
            { label: 'Not Started', value: stats.notStarted, color: 'text-gray-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#112240] border border-white/10 rounded-xl p-5">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'STALLED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((record) => (
              <div key={record.id} className="bg-[#112240] border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{record.companyName}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {record.contactName} &middot; {record.contactEmail}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">CSM: {record.csm}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_BADGE[record.plan]}`}>
                      {record.plan}
                    </span>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[record.status]}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{record.progress}%</span>
                  </div>
                  <div className="w-full bg-[#0B1E38] rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${PROGRESS_BAR[record.status]}`}
                      style={{ width: `${record.progress}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="flex gap-6 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Start: </span>
                    <span className="text-gray-300">{new Date(record.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Target: </span>
                    <span className="text-gray-300">{new Date(record.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.completedSteps.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-2">Completed</p>
                      <div className="space-y-1.5">
                        {record.completedSteps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 text-xs">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {record.pendingSteps.length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-2">Pending</p>
                      <div className="space-y-1.5">
                        {record.pendingSteps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-400 text-xs">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#112240] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Add Onboarding Record</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Company Name', key: 'companyName', span: 2 },
                { label: 'Contact Name', key: 'contactName', span: 1 },
                { label: 'Contact Email', key: 'contactEmail', span: 1 },
                { label: 'Start Date', key: 'startDate', span: 1, type: 'date' },
                { label: 'Target Date', key: 'targetDate', span: 1, type: 'date' },
                { label: 'CSM', key: 'csm', span: 2 },
              ].map((f) => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-gray-400 text-sm mb-1">Plan</label>
                <select
                  value={form.plan}
                  onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value as Onboarding['plan'] }))}
                  className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                >
                  {['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].map((pl) => (
                    <option key={pl} value={pl}>{pl}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.companyName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
