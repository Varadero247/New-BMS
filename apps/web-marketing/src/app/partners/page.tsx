// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

const ONBOARDING_STEPS = [
  { step: 1, title: 'Apply', description: 'Submit your partner application online. Takes less than 5 minutes.' },
  { step: 2, title: 'Approved in 5 days', description: 'Our channel team reviews your application and responds within 5 business days.' },
  { step: 3, title: 'Onboarding call', description: 'A 60-minute call with your dedicated channel manager to set up your partner portal, NFR licences, and co-sell strategy.' },
  { step: 4, title: 'Start selling', description: 'Go live with full access to demo environments, marketing materials, co-sell support, and deal registration.' },
];

const BENEFITS_TABLE: Array<{
  benefit: string;
  referral: string | boolean;
  reseller: string | boolean;
  strategic: string | boolean;
  whiteLabel: string | boolean;
}> = [
  { benefit: 'Revenue model', referral: '15% commission', reseller: '20% discount', strategic: '30% discount', whiteLabel: '35% discount' },
  { benefit: 'Annual commitment', referral: 'None', reseller: '2 deals/year', strategic: '10 deals/year', whiteLabel: '3 customers min' },
  { benefit: 'Platform licence fee', referral: false, reseller: false, strategic: false, whiteLabel: `${PRICING.symbol}${PRICING.partnerships.tiers.WHITE_LABEL.baseAnnualLicenceFee.toLocaleString()}/yr` },
  { benefit: 'Portal access', referral: 'Basic', reseller: 'Full', strategic: 'Full', whiteLabel: 'Full' },
  { benefit: 'Co-sell support', referral: false, reseller: true, strategic: true, whiteLabel: false },
  { benefit: 'Marketing support', referral: false, reseller: true, strategic: true, whiteLabel: false },
  { benefit: 'Co-marketing fund', referral: false, reseller: false, strategic: `${PRICING.symbol}${PRICING.partnerships.tiers.STRATEGIC.coMarketingFundGBP.toLocaleString()}`, whiteLabel: `${PRICING.symbol}${PRICING.partnerships.tiers.WHITE_LABEL.coMarketingFundGBP.toLocaleString()}` },
  { benefit: 'Dedicated channel manager', referral: false, reseller: false, strategic: true, whiteLabel: true },
  { benefit: 'NFR licences', referral: '0', reseller: `${PRICING.partnerships.tiers.RESELLER.nfrLicences}`, strategic: `${PRICING.partnerships.tiers.STRATEGIC.nfrLicences}`, whiteLabel: `${PRICING.partnerships.tiers.WHITE_LABEL.nfrLicences}` },
  { benefit: 'Listed on Nexara website', referral: false, reseller: true, strategic: true, whiteLabel: false },
  { benefit: 'Featured listing', referral: false, reseller: false, strategic: true, whiteLabel: false },
  { benefit: 'Full branding / white label', referral: false, reseller: false, strategic: false, whiteLabel: true },
  { benefit: 'Training required', referral: false, reseller: true, strategic: true, whiteLabel: true },
  { benefit: 'Certification required', referral: false, reseller: false, strategic: true, whiteLabel: true },
];

function BoolCell({ value }: { value: string | boolean }) {
  if (value === true) return <span className="text-green-400 text-base font-bold">&#10003;</span>;
  if (value === false) return <span className="text-gray-600">&#8212;</span>;
  return <span className="text-gray-300 text-sm">{value}</span>;
}

