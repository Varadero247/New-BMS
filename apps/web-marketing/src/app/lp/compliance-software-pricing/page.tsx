// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

const STANDARDS = [
  { name: 'ISO 9001', description: 'Quality Management' },
  { name: 'ISO 14001', description: 'Environmental Management' },
  { name: 'ISO 45001', description: 'Health & Safety' },
  { name: 'ISO 27001', description: 'Information Security' },
  { name: 'ISO 42001', description: 'AI Management' },
  { name: 'ISO 37001', description: 'Anti-Bribery' },
  { name: 'ISO 50001', description: 'Energy Management' },
  { name: 'ISO 22000', description: 'Food Safety' },
  { name: 'ISO 55001', description: 'Asset Management' },
  { name: 'ISO 13485', description: 'Medical Devices QMS' },
];

const REPLACED_TOOLS = [
  'ISO 9001 QMS platform',
  'Environmental management software',
  'Health & safety incident system',
  'InfoSec risk management tool',
  'Document control system',
  'Audit management platform',
  'Supplier portal & risk',
  'Training & competency tracker',
  'Asset / CMMS platform',
  'Incident reporting software',
  'HR compliance integration',
  'Regulatory compliance tracker',
];

const FAQ_ITEMS = [
  {
    q: 'Does one licence really cover all standards?',
    a: `Yes. Every Nexara tier includes all 43 API-backed modules covering ISO 9001, 14001, 45001, 27001, 42001, and 30+ additional standards. There are no per-standard add-ons or upgrade gates.`,
  },
  {
    q: 'How does Nexara compare to buying separate tools?',
    a: `The average organisation running 8–12 compliance tools spends £${(PRICING.competitorBenchmarks.incumbentStackAnnualLow / 1000).toFixed(0)}k–£${(PRICING.competitorBenchmarks.incumbentStackAnnualHigh / 1000).toFixed(0)}k per year. Nexara consolidates everything into one platform, saving £${(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow / 1000).toFixed(0)}k–£${(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh / 1000).toFixed(0)}k annually on average.`,
  },
  {
    q: 'What does the 14-day free trial include?',
    a: `Your trial gives you full Professional-tier access — all 43 modules, up to ${PRICING.trial.maxUsers} users, real data import, and AI-powered insights — for ${PRICING.trial.durationDays} days. No commitment required. Cancel before day 14 and you will not be charged.`,
  },
  {
    q: 'How is the per-standard price calculated?',
    a: `At ${PRICING.symbol}${PRICING.tiers.STARTER.listPriceMonthly}/user/month for Starter covering 10+ standards, the effective cost per standard is just ${PRICING.symbol}${(PRICING.tiers.STARTER.listPriceMonthly / 10).toFixed(1)}–${PRICING.symbol}${(PRICING.tiers.STARTER.listPriceMonthly / 8).toFixed(1)}/user/month — far less than licensing each standard's software separately.`,
  },
  {
    q: 'Can I migrate from my existing tools?',
    a: 'Yes. Nexara includes data import utilities for CSV, Excel, and common integrations. Our onboarding team assists with migration at no extra cost on Professional and above.',
  },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function ComplianceSoftwarePricingLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Effective per-standard cost: list price / 10 standards
  const perStandardLow = PRICING.tiers.STARTER.listPriceMonthly / 10;
  const perStandardHigh = PRICING.tiers.STARTER.listPriceMonthly / 8;

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
              Full pricing
            </Link>
            <Link href="/lp/free-trial" className="text-sm text-[#60A5FA] hover:text-white transition-colors">
              Start free trial
            </Link>
            <Link href="/signup" className="text-sm bg-[#1B3A6B] hover:bg-[#244d8a] text-white px-4 py-2 rounded-lg transition">
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-3">
            Compliance software pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Transparent, Honest,<br />No Surprises
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-3">
            Replace 8–12 separate compliance tools with one platform.
            All 43 modules, 30+ ISO standards — one flat per-user fee.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Effective cost per standard: as low as{' '}
            <strong className="text-white">{PRICING.symbol}{perStandardLow.toFixed(0)}–{PRICING.symbol}{perStandardHigh.toFixed(0)}/user/month</strong>{' '}
            ({PRICING.symbol}{PRICING.tiers.STARTER.listPriceMonthly} list price ÷ 10 standards)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/lp/free-trial"
              className="px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
            >
              Start {PRICING.trial.durationDays}-day free trial — free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-lg border border-white/20 hover:border-white/40 text-white font-semibold transition"
            >
              View all pricing tiers
            </Link>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            All prices in {PRICING.currency}. No credit card required to start trial.
          </p>
        </div>

        {/* Replace 8-12 tools section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Replace 8–12 tools with one platform
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            The average organisation manages {PRICING.symbol}{(PRICING.competitorBenchmarks.incumbentStackAnnualLow / 1000).toFixed(0)}k–{PRICING.symbol}{(PRICING.competitorBenchmarks.incumbentStackAnnualHigh / 1000).toFixed(0)}k/year in separate compliance point solutions.
            Nexara consolidates them — saving {fmt(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow)}–{fmt(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh)} annually.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {REPLACED_TOOLS.map((tool) => (
              <div key={tool} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <span className="text-red-400 text-sm flex-shrink-0">✕</span>
                <span className="text-sm text-gray-300">{tool}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-8 py-4">
              <span className="text-green-400 text-2xl">✓</span>
              <div>
                <p className="text-white font-semibold">One Nexara licence replaces all of the above</p>
                <p className="text-gray-400 text-sm">43 modules · 30+ standards · single login · unified reporting</p>
              </div>
            </div>
          </div>
        </div>

        {/* Per-standard pricing breakdown */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Price per standard breakdown
          </h2>
          <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
            At {PRICING.symbol}{PRICING.tiers.STARTER.listPriceMonthly}/user/month you get coverage across all standards below — and more.
            That is effectively {PRICING.symbol}{perStandardLow.toFixed(1)}–{PRICING.symbol}{perStandardHigh.toFixed(1)}/user/month per standard.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium">Standard</th>
                    <th className="px-5 py-3.5 text-left text-gray-400 font-medium">Scope</th>
                    <th className="px-5 py-3.5 text-right text-gray-400 font-medium">Typical standalone cost</th>
                    <th className="px-5 py-3.5 text-right text-gray-400 font-medium">With Nexara</th>
                  </tr>
                </thead>
                <tbody>
                  {STANDARDS.map((s, i) => (
                    <tr key={s.name} className={`border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                      <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                      <td className="px-5 py-3 text-gray-400">{s.description}</td>
                      <td className="px-5 py-3 text-right text-red-400">{PRICING.symbol}15–{PRICING.symbol}30/user/mo</td>
                      <td className="px-5 py-3 text-right text-green-400 font-medium">Included</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-white/20 bg-white/5">
                    <td className="px-5 py-4 text-white font-bold" colSpan={2}>
                      All 10 standards (plus 20+ more)
                    </td>
                    <td className="px-5 py-4 text-right text-red-400 font-bold">
                      {PRICING.symbol}150–{PRICING.symbol}300/user/mo
                    </td>
                    <td className="px-5 py-4 text-right font-bold">
                      <span className="text-green-400">{PRICING.symbol}{PRICING.tiers.STARTER.listPriceMonthly}</span>
                      <span className="text-gray-400">/user/mo</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Standalone costs are market estimates. Actual savings depend on your current vendor contracts.
            </p>
          </div>
        </div>

        {/* Pricing tier cards */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-3">Simple, flat pricing</h2>
          <p className="text-gray-400 text-center mb-10">All tiers include every module. No hidden per-standard fees.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[PRICING.tiers.STARTER, PRICING.tiers.PROFESSIONAL, PRICING.tiers.ENTERPRISE].map((tier) => {
              const t = tier as any;
              const isPro = tier.id === 'professional';
              return (
                <div
                  key={tier.id}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    isPro
                      ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#1a1505] to-[#0B1120]'
                      : 'border border-white/10 bg-white/5'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-[#B8860B] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {t.minUsers}–{t.maxUsers ?? '∞'} users
                  </p>
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-white">
                        {PRICING.symbol}{t.annualMonthlyRate ?? t.listPriceMonthly}
                      </span>
                      <span className="text-gray-400 mb-1.5">/user/mo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">billed annually · list {PRICING.symbol}{t.listPriceMonthly}/user/mo</p>
                  </div>
                  <ul className="space-y-2 mb-8 flex-1">
                    {[
                      'All 43 compliance modules',
                      '30+ ISO standards',
                      `${t.slaUptime} SLA uptime`,
                      t.support,
                      t.minCommitmentMonths === 1 ? 'Month-to-month' : `${t.minCommitmentMonths}-month minimum`,
                      ...(t.verticalAddOnsIncluded ? ['Vertical add-ons included'] : []),
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                    {t.platformFeeAnnual && (
                      <li className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-yellow-500 mt-0.5">+</span>
                        {PRICING.symbol}{t.platformFeeAnnual.toLocaleString()}/yr platform fee
                      </li>
                    )}
                  </ul>
                  {t.trialEnabled ? (
                    <Link
                      href="/lp/free-trial"
                      className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition ${
                        isPro
                          ? 'bg-[#B8860B] hover:bg-[#a07808] text-black'
                          : 'bg-[#1B3A6B] hover:bg-[#244d8a] text-white'
                      }`}
                    >
                      Start free trial
                    </Link>
                  ) : (
                    <Link
                      href="/signup"
                      className="block text-center py-2.5 rounded-lg font-semibold text-sm bg-[#1B3A6B] hover:bg-[#244d8a] text-white transition"
                    >
                      Get started
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center mt-6 text-sm text-gray-500">
            Need 100+ users?{' '}
            <Link href="/pricing" className="text-[#60A5FA] hover:text-white transition-colors">
              See Enterprise+ pricing
            </Link>
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Pricing questions answered</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/5 hover:bg-white/8 transition"
                >
                  <span className="text-white font-medium pr-4">{item.q}</span>
                  <span className="text-gray-400 text-xl flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-2 bg-white/3">
                    <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/60 to-[#0B1120] border border-[#1B3A6B]/40 p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Replace your entire compliance stack today
          </h2>
          <p className="text-gray-400 mb-8">
            {PRICING.trial.durationDays}-day free trial — full Professional access, up to {PRICING.trial.maxUsers} users, no commitment.
            Cancel any time before day {PRICING.trial.durationDays} and you will not be charged.
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
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 mt-16 py-8 text-center text-xs text-gray-600">
        &copy; 2026 Nexara DMCC. All rights reserved. &nbsp;·&nbsp;
        <Link href="/privacy" className="hover:text-gray-400">Privacy</Link> &nbsp;·&nbsp;
        <Link href="/terms" className="hover:text-gray-400">Terms</Link>
      </footer>
    </main>
  );
}
