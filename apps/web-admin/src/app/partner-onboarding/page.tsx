'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Handshake, Plus, X, Check, XCircle } from 'lucide-react';

interface PartnerOnboarding {
  id: string;
  partnerName: string;
  contactName: string;
  contactEmail: string;
  partnerType: 'RESELLER' | 'REFERRAL' | 'INTEGRATION' | 'MSP';
  status: 'APPLIED' | 'REVIEWING' | 'APPROVED' | 'ONBOARDING' | 'ACTIVE' | 'REJECTED';
  applicationDate: string;
  approvedDate: string | null;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  assignedTo: string;
  notes: string;
}

const MOCK_DATA: PartnerOnboarding[] = [
  {
    id: '1',
    partnerName: 'Apex IT Solutions',
    contactName: 'Claire Hopkins',
    contactEmail: 'claire@apex-it.co.uk',
    partnerType: 'RESELLER',
    status: 'ACTIVE',
    applicationDate: '2026-01-10',
    approvedDate: '2026-01-18',
    tier: 'GOLD',
    assignedTo: 'Sarah Chen',
    notes: '3 customer referrals already submitted',
  },
  {
    id: '2',
    partnerName: 'NovaTech Consulting',
    contactName: 'Ben Farrow',
    contactEmail: 'ben@novatech.co.uk',
    partnerType: 'MSP',
    status: 'REVIEWING',
    applicationDate: '2026-02-10',
    approvedDate: null,
    tier: 'SILVER',
    assignedTo: 'James Okafor',
    notes: 'Due diligence call scheduled Feb 24',
  },
  {
    id: '3',
    partnerName: 'DataBridge Systems',
    contactName: 'Yuki Tanaka',
    contactEmail: 'y.tanaka@databridge.io',
    partnerType: 'INTEGRATION',
    status: 'ONBOARDING',
    applicationDate: '2026-01-28',
    approvedDate: '2026-02-05',
    tier: 'SILVER',
    assignedTo: 'Priya Sharma',
    notes: 'API integration docs shared',
  },
  {
    id: '4',
    partnerName: 'SmallBiz Advisors',
    contactName: 'Gary Moss',
    contactEmail: 'gmoss@smallbizadvisors.com',
    partnerType: 'REFERRAL',
    status: 'APPLIED',
    applicationDate: '2026-02-20',
    approvedDate: null,
    tier: 'BRONZE',
    assignedTo: 'Tom Briggs',
    notes: 'New application — pending initial review',
  },
  {
    id: '5',
    partnerName: 'TechVault Ltd',
    contactName: 'Lisa Chu',
    contactEmail: 'lisa@techvault.co.uk',
    partnerType: 'RESELLER',
    status: 'REJECTED',
    applicationDate: '2026-01-15',
    approvedDate: null,
    tier: 'BRONZE',
    assignedTo: 'Sarah Chen',
    notes: 'Conflict of interest with existing partner territory',
  },
];

const STATUS_BADGE: Record<PartnerOnboarding['status'], string> = {
  APPLIED: 'bg-gray-700/40 text-gray-300 border border-gray-600',
  REVIEWING: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  APPROVED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  ONBOARDING: 'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
  ACTIVE: 'bg-green-900/30 text-green-400 border border-green-700',
  REJECTED: 'bg-red-900/30 text-red-400 border border-red-700',
};

const TIER_BADGE: Record<PartnerOnboarding['tier'], string> = {
  BRONZE: 'bg-orange-900/30 text-orange-400 border border-orange-700',
  SILVER: 'bg-gray-700/40 text-gray-300 border border-gray-500',
  GOLD: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
};

const TYPE_BADGE: Record<PartnerOnboarding['partnerType'], string> = {
  RESELLER: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  REFERRAL: 'bg-green-900/30 text-green-400 border border-green-700',
  INTEGRATION: 'bg-purple-900/30 text-purple-400 border border-purple-700',
  MSP: 'bg-cyan-900/30 text-cyan-400 border border-cyan-700',
};

