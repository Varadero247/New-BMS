// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

interface PlanSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

// Inline pricing summary — source of truth is packages/config/src/pricing.config.ts
const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null,
    listMonthly: 49,
    annualMonthly: 39,
    minUsers: 5,
    maxUsers: 25,
    sla: '99.5%',
    support: 'Email 9–5',
    trialEnabled: false,
    trialDays: 0,
    platformFee: null as number | null,
    custom: false,
    features: ['5–25 users', 'All core modules', '99.5% SLA', 'Email support (9–5)', '6-month minimum'],
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: '⭐ Most Popular',
    listMonthly: 39,
    annualMonthly: 31,
    minUsers: 10,
    maxUsers: 100,
    sla: '99.9%',
    support: 'Email + Chat',
    trialEnabled: true,
    trialDays: 14,
    platformFee: null as number | null,
    custom: false,
    features: ['10–100 users', 'All core modules', '14-day free trial', '99.9% SLA', 'Email + Chat support', 'No minimum term'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null,
    listMonthly: 28,
    annualMonthly: 22,
    minUsers: 25,
    maxUsers: null as number | null,
    sla: '99.95%',
    support: 'Priority + CSM',
    trialEnabled: false,
    trialDays: 0,
    platformFee: 5000,
    custom: false,
    features: ['25+ users', 'All modules incl. verticals', 'Volume pricing', '99.95% SLA', 'Priority + CSM', '£5,000/yr platform fee'],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    badge: null,
    listMonthly: null as number | null,
    annualMonthly: null as number | null,
    minUsers: 100,
    maxUsers: null as number | null,
    sla: '99.99% dedicated',
    support: 'Dedicated CSM',
    trialEnabled: false,
    trialDays: 0,
    platformFee: 12000,
    custom: true,
    features: ['100+ users', 'All modules + white label', 'Custom pricing', '99.99% SLA (dedicated)', 'Dedicated CSM', '£12,000/yr platform fee'],
  },
] as const;

const VOLUME_BANDS = [
  { minUsers: 25,  maxUsers: 49,  annualMonthly: 22 },
  { minUsers: 50,  maxUsers: 99,  annualMonthly: 22 },
  { minUsers: 100, maxUsers: 199, annualMonthly: 20 },
  { minUsers: 200, maxUsers: 499, annualMonthly: 18 },
];

function recommendPlan(users: number): string {
  if (users >= 100) return 'enterprise_plus';
  if (users >= 25) return 'enterprise';
  return 'professional';
}

function getVolumeRate(users: number): number | null {
  for (const band of VOLUME_BANDS) {
    if (users >= band.minUsers && (band.maxUsers === null || users <= band.maxUsers)) {
      return band.annualMonthly;
    }
  }
  return null;
}

