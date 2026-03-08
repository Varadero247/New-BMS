// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const BASE = `${API_URL}/api/region-config`;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const d = await res.json();
  return d.data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountrySummary {
  countryCode: string;
  countryName: string;
  region: string;
  tier: number;
  currency: { code: string; symbol: string };
  timezone: string;
  corporateTaxRate: number;
  gstVatRate: number;
  gstVatName: string;
  fiscalYearEnd: string;
  easeOfDoingBusinessRank: number | null;
  legislationCount: number;
  isoStandardsCount: number;
}

export interface ComparisonRow {
  countryCode: string;
  countryName: string;
  region: string;
  tier: number;
  currency: string;
  corporateTaxRate: number;
  gstVatRate: number;
  gstVatName: string;
  withholdingDividends: number;
  withholdingInterest: number;
  withholdingRoyalties: number;
  hasPayrollTax: boolean;
  payrollTaxName: string | null;
  payrollEmployeeRate: number | null;
  payrollEmployerRate: number | null;
  easeOfDoingBusinessRank: number | null;
  corruptionPerceptionsIndex: number | null;
  isoStandardsCount: number;
  incorporationTime: string;
}

export interface RankedRow extends ComparisonRow { rank: number; }

export interface TaxReportData {
  rankedByCorpTax: RankedRow[];
  rankedByGst: RankedRow[];
  rankedByWithholdingDividends: RankedRow[];
  rankedByEaseOfBusiness: RankedRow[];
  summary: {
    lowestCorpTax: RankedRow;
    highestCorpTax: RankedRow;
    lowestGst: RankedRow;
    highestGst: RankedRow;
    easiestToBusiness: RankedRow | null;
  };
}

export interface ComplianceRow {
  countryCode: string;
  countryName: string;
  tier: number;
  region: string;
  regulatoryBodiesCount: number;
  mandatoryLawsCount: number;
  totalLawsCount: number;
  isoStandardsAdopted: number;
  accreditationBody: string;
  dataProtectionAuthority: string;
  dueDiligenceRequirements: string;
  whistleblowerProtection: boolean;
  modernSlaveryAct: boolean;
  esgRequirements: string;
}

export interface ISOComparisonEntry {
  countryCode: string;
  countryName: string;
  adoptionStatus: string;
  localStandard?: string;
  certificationBodies: string[];
}

export interface ISOComparisonData {
  isoStandard: string;
  comparison: ISOComparisonEntry[];
  adoptedCount: number;
  totalCountries: number;
}

// ─── API functions ────────────────────────────────────────────────────────────

export const fetchAllCountries = () => get<CountrySummary[]>('');

export const fetchComparison = (codes?: string) =>
  get<{ countries: ComparisonRow[]; notFound: string[] }>(
    `/compare/countries${codes ? `?codes=${codes}` : ''}`
  );

export const fetchTaxReport = () => get<TaxReportData>('/report/tax');

export const fetchComplianceReport = () => get<ComplianceRow[]>('/report/compliance');

export const fetchISOComparison = (standard: string) =>
  get<ISOComparisonData>(`/compare/iso/${encodeURIComponent(standard)}`);
