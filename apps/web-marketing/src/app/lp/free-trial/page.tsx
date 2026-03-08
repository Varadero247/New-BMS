// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { PRICING } from '@/lib/pricing';

export default function FreeTrialPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', company: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission — in production wire to /api/marketing/trial/start
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  const trialTier = PRICING.tiers.PROFESSIONAL;
  const conversionRate = trialTier.trialConvertRate;
  const discountPct = PRICING.trial.conversionDiscountPct;

  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-100 flex flex-col">
      {/* Minimal header — conversion-optimised, no nav distractions */}
      <div className="border-b border-white/10 py-4 px-6 flex justify-center">
        <Link href="/" className="text-xl font-semibold tracking-tight text-white">
          Nexara
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        {!submitted ? (
          <div className="w-full max-w-lg">
            {/* Trust badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 text-xs text-[#60A5FA] bg-[#60A5FA]/10 border border-[#60A5FA]/20 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {PRICING.trial.durationDays}-day free trial · No charge until day {PRICING.trial.durationDays + 1}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 leading-tight">
              {PRICING.trial.durationDays} days. Full access.<br />No charge.
            </h1>

            <p className="text-gray-400 text-center mb-8">
              Start your free trial of Nexara Professional today.
            </p>

            {/* Value bullets */}
            <ul className="space-y-3 mb-10 bg-white/5 border border-white/10 rounded-xl p-6">
              {[
                `Full ${trialTier.name} tier — all 43 compliance modules`,
                `Up to ${PRICING.trial.maxUsers} users during trial`,
                `Cancel before day ${PRICING.trial.durationDays} — you won't be charged`,
                `Auto-converts with ${discountPct}% saving — ${PRICING.symbol}${conversionRate}/user/mo`,
                `${trialTier.slaUptime} SLA · ${trialTier.support}`,
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Work email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Company name *
                </label>
                <input
                  id="company"
                  name="company"
                  required
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Acme Ltd"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-[#1B3A6B] focus:ring-1 focus:ring-[#1B3A6B] outline-none transition"
                />
              </div>

              {/* Card placeholder */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
                  <span className="text-[#60A5FA]">🔒</span>
                  Card required to activate trial — you won't be charged until day {PRICING.trial.durationDays + 1}
                </p>
                <div className="space-y-3">
                  <div className="h-10 bg-white/5 border border-white/10 rounded-lg flex items-center px-4">
                    <span className="text-gray-600 text-sm">Card number  ·  Expiry  ·  CVC</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    Powered by Stripe · PCI-DSS Level 1 · 256-bit encryption
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold text-base transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting your trial…' : 'Start my free trial →'}
              </button>

              <p className="text-center text-xs text-gray-600">
                By starting a trial you agree to our{' '}
                <Link href="/terms" className="text-gray-400 hover:text-white underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-gray-400 hover:text-white underline">
                  Privacy Policy
                </Link>.
              </p>
            </form>
          </div>
        ) : (
          /* Success state */
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-400 text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Your trial is ready</h2>
            <p className="text-gray-400 mb-2">
              We've sent a confirmation and login link to <strong className="text-white">{form.email}</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Your trial expires in {PRICING.trial.durationDays} days. You'll receive a reminder {PRICING.trial.notificationDays} days before it ends.
            </p>
            <Link
              href="http://localhost:3000"
              className="inline-block px-8 py-3.5 rounded-lg bg-[#1B3A6B] hover:bg-[#244d8a] text-white font-semibold transition"
            >
              Open Nexara IMS →
            </Link>
            <p className="mt-4 text-xs text-gray-600">
              Questions? Email{' '}
              <a href="mailto:support@nexara.io" className="text-[#60A5FA] hover:underline">
                support@nexara.io
              </a>
            </p>
          </div>
        )}
      </div>

      <div className="py-6 text-center text-xs text-gray-700">
        &copy; 2026 Nexara DMCC. All rights reserved.
      </div>
    </main>
  );
}
