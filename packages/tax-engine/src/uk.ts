import { TaxBracket, TaxBreakdown, UKTaxResult } from './types';

// UK 2025/26 tax brackets
const UK_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12571, max: 50270, rate: 0.20 },
  { min: 50271, max: 125140, rate: 0.40 },
  { min: 125141, max: null, rate: 0.45 },
];

// UK NI brackets (Class 1 Employee)
const UK_NI_BRACKETS: TaxBracket[] = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12571, max: 50270, rate: 0.08 },
  { min: 50271, max: null, rate: 0.02 },
];

function annualize(pay: number, period: string): number {
  switch (period) {
    case 'monthly': return pay * 12;
    case 'weekly': return pay * 52;
    case 'fortnightly': return pay * 26;
    default: return pay;
  }
}

function deannualize(amount: number, period: string): number {
  switch (period) {
    case 'monthly': return amount / 12;
    case 'weekly': return amount / 52;
    case 'fortnightly': return amount / 26;
    default: return amount;
  }
}

function calculateBracketTax(annualIncome: number, brackets: TaxBracket[]): { total: number; breakdown: TaxBreakdown[] } {
  let total = 0;
  const breakdown: TaxBreakdown[] = [];

  for (const bracket of brackets) {
    const max = bracket.max ?? Infinity;
    if (annualIncome <= bracket.min) break;

    const taxableInBracket = Math.min(annualIncome, max) - bracket.min;
    const tax = taxableInBracket * bracket.rate;
    total += tax;

    if (taxableInBracket > 0) {
      breakdown.push({
        bracket: `${bracket.min}-${bracket.max ?? '∞'}`,
        taxableAmount: taxableInBracket,
        rate: bracket.rate,
        tax,
      });
    }
  }

  return { total, breakdown };
}

/**
 * Calculate UK income tax and National Insurance.
 * @param grossPay - Gross pay amount
 * @param _taxCode - Tax code (currently unused, uses standard personal allowance)
 * @param period - Pay period: 'annual' | 'monthly' | 'weekly' | 'fortnightly'
 */
export function calculateUKIncomeTax(
  grossPay: number,
  _taxCode: string = '1257L',
  period: string = 'annual',
): UKTaxResult {
  const annualGross = annualize(grossPay, period);

  const taxResult = calculateBracketTax(annualGross, UK_TAX_BRACKETS);
  const niResult = calculateBracketTax(annualGross, UK_NI_BRACKETS);

  const annualTax = taxResult.total;
  const annualNI = niResult.total;
  const annualNet = annualGross - annualTax - annualNI;

  return {
    grossPay,
    incomeTax: Math.round(deannualize(annualTax, period) * 100) / 100,
    nationalInsurance: Math.round(deannualize(annualNI, period) * 100) / 100,
    netPay: Math.round(deannualize(annualNet, period) * 100) / 100,
    breakdown: taxResult.breakdown,
  };
}
