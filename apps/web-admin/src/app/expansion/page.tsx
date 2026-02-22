'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { TrendingUp, Plus, X, DollarSign, ArrowUpRight } from 'lucide-react';

interface Expansion {
  id: string;
  companyName: string;
  currentMrr: number;
  expansionOpportunity: number;
  type: 'UPSELL' | 'CROSS_SELL' | 'ADD_ON';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'IDENTIFIED' | 'IN_PROGRESS' | 'WON' | 'LOST';
  assignedTo: string;
  notes: string;
}

const MOCK_DATA: Expansion[] = [
  {
    id: '1',
    companyName: 'Helix Manufacturing Ltd',
    currentMrr: 1200,
    expansionOpportunity: 600,
    type: 'UPSELL',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Sarah Chen',
    notes: 'Expressed interest in ENTERPRISE plan at last QBR',
  },
  {
    id: '2',
    companyName: 'Pinnacle Foods Group',
    currentMrr: 800,
    expansionOpportunity: 400,
    type: 'ADD_ON',
    priority: 'HIGH',
    status: 'IDENTIFIED',
    assignedTo: 'James Okafor',
    notes: 'Needs Food Safety module add-on — compliance deadline in 60 days',
  },
  {
    id: '3',
    companyName: 'Vertex Engineering',
    currentMrr: 2400,
    expansionOpportunity: 800,
    type: 'CROSS_SELL',
    priority: 'MEDIUM',
    status: 'IDENTIFIED',
    assignedTo: 'Priya Sharma',
    notes: 'Currently using Health & Safety; potential for Environment and Quality modules',
  },
  {
    id: '4',
    companyName: 'BlueSky Logistics',
    currentMrr: 600,
    expansionOpportunity: 300,
    type: 'UPSELL',
    priority: 'LOW',
    status: 'WON',
    assignedTo: 'Tom Briggs',
    notes: 'Upgraded to PROFESSIONAL plan',
  },
  {
    id: '5',
    companyName: 'Orion Healthcare',
    currentMrr: 1800,
    expansionOpportunity: 900,
    type: 'CROSS_SELL',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Sarah Chen',
    notes: 'Medical device module demo scheduled for March 5',
  },
];

const TYPE_BADGE: Record<Expansion['type'], string> = {
  UPSELL: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  CROSS_SELL: 'bg-purple-900/30 text-purple-400 border border-purple-700',
  ADD_ON: 'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
};

const PRIORITY_BADGE: Record<Expansion['priority'], string> = {
  HIGH: 'bg-red-900/30 text-red-400 border border-red-700',
  MEDIUM: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  LOW: 'bg-gray-700/40 text-gray-400 border border-gray-600',
};

const STATUS_BADGE: Record<Expansion['status'], string> = {
  IDENTIFIED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  IN_PROGRESS: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  WON: 'bg-green-900/30 text-green-400 border border-green-700',
  LOST: 'bg-red-900/30 text-red-400 border border-red-700',
};

const EMPTY_FORM = {
  companyName: '',
  currentMrr: '',
  expansionOpportunity: '',
  type: 'UPSELL' as Expansion['type'],
  priority: 'MEDIUM' as Expansion['priority'],
  status: 'IDENTIFIED' as Expansion['status'],
  assignedTo: '',
  notes: '',
};

export default function ExpansionPage() {
  const [data, setData] = useState<Expansion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sortField, setSortField] = useState<'expansionOpportunity' | 'currentMrr'>('expansionOpportunity');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/expansion');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Expansion API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post('/api/marketing/expansion', {
        ...form,
        currentMrr: Number(form.currentMrr),
        expansionOpportunity: Number(form.expansionOpportunity),
      });
      setData((prev) => [...prev, r.data.data]);
    } catch {
      setData((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          currentMrr: Number(form.currentMrr),
          expansionOpportunity: Number(form.expansionOpportunity),
        } as Expansion,
      ]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm(EMPTY_FORM);
    }
  }

  const fmt = (v: number) => `£${v.toLocaleString()}`;

  const sorted = [...data].sort((a, b) => b[sortField] - a[sortField]);

  const totalOpportunity = data.reduce((s, d) => s + d.expansionOpportunity, 0);
  const byType = {
    UPSELL: data.filter((d) => d.type === 'UPSELL').reduce((s, d) => s + d.expansionOpportunity, 0),
    CROSS_SELL: data.filter((d) => d.type === 'CROSS_SELL').reduce((s, d) => s + d.expansionOpportunity, 0),
    ADD_ON: data.filter((d) => d.type === 'ADD_ON').reduce((s, d) => s + d.expansionOpportunity, 0),
  };

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Expansion Revenue</h1>
              <p className="text-gray-400 text-sm">Upsell, cross-sell, and add-on opportunities</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Opportunity
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Opportunity', value: fmt(totalOpportunity), icon: DollarSign, color: 'text-blue-400' },
            { label: 'Upsell', value: fmt(byType.UPSELL), icon: ArrowUpRight, color: 'text-blue-400' },
            { label: 'Cross-sell', value: fmt(byType.CROSS_SELL), icon: ArrowUpRight, color: 'text-purple-400' },
            { label: 'Add-on', value: fmt(byType.ADD_ON), icon: ArrowUpRight, color: 'text-cyan-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#112240] border border-white/10 rounded-xl p-5">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sort bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-400 text-sm">Sort by:</span>
          {(['expansionOpportunity', 'currentMrr'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSortField(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortField === f ? 'bg-[#1B3A6B] text-white' : 'bg-[#112240] text-gray-400 hover:text-white'
              }`}
            >
              {f === 'expansionOpportunity' ? 'Opportunity' : 'Current MRR'}
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
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Company</th>
                    <th className="text-right px-6 py-3 text-gray-400 font-medium">Current MRR</th>
                    <th className="text-right px-6 py-3 text-gray-400 font-medium">Opportunity</th>
                    <th className="text-center px-6 py-3 text-gray-400 font-medium">Type</th>
                    <th className="text-center px-6 py-3 text-gray-400 font-medium">Priority</th>
                    <th className="text-center px-6 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Assigned To</th>
                    <th className="text-left px-6 py-3 text-gray-400 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-3 text-white font-medium">{row.companyName}</td>
                      <td className="px-6 py-3 text-gray-300 text-right">{fmt(row.currentMrr)}</td>
                      <td className="px-6 py-3 text-green-400 font-semibold text-right">
                        +{fmt(row.expansionOpportunity)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[row.type]}`}>
                          {row.type.replace('_', '-')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[row.priority]}`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.status]}`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-300">{row.assignedTo}</td>
                      <td className="px-6 py-3 text-gray-400 max-w-[200px] truncate">{row.notes}</td>
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
              <h2 className="text-lg font-semibold text-white">Add Expansion Opportunity</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Company Name', key: 'companyName', type: 'text' },
                { label: 'Current MRR (£)', key: 'currentMrr', type: 'number' },
                { label: 'Expansion Opportunity (£)', key: 'expansionOpportunity', type: 'number' },
                { label: 'Assigned To', key: 'assignedTo', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              ))}
              {[
                { label: 'Type', key: 'type', options: ['UPSELL', 'CROSS_SELL', 'ADD_ON'] },
                { label: 'Priority', key: 'priority', options: ['HIGH', 'MEDIUM', 'LOW'] },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-gray-400 text-sm mb-1">{f.label}</label>
                  <select
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o.replace('_', '-')}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                />
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
                disabled={saving || !form.companyName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Opportunity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
