// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import { useEffect, useState } from 'react';
import { PARTNER_TIERS } from '@/lib/pricing';
import type { PartnerTierKey } from '@/lib/pricing';

const TIER_ORDER: PartnerTierKey[] = ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'];

const TIER_COLOURS: Record<PartnerTierKey, { bg: string; border: string; badge: string }> = {
  REFERRAL: { bg: 'bg-blue-600/10', border: 'border-blue-600/30', badge: 'bg-blue-600 text-white' },
  RESELLER: { bg: 'bg-emerald-600/10', border: 'border-emerald-600/30', badge: 'bg-emerald-600 text-white' },
  STRATEGIC: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white' },
  WHITE_LABEL: { bg: 'bg-purple-600/10', border: 'border-purple-600/30', badge: 'bg-purple-600 text-white' },
};

const ALL_FEATURES = [
  '15% revenue share',
  '90-day deal protection',
  'Co-branded materials',
  'Partner dashboard',
  '20% discount on all deals',
  '5 NFR seats',
  'Deal desk support',
  'Co-marketing funds',
  '30% discount on all deals',
  '90-day deal protection + 30-day extension',
  '10 NFR seats',
  'Dedicated Partner Success Manager',
  'Joint go-to-market',
  '35% discount',
  '25 NFR seats',
  'Full rebrand rights',
  '£24K annual platform licence',
  'Dedicated engineering support',
];

function tierHasFeature(tier: PartnerTierKey, feature: string): boolean {
  return (PARTNER_TIERS[tier].features as readonly string[]).includes(feature);
}

export default function TierPage() {
  const [currentTier, setCurrentTier] = useState<PartnerTierKey>('RESELLER');

  useEffect(() => {
    const stored = localStorage.getItem('partner_tier') as PartnerTierKey | null;
    if (stored && stored in PARTNER_TIERS) setCurrentTier(stored);
  }, []);

  const tierData = PARTNER_TIERS[currentTier];
  const colours = TIER_COLOURS[currentTier];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Tier &amp; Benefits</h1>
        <p className="text-gray-400 text-sm mt-1">Your current tier, benefits, and the path to upgrade.</p>
      </div>

      {/* Current tier card */}
      <div className={`rounded-2xl border ${colours.border} ${colours.bg} p-8 mb-8`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colours.badge} mb-3`}>
              YOUR TIER
            </span>
            <h2 className="text-3xl font-bold text-white mb-1">{tierData.name}</h2>
            {'annualLicenceFee' in tierData && (
              <p className="text-sm text-gray-400">
                Annual platform licence: £{(tierData as { annualLicenceFee: number }).annualLicenceFee.toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-right">
            {tierData.discountPct > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Your discount</p>
                <p className="text-4xl font-bold text-white">{tierData.discountPct}%</p>
              </div>
            )}
            {'commissionPct' in tierData && tierData.commissionPct > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Commission rate</p>
                <p className="text-4xl font-bold text-white">{tierData.commissionPct}%</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(tierData.features as readonly string[]).map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Tier comparison table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Tier Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Requirement</th>
                {TIER_ORDER.map((t) => (
                  <th key={t} className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${t === currentTier ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {PARTNER_TIERS[t].name}
                    {t === currentTier && <span className="ml-1 text-emerald-500">★</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-6 py-3 text-gray-400">Min. ACV commitment</td>
                {TIER_ORDER.map((t) => (
                  <td key={t} className={`px-6 py-3 text-center ${t === currentTier ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {PARTNER_TIERS[t].minACV === 0 ? '—' : `£${PARTNER_TIERS[t].minACV.toLocaleString()}`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-400">Discount / commission</td>
                {TIER_ORDER.map((t) => {
                  const td = PARTNER_TIERS[t];
                  const val = 'commissionPct' in td && td.commissionPct > 0
                    ? `${td.commissionPct}% commission`
                    : `${td.discountPct}% discount`;
                  return (
                    <td key={t} className={`px-6 py-3 text-center ${t === currentTier ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-400">NFR seats</td>
                {TIER_ORDER.map((t) => (
                  <td key={t} className={`px-6 py-3 text-center ${t === currentTier ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {PARTNER_TIERS[t].nfrSeats}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-400">Deal protection</td>
                {TIER_ORDER.map((t) => (
                  <td key={t} className={`px-6 py-3 text-center ${t === currentTier ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {PARTNER_TIERS[t].dealProtectionDays} days
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature grid */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Benefits Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Feature</th>
                {TIER_ORDER.map((t) => (
                  <th key={t} className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider ${t === currentTier ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {PARTNER_TIERS[t].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ALL_FEATURES.map((f) => (
                <tr key={f} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3 text-gray-300">{f}</td>
                  {TIER_ORDER.map((t) => (
                    <td key={t} className="px-6 py-3 text-center">
                      {tierHasFeature(t, f) ? (
                        <svg className="w-4 h-4 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Ready to upgrade your tier?</h3>
        <p className="text-gray-400 text-sm mb-4">
          Talk to your Partner Success Manager to discuss upgrading and unlocking better discounts and benefits.
        </p>
        <a
          href="mailto:partners@nexara.com"
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          Contact Partner Manager
        </a>
      </div>
    </div>
  );
}
