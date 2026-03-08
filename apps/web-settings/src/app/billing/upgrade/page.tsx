// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react';

interface TierCard {
  id: string;
  name: string;
  price: string | null;
  priceNote: string;
  minUsers: number;
  maxUsers: string;
  sla: string;
  support: string;
  isCurrent: boolean;
  isPopular: boolean;
  isCustom: boolean;
  features: string[];
}

const TIERS: TierCard[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£49',
    priceNote: '/user/month (monthly) · £39 annual',
    minUsers: 5,
    maxUsers: '25',
    sla: '99.5% uptime',
    support: 'Email 9–5',
    isCurrent: false,
    isPopular: false,
    isCustom: false,
    features: [
      'Up to 25 users',
      'Core IMS modules',
      'Document control',
      'Incident management',
      'Email support (business hours)',
      '99.5% SLA',
      '6-month minimum commitment',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '£39',
    priceNote: '/user/month (annual) · £49 monthly',
    minUsers: 10,
    maxUsers: '100',
    sla: '99.9% uptime',
    support: 'Email + Chat',
    isCurrent: true,
    isPopular: true,
    isCustom: false,
    features: [
      'Up to 100 users',
      'All IMS modules included',
      'AI analysis panels',
      '14-day free trial',
      'Email + live chat support',
      '99.9% SLA',
      'Monthly or annual billing',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '£28',
    priceNote: '/user/month (list) · £22 annual + £5k platform fee',
    minUsers: 25,
    maxUsers: 'Unlimited',
    sla: '99.95% uptime',
    support: 'Priority + CSM',
    isCurrent: false,
    isPopular: false,
    isCustom: false,
    features: [
      'Unlimited users (volume pricing)',
      'All modules + vertical add-ons',
      'Dedicated Customer Success Manager',
      'Priority support with SLA',
      '99.95% SLA',
      'SSO / SAML / SCIM',
      '£5,000 annual platform fee',
    ],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    price: null,
    priceNote: 'Custom pricing · min 100 users · 12-month commitment',
    minUsers: 100,
    maxUsers: 'Unlimited',
    sla: '99.99% dedicated',
    support: 'Dedicated CSM',
    isCurrent: false,
    isPopular: false,
    isCustom: true,
    features: [
      '100+ users',
      'White-label option',
      'Dedicated infrastructure',
      'HR & Payroll API access',
      'Dedicated CSM',
      '99.99% dedicated SLA',
      '£12,000 annual platform fee',
    ],
  },
];

export default function BillingUpgradePage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back link */}
      <Link
        href="/billing"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </Link>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upgrade Your Plan</h1>
        <p className="text-gray-500 dark:text-gray-400">Choose the plan that fits your organisation. All plans include the full Nexara IMS module suite.</p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-4 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-xl border p-6 transition-shadow ${
              tier.isCurrent
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg shadow-brand-500/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md'
            }`}
          >
            {tier.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}

            {tier.isCurrent && (
              <div className="absolute -top-3 right-4">
                <span className="inline-block bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </span>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{tier.name}</h2>
              {tier.price ? (
                <div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{tier.price}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tier.priceNote}</p>
                </div>
              ) : (
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Custom</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tier.priceNote}</p>
                </div>
              )}
            </div>

            <div className="flex-1 mb-6">
              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={tier.isCurrent}
              onClick={() =>
                tier.isCustom
                  ? window.alert('A member of our enterprise team will be in touch to prepare a custom quote.')
                  : window.alert('Redirecting to Stripe checkout...')
              }
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                tier.isCurrent
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : tier.isPopular
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900'
              }`}
            >
              {tier.isCurrent ? 'Current Plan' : tier.isCustom ? 'Contact Sales' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
        All prices in GBP. Annual billing saves up to 20%. Volume discounts available for 25+ users on Enterprise.{' '}
        <a href="mailto:sales@nexara.io" className="text-brand-600 dark:text-brand-400 hover:underline">Contact sales</a> for custom quotes.
      </p>
    </div>
  );
}
