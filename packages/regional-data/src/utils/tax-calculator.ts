// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig, TaxBand } from '../types/region-config.types';

export function calculateCorporateTax(income: number, config: RegionConfig): {
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  bands?: { band: TaxBand; taxOnBand: number }[];
} {
  if (config.finance.corporateTaxBands) {
    let remaining = income;
    let totalTax = 0;
    const bands: { band: TaxBand; taxOnBand: number }[] = [];
    for (const band of config.finance.corporateTaxBands) {
      if (remaining <= 0) break;
      const taxableInBand = band.max ? Math.min(remaining, band.max - band.min) : remaining;
      const taxOnBand = taxableInBand * band.rate;
      bands.push({ band, taxOnBand });
      totalTax += taxOnBand;
      remaining -= taxableInBand;
    }
    return { taxableIncome: income, taxAmount: totalTax, effectiveRate: income > 0 ? totalTax / income : 0, bands };
  }
  const taxAmount = income * config.finance.corporateTaxRate;
  return { taxableIncome: income, taxAmount, effectiveRate: config.finance.corporateTaxRate };
}

export function calculateGST(amount: number, config: RegionConfig, inclusive = false): {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  rate: number;
  name: string;
} {
  const rate = config.finance.gstVatRate;
  if (inclusive) {
    const baseAmount = amount / (1 + rate);
    const gstAmount = amount - baseAmount;
    return { baseAmount, gstAmount, totalAmount: amount, rate, name: config.finance.gstVatName };
  }
  const gstAmount = amount * rate;
  return { baseAmount: amount, gstAmount, totalAmount: amount + gstAmount, rate, name: config.finance.gstVatName };
}

export function calculateWithholdingTax(
  amount: number,
  type: 'dividends' | 'interest' | 'royalties' | 'services',
  config: RegionConfig
): { grossAmount: number; withholdingTax: number; netAmount: number; rate: number } {
  const rate = config.finance.witholdingTaxRates[type];
  const withholdingTax = amount * rate;
  return { grossAmount: amount, withholdingTax, netAmount: amount - withholdingTax, rate };
}

export function calculateCPF(grossSalary: number, config: RegionConfig): {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  employeeTakeHome: number;
} | null {
  if (!config.finance.payrollTax) return null;
  const { employeeRate, employerRate, ceiling } = config.finance.payrollTax;
  const cappedSalary = ceiling ? Math.min(grossSalary, ceiling) : grossSalary;
  const employeeContribution = cappedSalary * employeeRate;
  const employerContribution = cappedSalary * employerRate;
  return {
    employeeContribution,
    employerContribution,
    totalContribution: employeeContribution + employerContribution,
    employeeTakeHome: grossSalary - employeeContribution,
  };
}
