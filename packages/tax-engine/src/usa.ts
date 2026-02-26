// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { TaxBracket, USFederalTaxResult } from './types';

// US 2024 Federal tax brackets (Single)
const US_SINGLE_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11600, rate: 0.1 },
  { min: 11601, max: 47150, rate: 0.12 },
  { min: 47151, max: 100525, rate: 0.22 },
  { min: 100526, max: 191950, rate: 0.24 },
  { min: 191951, max: 243725, rate: 0.32 },
  { min: 243726, max: 609350, rate: 0.35 },
  { min: 609351, max: null, rate: 0.37 },
];

// US 2024 Federal tax brackets (Married Filing Jointly)
const US_MARRIED_BRACKETS: TaxBracket[] = [
  { min: 0, max: 23200, rate: 0.1 },
  { min: 23201, max: 94300, rate: 0.12 },
  { min: 94301, max: 201050, rate: 0.22 },
  { min: 201051, max: 383900, rate: 0.24 },
  { min: 383901, max: 487450, rate: 0.32 },
  { min: 487451, max: 731200, rate: 0.35 },
  { min: 731201, max: null, rate: 0.37 },
];

const FICA_SS_RATE = 0.062;
const FICA_SS_CAP = 168600; // 2024 wage base
const FICA_MEDICARE_RATE = 0.0145;

function annualize(pay: number, period: string): number {
  switch (period) {
    case 'monthly':
      return pay * 12;
    case 'weekly':
      return pay * 52;
    case 'fortnightly':
      return pay * 26;
    default:
      return pay;
  }
}

function deannualize(amount: number, period: string): number {
  switch (period) {
    case 'monthly':
      return amount / 12;
    case 'weekly':
      return amount / 52;
    case 'fortnightly':
      return amount / 26;
    default:
      return amount;
  }
}

/**
 * Calculate US Federal income tax plus FICA.
 * @param grossPay - Gross pay amount
 * @param filingStatus - 'single' | 'married' | 'head_of_household'
 * @param period - Pay period
 */
export function calculateUSFederal(
  grossPay: number,
  filingStatus: string = 'single',
  period: string = 'annual'
): USFederalTaxResult {
  const annualGross = annualize(grossPay, period);

  const brackets = filingStatus === 'married' ? US_MARRIED_BRACKETS : US_SINGLE_BRACKETS;

  // Calculate federal income tax
  let annualFederalTax = 0;
  for (const bracket of brackets) {
    const max = bracket.max ?? Infinity;
    if (annualGross <= bracket.min) break;
    const taxableInBracket = Math.min(annualGross, max) - bracket.min;
    annualFederalTax += taxableInBracket * bracket.rate;
  }

  // Social Security (capped)
  const ssWages = Math.min(annualGross, FICA_SS_CAP);
  const annualSS = ssWages * FICA_SS_RATE;

  // Medicare (uncapped)
  const annualMedicare = annualGross * FICA_MEDICARE_RATE;

  const annualNet = annualGross - annualFederalTax - annualSS - annualMedicare;

  return {
    grossPay,
    federalTax: Math.round(deannualize(annualFederalTax, period) * 100) / 100,
    socialSecurity: Math.round(deannualize(annualSS, period) * 100) / 100,
    medicare: Math.round(deannualize(annualMedicare, period) * 100) / 100,
    netPay: Math.round(deannualize(annualNet, period) * 100) / 100,
  };
}
