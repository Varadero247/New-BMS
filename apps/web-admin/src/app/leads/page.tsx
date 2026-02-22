'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Users, Plus, X } from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  source: 'WEBSITE' | 'LINKEDIN' | 'REFERRAL' | 'COLD' | 'INBOUND';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  estimatedValue: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
}

const MOCK_DATA: Lead[] = [
  {
    id: '1',
    companyName: 'Meridian Construction',
    contactName: 'David Walsh',
    contactEmail: 'david.walsh@meridian.co.uk',
    contactPhone: '+44 7700 900100',
    source: 'LINKEDIN',
    status: 'QUALIFIED',
    estimatedValue: 14400,
    assignedTo: 'Sarah Chen',
    createdAt: '2026-02-01',
    lastContact: '2026-02-18',
  },
  {
    id: '2',
    companyName: 'Aqua Utilities PLC',
    contactName: 'Fiona Grant',
    contactEmail: 'fgrant@aquautilities.com',
    contactPhone: '+44 7700 900200',
    source: 'INBOUND',
    status: 'PROPOSAL',
    estimatedValue: 36000,
    assignedTo: 'James Okafor',
    createdAt: '2026-01-28',
    lastContact: '2026-02-19',
  },
  {
    id: '3',
    companyName: 'TechForge Labs',
    contactName: 'Ravi Patel',
    contactEmail: 'ravi@techforge.io',
    contactPhone: '+44 7700 900300',
    source: 'REFERRAL',
    status: 'NEGOTIATION',
    estimatedValue: 28800,
    assignedTo: 'Priya Sharma',
    createdAt: '2026-02-05',
    lastContact: '2026-02-20',
  },
  {
    id: '4',
    companyName: 'GreenPath Energy',
    contactName: 'Sophie Allen',
    contactEmail: 'sallen@greenpath.energy',
    contactPhone: '+44 7700 900400',
    source: 'WEBSITE',
    status: 'NEW',
    estimatedValue: 9600,
    assignedTo: 'Tom Briggs',
    createdAt: '2026-02-21',
    lastContact: '2026-02-21',
  },
  {
    id: '5',
    companyName: 'Summit Pharma',
    contactName: 'Mark Bennett',
    contactEmail: 'm.bennett@summitpharma.com',
    contactPhone: '+44 7700 900500',
    source: 'COLD',
    status: 'CONTACTED',
    estimatedValue: 21600,
    assignedTo: 'Sarah Chen',
    createdAt: '2026-02-10',
    lastContact: '2026-02-15',
  },
];

const PIPELINE_STAGES: Lead['status'][] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

const STATUS_BADGE: Record<Lead['status'], string> = {
  NEW: 'bg-gray-700/40 text-gray-300 border border-gray-600',
  CONTACTED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  QUALIFIED: 'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
  PROPOSAL: 'bg-purple-900/30 text-purple-400 border border-purple-700',
  NEGOTIATION: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  CLOSED_WON: 'bg-green-900/30 text-green-400 border border-green-700',
  CLOSED_LOST: 'bg-red-900/30 text-red-400 border border-red-700',
};

const SOURCE_BADGE: Record<Lead['source'], string> = {
  WEBSITE: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  LINKEDIN: 'bg-blue-800/30 text-blue-300 border border-blue-600',
  REFERRAL: 'bg-green-900/30 text-green-400 border border-green-700',
  COLD: 'bg-gray-700/40 text-gray-400 border border-gray-600',
  INBOUND: 'bg-purple-900/30 text-purple-400 border border-purple-700',
};

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  source: 'INBOUND' as Lead['source'],
  status: 'NEW' as Lead['status'],
  estimatedValue: '',
  assignedTo: '',
};

export default function LeadsPage() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stageFilter, setStageFilter] = useState<Lead['status'] | 'ALL'>('ALL');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/leads');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Leads API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Lead['status']) {
    try {
      await api.patch(`/api/marketing/leads/${id}`, { status });
    } catch {
      /* optimistic update below */
    }
    setData((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post('/api/marketing/leads', {
        ...form,
        estimatedValue: Number(form.estimatedValue),
      });
      setData((prev) => [...prev, r.data.data]);
    } catch {
      setData((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          estimatedValue: Number(form.estimatedValue),
          createdAt: new Date().toISOString().slice(0, 10),
          lastContact: new Date().toISOString().slice(0, 10),
        } as Lead,
      ]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm(EMPTY_FORM);
    }
  }

  const fmt = (v: number) => `£${v.toLocaleString()}`;
  const filtered = data.filter((d) => stageFilter === 'ALL' || d.status === stageFilter);

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
              <p className="text-gray-400 text-sm">Track and manage your sales leads</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Pipeline stage filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStageFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              stageFilter === 'ALL' ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
            }`}
          >
            All ({data.length})
          </button>
          {PIPELINE_STAGES.map((s) => {
            const count = data.filter((d) => d.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stageFilter === s ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Company</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Contact</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Source</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Est. Value</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Assigned</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Last Contact</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Move Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => {
                    const currentIdx = PIPELINE_STAGES.indexOf(lead.status);
                    const nextStage = PIPELINE_STAGES[currentIdx + 1] as Lead['status'] | undefined;
                    return (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-5 py-3 text-white font-medium">{lead.companyName}</td>
                        <td className="px-5 py-3">
                          <p className="text-gray-200">{lead.contactName}</p>
                          <p className="text-gray-500 text-xs">{lead.contactEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_BADGE[lead.source]}`}>
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[lead.status]}`}>
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-green-400 font-semibold text-right">
                          {fmt(lead.estimatedValue)}
                        </td>
                        <td className="px-5 py-3 text-gray-300">{lead.assignedTo}</td>
                        <td className="px-5 py-3 text-gray-400 text-right">
                          {new Date(lead.lastContact).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {nextStage && (
                            <button
                              onClick={() => updateStatus(lead.id, nextStage)}
                              className="px-2.5 py-1 bg-[#1B3A6B] hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                            >
                              {nextStage.replace('_', ' ')}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#112240] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Add New Lead</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Company Name', key: 'companyName', span: 2 },
                { label: 'Contact Name', key: 'contactName', span: 1 },
                { label: 'Contact Email', key: 'contactEmail', span: 1 },
                { label: 'Phone', key: 'contactPhone', span: 1 },
                { label: 'Est. Value (£)', key: 'estimatedValue', span: 1 },
                { label: 'Assigned To', key: 'assignedTo', span: 2 },
              ].map((f) => (
                <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <input
                    type={f.key === 'estimatedValue' ? 'number' : 'text'}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Source</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm((p) => ({ ...p, source: e.target.value as Lead['source'] }))}
                  className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                >
                  {['WEBSITE', 'LINKEDIN', 'REFERRAL', 'COLD', 'INBOUND'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Initial Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Lead['status'] }))}
                  className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                >
                  {PIPELINE_STAGES.slice(0, 5).map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.companyName || !form.contactEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
