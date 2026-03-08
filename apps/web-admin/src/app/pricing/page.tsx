// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PoundSterling, FlaskConical, Handshake, TrendingUp } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TierRow {
  id: string;
  name: string;
  listPriceMonthly: number | null;
  annualRate: number | null;
  trialConvertRate: number | null;
  platformFee: number | null;
  sla: string;
  trial: boolean;
}

interface TrialRow {
  id: string;
  org: string;
  email: string;
  started: string;
  expires: string;
  users: number;
  status: 'ACTIVE' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
}

interface DesignPartnerRow {
  id: string;
  org: string;
  lockedRateMonthly: number;
  lockExpires: string;
  notifyAt: string;
  status: 'ACTIVE' | 'NOTIFIED' | 'EXPIRED';
}

interface VolumeQuoteRow {
  id: string;
  org: string;
  users: number;
  tier: string;
  quotedRateMonthly: number;
  acv: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED';
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_TIERS: TierRow[] = [
  { id: 'starter',        name: 'Starter',       listPriceMonthly: 49, annualRate: 39,   trialConvertRate: 42, platformFee: null,  sla: '99.5%',           trial: false },
  { id: 'professional',   name: 'Professional',  listPriceMonthly: 39, annualRate: 31,   trialConvertRate: 33, platformFee: null,  sla: '99.9%',           trial: true  },
  { id: 'enterprise',     name: 'Enterprise',    listPriceMonthly: 28, annualRate: 22,   trialConvertRate: 24, platformFee: 5000,  sla: '99.95%',          trial: false },
  { id: 'enterprise_plus',name: 'Enterprise+',   listPriceMonthly: null, annualRate: null, trialConvertRate: null, platformFee: 12000, sla: '99.99% dedicated', trial: false },
];

const MOCK_TRIALS: TrialRow[] = [
  { id: '1', org: 'Meridian Construction Ltd', email: 'david.walsh@meridian.co.uk', started: '2026-02-20', expires: '2026-03-06', users: 4, status: 'EXPIRED' },
  { id: '2', org: 'TechForge Labs Ltd',         email: 'ravi@techforge.io',          started: '2026-02-28', expires: '2026-03-14', users: 3, status: 'ACTIVE' },
  { id: '3', org: 'GreenPath Energy',            email: 'sallen@greenpath.energy',    started: '2026-03-01', expires: '2026-03-15', users: 2, status: 'ACTIVE' },
  { id: '4', org: 'Summit Pharma Holdings',      email: 'm.bennett@summitpharma.com', started: '2026-02-10', expires: '2026-02-24', users: 5, status: 'CONVERTED' },
  { id: '5', org: 'Aqua Utilities PLC',          email: 'fgrant@aquautilities.com',   started: '2026-01-28', expires: '2026-02-11', users: 5, status: 'CONVERTED' },
];

const MOCK_DESIGN_PARTNERS: DesignPartnerRow[] = [
  { id: '1', org: 'Nour Hospitality Group',  lockedRateMonthly: 19, lockExpires: '2027-01-01', notifyAt: '2026-10-01', status: 'ACTIVE'   },
  { id: '2', org: 'Atlas Freight DMCC',      lockedRateMonthly: 19, lockExpires: '2026-12-15', notifyAt: '2026-09-15', status: 'NOTIFIED' },
  { id: '3', org: 'Petra Analytics SG',      lockedRateMonthly: 19, lockExpires: '2026-11-30', notifyAt: '2026-08-30', status: 'ACTIVE'   },
  { id: '4', org: 'HarbourView Capital Ltd', lockedRateMonthly: 19, lockExpires: '2026-10-20', notifyAt: '2026-07-20', status: 'NOTIFIED' },
];

const MOCK_QUOTES: VolumeQuoteRow[] = [
  { id: '1', org: 'GlobalSafety Corp',   users: 120, tier: 'Enterprise', quotedRateMonthly: 20, acv: 33600,  status: 'SENT'     },
  { id: '2', org: 'Meridian MedTech',    users: 80,  tier: 'Enterprise', quotedRateMonthly: 22, acv: 26160,  status: 'DRAFT'    },
  { id: '3', org: 'Apex Manufacturing',  users: 250, tier: 'Enterprise', quotedRateMonthly: 18, acv: 59000,  status: 'ACCEPTED' },
  { id: '4', org: 'Pacific Logistics',   users: 45,  tier: 'Enterprise', quotedRateMonthly: 22, acv: 16880,  status: 'DECLINED' },
];

// ── Badge helpers ──────────────────────────────────────────────────────────────

const TRIAL_STATUS_BADGE: Record<TrialRow['status'], string> = {
  ACTIVE:    'bg-green-900/30 text-green-400 border border-green-700',
  CONVERTED: 'bg-blue-900/30 text-blue-400 border border-blue-700',
  EXPIRED:   'bg-red-900/30 text-red-400 border border-red-700',
  CANCELLED: 'bg-gray-700/40 text-gray-400 border border-gray-600',
};

const DP_STATUS_BADGE: Record<DesignPartnerRow['status'], string> = {
  ACTIVE:   'bg-green-900/30 text-green-400 border border-green-700',
  NOTIFIED: 'bg-amber-900/30 text-amber-400 border border-amber-700',
  EXPIRED:  'bg-red-900/30 text-red-400 border border-red-700',
};

const QUOTE_STATUS_BADGE: Record<VolumeQuoteRow['status'], string> = {
  DRAFT:    'bg-gray-700/40 text-gray-400 border border-gray-600',
  SENT:     'bg-blue-900/30 text-blue-400 border border-blue-700',
  ACCEPTED: 'bg-green-900/30 text-green-400 border border-green-700',
  DECLINED: 'bg-red-900/30 text-red-400 border border-red-700',
};

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#B8860B]/20 flex items-center justify-center text-[#B8860B]">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#112240] border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-gray-400 font-medium border-b border-white/10 ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function Td({ children, right, mono }: { children: React.ReactNode; right?: boolean; mono?: boolean }) {
  return (
    <td className={`px-5 py-3 border-b border-white/5 ${right ? 'text-right' : ''} ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </td>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PricingAdminPage() {
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<TierRow[]>([]);
  const [trials, setTrials] = useState<TrialRow[]>([]);
  const [partners, setPartners] = useState<DesignPartnerRow[]>([]);
  const [quotes, setQuotes] = useState<VolumeQuoteRow[]>([]);

  useEffect(() => {
    // In production: fetch from /api/billing/pricing/tiers, /api/billing/trials etc.
    const timer = setTimeout(() => {
      setTiers(MOCK_TIERS);
      setTrials(MOCK_TRIALS);
      setPartners(MOCK_DESIGN_PARTNERS);
      setQuotes(MOCK_QUOTES);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const fmtGbp = (v: number | null) => (v === null ? '—' : `£${v}`);
  const fmtAcv = (v: number) => `£${v.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0B1E38]">
        <Sidebar />
        <div className="flex-1 p-6 ml-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B1E38]">
      <Sidebar />
      <div className="flex-1 p-6 ml-64">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#B8860B]/20 rounded-lg flex items-center justify-center">
            <PoundSterling className="w-5 h-5 text-[#B8860B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Pricing & Billing</h1>
            <p className="text-gray-400 text-sm">Manage tiers, trials, design partners, and volume quotes</p>
          </div>
        </div>

        {/* Section 1: Tier Config Overview */}
        <Section title="Tier Configuration" icon={<PoundSterling className="w-5 h-5" />}>
          <TableWrap>
            <thead>
              <tr>
                <Th>Tier ID</Th>
                <Th>Name</Th>
                <Th right>List Price/mo</Th>
                <Th right>Annual Rate/mo</Th>
                <Th right>Trial Convert Rate</Th>
                <Th right>Platform Fee/yr</Th>
                <Th>SLA</Th>
                <Th>Trial</Th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <Td mono>{t.id}</Td>
                  <Td><span className="text-white font-medium">{t.name}</span></Td>
                  <Td right><span className="text-gray-200">{fmtGbp(t.listPriceMonthly)}</span></Td>
                  <Td right><span className="text-green-400 font-semibold">{fmtGbp(t.annualRate)}</span></Td>
                  <Td right><span className="text-gray-200">{fmtGbp(t.trialConvertRate)}</span></Td>
                  <Td right><span className="text-amber-400">{t.platformFee ? fmtAcv(t.platformFee) : '—'}</span></Td>
                  <Td><span className="text-gray-300 font-mono text-xs">{t.sla}</span></Td>
                  <Td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.trial ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-gray-700/40 text-gray-500 border border-gray-600'}`}>
                      {t.trial ? 'Yes' : 'No'}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>

        {/* Section 2: Active Trials Dashboard */}
        <Section title="Active Trials Dashboard" icon={<FlaskConical className="w-5 h-5" />}>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Total Trials', value: trials.length, color: 'text-white' },
              { label: 'Active', value: trials.filter((t) => t.status === 'ACTIVE').length, color: 'text-green-400' },
              { label: 'Converted', value: trials.filter((t) => t.status === 'CONVERTED').length, color: 'text-blue-400' },
              { label: 'Conversion Rate', value: `${Math.round((trials.filter((t) => t.status === 'CONVERTED').length / trials.length) * 100)}%`, color: 'text-[#B8860B]' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#112240] border border-white/10 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Organisation</Th>
                <Th>Email</Th>
                <Th>Started</Th>
                <Th>Expires</Th>
                <Th right>Users</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <Td><span className="text-white font-medium">{t.org}</span></Td>
                  <Td><span className="text-gray-300">{t.email}</span></Td>
                  <Td><span className="text-gray-400">{t.started}</span></Td>
                  <Td><span className="text-gray-400">{t.expires}</span></Td>
                  <Td right><span className="text-gray-200">{t.users}</span></Td>
                  <Td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TRIAL_STATUS_BADGE[t.status]}`}>
                      {t.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex gap-2">
                      {t.status === 'ACTIVE' && (
                        <button className="px-2 py-1 bg-[#1B3A6B] hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                          Extend
                        </button>
                      )}
                      <button className="px-2 py-1 bg-[#1B3A6B] hover:bg-[#1B4A2B] text-white text-xs rounded-lg transition-colors">
                        View
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>

        {/* Section 3: Design Partners */}
        <Section title="Design Partners" icon={<Handshake className="w-5 h-5" />}>
          <TableWrap>
            <thead>
              <tr>
                <Th>Organisation</Th>
                <Th right>Locked Rate/mo</Th>
                <Th>Lock Expires</Th>
                <Th>Notify At</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <Td><span className="text-white font-medium">{p.org}</span></Td>
                  <Td right><span className="text-[#B8860B] font-semibold">£{p.lockedRateMonthly}/user</span></Td>
                  <Td><span className="text-gray-400">{p.lockExpires}</span></Td>
                  <Td><span className={p.status === 'NOTIFIED' ? 'text-amber-400' : 'text-gray-400'}>{p.notifyAt}</span></Td>
                  <Td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DP_STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <p className="text-xs text-gray-500 mt-2">Max 10 design partners. Partners receive month-9 renewal notification email automatically.</p>
        </Section>

        {/* Section 4: Volume Quotes Pipeline */}
        <Section title="Volume Quotes Pipeline" icon={<TrendingUp className="w-5 h-5" />}>
          <TableWrap>
            <thead>
              <tr>
                <Th>Organisation</Th>
                <Th right>Users</Th>
                <Th>Tier</Th>
                <Th right>Quoted Rate/mo</Th>
                <Th right>ACV</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-white/5">
                  <Td><span className="text-white font-medium">{q.org}</span></Td>
                  <Td right><span className="text-gray-200">{q.users}</span></Td>
                  <Td><span className="text-gray-300">{q.tier}</span></Td>
                  <Td right><span className="text-green-400 font-semibold">£{q.quotedRateMonthly}/user</span></Td>
                  <Td right><span className="text-white font-semibold">{fmtAcv(q.acv)}</span></Td>
                  <Td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${QUOTE_STATUS_BADGE[q.status]}`}>
                      {q.status}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Section>
      </div>
    </div>
  );
}
