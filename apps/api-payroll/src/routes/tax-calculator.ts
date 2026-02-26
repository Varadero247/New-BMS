// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Multi-country tax calculation helpers
 * Provides tax computation for 7 jurisdictions: UK, US, AU, CA, UAE, DE, NL
 */

export interface TaxBreakdown {
  grossPay: number;
  taxableIncome: number;
  incomeTax: number;
  socialContributions: number;
  netPay: number;
  breakdown: Array<{ description: string; amount: number }>;
}

// ---------------------------------------------------------------------------
// UK Tax Calculation
// ---------------------------------------------------------------------------

const UK_PERSONAL_ALLOWANCE = 12570;
const UK_PA_TAPER_THRESHOLD = 100000;

const UK_BANDS = [
  { name: 'Basic', rate: 0.2, from: 0, to: 37700 },
  { name: 'Higher', rate: 0.4, from: 37700, to: 125140 },
  { name: 'Additional', rate: 0.45, from: 125140, to: Infinity },
];

const SCOTTISH_BANDS = [
  { name: 'Starter', rate: 0.19, from: 0, to: 2162 },
  { name: 'Basic', rate: 0.2, from: 2162, to: 13118 },
  { name: 'Intermediate', rate: 0.21, from: 13118, to: 31092 },
  { name: 'Higher', rate: 0.42, from: 31092, to: 125140 },
  { name: 'Top', rate: 0.47, from: 125140, to: Infinity },
];

const UK_NI_EMPLOYEE_RATE = 0.08;
const UK_NI_THRESHOLD = 12570;
const UK_NI_UPPER_LIMIT = 50270;
const UK_NI_UPPER_RATE = 0.02;

