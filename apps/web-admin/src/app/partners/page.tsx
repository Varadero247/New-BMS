// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { Handshake, TrendingUp, PoundSterling, BarChart3 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Partner {
  id: string;
  name: string;
  tier: 'REFERRAL' | 'RESELLER' | 'STRATEGIC' | 'WHITE_LABEL';
  contactName: string;
  contactEmail: string;
  region: string;
  dealsYTD: number;
  acvYTD: number;
  joinedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

interface DealRegistration {
  id: string;
  partner: string;
  prospect: string;
  tier: string;
  estimatedACV: number;
  registered: string;
  expires: string;
  status: 'PENDING' | 'APPROVED' | 'CLOSED_WON' | 'EXPIRED';
}

interface CommissionRow {
  id: string;
  partner: string;
  deal: string;
  dealACV: number;
  commissionPct: number;
  commissionAmount: number;
  period: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_PARTNERS: Partner[] = [
  { id: '1', name: 'SafetyFirst Consulting',   tier: 'REFERRAL',   contactName: 'James Okafor',  contactEmail: 'james@safetyfirst.co.uk', region: 'UK',   dealsYTD: 3,  acvYTD: 44640,  joinedAt: '2025-10-01', status: 'ACTIVE'  },
  { id: '2', name: 'QualityBridge Pte Ltd',    tier: 'RESELLER',   contactName: 'Priya Sharma',  contactEmail: 'priya@qualitybridge.sg',  region: 'APAC', dealsYTD: 8,  acvYTD: 119040, joinedAt: '2025-09-15', status: 'ACTIVE'  },
  { id: '3', name: 'Atlas IMS Partners Ltd',   tier: 'STRATEGIC',  contactName: 'Tom Briggs',    contactEmail: 'tom@atlasims.com',        region: 'UK',   dealsYTD: 15, acvYTD: 396000, joinedAt: '2025-08-01', status: 'ACTIVE'  },
  { id: '4', name: 'Meridian Compliance DMCC', tier: 'STRATEGIC',  contactName: 'Sarah Chen',    contactEmail: 'sarah@meridian.ae',       region: 'MENA', dealsYTD: 11, acvYTD: 290400, joinedAt: '2025-11-01', status: 'ACTIVE'  },
  { id: '5', name: 'TechBridge Solutions',     tier: 'REFERRAL',   contactName: 'David Walsh',   contactEmail: 'david@techbridge.ie',     region: 'IE',   dealsYTD: 1,  acvYTD: 14880,  joinedAt: '2026-01-15', status: 'PENDING' },
  { id: '6', name: 'Nexus Systems AU Pty',     tier: 'RESELLER',   contactName: 'Sophie Allen',  contactEmail: 'sophie@nexussystems.au',  region: 'APAC', dealsYTD: 5,  acvYTD: 74400,  joinedAt: '2025-12-01', status: 'ACTIVE'  },
];

const MOCK_DEALS: DealRegistration[] = [
  { id: '1', partner: 'Atlas IMS Partners Ltd',   prospect: 'GlobalSafety Corp',   tier: 'Enterprise',    estimatedACV: 33600,  registered: '2026-02-15', expires: '2026-05-15', status: 'APPROVED'   },
  { id: '2', partner: 'QualityBridge Pte Ltd',    prospect: 'Pacific Logistics SG', tier: 'Professional',  estimatedACV: 22320,  registered: '2026-02-20', expires: '2026-05-20', status: 'PENDING'    },
  { id: '3', partner: 'Meridian Compliance DMCC', prospect: 'NourHospitality DMCC', tier: 'Enterprise+',   estimatedACV: 120000, registered: '2026-01-10', expires: '2026-04-10', status: 'CLOSED_WON' },
  { id: '4', partner: 'SafetyFirst Consulting',   prospect: 'Summit Pharma UK',     tier: 'Professional',  estimatedACV: 14880,  registered: '2025-12-01', expires: '2026-03-01', status: 'EXPIRED'    },
  { id: '5', partner: 'Atlas IMS Partners Ltd',   prospect: 'Apex Manufacturing',   tier: 'Enterprise',    estimatedACV: 59000,  registered: '2026-03-01', expires: '2026-06-01', status: 'APPROVED'   },
];

const MOCK_COMMISSIONS: CommissionRow[] = [
  { id: '1', partner: 'SafetyFirst Consulting',   deal: 'Meridian Construction',    dealACV: 14880,  commissionPct: 15, commissionAmount: 2232,  period: 'Q1 2026', status: 'PAID'    },
  { id: '2', partner: 'SafetyFirst Consulting',   deal: 'Aqua Utilities PLC',       dealACV: 14880,  commissionPct: 15, commissionAmount: 2232,  period: 'Q1 2026', status: 'APPROVED'},
  { id: '3', partner: 'Atlas IMS Partners Ltd',   deal: 'GlobalSafety Corp',        dealACV: 33600,  commissionPct: 0,  commissionAmount: 7056,  period: 'Q1 2026', status: 'PENDING' },
  { id: '4', partner: 'Meridian Compliance DMCC', deal: 'NourHospitality DMCC',     dealACV: 120000, commissionPct: 0,  commissionAmount: 36000, period: 'Q1 2026', status: 'APPROVED'},
  { id: '5', partner: 'QualityBridge Pte Ltd',    deal: 'Pacific Logistics SG',     dealACV: 22320,  commissionPct: 0,  commissionAmount: 4464,  period: 'Q1 2026', status: 'PENDING' },
];

// ── Badge helpers ──────────────────────────────────────────────────────────────

const PARTNER_TIER_BADGE: Record<Partner['tier'], string> = {
  REFERRAL:    'bg-gray-700/40 text-gray-300 border border-gray-600',
  RESELLER:    'bg-blue-900/30 text-blue-400 border border-blue-700',
  STRATEGIC:   'bg-purple-900/30 text-purple-400 border border-purple-700',
  WHITE_LABEL: 'bg-amber-900/30 text-amber-400 border border-amber-700',
};

const PARTNER_STATUS_BADGE: Record<Partner['status'], string> = {
  ACTIVE:    'bg-green-900/30 text-green-400 border border-green-700',
  PENDING:   'bg-amber-900/30 text-amber-400 border border-amber-700',
  SUSPENDED: 'bg-red-900/30 text-red-400 border border-red-700',
};

const DEAL_STATUS_BADGE: Record<DealRegistration['status'], string> = {
  PENDING:    'bg-amber-900/30 text-amber-400 border border-amber-700',
  APPROVED:   'bg-blue-900/30 text-blue-400 border border-blue-700',
  CLOSED_WON: 'bg-green-900/30 text-green-400 border border-green-700',
  EXPIRED:    'bg-red-900/30 text-red-400 border border-red-700',
};

const COMMISSION_STATUS_BADGE: Record<CommissionRow['status'], string> = {
  PENDING:  'bg-amber-900/30 text-amber-400 border border-amber-700',
  APPROVED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  PAID:     'bg-green-900/30 text-green-400 border border-green-700',
};

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PartnersAdminPage() {
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);

