import { TaxBracket, CAFederalTaxResult } from './types';

// Canadian 2024 Federal tax brackets
const CA_FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55868, max: 111733, rate: 0.205 },
  { min: 111734, max: 154906, rate: 0.26 },
  { min: 154907, max: 220000, rate: 0.29 },
  { min: 220001, max: null, rate: 0.33 },
];

// Basic Personal Amount (BPA) for 2024
const BPA = 15705;

// CPP (Canada Pension Plan) 2024
const CPP_RATE = 0.0595;
const CPP_EXEMPTION = 3500;
const CPP_MAX_PENSIONABLE = 68500;

// EI (Employment Insurance) 2024
const EI_RATE = 0.0166;
const EI_MAX_INSURABLE = 63200;

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
 * Calculate Canadian Federal income tax, CPP, and EI.
 * @param grossPay - Gross pay amount
 * @param period - Pay period
 */
export function calculateCAFederal(
  grossPay: number,
  period: string = 'annual'
): CAFederalTaxResult {
  const annualGross = annualize(grossPay, period);

  // Calculate federal tax on income above BPA
  const taxableIncome = Math.max(0, annualGross - BPA);
  let annualFederalTax = 0;
  for (const bracket of CA_FEDERAL_BRACKETS) {
    const max = bracket.max ?? Infinity;
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, max) - bracket.min;
    annualFederalTax += taxableInBracket * bracket.rate;
  }

  // CPP contributions
  const cppPensionableEarnings = Math.min(annualGross, CPP_MAX_PENSIONABLE);
  const cppContributable = Math.max(0, cppPensionableEarnings - CPP_EXEMPTION);
  const annualCPP = cppContributable * CPP_RATE;

  // EI premiums
  const eiInsurableEarnings = Math.min(annualGross, EI_MAX_INSURABLE);
  const annualEI = eiInsurableEarnings * EI_RATE;

  const annualNet = annualGross - annualFederalTax - annualCPP - annualEI;

  return {
    grossPay,
    federalTax: Math.round(deannualize(annualFederalTax, period) * 100) / 100,
    cpp: Math.round(deannualize(annualCPP, period) * 100) / 100,
    ei: Math.round(deannualize(annualEI, period) * 100) / 100,
    netPay: Math.round(deannualize(annualNet, period) * 100) / 100,
  };
}
