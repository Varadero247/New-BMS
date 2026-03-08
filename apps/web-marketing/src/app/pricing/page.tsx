// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

const FAQ_ITEMS = [
  {
    q: 'What happens at the end of my 14-day free trial?',
    a: `Your trial automatically converts to a paid Professional plan at ${PRICING.symbol}${PRICING.tiers.PROFESSIONAL.trialConvertRate}/user/month — that's ${PRICING.tiers.PROFESSIONAL.trialDiscountPct}% off the list price. You'll receive a reminder ${PRICING.tiers.PROFESSIONAL.trialNotificationDays} days before conversion. Cancel any time before day 14 and you won't be charged.`,
  },
  {
    q: 'Can I change tiers after I sign up?',
    a: 'Yes. You can upgrade immediately — the difference is prorated to your next billing date. Downgrades take effect at the start of your next billing cycle.',
  },
  {
    q: 'What is the annual discount?',
    a: `Pay annually and save ${PRICING.tiers.PROFESSIONAL.annualDiscountPct}% across all tiers. Enterprise customers also qualify for multi-year commitments with additional volume discounts.`,
  },
  {
    q: 'Does Nexara support multiple ISO standards on a single licence?',
    a: 'Yes. Every tier includes all 43 API-backed modules covering ISO 9001, 14001, 45001, 27001, 42001, and 30+ additional standards. There are no per-standard add-ons.',
  },
  {
    q: 'What is the Enterprise platform fee?',
    a: `Enterprise plans include a ${PRICING.symbol}${(PRICING.tiers.ENTERPRISE.platformFeeAnnual ?? 0).toLocaleString()} annual platform fee which covers dedicated onboarding, custom integrations, and a Customer Success Manager. Enterprise+ includes a ${PRICING.symbol}${(PRICING.tiers.ENTERPRISE_PLUS.platformFeeAnnual ?? 0).toLocaleString()} platform fee.`,
  },
  {
    q: 'Is there a minimum commitment period?',
    a: `Starter requires a ${PRICING.tiers.STARTER.minCommitmentMonths}-month minimum commitment. Professional is month-to-month. Enterprise and Enterprise+ are billed annually with optional multi-year pricing.`,
  },
];

