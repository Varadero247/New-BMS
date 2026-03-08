// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useState } from 'react';
import { PARTNER_TIERS } from '@/lib/pricing';
import type { PartnerTierKey } from '@/lib/pricing';

// Prospect pricing (what they pay full list)
const PROSPECT_TIERS = [
  { id: 'STARTER', label: 'Starter', ppum: 49, minUsers: 5, maxUsers: 25 },
  { id: 'PROFESSIONAL', label: 'Professional', ppum: 39, minUsers: 10, maxUsers: 100 },
  { id: 'ENTERPRISE', label: 'Enterprise', ppum: 28, minUsers: 25, maxUsers: null },
] as const;

type ProspectTierId = typeof PROSPECT_TIERS[number]['id'];

const INCUMBENT_STACKS = [
  { label: 'Donesafe', monthlyPPUM: 10 },
  { label: 'Intelex', monthlyPPUM: 120 },
  { label: 'ETQ Reliance', monthlyPPUM: 130 },
  { label: 'Custom / Multiple tools', monthlyPPUM: null },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function StackCalculatorPage() {
  const [users, setUsers] = useState(50);
  const [prospectTierId, setProspectTierId] = useState<ProspectTierId>('PROFESSIONAL');
  const [incumbentIdx, setIncumbentIdx] = useState(0);
  const [incumbentCustom, setIncumbentCustom] = useState('');
  const [partnerTier, setPartnerTier] = useState<PartnerTierKey>('RESELLER');

  const prospectTier = PROSPECT_TIERS.find((t) => t.id === prospectTierId) || PROSPECT_TIERS[1];
  const clampedUsers = Math.max(prospectTier.minUsers, Math.min(users, prospectTier.maxUsers ?? users));

  // Nexara full-list ACV for prospect
  const nexaraListACV = prospectTier.ppum * clampedUsers * 12;

  // Partner discount ACV
  const tierData = PARTNER_TIERS[partnerTier];
  const partnerDiscount = 'discountPct' in tierData ? tierData.discountPct : 0;
  const partnerBuyACV = nexaraListACV * (1 - partnerDiscount / 100);
  const partnerMargin = nexaraListACV - partnerBuyACV;

  // Incumbent stack cost
  const incumbent = INCUMBENT_STACKS[incumbentIdx];
  const incumbentPPUM = incumbent.monthlyPPUM ?? (incumbentCustom ? Number(incumbentCustom) : 0);
  const incumbentACV = incumbentPPUM * clampedUsers * 12;

  // Savings for prospect (list vs incumbent)
  const savingVsIncumbent = incumbentACV > 0 ? incumbentACV - nexaraListACV : 0;

  function generateQuote() {
    const lines = [
      'NEXARA IMS — PARTNER QUOTE SUMMARY',
      '====================================',
      `Generated: ${new Date().toLocaleDateString('en-GB')}`,
      '',
      `Prospect configuration: ${clampedUsers} users — ${prospectTier.label} tier`,
      `Nexara list ACV: ${fmt(nexaraListACV)}`,
      ...(incumbentACV > 0 ? [
        `Incumbent stack ACV: ${fmt(incumbentACV)}`,
        `Customer saving vs incumbent: ${fmt(savingVsIncumbent > 0 ? savingVsIncumbent : 0)}`,
      ] : []),
      '',
      `Partner tier: ${tierData.name}`,
      `Partner discount: ${partnerDiscount}%`,
      `Partner buy price (ACV): ${fmt(partnerBuyACV)}`,
      `Partner margin: ${fmt(partnerMargin)}`,
      '',
      'Contact partners@nexara.com to obtain a formal quote.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexara-quote-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Stack Calculator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Show prospects their potential savings and calculate your partner margin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Prospect Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Number of users: <span className="text-white font-bold">{users}</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={users}
                  onChange={(e) => setUsers(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>500</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nexara Tier</label>
                <div className="flex flex-wrap gap-2">
                  {PROSPECT_TIERS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setProspectTierId(t.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        prospectTierId === t.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Incumbent stack</label>
                <select
                  value={incumbentIdx}
                  onChange={(e) => setIncumbentIdx(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                >
                  {INCUMBENT_STACKS.map((s, i) => (
                    <option key={i} value={i}>{s.label}</option>
                  ))}
                </select>
                {incumbent.monthlyPPUM === null && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-400 mb-1">Custom monthly per-user cost (£)</label>
                    <input
                      type="number"
                      min="0"
                      value={incumbentCustom}
                      onChange={(e) => setIncumbentCustom(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-sm"
                      placeholder="e.g. 45"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Your Partner Tier</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PARTNER_TIERS) as PartnerTierKey[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPartnerTier(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    partnerTier === t
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {PARTNER_TIERS[t].name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Prospect View</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Nexara list ACV</span>
                <span className="text-base font-bold text-white">{fmt(nexaraListACV)}</span>
              </div>
              {incumbentACV > 0 && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">
                      {incumbent.label !== 'Custom / Multiple tools' ? incumbent.label : 'Current stack'} ACV
                    </span>
                    <span className="text-base font-bold text-gray-300">{fmt(incumbentACV)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-sm text-gray-400">Customer saving vs incumbent</span>
                    <span className={`text-base font-bold ${savingVsIncumbent > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {savingVsIncumbent >= 0 ? '+' : ''}{fmt(savingVsIncumbent)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <h2 className="text-base font-semibold text-white mb-4">Your Partner Economics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-emerald-500/10">
                <span className="text-sm text-gray-400">Your tier discount</span>
                <span className="text-base font-bold text-white">
                  {partnerDiscount > 0 ? `${partnerDiscount}%` : 'Commission-based'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-emerald-500/10">
                <span className="text-sm text-gray-400">Your buy price (ACV)</span>
                <span className="text-base font-bold text-white">{fmt(partnerBuyACV)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Your margin / commission</span>
                <span className="text-xl font-bold text-emerald-400">{fmt(partnerMargin)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={generateQuote}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors border border-gray-700"
          >
            Generate Quote (Download .txt)
          </button>
        </div>
      </div>
    </div>
  );
}