  const fmtGbp = (v: number) => `£${v.toLocaleString()}`;

  const pendingCommissions = MOCK_COMMISSIONS.filter((c) => c.status === 'PENDING');
  const toggleCommission = (id: string) =>
    setSelectedCommissions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const totalChannelACV = MOCK_PARTNERS.reduce((sum, p) => sum + p.acvYTD, 0);
  const commissionPaidYTD = MOCK_COMMISSIONS.filter((c) => c.status === 'PAID').reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Handshake className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Partner Management</h1>
            <p className="text-gray-400 text-sm">Partner directory, deal pipeline, commissions, and analytics</p>
          </div>
        </div>

        {/* Section 4 (analytics cards) shown at top for overview */}
        <Section title="Programme Analytics" icon={<BarChart3 className="w-5 h-5" />}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Partners',      value: MOCK_PARTNERS.length,                                      color: 'text-white'  },
              { label: 'Strategic Partners',  value: MOCK_PARTNERS.filter((p) => p.tier === 'STRATEGIC').length, color: 'text-purple-400' },
              { label: 'Channel ACV YTD',     value: fmtGbp(totalChannelACV),                                   color: 'text-green-400' },
              { label: 'Commission Paid YTD', value: fmtGbp(commissionPaidYTD),                                  color: 'text-[#B8860B]' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#112240] border border-white/10 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {(['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'] as const).map((tier) => {
              const count = MOCK_PARTNERS.filter((p) => p.tier === tier).length;
              const acv   = MOCK_PARTNERS.filter((p) => p.tier === tier).reduce((sum, p) => sum + p.acvYTD, 0);
              return (
                <div key={tier} className="bg-[#112240] border border-white/10 rounded-xl p-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${PARTNER_TIER_BADGE[tier]}`}>
                    {tier.replace('_', ' ')}
                  </span>
                  <p className="text-white font-bold text-lg">{count}</p>
                  <p className="text-gray-400 text-xs">partners</p>
                  <p className="text-green-400 font-semibold text-sm mt-1">{fmtGbp(acv)}</p>
                  <p className="text-gray-500 text-xs">ACV YTD</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Section 1: Partner Directory */}
        <Section title="Partner Directory" icon={<Handshake className="w-5 h-5" />}>
          <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Partner</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Tier</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Contact</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Region</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Deals YTD</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">ACV YTD</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Joined</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PARTNERS.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-white font-medium">{p.name}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PARTNER_TIER_BADGE[p.tier]}`}>
                          {p.tier.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-200">{p.contactName}</p>
                        <p className="text-gray-500 text-xs">{p.contactEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-300">{p.region}</td>
                      <td className="px-5 py-3 text-right text-gray-200">{p.dealsYTD}</td>
                      <td className="px-5 py-3 text-right text-green-400 font-semibold">{fmtGbp(p.acvYTD)}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{p.joinedAt}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PARTNER_STATUS_BADGE[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Section 2: Deal Registration Pipeline */}
        <Section title="Deal Registration Pipeline" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Partner</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Prospect</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Tier</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Est. ACV</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Registered</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Expires</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DEALS.map((d) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-gray-200">{d.partner}</td>
                      <td className="px-5 py-3 text-white font-medium">{d.prospect}</td>
                      <td className="px-5 py-3 text-gray-300">{d.tier}</td>
                      <td className="px-5 py-3 text-right text-green-400 font-semibold">{fmtGbp(d.estimatedACV)}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{d.registered}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{d.expires}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEAL_STATUS_BADGE[d.status]}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Section 3: Commission Management */}
        <Section title="Commission Management" icon={<PoundSterling className="w-5 h-5" />}>
          {selectedCommissions.length > 0 && (
            <div className="mb-4 flex items-center gap-4 bg-[#1B3A6B]/40 border border-blue-700/40 rounded-xl px-4 py-3">
              <span className="text-blue-400 text-sm font-medium">{selectedCommissions.length} selected</span>
              <button
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                onClick={() => alert(`Bulk approving ${selectedCommissions.length} commission(s)`)}
              >
                Bulk Approve
              </button>
              <button
                className="px-4 py-1.5 bg-[#1B3A6B] hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                onClick={() => alert(`Marking ${selectedCommissions.length} commission(s) as paid`)}
              >
                Mark Paid
              </button>
              <button
                className="text-gray-400 text-sm hover:text-white transition-colors"
                onClick={() => setSelectedCommissions([])}
              >
                Clear
              </button>
            </div>
          )}
          <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.length === pendingCommissions.length && pendingCommissions.length > 0}
                        onChange={(e) =>
                          setSelectedCommissions(e.target.checked ? pendingCommissions.map((c) => c.id) : [])
                        }
                        className="rounded border-gray-600 bg-transparent"
                      />
                    </th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Partner</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Deal</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Deal ACV</th>
                    <th className="text-right px-5 py-3 text-gray-400 font-medium">Commission</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Period</th>
                    <th className="text-left px-5 py-3 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COMMISSIONS.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3">
                        {c.status === 'PENDING' && (
                          <input
                            type="checkbox"
                            checked={selectedCommissions.includes(c.id)}
                            onChange={() => toggleCommission(c.id)}
                            className="rounded border-gray-600 bg-transparent"
                          />
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-200">{c.partner}</td>
                      <td className="px-5 py-3 text-white font-medium">{c.deal}</td>
                      <td className="px-5 py-3 text-right text-gray-200">{fmtGbp(c.dealACV)}</td>
                      <td className="px-5 py-3 text-right text-green-400 font-semibold">{fmtGbp(c.commissionAmount)}</td>
                      <td className="px-5 py-3 text-gray-400">{c.period}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${COMMISSION_STATUS_BADGE[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
