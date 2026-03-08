// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Step1Welcome } from '@/steps/Step1Welcome';
import { Step2RegionSelection } from '@/steps/Step2RegionSelection';
import { Step3ISOStandards } from '@/steps/Step3ISOStandards';
import { Step4ReviewConfirm } from '@/steps/Step4ReviewConfirm';

const STEPS = [
  { label: 'Welcome', num: 1 },
  { label: 'Region', num: 2 },
  { label: 'Standards', num: 3 },
  { label: 'Confirm', num: 4 },
];

interface OnboardingShellProps {
  currentStep: number;
}

export function OnboardingShell({ currentStep }: OnboardingShellProps) {
  const router = useRouter();

  const goNext = () => router.push(`/step/${currentStep + 1}`);
  const goBack = () => router.push(`/step/${currentStep - 1}`);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#091628] border-b border-[#1E3A5F] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#B8860B] flex items-center justify-center font-bold text-sm text-white">N</div>
          <span className="font-semibold text-white text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nexara IMS — Organisation Setup</span>
        </div>
        <div className="text-xs text-slate-400">Step {currentStep} of {STEPS.length}</div>
      </header>

      {/* Progress bar */}
      <div className="bg-[#091628] px-6 pb-4">
        <div className="flex items-center gap-0 max-w-2xl mx-auto">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  s.num < currentStep ? 'bg-[#B8860B] text-white' :
                  s.num === currentStep ? 'bg-white text-[#0B1E38]' :
                  'bg-[#1E3A5F] text-slate-400'
                }`}>
                  {s.num < currentStep ? '✓' : s.num}
                </div>
                <span className={`text-xs mt-1 ${s.num === currentStep ? 'text-white font-medium' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${s.num < currentStep ? 'bg-[#B8860B]' : 'bg-[#1E3A5F]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        {currentStep === 1 && <Step1Welcome onNext={goNext} />}
        {currentStep === 2 && <Step2RegionSelection onNext={goNext} onBack={goBack} />}
        {currentStep === 3 && <Step3ISOStandards onNext={goNext} onBack={goBack} />}
        {currentStep === 4 && <Step4ReviewConfirm onBack={goBack} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#1E3A5F] px-6 py-4 text-center text-xs text-gray-400">
        &copy; 2026 Nexara DMCC. All rights reserved. — Nexara IMS Platform
      </footer>
    </div>
  );
}
