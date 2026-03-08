// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Tax Comparison Screen — mobile-friendly APAC tax rate calculator
 * Computes tax obligations for a given salary / profit in a target country.
 */

export interface TaxProfile {
  countryCode: string;
  countryName: string;
  corporateTaxRate: number;
  gstVatRate: number;
  gstVatName: string;
  gstRegistrationThreshold: number | null;
  withholdingDividends: number;
  withholdingInterest: number;
  withholdingRoyalties: number;
  hasPayrollTax: boolean;
  payrollTaxName: string | null;
  payrollEmployeeRate: number | null;
  payrollEmployerRate: number | null;
  currencyCode: string;
}

export interface TaxCalculation {
  profit: number;
  corporateTax: number;
  corporateTaxRate: number;
  netProfit: number;
  gstObligated: boolean;
  gstNote: string;
  payrollTax: PayrollCalculation | null;
  dividendWht: number | null;
  totalEffectiveBurden: number; // corp tax + employer payroll (if any)
}

export interface PayrollCalculation {
  grossSalary: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  schemeName: string;
}

export interface WhtScenario {
  type: 'dividends' | 'interest' | 'royalties';
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netReceived: number;
}

// ─── Corporate tax calculation ────────────────────────────────────────────────

export function calculateCorporateTax(profit: number, taxRate: number): number {
  if (profit <= 0) return 0;
  return Math.round(profit * taxRate * 100) / 100;
}

// ─── GST obligation check ─────────────────────────────────────────────────────

export function checkGstObligation(
  annualRevenue: number,
  profile: TaxProfile
): { obligated: boolean; note: string } {
  if (profile.gstVatRate === 0) {
    return { obligated: false, note: `${profile.countryName} has no GST/VAT` };
  }
  if (profile.gstRegistrationThreshold === null) {
    return { obligated: true, note: 'Registration required (no threshold set)' };
  }
  const obligated = annualRevenue >= profile.gstRegistrationThreshold;
  return {
    obligated,
    note: obligated
      ? `Revenue ${profile.currencyCode} ${annualRevenue.toLocaleString()} exceeds threshold of ${profile.currencyCode} ${profile.gstRegistrationThreshold.toLocaleString()}`
      : `Revenue below ${profile.currencyCode} ${profile.gstRegistrationThreshold.toLocaleString()} threshold`,
  };
}

// ─── Payroll tax calculation ──────────────────────────────────────────────────

export function calculatePayroll(
  grossSalary: number,
  profile: TaxProfile
): PayrollCalculation | null {
  if (!profile.hasPayrollTax || profile.payrollEmployeeRate === null || profile.payrollEmployerRate === null) {
    return null;
  }
  const employeeContribution = Math.round(grossSalary * profile.payrollEmployeeRate * 100) / 100;
  const employerContribution = Math.round(grossSalary * profile.payrollEmployerRate * 100) / 100;
  return {
    grossSalary,
    employeeContribution,
    employerContribution,
    totalContribution: Math.round((employeeContribution + employerContribution) * 100) / 100,
    schemeName: profile.payrollTaxName ?? 'Payroll Tax',
  };
}

// ─── WHT scenario ─────────────────────────────────────────────────────────────

export function calculateWht(
  grossAmount: number,
  type: WhtScenario['type'],
  profile: TaxProfile
): WhtScenario {
  const rates: Record<WhtScenario['type'], number> = {
    dividends: profile.withholdingDividends,
    interest: profile.withholdingInterest,
    royalties: profile.withholdingRoyalties,
  };
  const whtRate = rates[type];
  const whtAmount = Math.round(grossAmount * whtRate * 100) / 100;
  return {
    type,
    grossAmount,
    whtRate,
    whtAmount,
    netReceived: Math.round((grossAmount - whtAmount) * 100) / 100,
  };
}

// ─── Full tax calculation ─────────────────────────────────────────────────────

export function calculateTaxScenario(
  profit: number,
  grossSalary: number,
  annualRevenue: number,
  profile: TaxProfile
): TaxCalculation {
  const corporateTax = calculateCorporateTax(profit, profile.corporateTaxRate);
  const gst = checkGstObligation(annualRevenue, profile);
  const payroll = grossSalary > 0 ? calculatePayroll(grossSalary, profile) : null;
  const dividendWht = profit > 0
    ? calculateWht(profit - corporateTax, 'dividends', profile).whtAmount
    : null;
  const totalEffectiveBurden = corporateTax + (payroll?.employerContribution ?? 0);

  return {
    profit,
    corporateTax,
    corporateTaxRate: profile.corporateTaxRate,
    netProfit: profit - corporateTax,
    gstObligated: gst.obligated,
    gstNote: gst.note,
    payrollTax: payroll,
    dividendWht,
    totalEffectiveBurden,
  };
}

// ─── Comparison: rank countries by total burden ───────────────────────────────

export interface BurdenRank {
  rank: number;
  countryCode: string;
  countryName: string;
  corporateTax: number;
  employerPayroll: number;
  totalBurden: number;
  effectiveRate: number; // totalBurden / profit
}

export function rankByBurden(profit: number, grossSalary: number, profiles: TaxProfile[]): BurdenRank[] {
  const ranked = profiles.map((p) => {
    const corpTax = calculateCorporateTax(profit, p.corporateTaxRate);
    const payroll = grossSalary > 0 ? calculatePayroll(grossSalary, p) : null;
    const totalBurden = corpTax + (payroll?.employerContribution ?? 0);
    return {
      countryCode: p.countryCode,
      countryName: p.countryName,
      corporateTax: corpTax,
      employerPayroll: payroll?.employerContribution ?? 0,
      totalBurden,
      effectiveRate: profit > 0 ? totalBurden / profit : 0,
    };
  });
  return ranked
    .sort((a, b) => a.totalBurden - b.totalBurden)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
