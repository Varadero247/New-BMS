// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { useState } from 'react';

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IN', name: 'India' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'ZA', name: 'South Africa' },
];

const TRIAL_DAYS = 14;

function getTrialExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FLOW_STEPS = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Company' },
  { num: 3, label: 'Billing' },
  { num: 4, label: 'Ready' },
];

export function TrialOnboardingFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    country: 'GB',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, 4));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleStartTrial() {
    setSubmitting(true);
    setError('');
    try {
      // In production: POST /api/billing/trials { ...form }
      await new Promise((r) => setTimeout(r, 800)); // simulate API call
      setStep(4);
    } catch {
      setError('Unable to start trial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full bg-[#091628] border border-[#1E3A5F] rounded-lg px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="min-h-screen bg-[#050D1A] flex flex-col">
      {/* Header */}
      <header className="bg-[#091628] border-b border-[#1E3A5F] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <span className="font-semibold text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Nexara IMS — Start Free Trial
          </span>
        </div>
        <div className="text-xs text-slate-400">Step {step} of {FLOW_STEPS.length}</div>
      </header>

      {/* Progress */}
      <div className="bg-[#091628] px-6 pb-4">
        <div className="flex items-center gap-0 max-w-xl mx-auto">
          {FLOW_STEPS.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s.num < step ? 'bg-[#B8860B] text-white' :
                  s.num === step ? 'bg-white text-[#0B1E38]' :
                  'bg-[#1E3A5F] text-slate-400'
                }`}>
                  {s.num < step ? '✓' : s.num}
                </div>
                <span className={`text-xs mt-1 ${s.num === step ? 'text-white font-medium' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < FLOW_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${s.num < step ? 'bg-[#B8860B]' : 'bg-[#1E3A5F]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Step 1: Email + password */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Create your account
                </h2>
                <p className="text-slate-400 text-sm">Start your 14-day free trial — no credit card required at sign-up.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Work email</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!form.email || !form.password || form.password.length < 8}
                onClick={goNext}
                className="w-full py-3 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Continue &rarr;
              </button>

              <p className="text-center text-xs text-slate-500">
                By continuing you agree to Nexara&apos;s{' '}
                <a href="/legal/terms" className="text-[#B8860B] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/legal/privacy" className="text-[#B8860B] hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}

          {/* Step 2: Company + country */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  About your company
                </h2>
                <p className="text-slate-400 text-sm">We&apos;ll personalise your setup based on your location.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Company name</label>
                  <input
                    type="text"
                    placeholder="Acme Corp Ltd"
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    value={form.country}
                    onChange={(e) => update('country', e.target.value)}
                    className={inputClass}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 border border-[#1E3A5F] text-slate-300 font-semibold rounded-lg hover:bg-[#1E3A5F]/30 transition-colors text-sm"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={!form.companyName}
                  onClick={goNext}
                  className="flex-1 py-3 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Card collection placeholder */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Payment details
                </h2>
                <p className="text-slate-400 text-sm">
                  Your card won&apos;t be charged during your trial. We collect details now so your service continues automatically if you choose to upgrade.
                </p>
              </div>

              <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-[#B8860B] text-lg flex-shrink-0 mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-white">14-day free trial</p>
                  <p className="text-xs text-slate-400">
                    Trial ends {getTrialExpiry()}. You&apos;ll receive a reminder 7 days before. Cancel anytime.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Card number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={(e) => update('cardNumber', e.target.value)}
                    className={inputClass}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={form.cardExpiry}
                      onChange={(e) => update('cardExpiry', e.target.value)}
                      className={inputClass}
                      maxLength={7}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={form.cardCvc}
                      onChange={(e) => update('cardCvc', e.target.value)}
                      className={inputClass}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 border border-[#1E3A5F] text-slate-300 font-semibold rounded-lg hover:bg-[#1E3A5F]/30 transition-colors text-sm"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={submitting || !form.cardNumber || !form.cardExpiry || !form.cardCvc}
                  onClick={handleStartTrial}
                  className="flex-1 py-3 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  {submitting ? 'Starting trial...' : 'Start Free Trial \u2192'}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500">
                Payments processed securely. Card data never stored on Nexara servers.
              </p>
            </div>
          )}

          {/* Step 4: Trial ready */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#B8860B]/20 border-2 border-[#B8860B] flex items-center justify-center mx-auto">
                <span className="text-3xl">🎉</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Your trial is ready!
                </h2>
                <p className="text-slate-400 text-sm">
                  Welcome to Nexara IMS, {form.companyName || 'your organisation'}. Your 14-day Professional trial is now active.
                </p>
              </div>

              <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-5 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Plan</span>
                  <span className="text-white font-semibold text-sm">Professional (Trial)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Trial expires</span>
                  <span className="text-[#B8860B] font-semibold text-sm">{getTrialExpiry()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Users included</span>
                  <span className="text-white font-semibold text-sm">Up to 5 during trial</span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="/dashboard"
                  className="block w-full py-3 bg-[#B8860B] hover:bg-[#D4A017] text-white font-semibold rounded-lg transition-colors text-sm text-center"
                >
                  Go to Dashboard &rarr;
                </a>
                <button
                  type="button"
                  className="block w-full py-3 border border-[#1E3A5F] text-slate-300 hover:bg-[#1E3A5F]/30 font-semibold rounded-lg transition-colors text-sm"
                  onClick={() => alert('Invite link copied! Share with your team.')}
                >
                  Invite team members
                </button>
                <a
                  href="/settings/billing/upgrade"
                  className="block text-sm text-[#B8860B] hover:underline"
                >
                  Upgrade anytime — from £31/user/mo annual
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] px-6 py-4 text-center text-xs text-slate-500">
        &copy; 2026 Nexara DMCC. All rights reserved. — Nexara IMS Platform
      </footer>
    </div>
  );
}
