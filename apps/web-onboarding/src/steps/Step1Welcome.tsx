// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';

interface Step1WelcomeProps {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Step1WelcomeProps) {
  const { orgName, setOrgName } = useOnboarding();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgName.trim()) onNext();
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#B8860B]/10 text-[#D4A017] text-xs font-semibold px-3 py-1 rounded-full border border-[#B8860B]/30 uppercase tracking-wide">
          Organisation Setup
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Welcome to Nexara IMS
        </h1>
        <p className="text-gray-600 dark:text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
          Let&apos;s configure your organisation. This wizard will guide you through region selection,
          compliance legislation, and ISO standards that apply to your business.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🌏', title: 'Regional Config', desc: 'Tax rates, legislation, and local standards' },
          { icon: '📋', title: 'Compliance Ready', desc: 'Pre-mapped legislation to ISO frameworks' },
          { icon: '⚡', title: 'Quick Setup', desc: 'Get running in minutes, not days' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{desc}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Organisation Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g. Acme Pte Ltd"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-[#1E3A5F] rounded-lg bg-white dark:bg-[#0B1E38] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8860B] text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">This will appear on all compliance reports and certificates.</p>
        </div>

        <button
          type="submit"
          disabled={!orgName.trim()}
          className="w-full py-3 px-6 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Get Started &rarr;
        </button>
      </form>
    </div>
  );
}