function calculateBandedTax(
  taxableIncome: number,
  bands: Array<{ name: string; rate: number; from: number; to: number }>
): { total: number; breakdown: Array<{ description: string; amount: number }> } {
  let remaining = taxableIncome;
  let total = 0;
  const breakdown: Array<{ description: string; amount: number }> = [];

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandWidth = band.to === Infinity ? remaining : band.to - band.from;
    const taxableInBand = Math.min(remaining, bandWidth);
    const tax = taxableInBand * band.rate;
    total += tax;
    if (taxableInBand > 0) {
      breakdown.push({
        description: `${band.name} rate (${(band.rate * 100).toFixed(0)}%)`,
        amount: Math.round(tax * 100) / 100,
      });
    }
    remaining -= taxableInBand;
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

function getUKPersonalAllowance(grossAnnual: number): number {
  if (grossAnnual <= UK_PA_TAPER_THRESHOLD) return UK_PERSONAL_ALLOWANCE;
  const reduction = Math.floor((grossAnnual - UK_PA_TAPER_THRESHOLD) / 2);
  return Math.max(0, UK_PERSONAL_ALLOWANCE - reduction);
}

function calculateUKNI(grossAnnual: number): {
  total: number;
  breakdown: Array<{ description: string; amount: number }>;
} {
  const breakdown: Array<{ description: string; amount: number }> = [];
  let total = 0;

  if (grossAnnual > UK_NI_THRESHOLD) {
    const mainNI = Math.min(grossAnnual, UK_NI_UPPER_LIMIT) - UK_NI_THRESHOLD;
    const mainAmount = mainNI * UK_NI_EMPLOYEE_RATE;
    total += mainAmount;
    breakdown.push({
      description: 'NI (8% main rate)',
      amount: Math.round(mainAmount * 100) / 100,
    });

    if (grossAnnual > UK_NI_UPPER_LIMIT) {
      const upperNI = (grossAnnual - UK_NI_UPPER_LIMIT) * UK_NI_UPPER_RATE;
      total += upperNI;
      breakdown.push({
        description: 'NI (2% upper rate)',
        amount: Math.round(upperNI * 100) / 100,
      });
    }
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

export function calculateUKTax(grossAnnual: number, isScottish: boolean = false): TaxBreakdown {
  const personalAllowance = getUKPersonalAllowance(grossAnnual);
  const taxableIncome = Math.max(0, grossAnnual - personalAllowance);
  const bands = isScottish ? SCOTTISH_BANDS : UK_BANDS;

  const taxResult = calculateBandedTax(taxableIncome, bands);
  const niResult = calculateUKNI(grossAnnual);

  const incomeTax = taxResult.total;
  const socialContributions = niResult.total;
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown: [...taxResult.breakdown, ...niResult.breakdown],
  };
}

// ---------------------------------------------------------------------------
// US Federal Tax Calculation
// ---------------------------------------------------------------------------

const US_FEDERAL_BRACKETS = [
  { rate: 0.1, from: 0, to: 11600 },
  { rate: 0.12, from: 11600, to: 47150 },
  { rate: 0.22, from: 47150, to: 100525 },
  { rate: 0.24, from: 100525, to: 191950 },
  { rate: 0.32, from: 191950, to: 243725 },
  { rate: 0.35, from: 243725, to: 609350 },
  { rate: 0.37, from: 609350, to: Infinity },
];

const US_SS_RATE = 0.062;
const US_SS_WAGE_BASE = 168600;
const US_MEDICARE_RATE = 0.0145;
const US_ADDITIONAL_MEDICARE_RATE = 0.009;
const US_ADDITIONAL_MEDICARE_THRESHOLD = 200000;

export function calculateUSFederalTax(grossAnnual: number): TaxBreakdown {
  const taxableIncome = grossAnnual; // simplified: no standard deduction in this calculator

  // Federal income tax
  let remaining = taxableIncome;
  let incomeTax = 0;
  const breakdown: Array<{ description: string; amount: number }> = [];

  for (const bracket of US_FEDERAL_BRACKETS) {
    if (remaining <= 0) break;
    const bracketWidth = bracket.to === Infinity ? remaining : bracket.to - bracket.from;
    const taxableInBracket = Math.min(remaining, bracketWidth);
    const tax = taxableInBracket * bracket.rate;
    incomeTax += tax;
    if (taxableInBracket > 0) {
      breakdown.push({
        description: `Federal ${(bracket.rate * 100).toFixed(0)}% bracket`,
        amount: Math.round(tax * 100) / 100,
      });
    }
    remaining -= taxableInBracket;
  }
  incomeTax = Math.round(incomeTax * 100) / 100;

  // FICA
  let socialContributions = 0;

  // Social Security
  const ssWages = Math.min(grossAnnual, US_SS_WAGE_BASE);
  const ssTax = Math.round(ssWages * US_SS_RATE * 100) / 100;
  socialContributions += ssTax;
  breakdown.push({ description: 'Social Security (6.2%)', amount: ssTax });

  // Medicare
  const medicareTax = Math.round(grossAnnual * US_MEDICARE_RATE * 100) / 100;
  socialContributions += medicareTax;
  breakdown.push({ description: 'Medicare (1.45%)', amount: medicareTax });

  // Additional Medicare
  if (grossAnnual > US_ADDITIONAL_MEDICARE_THRESHOLD) {
    const additionalMedicare =
      Math.round(
        (grossAnnual - US_ADDITIONAL_MEDICARE_THRESHOLD) * US_ADDITIONAL_MEDICARE_RATE * 100
      ) / 100;
    socialContributions += additionalMedicare;
    breakdown.push({ description: 'Additional Medicare (0.9%)', amount: additionalMedicare });
  }

  socialContributions = Math.round(socialContributions * 100) / 100;
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Australia Tax Calculation
// ---------------------------------------------------------------------------

const _AU_TAX_FREE_THRESHOLD = 18200;

const AU_BANDS = [
  { name: 'Nil', rate: 0, from: 0, to: 18200 },
  { name: '19c', rate: 0.19, from: 18200, to: 45000 },
  { name: '32.5c', rate: 0.325, from: 45000, to: 120000 },
  { name: '37c', rate: 0.37, from: 120000, to: 180000 },
  { name: '45c', rate: 0.45, from: 180000, to: Infinity },
];

const AU_SUPER_RATE = 0.115;
const AU_MEDICARE_LEVY_RATE = 0.02;

export function calculateAUTax(grossAnnual: number): TaxBreakdown {
  const taxableIncome = grossAnnual;
  const breakdown: Array<{ description: string; amount: number }> = [];

  // Income tax using marginal bands
  let incomeTax = 0;
  for (const band of AU_BANDS) {
    if (grossAnnual <= band.from) break;
    const taxableInBand =
      Math.min(grossAnnual, band.to === Infinity ? grossAnnual : band.to) - band.from;
    if (taxableInBand > 0 && band.rate > 0) {
      const tax = taxableInBand * band.rate;
      incomeTax += tax;
      breakdown.push({
        description: `${band.name} band (${(band.rate * 100).toFixed(1)}%)`,
        amount: Math.round(tax * 100) / 100,
      });
    }
  }
  incomeTax = Math.round(incomeTax * 100) / 100;

  // Medicare levy
  const medicareLevy = Math.round(grossAnnual * AU_MEDICARE_LEVY_RATE * 100) / 100;
  breakdown.push({ description: 'Medicare Levy (2%)', amount: medicareLevy });

  // Superannuation (employer-paid, shown for info)
  const superannuation = Math.round(grossAnnual * AU_SUPER_RATE * 100) / 100;
  breakdown.push({ description: 'Superannuation (11.5% employer)', amount: superannuation });

  const socialContributions = medicareLevy; // super is employer-paid, not deducted
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Canada Federal Tax Calculation
// ---------------------------------------------------------------------------

const CA_BASIC_PERSONAL_AMOUNT = 15705;

const CA_FEDERAL_BANDS = [
  { name: '15%', rate: 0.15, from: 0, to: 55867 },
  { name: '20.5%', rate: 0.205, from: 55867, to: 111733 },
  { name: '26%', rate: 0.26, from: 111733, to: 154906 },
  { name: '29%', rate: 0.29, from: 154906, to: 220000 },
  { name: '33%', rate: 0.33, from: 220000, to: Infinity },
];

const CA_CPP_RATE = 0.0595;
const CA_CPP_YMPE = 68500;
const CA_CPP_BASIC_EXEMPTION = 3500;
const CA_EI_EMPLOYEE_RATE = 0.0166;
const CA_EI_MIE = 63200;

export function calculateCAFederalTax(grossAnnual: number): TaxBreakdown {
  const taxableIncome = Math.max(0, grossAnnual - CA_BASIC_PERSONAL_AMOUNT);
  const breakdown: Array<{ description: string; amount: number }> = [];

  // Federal income tax
  const taxResult = calculateBandedTax(
    taxableIncome,
    CA_FEDERAL_BANDS.map((b) => ({ ...b, to: b.to === Infinity ? Infinity : b.to }))
  );
  const incomeTax = taxResult.total;
  breakdown.push(...taxResult.breakdown);

  // CPP
  const cppPensionableEarnings = Math.min(grossAnnual, CA_CPP_YMPE) - CA_CPP_BASIC_EXEMPTION;
  const cpp =
    cppPensionableEarnings > 0 ? Math.round(cppPensionableEarnings * CA_CPP_RATE * 100) / 100 : 0;
  breakdown.push({ description: 'CPP (5.95%)', amount: cpp });

  // EI
  const eiInsurableEarnings = Math.min(grossAnnual, CA_EI_MIE);
  const ei = Math.round(eiInsurableEarnings * CA_EI_EMPLOYEE_RATE * 100) / 100;
  breakdown.push({ description: 'EI (1.66%)', amount: ei });

  const socialContributions = Math.round((cpp + ei) * 100) / 100;
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// UAE Gratuity Calculation
// ---------------------------------------------------------------------------

export function calculateUAEGratuity(monthlySalary: number, yearsOfService: number): number {
  if (yearsOfService <= 0) return 0;

  const dailySalary = monthlySalary / 30;

  if (yearsOfService <= 5) {
    // 21 days per year for first 5 years
    return Math.round(dailySalary * 21 * yearsOfService * 100) / 100;
  }

  // 21 days per year for first 5 years + 30 days per year after
  const first5 = dailySalary * 21 * 5;
  const remaining = dailySalary * 30 * (yearsOfService - 5);
  return Math.round((first5 + remaining) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Germany Tax Calculation
// ---------------------------------------------------------------------------

const DE_SOLIDARITY_SURCHARGE = 0.055;

// German social insurance rates (split equally between employee and employer)
const DE_PENSION_RATE = 0.186;
const DE_HEALTH_RATE = 0.146;
const DE_HEALTH_ADDITIONAL = 0.017;
const DE_UNEMPLOYMENT_RATE = 0.026;
const DE_NURSING_CARE_RATE = 0.034;

// Simplified German progressive tax formula (2024 zones)
// Zone 1: 0-11604 = 0%
// Zone 2: 11605-17005 = progressive 14-24%
// Zone 3: 17006-66760 = progressive 24-42%
// Zone 4: 66761-277825 = 42%
// Zone 5: 277826+ = 45%
function calculateGermanIncomeTax(grossAnnual: number): number {
  if (grossAnnual <= 11604) return 0;

  let tax = 0;
  if (grossAnnual <= 17005) {
    const y = (grossAnnual - 11604) / 10000;
    tax = (922.98 * y + 1400) * y;
  } else if (grossAnnual <= 66760) {
    const z = (grossAnnual - 17005) / 10000;
    tax = (181.19 * z + 2397) * z + 1025.38;
  } else if (grossAnnual <= 277825) {
    tax = 0.42 * grossAnnual - 10602.13;
  } else {
    tax = 0.45 * grossAnnual - 18936.88;
  }

  return Math.round(tax * 100) / 100;
}

export function calculateDETax(grossAnnual: number): TaxBreakdown {
  const taxableIncome = grossAnnual;
  const breakdown: Array<{ description: string; amount: number }> = [];

  // Income tax
  const baseTax = calculateGermanIncomeTax(grossAnnual);
  breakdown.push({ description: 'Income tax (progressive)', amount: baseTax });

  // Solidarity surcharge (only if tax > 18130)
  let solidaritySurcharge = 0;
  if (baseTax > 18130) {
    solidaritySurcharge = Math.round(baseTax * DE_SOLIDARITY_SURCHARGE * 100) / 100;
    breakdown.push({ description: 'Solidarity surcharge (5.5%)', amount: solidaritySurcharge });
  }

  const incomeTax = Math.round((baseTax + solidaritySurcharge) * 100) / 100;

  // Social insurance (employee half)
  const pensionEmployee = Math.round(((grossAnnual * DE_PENSION_RATE) / 2) * 100) / 100;
  const healthEmployee =
    Math.round(((grossAnnual * (DE_HEALTH_RATE + DE_HEALTH_ADDITIONAL)) / 2) * 100) / 100;
  const unemploymentEmployee = Math.round(((grossAnnual * DE_UNEMPLOYMENT_RATE) / 2) * 100) / 100;
  const nursingCareEmployee = Math.round(((grossAnnual * DE_NURSING_CARE_RATE) / 2) * 100) / 100;

  breakdown.push({ description: 'Pension insurance (9.3% employee)', amount: pensionEmployee });
  breakdown.push({ description: 'Health insurance (8.15% employee)', amount: healthEmployee });
  breakdown.push({
    description: 'Unemployment insurance (1.3% employee)',
    amount: unemploymentEmployee,
  });
  breakdown.push({
    description: 'Nursing care insurance (1.7% employee)',
    amount: nursingCareEmployee,
  });

  const socialContributions =
    Math.round(
      (pensionEmployee + healthEmployee + unemploymentEmployee + nursingCareEmployee) * 100
    ) / 100;
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Netherlands Tax Calculation
// ---------------------------------------------------------------------------

const NL_BANDS = [
  { name: 'Band 1', rate: 0.3693, from: 0, to: 73031 },
  { name: 'Band 2', rate: 0.495, from: 73031, to: Infinity },
];

const NL_ZVW_RATE = 0.0657; // employer-paid health insurance

export function calculateNLTax(grossAnnual: number): TaxBreakdown {
  const taxableIncome = grossAnnual;
  const breakdown: Array<{ description: string; amount: number }> = [];

  // Income tax
  const taxResult = calculateBandedTax(taxableIncome, NL_BANDS);
  const incomeTax = taxResult.total;
  breakdown.push(...taxResult.breakdown);

  // ZVW (employer-paid, shown for info but not deducted from net)
  const zvw = Math.round(grossAnnual * NL_ZVW_RATE * 100) / 100;
  breakdown.push({ description: 'ZVW health insurance (6.57% employer)', amount: zvw });

  const socialContributions = 0; // employer-paid contributions don't reduce employee net
  const netPay = Math.round((grossAnnual - incomeTax - socialContributions) * 100) / 100;

  return {
    grossPay: grossAnnual,
    taxableIncome,
    incomeTax,
    socialContributions,
    netPay,
    breakdown,
  };
}
