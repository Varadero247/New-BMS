// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, ArrowUpCircle, Download, AlertTriangle, Star, TrendingUp } from 'lucide-react';

interface Invoice {
  id: string;
  period: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const INVOICES: Invoice[] = [
  { id: 'INV-2026-003', period: 'March 2026',    amount: 975,  status: 'Pending' },
  { id: 'INV-2026-002', period: 'February 2026', amount: 975,  status: 'Paid'    },
  { id: 'INV-2026-001', period: 'January 2026',  amount: 975,  status: 'Paid'    },
  { id: 'INV-2025-012', period: 'December 2025', amount: 975,  status: 'Paid'    },
  { id: 'INV-2025-011', period: 'November 2025', amount: 975,  status: 'Paid'    },
];

const STATUS_BADGE: Record<Invoice['status'], string> = {
  Paid:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Inline pricing — source of truth: packages/config/src/pricing.config.ts
const VERTICAL_ADDONS = [
  { id: 'automotive',  name: 'Automotive (IATF 16949)',   priceMonthly: 8 },
  { id: 'medical',     name: 'Medical Devices (ISO 13485)', priceMonthly: 8 },
  { id: 'aerospace',   name: 'Aerospace (AS9100D)',        priceMonthly: 8 },
  { id: 'food_safety', name: 'Food Safety (ISO 22000)',    priceMonthly: 6 },
  { id: 'ai_mgmt',     name: 'AI Management (ISO 42001)',  priceMonthly: 6 },
];

// Demo config — in production these would come from /api/organisations/billing
const DEMO = {
  tier: 'professional' as 'starter' | 'professional' | 'enterprise' | 'enterprise_plus',
  tierName: 'Professional',
  annualMonthlyRate: 31,
  platformFeeAnnual: null as number | null,
  planUsers: 25,
  planCap: 100,
  nextRenewal: '7 Apr 2027',
  isDesignPartner: false,
  designPartnerRate: null as number | null,
  isTrial: false,
  trialEndDate: null as string | null,
  activeAddons: [] as string[],
};

export default function BillingPage() {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? Your access will end at the next renewal date.')) {
      window.alert('Cancellation request received. Your subscription will remain active until 2026-04-07. Our team will be in touch.');
    }
  };

  const { planUsers, planCap, tier, tierName, platformFeeAnnual, isDesignPartner, designPartnerRate, isTrial, trialEndDate } = DEMO;
  const effectiveRate = isDesignPartner && designPartnerRate !== null ? designPartnerRate : DEMO.annualMonthlyRate;
  const usagePct = Math.round((planUsers / planCap) * 100);
  const monthlyTotal = effectiveRate * planUsers;
  const annualUserCost = monthlyTotal * 12;
  const totalAnnual = annualUserCost + (platformFeeAnnual ?? 0);

  // Show volume discount prompt when approaching next Enterprise band (25 users)
  const showVolumePrompt = tier === 'enterprise' && planUsers >= 20 && planUsers < 25;
  // Show tier boundary prompt when Professional usage is high
  const showBoundaryPrompt = tier === 'professional' && planUsers >= 85;
  // Enterprise/Enterprise+ tiers include vertical add-ons
  const addonsIncluded = tier === 'enterprise' || tier === 'enterprise_plus';

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing &amp; Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your plan, invoices, and payment details</p>
        </div>
      </div>

      {/* Trial banner */}
      {isTrial && trialEndDate && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400">Free Trial Active</p>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
              Your trial ends on <strong>{trialEndDate}</strong>. Upgrade to keep access.
            </p>
          </div>
          <Link href="/billing/upgrade" className="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Design Partner banner */}
      {isDesignPartner && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-300 dark:border-amber-700/40 rounded-xl px-5 py-4 flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-400">Design Partner — Founding Rate</p>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-0.5">
              You are enjoying a locked founding rate of <strong>£{designPartnerRate}/user/mo</strong> as part of our Design Partner programme.
            </p>
          </div>
        </div>
      )}

      {/* Volume discount prompt */}
      {showVolumePrompt && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            You have <strong>{planUsers}</strong> users. Adding {25 - planUsers} more qualifies you for Enterprise volume pricing at £22/user/mo.{' '}
            <Link href="/billing/upgrade" className="underline font-semibold">Learn more</Link>
          </p>
        </div>
      )}

      {/* Tier boundary prompt */}
      {showBoundaryPrompt && (
        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl px-5 py-4 flex items-center gap-3">
          <ArrowUpCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <p className="text-sm text-purple-700 dark:text-purple-400">
            You&rsquo;re approaching the Professional plan limit ({planUsers}/100 users). Upgrade to Enterprise for volume pricing and a dedicated CSM.{' '}
            <Link href="/billing/upgrade" className="underline font-semibold">Compare plans</Link>
          </p>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tierName}</h2>
              {isDesignPartner && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3" /> Founding Rate
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Billed annually · £{effectiveRate}/user/month</p>
          </div>
          <Link
            href="/billing/upgrade"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{planUsers}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">£{monthlyTotal.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next Renewal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{DEMO.nextRenewal}</p>
          </div>
        </div>

        {/* Platform fee line item for Enterprise/Enterprise+ */}
        {platformFeeAnnual && (
          <div className="py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">User licences ({planUsers} × £{effectiveRate} × 12)</span>
              <span className="font-medium text-gray-900 dark:text-white">£{annualUserCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Platform fee (annual)</span>
              <span className="font-medium text-gray-900 dark:text-white">£{platformFeeAnnual.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
              <span className="text-gray-900 dark:text-white">Total ACV</span>
              <span className="text-amber-600 dark:text-amber-400">£{totalAnnual.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Usage bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User seats</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{planUsers} / {planCap}</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-brand-600 h-2.5 rounded-full"
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{usagePct}% of user cap used</p>
        </div>
      </div>

      {/* Vertical Add-ons */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Vertical Add-ons</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {addonsIncluded
            ? `Included free with your ${tierName} plan.`
            : 'Industry-specific modules available as optional add-ons.'}
        </p>
        <div className="space-y-2">
          {VERTICAL_ADDONS.map((addon) => {
            const active = DEMO.activeAddons.includes(addon.id) || addonsIncluded;
            return (
              <div key={addon.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{addon.name}</p>
                <div className="flex items-center gap-3">
                  {!addonsIncluded && (
                    <span className="text-sm text-gray-400">+£{addon.priceMonthly}/user/mo</span>
                  )}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    active
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {active ? 'Active' : 'Add'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Invoice History</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Invoice #</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Period</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-right">Amount</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Status</th>
              <th className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">Download</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 font-mono text-xs text-gray-600 dark:text-gray-400">{inv.id}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300">{inv.period}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 text-right font-medium text-gray-900 dark:text-white">£{inv.amount.toLocaleString()}</td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-3 border-b border-gray-50 dark:border-gray-700/50">
                  <button
                    onClick={() => window.alert(`Downloading ${inv.id}...`)}
                    className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline text-xs"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-red-800 dark:text-red-300">Danger Zone</h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Cancelling your subscription will end access to all Nexara IMS modules at your next renewal date. Your data will be retained for 90 days.
        </p>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          Cancel Subscription
        </button>
      </div>
    </div>
  );
}
