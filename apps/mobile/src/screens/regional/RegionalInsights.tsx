// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Regional Insights Screen — APAC market intelligence for mobile
 * Offline-capable: caches last-fetched data for offline viewing
 */

export type AdoptionStatus =
  | 'ADOPTED'
  | 'ADOPTED_WITH_MODIFICATIONS'
  | 'EQUIVALENT_STANDARD'
  | 'PARTIALLY_ADOPTED'
  | 'UNDER_CONSIDERATION'
  | 'NOT_ADOPTED';

export interface CountrySnapshot {
  countryCode: string;
  countryName: string;
  region: string;
  tier: 1 | 2;
  currencyCode: string;
  corporateTaxRate: number;
  gstVatRate: number;
  gstVatName: string;
  withholdingDividends: number;
  hasPayrollTax: boolean;
  payrollTaxName: string | null;
  easeOfDoingBusinessRank: number | null;
  isoStandardsCount: number;
  incorporationTime: string;
}

export interface ISOEntry {
  standard: string;
  adoptionStatus: AdoptionStatus;
  localStandard?: string;
  certificationBodies: string[];
}

export interface RegionalCache {
  fetchedAt: string;
  countries: CountrySnapshot[];
}

// ─── Adoption helpers ─────────────────────────────────────────────────────────

export const ADOPTED_STATUSES: AdoptionStatus[] = [
  'ADOPTED',
  'ADOPTED_WITH_MODIFICATIONS',
  'EQUIVALENT_STANDARD',
  'PARTIALLY_ADOPTED',
  'UNDER_CONSIDERATION',
];

export function isAdopted(status: AdoptionStatus): boolean {
  return ADOPTED_STATUSES.includes(status);
}

export function adoptionLabel(status: AdoptionStatus): string {
  return status.replace(/_/g, ' ');
}

// ─── Tax formatting ───────────────────────────────────────────────────────────

export function formatPct(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function formatCorpTax(rate: number): string {
  return formatPct(rate, 1);
}

export function formatGst(rate: number): string {
  return formatPct(rate, 1);
}

export function formatWht(rate: number): string {
  return formatPct(rate, 0);
}

// ─── Country filtering / sorting ──────────────────────────────────────────────

export type SortField =
  | 'countryName'
  | 'corporateTaxRate'
  | 'gstVatRate'
  | 'easeOfDoingBusinessRank'
  | 'isoStandardsCount';

export function filterCountries(
  countries: CountrySnapshot[],
  opts: { region?: string; search?: string; tier?: 1 | 2 }
): CountrySnapshot[] {
  let result = [...countries];
  if (opts.region) result = result.filter((c) => c.region === opts.region);
  if (opts.tier !== undefined) result = result.filter((c) => c.tier === opts.tier);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.countryName.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }
  return result;
}

export function sortCountries(
  countries: CountrySnapshot[],
  field: SortField,
  ascending = true
): CountrySnapshot[] {
  return [...countries].sort((a, b) => {
    const av = (a[field] as number | string) ?? (field === 'easeOfDoingBusinessRank' ? 999 : 0);
    const bv = (b[field] as number | string) ?? (field === 'easeOfDoingBusinessRank' ? 999 : 0);
    if (typeof av === 'string' && typeof bv === 'string') {
      return ascending ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return ascending ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

export const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export function isCacheStale(cache: RegionalCache): boolean {
  return Date.now() - new Date(cache.fetchedAt).getTime() > CACHE_TTL_MS;
}

export function createCache(countries: CountrySnapshot[]): RegionalCache {
  return { fetchedAt: new Date().toISOString(), countries };
}

// ─── Summary stats ────────────────────────────────────────────────────────────

export interface RegionalSummary {
  totalCountries: number;
  tier1Count: number;
  tier2Count: number;
  lowestCorpTax: CountrySnapshot;
  highestCorpTax: CountrySnapshot;
  lowestGst: CountrySnapshot;
  easiestBusiness: CountrySnapshot | null;
  avgCorpTax: number;
  avgGst: number;
}

export function buildRegionalSummary(countries: CountrySnapshot[]): RegionalSummary {
  if (countries.length === 0) {
    throw new Error('Cannot build summary from empty country list');
  }
  const sorted = [...countries].sort((a, b) => a.corporateTaxRate - b.corporateTaxRate);
  const byGst = [...countries].sort((a, b) => a.gstVatRate - b.gstVatRate);
  const byEoDB = countries
    .filter((c) => c.easeOfDoingBusinessRank !== null)
    .sort((a, b) => (a.easeOfDoingBusinessRank ?? 999) - (b.easeOfDoingBusinessRank ?? 999));

  const avgCorpTax =
    countries.reduce((s, c) => s + c.corporateTaxRate, 0) / countries.length;
  const avgGst = countries.reduce((s, c) => s + c.gstVatRate, 0) / countries.length;

  return {
    totalCountries: countries.length,
    tier1Count: countries.filter((c) => c.tier === 1).length,
    tier2Count: countries.filter((c) => c.tier === 2).length,
    lowestCorpTax: sorted[0],
    highestCorpTax: sorted[sorted.length - 1],
    lowestGst: byGst[0],
    easiestBusiness: byEoDB[0] ?? null,
    avgCorpTax,
    avgGst,
  };
}

export function groupByRegion(countries: CountrySnapshot[]): Record<string, CountrySnapshot[]> {
  const groups: Record<string, CountrySnapshot[]> = {};
  for (const c of countries) {
    if (!groups[c.region]) groups[c.region] = [];
    groups[c.region].push(c);
  }
  return groups;
}
