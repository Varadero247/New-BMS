// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export interface CountryComparisonRow {
  countryCode: string;
  countryName: string;
  region: string;
  tier: number;
  currency: string;
  corporateTaxRate: number;
  gstVatRate: number;
  gstVatName: string;
  gstRegistrationThreshold: number | null;
  withholdingDividends: number;
  withholdingInterest: number;
  withholdingRoyalties: number;
  withholdingServices: number;
  hasPayrollTax: boolean;
  payrollTaxName: string | null;
  payrollEmployeeRate: number | null;
  payrollEmployerRate: number | null;
  easeOfDoingBusinessRank: number | null;
  corruptionPerceptionsIndex: number | null;
  minShareCapital: number | null;
  incorporationTime: string;
  isoStandardsCount: number;
  primaryLawsCount: number;
  fiscalYearEnd: string;
}

export function compareCountries(configs: RegionConfig[]): CountryComparisonRow[] {
  return configs.map((c) => ({
    countryCode: c.countryCode,
    countryName: c.countryName,
    region: c.region,
    tier: c.tier,
    currency: c.currency.code,
    corporateTaxRate: c.finance.corporateTaxRate,
    gstVatRate: c.finance.gstVatRate,
    gstVatName: c.finance.gstVatName,
    gstRegistrationThreshold: c.finance.gstVatRegistrationThreshold ?? null,
    withholdingDividends: c.finance.witholdingTaxRates.dividends,
    withholdingInterest: c.finance.witholdingTaxRates.interest,
    withholdingRoyalties: c.finance.witholdingTaxRates.royalties,
    withholdingServices: c.finance.witholdingTaxRates.services,
    hasPayrollTax: !!c.finance.payrollTax,
    payrollTaxName: c.finance.payrollTax?.name ?? null,
    payrollEmployeeRate: c.finance.payrollTax?.employeeRate ?? null,
    payrollEmployerRate: c.finance.payrollTax?.employerRate ?? null,
    easeOfDoingBusinessRank: c.business.easeOfDoingBusinessRank ?? null,
    corruptionPerceptionsIndex: c.business.corruptionPerceptionsIndex ?? null,
    minShareCapital: c.business.minShareCapital ?? null,
    incorporationTime: c.business.incorporationTime,
    isoStandardsCount: c.isoContext.adoptedStandards.length,
    primaryLawsCount: c.legislation.primaryLaws.length,
    fiscalYearEnd: c.finance.fiscalYearEnd,
  }));
}

export interface TaxLeagueTable {
  byCorpTax: CountryComparisonRow[];
  byGst: CountryComparisonRow[];
  byWithholdingDividends: CountryComparisonRow[];
  byEaseOfBusiness: CountryComparisonRow[];
  summary: {
    lowestCorpTax: CountryComparisonRow;
    highestCorpTax: CountryComparisonRow;
    lowestGst: CountryComparisonRow;
    highestGst: CountryComparisonRow;
    easiestToBusiness: CountryComparisonRow | null;
  };
}

export function buildTaxLeagueTable(configs: RegionConfig[]): TaxLeagueTable {
  const rows = compareCountries(configs);
  const byCorpTax = [...rows].sort((a, b) => a.corporateTaxRate - b.corporateTaxRate);
  const byGst = [...rows].sort((a, b) => a.gstVatRate - b.gstVatRate);
  const byWithholdingDividends = [...rows].sort((a, b) => a.withholdingDividends - b.withholdingDividends);
  const ranked = rows.filter((r) => r.easeOfDoingBusinessRank !== null);
  const byEaseOfBusiness = [...ranked].sort((a, b) => (a.easeOfDoingBusinessRank ?? 999) - (b.easeOfDoingBusinessRank ?? 999));
  return {
    byCorpTax,
    byGst,
    byWithholdingDividends,
    byEaseOfBusiness,
    summary: {
      lowestCorpTax: byCorpTax[0],
      highestCorpTax: byCorpTax[byCorpTax.length - 1],
      lowestGst: byGst[0],
      highestGst: byGst[byGst.length - 1],
      easiestToBusiness: byEaseOfBusiness[0] ?? null,
    },
  };
}