const EMPTY_FORM = {
  partnerName: '',
  contactName: '',
  contactEmail: '',
  partnerType: 'REFERRAL' as PartnerOnboarding['partnerType'],
  tier: 'BRONZE' as PartnerOnboarding['tier'],
  assignedTo: '',
  notes: '',
};

export default function PartnerOnboardingPage() {
  const [data, setData] = useState<PartnerOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get('/api/marketing/partner-onboarding');
      setData(r.data.data || MOCK_DATA);
    } catch {
      setData(MOCK_DATA);
      setError('Partner Onboarding API unavailable — showing demo data.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: PartnerOnboarding['status']) {
    try {
      await api.patch(`/api/marketing/partner-onboarding/${id}`, {
        status,
        approvedDate: status === 'APPROVED' ? new Date().toISOString().slice(0, 10) : undefined,
      });
    } catch {
      /* optimistic */
    }
    setData((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              approvedDate: status === 'APPROVED' ? new Date().toISOString().slice(0, 10) : p.approvedDate,
            }
          : p
      )
    );
  }

  async function save() {
    setSaving(true);
    try {
      const r = await api.post('/api/marketing/partner-onboarding', {
        ...form,
        applicationDate: new Date().toISOString().slice(0, 10),
        status: 'APPLIED',
      });
      setData((prev) => [...prev, r.data.data]);
    } catch {
      setData((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now().toString(),
          applicationDate: new Date().toISOString().slice(0, 10),
          approvedDate: null,
          status: 'APPLIED' as PartnerOnboarding['status'],
        } as PartnerOnboarding,
      ]);
    } finally {
      setSaving(false);
      setShowModal(false);
      setForm(EMPTY_FORM);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Partner Onboarding</h1>
              <p className="text-gray-400 text-sm">Manage partner applications and onboarding pipeline</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

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
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Partner</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Contact</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Type</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Tier</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Applied</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Assigned</th>
                    <th className="text-center px-5 py-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((partner) => (
                    <tr key={partner.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{partner.partnerName}</p>
                        {partner.notes && <p className="text-gray-500 text-xs mt-0.5 max-w-[200px] truncate">{partner.notes}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-200">{partner.contactName}</p>
                        <p className="text-gray-500 text-xs">{partner.contactEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[partner.partnerType]}`}>
                          {partner.partnerType}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[partner.tier]}`}>
                          {partner.tier}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[partner.status]}`}>
                          {partner.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-right">
                        {new Date(partner.applicationDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-gray-300">{partner.assignedTo}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {(partner.status === 'APPLIED' || partner.status === 'REVIEWING') && (
                            <>
                              <button
                                onClick={() => updateStatus(partner.id, 'APPROVED')}
                                className="flex items-center gap-1 px-2.5 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs rounded-lg border border-green-700 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(partner.id, 'REJECTED')}
                                className="flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded-lg border border-red-700 transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}
                          {partner.status === 'APPROVED' && (
                            <button
                              onClick={() => updateStatus(partner.id, 'ONBOARDING')}
                              className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 text-xs rounded-lg border border-cyan-700 transition-colors"
                            >
                              Start Onboarding
                            </button>
                          )}
                          {partner.status === 'ONBOARDING' && (
                            <button
                              onClick={() => updateStatus(partner.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs rounded-lg border border-green-700 transition-colors"
                            >
                              Mark Active
                            </button>
                          )}
                        </div>
                      </td>
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
              <h2 className="text-lg font-semibold text-white">Add Partner Application</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Partner Name', key: 'partnerName' },
                { label: 'Contact Name', key: 'contactName' },
                { label: 'Contact Email', key: 'contactEmail' },
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
                  <label className="block text-gray-400 text-sm mb-1">Partner Type</label>
                  <select
                    value={form.partnerType}
                    onChange={(e) => setForm((p) => ({ ...p, partnerType: e.target.value as PartnerOnboarding['partnerType'] }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    {['RESELLER', 'REFERRAL', 'INTEGRATION', 'MSP'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value as PartnerOnboarding['tier'] }))}
                    className="w-full bg-[#0B1E38] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                  >
                    {['BRONZE', 'SILVER', 'GOLD'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
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
                disabled={saving || !form.partnerName}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
