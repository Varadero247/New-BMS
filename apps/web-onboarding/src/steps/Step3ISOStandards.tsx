// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { getRegionConfig } from '@ims/regional-data';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

const ISO_STANDARDS = [
  { standard: 'ISO 9001:2015', name: 'Quality Management', desc: 'Products and services quality management system', icon: '🏆' },
  { standard: 'ISO 14001:2015', name: 'Environmental Management', desc: 'Environmental impact and sustainability', icon: '🌿' },
  { standard: 'ISO 45001:2018', name: 'Occupational Health & Safety', desc: 'Workplace safety and health management', icon: '🦺' },
  { standard: 'ISO 27001:2022', name: 'Information Security', desc: 'Information security management system', icon: '🔒' },
  { standard: 'ISO 37001:2016', name: 'Anti-Bribery', desc: 'Anti-bribery management system', icon: '⚖️' },
  { standard: 'ISO 50001:2018', name: 'Energy Management', desc: 'Energy performance and efficiency', icon: '⚡' },
  { standard: 'ISO 22000:2018', name: 'Food Safety', desc: 'Food safety management along the supply chain', icon: '🍽️' },
  { standard: 'ISO 13485:2016', name: 'Medical Devices', desc: 'Quality management for medical devices', icon: '🏥' },
  { standard: 'ISO 42001:2023', name: 'AI Management', desc: 'Artificial intelligence management system', icon: '🤖' },
];

export function Step3ISOStandards({ onNext, onBack }: Step3Props) {
  const { selectedISOs, toggleISO, primaryCountry } = useOnboarding();
  const primaryConfig = getRegionConfig(primaryCountry);

  const getAdoptionStatus = (std: string) => {
    return primaryConfig?.isoContext.adoptedStandards.find((s) => s.standard === std);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          ISO Standards
        </h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          Select the ISO management system standards that apply to your organisation.
          {primaryConfig && ` Adoption status shown for ${primaryConfig.countryName}.`}
        </p>
      </div>

      <div className="space-y-2">
        {ISO_STANDARDS.map(({ standard, name, desc, icon }) => {
          const selected = selectedISOs.includes(standard);
          const adoption = getAdoptionStatus(standard);
          return (
            <button
              key={standard}
              type="button"
              onClick={() => toggleISO(standard)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                selected
                  ? 'border-[#B8860B] bg-[#B8860B]/5 dark:bg-[#B8860B]/10'
                  : 'border-gray-200 dark:border-[#1E3A5F] hover:border-[#B8860B]/40'
              }`}
            >
              {/* Checkbox */}
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                selected ? 'bg-[#B8860B] border-[#B8860B]' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selected && <span className="text-white text-xs font-bold">✓</span>}
              </div>

              {/* Icon */}
              <span className="text-2xl flex-shrink-0">{icon}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${selected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                    {name}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{standard}</span>
                  {adoption && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      adoption.adoptionStatus === 'ADOPTED' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {adoption.localStandard ?? adoption.adoptionStatus}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
                {adoption?.mandatoryForSectors && adoption.mandatoryForSectors.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    Mandatory for: {adoption.mandatoryForSectors.join(', ')}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 dark:text-slate-500 text-center">
        {selectedISOs.length} standard{selectedISOs.length !== 1 ? 's' : ''} selected
      </p>

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
          disabled={selectedISOs.length === 0}
          className="flex-1 py-3 px-6 bg-[#B8860B] hover:bg-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Review &rarr;
        </button>
      </div>
    </div>
  );
}
