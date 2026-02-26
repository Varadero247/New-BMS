// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { TaxBracket, AUTaxResult } from './types';

// Australian 2024/25 resident tax brackets
const AU_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18201, max: 45000, rate: 0.16 },
  { min: 45001, max: 135000, rate: 0.3 },
  { min: 135001, max: 190000, rate: 0.37 },
  { min: 190001, max: null, rate: 0.45 },
];

const SUPER_RATE = 0.115; // 11.5% superannuation guarantee
const MEDICARE_LEVY_RATE = 0.02; // 2% Medicare levy

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
 * Calculate Australian payroll including income tax, superannuation and Medicare levy.
 * @param grossPay - Gross pay amount
 * @param period - Pay period: 'annual' | 'monthly' | 'weekly' | 'fortnightly'
 */
export function calculateAUPayroll(grossPay: number, period: string = 'annual'): AUTaxResult {
  const annualGross = annualize(grossPay, period);

  // Calculate income tax using brackets
  let annualTax = 0;
  for (const bracket of AU_TAX_BRACKETS) {
    const max = bracket.max ?? Infinity;
    if (annualGross <= bracket.min) break;
    const taxableInBracket = Math.min(annualGross, max) - bracket.min;
    annualTax += taxableInBracket * bracket.rate;
  }

  // Superannuation (paid on top of gross, not deducted)
  const annualSuper = annualGross * SUPER_RATE;

  // Medicare levy
  const annualMedicare = annualGross * MEDICARE_LEVY_RATE;

  const annualNet = annualGross - annualTax - annualMedicare;

  return {
    grossPay,
    incomeTax: Math.round(deannualize(annualTax, period) * 100) / 100,
    superannuation: Math.round(deannualize(annualSuper, period) * 100) / 100,
    medicareLevy: Math.round(deannualize(annualMedicare, period) * 100) / 100,
    netPay: Math.round(deannualize(annualNet, period) * 100) / 100,
  };
}