export function PlanSelectionStep({ onNext, onBack }: PlanSelectionStepProps) {
  const { selectedPlan, setSelectedPlan, billingCycle, setBillingCycle, userCount, setUserCount } = useOnboarding();

  // Auto-recommend plan when userCount changes
  useEffect(() => {
    const recommended = recommendPlan(userCount);
    setSelectedPlan(recommended);
  }, [userCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTier = TIERS.find((t) => t.id === selectedPlan) ?? TIERS[1];
  const showVolumeBands = selectedPlan === 'enterprise' && userCount >= 25;

  function formatPrice(monthly: number | null): string {
    if (monthly === null) return 'Custom';
    return `£${monthly}`;
  }

  function getDisplayRate(tier: typeof TIERS[number]): number | null {
    if (tier.id === 'enterprise' || tier.id === 'enterprise_plus') {
      if (tier.id === 'enterprise_plus') return null;
      return getVolumeRate(userCount) ?? tier.annualMonthly;
    }
    return billingCycle === 'annual' ? tier.annualMonthly : tier.listMonthly;
  }

  function getAnnualCost(tier: typeof TIERS[number]): string {
    const rate = getDisplayRate(tier);
    if (rate === null) return 'Custom';
    const userCost = rate * userCount * 12;
    const platformFee = tier.platformFee ?? 0;
    return `£${(userCost + platformFee).toLocaleString()}/yr`;
  }

  function getCTA(tier: typeof TIERS[number]): string {
    if (tier.trialEnabled) return 'Start 14-day free trial';
    if (tier.id === 'enterprise' || tier.id === 'enterprise_plus') return 'Talk to Sales';
    return 'Get started';
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Choose Your Plan
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          All plans include every ISO management module. Pay per user, cancel anytime on Professional.
        </p>
      </div>

      {/* Billing toggle + user count row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Billing cycle toggle */}
        <div className="flex items-center gap-1 bg-[#091628] border border-[#1E3A5F] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-[#B8860B] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual
            <span className="text-xs font-semibold bg-white/20 px-1.5 py-0.5 rounded">Save 20%</span>
          </button>
        </div>

        {/* User count */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400 font-medium whitespace-nowrap">Users:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={userCount}
            onChange={(e) => {
              const v = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
              setUserCount(v);
            }}
            className="w-20 bg-[#091628] border border-[#1E3A5F] rounded-lg px-3 py-1.5 text-white text-sm text-center focus:outline-none focus:border-[#B8860B]"
          />
          <span className="text-xs text-slate-500">1–500</span>
        </div>
      </div>

      {/* Tier cards — 2×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TIERS.map((tier) => {
          const isSelected = selectedPlan === tier.id;
          const rate = getDisplayRate(tier);
          const annualCost = getAnnualCost(tier);
          const outOfRange =
            userCount < tier.minUsers ||
            (tier.maxUsers !== null && userCount > tier.maxUsers);

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setSelectedPlan(tier.id)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-[#B8860B] bg-[#B8860B]/10 shadow-lg shadow-[#B8860B]/10'
                  : outOfRange
                  ? 'border-[#1E3A5F]/50 bg-[#091628]/50 opacity-60 cursor-default'
                  : 'border-[#1E3A5F] bg-[#091628] hover:border-[#B8860B]/50'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <span className="absolute top-3 right-3 text-xs font-semibold bg-[#B8860B] text-white px-2 py-0.5 rounded-full">
                  {tier.badge}
                </span>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-[#B8860B] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}

              <div className={`mb-3 ${isSelected ? 'mt-2' : ''}`}>
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  {tier.custom ? (
                    <span className="text-2xl font-bold text-[#B8860B]">Custom</span>
                  ) : rate !== null ? (
                    <>
                      <span className="text-2xl font-bold text-[#B8860B]">£{rate}</span>
                      <span className="text-slate-400 text-sm">/user/mo</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-[#B8860B]">Custom</span>
                  )}
                </div>
                {billingCycle === 'annual' && !tier.custom && rate !== null && (
                  <p className="text-xs text-slate-500 mt-0.5">Billed annually · {annualCost} est.</p>
                )}
                {tier.platformFee && (
                  <p className="text-xs text-amber-500/80 mt-0.5">+ £{tier.platformFee.toLocaleString()}/yr platform fee</p>
                )}
              </div>

              <div className="space-y-1 mb-4">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-1.5">
                    <span className="text-[#B8860B] text-xs mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-xs text-slate-300">{f}</span>
                  </div>
                ))}
              </div>

              <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-center transition-colors ${
                isSelected
                  ? 'bg-[#B8860B] text-white'
                  : 'bg-[#1E3A5F] text-slate-300'
              }`}>
                {getCTA(tier)}
              </div>

              {tier.trialEnabled && (
                <p className="text-center text-xs text-slate-500 mt-1.5">No credit card required</p>
              )}

              {outOfRange && (
                <p className="text-center text-xs text-amber-500/70 mt-1.5">
                  {userCount < tier.minUsers
                    ? `Minimum ${tier.minUsers} users`
                    : `Maximum ${tier.maxUsers} users`}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Volume discount table for Enterprise */}
      {showVolumeBands && (
        <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Enterprise Volume Pricing (Annual)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E3A5F]">
                  <th className="text-left pb-2 text-slate-400 font-medium">Users</th>
                  <th className="text-right pb-2 text-slate-400 font-medium">Rate/user/mo</th>
                  <th className="text-right pb-2 text-slate-400 font-medium">Est. ACV</th>
                </tr>
              </thead>
              <tbody>
                {VOLUME_BANDS.map((band) => {
                  const inRange = userCount >= band.minUsers && userCount <= band.maxUsers;
                  const exampleUsers = Math.min(Math.max(userCount, band.minUsers), band.maxUsers);
                  const acv = band.annualMonthly * exampleUsers * 12 + 5000;
                  return (
                    <tr
                      key={band.minUsers}
                      className={`border-b border-[#1E3A5F]/50 ${inRange ? 'bg-[#B8860B]/10' : ''}`}
                    >
                      <td className={`py-2 ${inRange ? 'text-[#B8860B] font-semibold' : 'text-slate-300'}`}>
                        {band.minUsers}–{band.maxUsers} users
                        {inRange && ' ← you'}
                      </td>
                      <td className={`py-2 text-right ${inRange ? 'text-[#B8860B] font-semibold' : 'text-slate-300'}`}>
                        £{band.annualMonthly}/mo
                      </td>
                      <td className="py-2 text-right text-slate-400">
                        ~£{acv.toLocaleString()}/yr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">* Includes £5,000/yr platform fee. Multi-year discounts available on request.</p>
        </div>
      )}

      {/* Selected plan summary */}
      <div className="bg-[#091628] border border-[#B8860B]/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Selected: {selectedTier.name}</p>
          <p className="text-xs text-slate-400">
            {userCount} users · {billingCycle} billing
            {billingCycle === 'annual' && !selectedTier.custom ? ' · 20% saving applied' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#B8860B]">
            {selectedTier.custom ? 'Custom' : getAnnualCost(selectedTier)}
          </p>
          {selectedTier.platformFee && (
            <p className="text-xs text-slate-500">incl. platform fee</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 dark:border-[#1E3A5F] text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E3A5F]/30 transition-colors text-sm"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-[#B8860B] hover:bg-[#D4A017] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {selectedTier.trialEnabled ? 'Start Free Trial \u2192' : 'Continue \u2192'}
        </button>
      </div>
    </div>
  );
}
