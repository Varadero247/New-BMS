// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React, { createContext, useContext, useState } from 'react';

export interface OnboardingState {
  orgName: string;
  primaryCountry: string;
  operatingCountries: string[];
  selectedISOs: string[];
  step: number;
}

interface OnboardingContextValue extends OnboardingState {
  setOrgName: (name: string) => void;
  setPrimaryCountry: (code: string) => void;
  setOperatingCountries: (codes: string[]) => void;
  toggleISO: (standard: string) => void;
  setStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [orgName, setOrgName] = useState('');
  const [primaryCountry, setPrimaryCountry] = useState('SG');
  const [operatingCountries, setOperatingCountries] = useState<string[]>([]);
  const [selectedISOs, setSelectedISOs] = useState<string[]>(['ISO 9001:2015']);
  const [step, setStep] = useState(1);

  const toggleISO = (standard: string) => {
    setSelectedISOs((prev) =>
      prev.includes(standard) ? prev.filter((s) => s !== standard) : [...prev, standard]
    );
  };

  return (
    <OnboardingContext.Provider value={{
      orgName, primaryCountry, operatingCountries, selectedISOs, step,
      setOrgName, setPrimaryCountry, setOperatingCountries, toggleISO, setStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
