// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { allRegionConfigs, getRegionConfig } from '@ims/regional-data';

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', JP: '🇯🇵', KR: '🇰🇷',
  HK: '🇭🇰', TW: '🇹🇼', CN: '🇨🇳', IN: '🇮🇳', BD: '🇧🇩',
  LK: '🇱🇰', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦', BN: '🇧🇳',
};

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2RegionSelection({ onNext, onBack }: Step2Props) {
  const { primaryCountry, setPrimaryCountry, operatingCountries, setOperatingCountries } = useOnboarding();
  const [showISOTable, setShowISOTable] = useState(false);

  const primaryConfig = getRegionConfig(primaryCountry);
  const regions = ['ASEAN', 'ANZ', 'EAST_ASIA', 'SOUTH_ASIA'] as const;

  const toggleOpCountry = (code: string) => {
    setOperatingCountries(
      operatingCountries.includes(code)
        ? operatingCountries.filter((c) => c !== code)
        : [...operatingCountries, code]
    );
  };

  const CATEGORY_COLORS: Record<string, string> = {
    EMPLOYMENT: 'bg-blue-100 text-blue-700',
    HSE: 'bg-yellow-100 text-yellow-700',
    ENVIRONMENT: 'bg-green-100 text-green-700',
    DATA_PRIVACY: 'bg-purple-100 text-purple-700',
    CORPORATE: 'bg-gray-100 text-gray-700',
    ANTI_CORRUPTION: 'bg-red-100 text-red-700',
    FINANCIAL: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-gray-100 text-gray-600',
    INFORMATION_SECURITY: 'bg-indigo-100 text-indigo-700',
    TRADE: 'bg-cyan-100 text-cyan-700',
    FOOD_SAFETY: 'bg-lime-100 text-lime-700',
    MEDICAL: 'bg-pink-100 text-pink-700',
    CONSUMER: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Select Your Region
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Choose your primary country and any additional operating territories.</p>
      </div>

      {/* Primary country selector */}
      <div className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl p-5 space-y-4">
        <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Primary Country</div>
        {regions.map((region) => {
          const regionConfigs = allRegionConfigs.filter((c) => c.region === region);
          return (
            <div key={region}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {region.replace('_', ' ')}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {regionConfigs.map((c) => (
                  <button
                    key={c.countryCode}
                    type="button"
                    onClick={() => setPrimaryCountry(c.countryCode)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                      primaryCountry === c.countryCode
                        ? 'border-[#B8860B] bg-[#B8860B]/10 text-[#B8860B] font-semibold'
                        : 'border-gray-200 dark:border-[#1E3A5F] hover:border-[#B8860B]/50 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl">{FLAG_EMOJIS[c.countryCode] ?? '🏳️'}</span>
                    <span className="text-center leading-tight">{c.countryName}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operating countries multi-select */}
      <div className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl p-5 space-y-3">
        <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Additional Operating Countries <span className="text-gray-400 font-normal">(optional)</span></div>
        <div className="flex flex-wrap gap-2">
          {allRegionConfigs.filter((c) => c.countryCode !== primaryCountry).map((c) => (
            <button
              key={c.countryCode}
              type="button"
              onClick={() => toggleOpCountry(c.countryCode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                operatingCountries.includes(c.countryCode)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-gray-200 dark:border-[#1E3A5F] text-gray-600 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              <span>{FLAG_EMOJIS[c.countryCode] ?? '🏳️'}</span>
              {c.countryCode}
            </button>
          ))}
        </div>
      </div>

      {/* Primary country details */}
      {primaryConfig && (
        <div className="bg-white dark:bg-[#091628] border border-gray-200 dark:border-[#1E3A5F] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{FLAG_EMOJIS[primaryConfig.countryCode] ?? '🏳️'}</span>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">{primaryConfig.countryName}</div>
              <div className="text-xs text-gray-500">{primaryConfig.currency.code} · {primaryConfig.timezone[0]}</div>
            </div>
          </div>

          {/* Tax rates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-[#0B1E38] rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-0.5">Corp Tax</div>
              <div className="font-bold text-gray-900 dark:text-white">{(primaryConfig.finance.corporateTaxRate * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-gray-50 dark:bg-[#0B1E38] rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-0.5">{primaryConfig.finance.gstVatName}</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {primaryConfig.finance.gstVatRate > 0 ? `${(primaryConfig.finance.gstVatRate * 100).toFixed(0)}%` : 'None'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#0B1E38] rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 mb-0.5">FY End</div>
              <div className="font-bold text-gray-900 dark:text-white text-xs">{primaryConfig.finance.fiscalYearEnd}</div>
            </div>
          </div>

          {/* Key legislation */}
          <div>
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">Key Legislation</div>
            <div className="flex flex-wrap gap-2">
              {primaryConfig.legislation.primaryLaws.map((law) => (
                <span
                  key={law.shortCode}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    CATEGORY_COLORS[law.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {law.shortCode}
                </span>
              ))}
            </div>
          </div>

          {/* ISO adoption toggle */}
          <button
            type="button"
            onClick={() => setShowISOTable((s) => !s)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {showISOTable ? 'Hide' : 'Show'} ISO Adoption Status
          </button>

          {showISOTable && (
            <div className="overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#1E3A5F]">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Standard</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Local</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {primaryConfig.isoContext.adoptedStandards.map((iso) => (
                    <tr key={iso.standard} className="border-b border-gray-100 dark:border-[#1E3A5F]/50">
                      <td className="py-2 pr-4 font-mono text-gray-800 dark:text-gray-200">{iso.standard}</td>
                      <td className="py-2 pr-4 text-gray-600 dark:text-gray-400">{iso.localStandard ?? '—'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          iso.adoptionStatus === 'ADOPTED' ? 'bg-green-100 text-green-700' :
                          iso.adoptionStatus === 'MODIFIED' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{iso.adoptionStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