export default function PartnersPage() {
  const [openStep, setOpenStep] = useState<number | null>(null);

  const pt = PRICING.partnerships;
  const dr = pt.dealRegistration;

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

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#60A5FA] uppercase tracking-wider mb-3">
            Channel programme
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Partner with Nexara IMS
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            From referral commissions to white-label deployments &mdash; choose the model that fits your business.
            Earn up to 35% on every deal. Full co-sell support. Dedicated channel manager for Strategic and above.
          </p>
          <a
            href="mailto:partners@nexara.io"
            className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Apply to partner programme
          </a>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {[
            {
              key: 'REFERRAL',
              tier: pt.tiers.REFERRAL,
              headline: '15% revenue share',
              sub: 'No commitment',
              highlight: false,
            },
            {
              key: 'RESELLER',
              tier: pt.tiers.RESELLER,
              headline: '20% discount on all sales',
              sub: 'Monthly reporting',
              highlight: false,
            },
            {
              key: 'STRATEGIC',
              tier: pt.tiers.STRATEGIC,
              headline: '30% discount',
              sub: 'Co-marketing + Partner Success Manager',
              highlight: true,
            },
            {
              key: 'WHITE_LABEL',
              tier: pt.tiers.WHITE_LABEL,
              headline: '35% discount',
              sub: `+ ${PRICING.symbol}${pt.tiers.WHITE_LABEL.baseAnnualLicenceFee.toLocaleString()}/yr platform licence · Full rebrand`,
              highlight: false,
            },
          ].map(({ key, tier, headline, sub, highlight }) => (
            <div
              key={key}
              className={`relative rounded-2xl p-6 flex flex-col ${
                highlight
                  ? 'border-2 border-[#B8860B] bg-gradient-to-b from-[#1a1505] to-[#0B1120]'
                  : 'border border-white/10 bg-white/5'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#B8860B] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Strategic
                  </span>
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{(tier as any).name}</h3>
              <p className="text-2xl font-bold text-white mt-2 mb-1">{headline}</p>
              <p className="text-xs text-gray-500 mb-6">{sub}</p>
              <div className="flex-1" />
              <a
                href="mailto:partners@nexara.io"
                className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition ${
                  highlight
                    ? 'bg-[#B8860B] hover:bg-[#a07808] text-black'
                    : 'bg-[#1B3A6B] hover:bg-[#244d8a] text-white'
                }`}
              >
                Apply
              </a>
            </div>
          ))}
        </div>

        {/* Benefits table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Benefits by tier</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3.5 text-left text-gray-400 font-medium">Benefit</th>
                  <th className="px-4 py-3.5 text-center text-gray-300 font-medium">Referral</th>
                  <th className="px-4 py-3.5 text-center text-gray-300 font-medium">Reseller</th>
                  <th className="px-4 py-3.5 text-center text-[#B8860B] font-semibold">Strategic</th>
                  <th className="px-4 py-3.5 text-center text-gray-300 font-medium">White Label</th>
                </tr>
              </thead>
              <tbody>
                {BENEFITS_TABLE.map((row, i) => (
                  <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                    <td className="px-4 py-3 text-gray-300">{row.benefit}</td>
                    <td className="px-4 py-3 text-center"><BoolCell value={row.referral} /></td>
                    <td className="px-4 py-3 text-center"><BoolCell value={row.reseller} /></td>
                    <td className="px-4 py-3 text-center"><BoolCell value={row.strategic} /></td>
                    <td className="px-4 py-3 text-center"><BoolCell value={row.whiteLabel} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deal registration */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Deal registration</h2>
            <p className="text-gray-400 text-sm mb-6">
              Register deals with a minimum ACV of {PRICING.symbol}{dr.minimumDealACVForRegistration.toLocaleString()} to receive full protection.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-3xl font-bold text-white">{dr.protectionPeriodDays}</p>
                <p className="text-gray-400 text-sm mt-1">days protection</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">+{dr.extensionDays}</p>
                <p className="text-gray-400 text-sm mt-1">days extension on request</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{PRICING.symbol}{(dr.minimumDealACVForRegistration / 1000).toFixed(0)}k</p>
                <p className="text-gray-400 text-sm mt-1">minimum deal ACV</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner onboarding process */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Partner onboarding process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {ONBOARDING_STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-white/10 z-0" />
                )}
                <div className="relative z-10 bg-[#0B1120] text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-[#1B3A6B] flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{s.step}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                  <p className="text-gray-400 text-sm">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-[#1B3A6B]/60 to-[#0B1120] border border-[#1B3A6B]/40 p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to partner with Nexara?</h2>
          <p className="text-gray-400 mb-8">
            Apply today and our channel team will respond within 5 business days.
            All partner tiers include access to the Nexara partner portal, NFR licences, and co-sell collateral.
          </p>
          <a
            href="mailto:partners@nexara.io"
            className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
          >
            Apply to partner programme &rarr;
          </a>
          <p className="mt-3 text-sm text-gray-500">
            Email: <a href="mailto:partners@nexara.io" className="text-[#60A5FA] hover:text-white transition-colors">partners@nexara.io</a>
          </p>
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