function fmt(n: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openVolume, setOpenVolume] = useState(false);

  const tiers = [
    PRICING.tiers.STARTER,
    PRICING.tiers.PROFESSIONAL,
    PRICING.tiers.ENTERPRISE,
    PRICING.tiers.ENTERPRISE_PLUS,
  ];

  function getDisplayPrice(tier: typeof tiers[number]) {
    const t = tier as any;
    if (t.listPriceMonthly === null) return null;
    return billingCycle === 'annual' ? t.annualMonthlyRate : t.listPriceMonthly;
  }

  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            Nexara
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/lp/free-trial" className="text-sm text-[#60A5FA] hover:text-white transition-colors">
              Start free trial
            </Link>
            <Link href="/signup" className="text-sm bg-[#1B3A6B] hover:bg-[#244d8a] text-white px-4 py-2 rounded-lg transition">
              Book a demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-3">Transparent pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            One platform. Every standard.<br />No per-module fees.
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-2">
            Save {fmt(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow)}–{fmt(PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh)} per year versus your incumbent stack.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            14-day free trial — no commitment. All prices in {PRICING.currency}.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition ${
                billingCycle === 'monthly'
                  ? 'bg-[#1B3A6B] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#1B3A6B] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {tiers.map((tier) => {
            const t = tier as any;
            const isPro = tier.id === 'professional';
            const price = getDisplayPrice(tier);

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

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                  <p className="text-xs text-gray-500">
                    {t.minUsers} – {t.maxUsers ?? '∞'} users
                  </p>
                </div>

                <div className="mb-6">
                  {price !== null ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold text-white">{PRICING.symbol}{price}</span>
                        <span className="text-gray-400 mb-1.5">/user/mo</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-xs text-gray-500 mt-1">
                          billed annually · list {PRICING.symbol}{t.listPriceMonthly}/user/mo
                        </p>
                      )}
                    </>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-white">Custom pricing</span>
                      <p className="text-xs text-gray-500 mt-1">100+ users · min {fmt(t.targetACVMin ?? 0)}/yr ACV</p>
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    All 43 compliance modules
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {t.slaUptime} SLA uptime
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {t.support}
                  </li>
                  {t.verticalAddOnsIncluded && (
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      Vertical add-ons included
                    </li>
                  )}
                  {t.whiteLabel && (
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-0.5">✓</span>
                      White-label ready
                    </li>
                  )}
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
                ) : price === null ? (
                  <Link
                    href="/signup"
                    className="block text-center py-2.5 rounded-lg font-semibold text-sm bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    Contact sales
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

        {/* Volume discount accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <button
            onClick={() => setOpenVolume(!openVolume)}
            className="w-full flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition text-left"
          >
            <span className="text-white font-semibold">Enterprise volume discount bands</span>
            <span className="text-gray-400 text-xl">{openVolume ? '−' : '+'}</span>
          </button>
          {openVolume && (
            <div className="border border-t-0 border-white/10 rounded-b-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Users</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">List /user/mo</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Annual /user/mo</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">2-year /user/mo</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Illustrative ACV</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING.volumeDiscounts.bands.map((band, i) => {
                    const b = band as any;
                    const isCustom = b.note;
                    return (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/3">
                        <td className="px-4 py-3 text-white">
                          {band.minUsers}{band.maxUsers ? `–${band.maxUsers}` : '+'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {b.listMonthly ? `${PRICING.symbol}${b.listMonthly}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {b.annualMonthly ? `${PRICING.symbol}${b.annualMonthly}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {b.twoYearMonthly ? `${PRICING.symbol}${b.twoYearMonthly}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">
                          {isCustom ? (
                            <span className="text-[#60A5FA]">Custom</span>
                          ) : (
                            `${fmt(b.illustrativeACVMin)}–${fmt(b.illustrativeACVMax)}`
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="px-4 py-3 text-xs text-gray-500 border-t border-white/5">
                {PRICING.volumeDiscounts.notes}
              </p>
            </div>
          )}
        </div>

        {/* Competitor comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-2">How Nexara compares</h2>
          <p className="text-gray-400 text-center mb-8">Per-user per-month list prices (approximate, public sources)</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-5 py-4 text-left text-gray-400 font-medium">Platform</th>
                  <th className="px-5 py-4 text-right text-gray-400 font-medium">List price /user/mo</th>
                  <th className="px-5 py-4 text-right text-gray-400 font-medium">vs Nexara Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Donesafe', ppum: PRICING.competitorBenchmarks.donesafePPUM, currency: PRICING.symbol },
                  { name: 'Intelex', ppum: PRICING.competitorBenchmarks.intelexPPUM, currency: PRICING.symbol },
                  { name: 'ETQ Reliance', ppum: PRICING.competitorBenchmarks.etqPPUM, currency: PRICING.symbol },
                  { name: 'Nexara Enterprise', ppum: PRICING.tiers.ENTERPRISE.listPriceMonthly, currency: PRICING.symbol, isNexara: true },
                ].map((row) => {
                  const nexaraPpum = PRICING.tiers.ENTERPRISE.listPriceMonthly;
                  const diff = row.ppum !== null && nexaraPpum !== null ? row.ppum - nexaraPpum : null;
                  return (
                    <tr
                      key={row.name}
                      className={`border-t border-white/5 ${row.isNexara ? 'bg-[#1B3A6B]/20' : 'hover:bg-white/3'}`}
                    >
                      <td className="px-5 py-4 text-white font-medium">
                        {row.name}
                        {row.isNexara && (
                          <span className="ml-2 text-xs bg-[#B8860B]/20 text-[#B8860B] px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right text-white">
                        {row.ppum !== null ? `${row.currency}${row.ppum}` : 'Custom'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {row.isNexara ? (
                          <span className="text-[#60A5FA]">Baseline</span>
                        ) : diff !== null && diff > 0 ? (
                          <span className="text-red-400">+{PRICING.symbol}{diff}/user/mo more expensive</span>
                        ) : diff !== null && diff < 0 ? (
                          <span className="text-green-400">{PRICING.symbol}{Math.abs(diff)}/user/mo cheaper</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">
            * Intelex and ETQ prices are estimates based on publicly available market data. Actual pricing varies by contract.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
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
          <h2 className="text-3xl font-bold text-white mb-3">Ready to consolidate your compliance stack?</h2>
          <p className="text-gray-400 mb-8">
            Start your {PRICING.trial.durationDays}-day free trial today — full Professional access, up to {PRICING.trial.maxUsers} users, no commitment.
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
