'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { RotateCcw, Plus, X, DollarSign, Trophy } from 'lucide-react';

interface Winback {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  churnDate: string;
  churnReason: string;
  mrrLost: number;
  campaignStatus: 'IDENTIFIED' | 'OUTREACH_SENT' | 'IN_TALKS' | 'WON_BACK' | 'NO_RESPONSE' | 'DECLINED';
  lastOutreach: string;
  nextAction: string;
  assignedTo: string;
}

const MOCK_DATA: Winback[] = [
  {
    id: '1',
    companyName: 'RedBrick Property Group',
    contactName: 'James Morley',
    contactEmail: 'james@redbrick.co.uk',
    churnDate: '2025-12-01',
    churnReason: 'Budget cut — CFO mandate',
    mrrLost: 1800,
    campaignStatus: 'IN_TALKS',
    lastOutreach: '2026-02-18',
    nextAction: 'Follow-up call Feb 25 — budget review outcome expected',
    assignedTo: 'Sarah Chen',
  },
  {
    id: '2',
    companyName: 'Coastal Ventures Ltd',
    contactName: 'Emma Booth',
    contactEmail: 'ebooth@coastalventures.com',
    churnDate: '2025-11-15',
    churnReason: 'Switched to competitor (cheaper plan)',
    mrrLost: 600,
    campaignStatus: 'OUTREACH_SENT',
    lastOutreach: '2026-02-10',
    nextAction: 'No reply yet — send second touchpoint email Feb 22',
    assignedTo: 'James Okafor',
  },
  {
    id: '3',
    companyName: 'NorthStar Aerospace',
    contactName: 'Paul Kingston',
    contactEmail: 'pkingston@northstar-aero.com',
    churnDate: '2025-10-01',
    churnReason: 'Missing aerospace-specific features',
    mrrLost: 3600,
    campaignStatus: 'WON_BACK',
    lastOutreach: '2026-01-20',
    nextAction: 'Re-signed on ENTERPRISE with Aerospace module — go-live March 1',
    assignedTo: 'Priya Sharma',
  },
  {
    id: '4',
    companyName: 'Skyline Retail',
    contactName: 'Charlotte Mills',
    contactEmail: 'c.mills@skylineretail.co.uk',
    churnDate: '2025-09-01',
    churnReason: 'Poor onboarding experience',
    mrrLost: 900,
    campaignStatus: 'DECLINED',
    lastOutreach: '2026-01-15',
    nextAction: 'Declined — revisit in 6 months',
    assignedTo: 'Tom Briggs',
  },
  {
    id: '5',
    companyName: 'Delta Pharma',
    contactName: 'Oliver Nash',
    contactEmail: 'onash@deltapharma.co.uk',
    churnDate: '2026-01-01',
    churnReason: 'Acquired by larger group with different tooling',
    mrrLost: 2400,
    campaignStatus: 'IDENTIFIED',
    lastOutreach: '',
    nextAction: 'Initial outreach not yet sent — assign to CSM',
    assignedTo: '',
  },
];

const STATUS_BADGE: Record<Winback['campaignStatus'], string> = {
  IDENTIFIED: 'bg-gray-700/40 text-gray-300 border border-gray-600',
  OUTREACH_SENT: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  IN_TALKS: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  WON_BACK: 'bg-green-900/30 text-green-400 border border-green-700',
  NO_RESPONSE: 'bg-gray-700/40 text-gray-400 border border-gray-600',
  DECLINED: 'bg-red-900/30 text-red-400 border border-red-700',
};

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  churnDate: '',
  churnReason: '',
  mrrLost: '',
  nextAction: '',
  assignedTo: '',
};

export default function WinbackPage() {
  const [data, setData] = useState<Winback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Winback['campaignStatus'] | 'ALL'>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/winback');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Winback API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post('/api/marketing/winback', {
        ...form,
        mrrLost: Number(form.mrrLost),
        campaignStatus: 'IDENTIFIED',
        lastOutreach: '',
      });
      setData((prev) => [...prev, r.data.data]);
    } catch {
      setData((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          mrrLost: Number(form.mrrLost),
          campaignStatus: 'IDENTIFIED' as Winback['campaignStatus'],
          lastOutreach: '',
        } as Winback,
      ]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm(EMPTY_FORM);
    }
  }

  const fmt = (v: number) => `£${v.toLocaleString()}`;

  const filtered = data.filter((d) => statusFilter === 'ALL' || d.campaignStatus === statusFilter);

  const totalLostMrr = data.reduce((s, d) => s + d.mrrLost, 0);
  const wonBack = data.filter((d) => d.campaignStatus === 'WON_BACK');
  const wonBackMrr = wonBack.reduce((s, d) => s + d.mrrLost, 0);
  const inTalks = data.filter((d) => d.campaignStatus === 'IN_TALKS').length;

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Win-back Campaigns</h1>
              <p className="text-gray-400 text-sm">Re-engage and recover churned customers</p>
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
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-red-400" />
              <p className="text-gray-400 text-sm">Total Lost MRR</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{fmt(totalLostMrr)}</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-sm">Won Back</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{wonBack.length}</p>
            <p className="text-gray-500 text-xs mt-0.5">{fmt(wonBackMrr)} recovered</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <p className="text-gray-400 text-sm">In Talks</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{inTalks}</p>
          </div>
          <div className="bg-[#112240] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <p className="text-gray-400 text-sm">Recovery Rate</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {totalLostMrr > 0 ? Math.round((wonBackMrr / totalLostMrr) * 100) : 0}%
            </p>
            <p className="text-gray-500 text-xs mt-0.5">of lost MRR</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(['ALL', 'IDENTIFIED', 'OUTREACH_SENT', 'IN_TALKS', 'WON_BACK', 'NO_RESPONSE', 'DECLINED'] as const).map((s) => (
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
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Churn Date</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Churn Reason</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">MRR Lost</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Last Outreach</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Next Action</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-white font-medium">{row.companyName}</td>
                      <td className="px-5 py-3">
                        <p className="text-gray-200">{row.contactName}</p>
                        <p className="text-gray-500 text-xs">{row.contactEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-right">
                        {new Date(row.churnDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-gray-400 max-w-[160px] truncate">{row.churnReason}</td>
                      <td className="px-5 py-3 text-red-400 font-semibold text-right">{fmt(row.mrrLost)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.campaignStatus]}`}>
                          {row.campaignStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-right">
                        {row.lastOutreach ? new Date(row.lastOutreach).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-400 max-w-[220px]">{row.nextAction}</td>
                      <td className="px-5 py-3 text-gray-300">{row.assignedTo || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#112240] border border-white/10 rounded-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Add Win-back Record</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Company Name', key: 'companyName' },
                { label: 'Contact Name', key: 'contactName' },
                { label: 'Contact Email', key: 'contactEmail' },
                { label: 'Churn Reason', key: 'churnReason' },
                { label: 'Assigned To', key: 'assignedTo' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Churn Date</label>
                  <input
                    type="date"
                    value={form.churnDate}
                    onChange={(e) => setForm((p) => ({ ...p, churnDate: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">MRR Lost (£)</label>
                  <input
                    type="number"
                    value={form.mrrLost}
                    onChange={(e) => setForm((p) => ({ ...p, mrrLost: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Next Action</label>
                <textarea
                  value={form.nextAction}
                  onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))}
                  rows={2}
                  className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                />
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
