// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

interface CompetitorProfile {
  displayName: string;
  theirPrice: number | null;
  weaknesses: [string, string, string];
  ourAdvantage: string;
}

const COMPETITORS: Record<string, CompetitorProfile> = {
  qualityone: {
    displayName: 'QualityOne',
    theirPrice: 79,
    weaknesses: ['ISO 9001 only', 'No environmental module', 'Outdated UI'],
    ourAdvantage: 'Full 43-module suite at half the price',
  },
  isopro: {
    displayName: 'ISOPro',
    theirPrice: 65,
    weaknesses: ['No AI features', 'Per-standard pricing', 'Poor mobile'],
    ourAdvantage: 'AI-powered insights, all standards included',
  },
  simplysis: {
    displayName: 'Simplysis',
    theirPrice: 55,
    weaknesses: ['Limited reporting', 'No supplier portal', 'Manual workflows'],
    ourAdvantage: 'Automated workflows, built-in portals, advanced reporting',
  },
  qmsware: {
    displayName: 'QMSWare',
    theirPrice: 48,
    weaknesses: ['Quality only', 'On-premise required', 'No API'],
    ourAdvantage: 'Cloud-native, REST API, all modules',
  },
};

const GENERIC_PROFILE: CompetitorProfile = {
  displayName: 'Your Current Tool',
  theirPrice: null,
  weaknesses: ['Single-standard focus', 'No unified reporting', 'Manual processes'],
  ourAdvantage: 'All standards unified in one intelligent platform',
};

const FEATURE_ROWS: Array<{ feature: string }> = [
  { feature: 'All 43 compliance modules' },
  { feature: '30+ ISO standards included' },
  { feature: 'AI-powered insights' },
  { feature: 'Built-in supplier portal' },
  { feature: 'Cloud-native (no on-premise)' },
  { feature: 'REST API access' },
  { feature: 'Automated workflows' },
  { feature: 'Real-time dashboards' },
  { feature: 'Mobile app' },
  { feature: 'Single login for all modules' },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function ReplaceCompetitorPage({
  params,
}: {
  params: { competitor: string };
}) {
  const slug = params.competitor.toLowerCase();
  const profile = COMPETITORS[slug] ?? GENERIC_PROFILE;
  const nexaraPrice = PRICING.tiers.PROFESSIONAL.listPriceMonthly;
  const [userCount, setUserCount] = useState(25);

  const theirAnnual = profile.theirPrice !== null ? profile.theirPrice * userCount * 12 : null;
  const nexaraAnnual = nexaraPrice * userCount * 12;
  const annualSaving = theirAnnual !== null ? Math.max(0, theirAnnual - nexaraAnnual) : null;
  const savingPct =
    theirAnnual !== null && theirAnnual > 0
      ? Math.round(((theirAnnual - nexaraAnnual) / theirAnnual) * 100)
      : null;

  const isGeneric = profile.theirPrice === null;

  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            Nexara
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/lp/free-trial" className="text-sm text-[#60A5FA] hover:text-white transition-colors">
              Start free trial
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#1B3A6B] hover:bg-[#244d8a] text-white px-4 py-2 rounded-lg transition"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-3">
            Switch today
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Switching from {profile.displayName}?<br />
            <span className="text-[#60A5FA]">Nexara does more for less.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            {profile.ourAdvantage}. No rip-and-replace — migrate in days, not months.
          </p>
          <Link
            href="/lp/free-trial"
            className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Start {PRICING.trial.durationDays}-day free trial — free
          </Link>
        </div>

        {/* Why they fall short */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Why teams leave {profile.displayName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {profile.weaknesses.map((weakness, i) => (
              <div
                key={i}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                  <span className="text-red-400 text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-white font-semibold mb-1">{weakness}</p>
                <p className="text-gray-500 text-sm">
                  A limitation that holds your compliance programme back.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Savings calculator */}
        {!isGeneric && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              How much could you save?
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Number of users: <strong className="text-white">{userCount}</strong>
                </label>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={userCount}
                  onChange={(e) => setUserCount(Number(e.target.value))}
                  className="w-full accent-[#1B3A6B] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5</span>
                  <span>500</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{profile.displayName} annual cost</p>
                  <p className="text-2xl font-bold text-red-400">
                    {theirAnnual !== null ? fmt(theirAnnual) : '—'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {PRICING.symbol}{profile.theirPrice}/user/mo &times; {userCount} users
                  </p>
                </div>
                <div className="bg-[#1B3A6B]/20 border border-[#1B3A6B]/40 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Nexara Professional annual cost</p>
                  <p className="text-2xl font-bold text-[#60A5FA]">{fmt(nexaraAnnual)}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {PRICING.symbol}{nexaraPrice}/user/mo &times; {userCount} users
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Annual saving</p>
                  <p className={`text-2xl font-bold ${annualSaving && annualSaving > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    {annualSaving !== null && annualSaving > 0
                      ? fmt(annualSaving)
                      : 'More value, same cost'}
                  </p>
                  {savingPct !== null && savingPct > 0 && (
                    <p className="text-xs text-green-500 mt-1">{savingPct}% reduction</p>
                  )}
                </div>
              </div>

              {annualSaving !== null && annualSaving > 0 && (
                <div className="mt-6 text-center">
                  <Link
                    href="/lp/free-trial"
                    className="inline-block px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                  >
                    Save {fmt(annualSaving)}/year &mdash; start free trial
                  </Link>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 text-center mt-3">
              * {profile.displayName} price is an estimate based on publicly available market data.
              Annual saving uses Nexara Professional list price. Annual billing saves a further {PRICING.tiers.PROFESSIONAL.annualDiscountPct}%.
            </p>
          </div>
        )}

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Feature comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4 text-left text-gray-400 font-medium">Feature</th>
                  <th className="px-5 py-4 text-center font-semibold">
                    <span className="text-[#60A5FA]">Nexara IMS</span>
                  </th>
                  <th className="px-5 py-4 text-center text-gray-400 font-medium">
                    {profile.displayName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                    <td className="px-5 py-3.5 text-gray-300">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-green-400 font-bold text-base">&#10003;</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-red-400 font-bold text-base">&#10005;</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Switch today CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/60 to-[#0B1120] border border-[#1B3A6B]/40 p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Switch Today</h2>
          <p className="text-gray-400 mb-8">
            {PRICING.trial.durationDays}-day free trial &mdash; full Professional access, up to {PRICING.trial.maxUsers} users, no commitment.
            Our migration team will help you move your data from {profile.displayName} at no cost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lp/free-trial"
              className="px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
            >
              Start free trial
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-lg border border-white/20 hover:border-white/40 text-white font-semibold transition"
            >
              Book a migration demo
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-xs text-gray-600">
        &copy; 2026 Nexara DMCC. All rights reserved. &nbsp;&middot;&nbsp;
        <Link href="/privacy" className="hover:text-gray-400">Privacy</Link> &nbsp;&middot;&nbsp;
        <Link href="/terms" className="hover:text-gray-400">Terms</Link>
      </footer>
    </main>
  );
}

export function generateStaticParams() {
  return [
    { competitor: 'qualityone' },
    { competitor: 'isopro' },
    { competitor: 'simplysis' },
    { competitor: 'qmsware' },
  ];
}
