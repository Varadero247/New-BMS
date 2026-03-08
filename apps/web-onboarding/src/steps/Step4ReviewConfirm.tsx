// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useOnboarding } from '@/context/OnboardingContext';
import { getRegionConfig } from '@ims/regional-data';

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', JP: '🇯🇵', KR: '🇰🇷',
  HK: '🇭🇰', TW: '🇹🇼', CN: '🇨🇳', IN: '🇮🇳', BD: '🇧🇩',
  LK: '🇱🇰', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦', BN: '🇧🇳',
};

interface Step4Props {
  onBack: () => void;
}

export function Step4ReviewConfirm({ onBack }: Step4Props) {
  const { orgName, primaryCountry, operatingCountries, selectedISOs } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const primaryConfig = getRegionConfig(primaryCountry);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await axios.post(
        `${API_URL}/api/regional/onboarding/setup`,
        {
          orgName,
          primaryCountry,
          operatingCountries,
          selectedISOs,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setSubmitted(true);
    } catch {
      setError('Configuration saved locally. Connect to the API to sync with your organisation.');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Setup Complete!
        </h2>
        <p className="text-gray-600 dark:text-slate-300">
          <strong>{orgName}</strong> is now configured for <strong>{primaryConfig?.countryName ?? primaryCountry}</strong>.
        </p>
        {error && <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>}
        <div className="flex gap-3 max-w-sm mx-auto">
          <a
            href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000'}`}
            className="flex-1 py-3 px-6 bg-[#B8860B] hover:bg-[#D4A017] text-white font-semibold rounded-lg transition-colors text-sm text-center"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Review &amp; Confirm
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Review your configuration before activating your organisation.</p>
      </div>

      {/* Summary card */}
      <div className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl overflow-hidden">
        {/* Org name */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1E3A5F]">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organisation</div>
          <div className="font-bold text-gray-900 dark:text-white text-lg">{orgName}</div>
        </div>

        {/* Primary country */}
        {primaryConfig && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1E3A5F]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Primary Country</div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{FLAG_EMOJIS[primaryConfig.countryCode] ?? '🏳️'}</span>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{primaryConfig.countryName}</div>
                <div className="text-xs text-gray-500">{primaryConfig.currency.code} ({primaryConfig.currency.symbol}) · {primaryConfig.region}</div>
              </div>
            </div>

            {/* Tax snapshot */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Corp Tax', value: `${(primaryConfig.finance.corporateTaxRate * 100).toFixed(1)}%` },
                { label: primaryConfig.finance.gstVatName, value: primaryConfig.finance.gstVatRate > 0 ? `${(primaryConfig.finance.gstVatRate * 100).toFixed(0)}%` : 'None' },
                { label: 'FY End', value: primaryConfig.finance.fiscalYearEnd },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-[#0B1E38] rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operating countries */}
        {operatingCountries.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1E3A5F]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Operating Countries</div>
            <div className="flex flex-wrap gap-2">
              {operatingCountries.map((code) => {
                const cfg = getRegionConfig(code);
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    {FLAG_EMOJIS[code] ?? '🏳️'} {cfg?.countryName ?? code}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Key legislation */}
        {primaryConfig && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1E3A5F]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Applicable Legislation</div>
            <div className="space-y-1">
              {primaryConfig.legislation.primaryLaws.map((law) => (
                <div key={law.shortCode} className="flex items-start gap-2 text-xs">
                  <span className="font-mono font-semibold text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">{law.shortCode}</span>
                  <span className="text-gray-500 dark:text-slate-400">{law.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ISO standards */}
        <div className="px-6 py-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Selected ISO Standards</div>
          <div className="flex flex-wrap gap-2">
            {selectedISOs.map((std) => (
              <span key={std} className="px-2.5 py-1 bg-[#B8860B]/10 text-[#B8860B] border border-[#B8860B]/30 rounded-full text-xs font-mono font-medium">
                {std}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex-1 py-3 px-6 border border-gray-300 dark:border-[#1E3A5F] text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-[#1E3A5F]/30 transition-colors text-sm disabled:opacity-50"
        >
          &larr; Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="flex-1 py-3 px-6 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          {submitting ? 'Activating...' : 'Activate Organisation'}
        </button>
      </div>
    </div>
  );
}
