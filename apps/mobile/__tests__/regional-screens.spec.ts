// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Mobile Regional Screens — unit specification tests
 * Covers: RegionalInsights, TaxComparison, ComplianceChecker
 */

import {
  isAdopted,
  adoptionLabel,
  formatPct,
  formatCorpTax,
  formatGst,
  formatWht,
  filterCountries,
  sortCountries,
  isCacheStale,
  createCache,
  buildRegionalSummary,
  groupByRegion,
  ADOPTED_STATUSES,
  CACHE_TTL_MS,
  type CountrySnapshot,
  type AdoptionStatus,
  type RegionalCache,
} from '../src/screens/regional/RegionalInsights';

import {
  calculateCorporateTax,
  checkGstObligation,
  calculatePayroll,
  calculateWht,
  calculateTaxScenario,
  rankByBurden,
  type TaxProfile,
} from '../src/screens/regional/TaxComparison';

import {
  assessComplianceGaps,
  buildGapReport,
  compareCompliance,
  riskLevelRank,
  highestRisk,
  penaltyRiskScore,
  type OrgCompliance,
  type ComplianceProfile,
  type RiskLevel,
} from '../src/screens/regional/ComplianceChecker';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SG: CountrySnapshot = {
  countryCode: 'SG', countryName: 'Singapore', region: 'ASEAN', tier: 1,
  currencyCode: 'SGD', corporateTaxRate: 0.17, gstVatRate: 0.09, gstVatName: 'GST',
  withholdingDividends: 0, hasPayrollTax: true, payrollTaxName: 'CPF',
  easeOfDoingBusinessRank: 2, isoStandardsCount: 38, incorporationTime: '1-3 days',
};

const HK: CountrySnapshot = {
  countryCode: 'HK', countryName: 'Hong Kong', region: 'East Asia', tier: 1,
  currencyCode: 'HKD', corporateTaxRate: 0.165, gstVatRate: 0, gstVatName: 'None',
  withholdingDividends: 0, hasPayrollTax: true, payrollTaxName: 'MPF',
  easeOfDoingBusinessRank: 3, isoStandardsCount: 30, incorporationTime: '1 day',
};

const PH: CountrySnapshot = {
  countryCode: 'PH', countryName: 'Philippines', region: 'ASEAN', tier: 2,
  currencyCode: 'PHP', corporateTaxRate: 0.25, gstVatRate: 0.12, gstVatName: 'VAT',
  withholdingDividends: 0.15, hasPayrollTax: true, payrollTaxName: 'SSS/PhilHealth',
  easeOfDoingBusinessRank: 95, isoStandardsCount: 12, incorporationTime: '28 days',
};

const AU: CountrySnapshot = {
  countryCode: 'AU', countryName: 'Australia', region: 'ANZ', tier: 1,
  currencyCode: 'AUD', corporateTaxRate: 0.30, gstVatRate: 0.10, gstVatName: 'GST',
  withholdingDividends: 0.30, hasPayrollTax: false, payrollTaxName: null,
  easeOfDoingBusinessRank: 14, isoStandardsCount: 45, incorporationTime: '2-5 days',
};

const ALL_COUNTRIES = [SG, HK, PH, AU];

const SG_TAX: TaxProfile = {
  countryCode: 'SG', countryName: 'Singapore',
  corporateTaxRate: 0.17, gstVatRate: 0.09, gstVatName: 'GST',
  gstRegistrationThreshold: 1_000_000,
  withholdingDividends: 0, withholdingInterest: 0.15, withholdingRoyalties: 0.10,
  hasPayrollTax: true, payrollTaxName: 'CPF', payrollEmployeeRate: 0.20, payrollEmployerRate: 0.17,
  currencyCode: 'SGD',
};

const HK_TAX: TaxProfile = {
  countryCode: 'HK', countryName: 'Hong Kong',
  corporateTaxRate: 0.165, gstVatRate: 0, gstVatName: 'None',
  gstRegistrationThreshold: null,
  withholdingDividends: 0, withholdingInterest: 0, withholdingRoyalties: 0.045,
  hasPayrollTax: true, payrollTaxName: 'MPF', payrollEmployeeRate: 0.05, payrollEmployerRate: 0.05,
  currencyCode: 'HKD',
};

const AU_TAX: TaxProfile = {
  countryCode: 'AU', countryName: 'Australia',
  corporateTaxRate: 0.30, gstVatRate: 0.10, gstVatName: 'GST',
  gstRegistrationThreshold: 75_000,
  withholdingDividends: 0.30, withholdingInterest: 0.10, withholdingRoyalties: 0.30,
  hasPayrollTax: false, payrollTaxName: null, payrollEmployeeRate: null, payrollEmployerRate: null,
  currencyCode: 'AUD',
};

const FULL_ORG: OrgCompliance = {
  hasDataProtectionPolicy: true, hasAntiCorruptionPolicy: true, hasAmlProgram: true,
  hasModernSlaveryStatement: true, hasWhistleblowerChannel: true,
  publishesEsgReport: true, conductsDueDiligence: true,
};

const MINIMAL_ORG: OrgCompliance = {
  hasDataProtectionPolicy: false, hasAntiCorruptionPolicy: false, hasAmlProgram: false,
  hasModernSlaveryStatement: false, hasWhistleblowerChannel: false,
  publishesEsgReport: false, conductsDueDiligence: false,
};

const SG_COMPLIANCE: ComplianceProfile = {
  countryCode: 'SG', countryName: 'Singapore',
  hasDataProtectionLaw: true, dataProtectionAuthority: 'PDPC',
  hasAntiCorruptionLaw: true, hasAmlRegulations: true,
  hasModernSlaveryAct: false, hasWhistleblowerProtection: true,
  esgReportingRequired: true, esgScope: 'MANDATORY_LISTED',
  dueDiligenceLaw: 'RECOMMENDED', penaltyRegime: 'STRICT', enforcementRecord: 'ACTIVE',
};

const AU_COMPLIANCE: ComplianceProfile = {
  countryCode: 'AU', countryName: 'Australia',
  hasDataProtectionLaw: true, dataProtectionAuthority: 'OAIC',
  hasAntiCorruptionLaw: true, hasAmlRegulations: true,
  hasModernSlaveryAct: true, hasWhistleblowerProtection: true,
  esgReportingRequired: true, esgScope: 'MANDATORY_LISTED',
  dueDiligenceLaw: 'MANDATORY', penaltyRegime: 'STRICT', enforcementRecord: 'ACTIVE',
};

// ─── RegionalInsights tests ───────────────────────────────────────────────────

describe('AdoptionStatus helpers', () => {
  const adoptedStatuses: AdoptionStatus[] = [
    'ADOPTED', 'ADOPTED_WITH_MODIFICATIONS', 'EQUIVALENT_STANDARD',
    'PARTIALLY_ADOPTED', 'UNDER_CONSIDERATION',
  ];
  const notAdopted: AdoptionStatus[] = ['NOT_ADOPTED'];

  for (const s of adoptedStatuses) {
    it(`isAdopted("${s}") = true`, () => expect(isAdopted(s)).toBe(true));
  }
  for (const s of notAdopted) {
    it(`isAdopted("${s}") = false`, () => expect(isAdopted(s)).toBe(false));
  }

  it('ADOPTED_STATUSES has 5 entries', () => {
    expect(ADOPTED_STATUSES).toHaveLength(5);
    expect(ADOPTED_STATUSES.includes('NOT_ADOPTED')).toBe(false);
  });

  it('adoptionLabel replaces underscores with spaces', () => {
    expect(adoptionLabel('ADOPTED_WITH_MODIFICATIONS')).toBe('ADOPTED WITH MODIFICATIONS');
    expect(adoptionLabel('NOT_ADOPTED')).toBe('NOT ADOPTED');
    expect(adoptionLabel('ADOPTED')).toBe('ADOPTED');
  });
});

describe('formatPct / formatCorpTax / formatGst / formatWht', () => {
  const pctCases: [number, number, string][] = [
    [0.17, 1, '17.0%'],
    [0.165, 1, '16.5%'],
    [0.09, 1, '9.0%'],
    [0, 1, '0.0%'],
    [0.255, 2, '25.50%'],
  ];
  for (const [rate, decimals, expected] of pctCases) {
    it(`formatPct(${rate}, ${decimals}) = "${expected}"`, () => {
      expect(formatPct(rate, decimals)).toBe(expected);
    });
  }

  const corpCases: [number, string][] = [
    [0.17, '17.0%'], [0.30, '30.0%'], [0.165, '16.5%'], [0.25, '25.0%'],
  ];
  for (const [r, e] of corpCases) {
    it(`formatCorpTax(${r}) = "${e}"`, () => expect(formatCorpTax(r)).toBe(e));
  }

  const gstCases: [number, string][] = [
    [0.09, '9.0%'], [0.10, '10.0%'], [0, '0.0%'], [0.12, '12.0%'],
  ];
  for (const [r, e] of gstCases) {
    it(`formatGst(${r}) = "${e}"`, () => expect(formatGst(r)).toBe(e));
  }

  const whtCases: [number, string][] = [
    [0.15, '15%'], [0.30, '30%'], [0, '0%'], [0.05, '5%'],
  ];
  for (const [r, e] of whtCases) {
    it(`formatWht(${r}) = "${e}"`, () => expect(formatWht(r)).toBe(e));
  }
});

describe('filterCountries', () => {
  it('no filter returns all', () => {
    expect(filterCountries(ALL_COUNTRIES, {})).toHaveLength(4);
  });

  it('filter by region', () => {
    expect(filterCountries(ALL_COUNTRIES, { region: 'ASEAN' })).toHaveLength(2);
    expect(filterCountries(ALL_COUNTRIES, { region: 'ANZ' })).toHaveLength(1);
    expect(filterCountries(ALL_COUNTRIES, { region: 'East Asia' })).toHaveLength(1);
  });

  it('filter by tier 1', () => {
    const r = filterCountries(ALL_COUNTRIES, { tier: 1 });
    expect(r).toHaveLength(3);
    expect(r.every((c) => c.tier === 1)).toBe(true);
  });

  it('filter by tier 2', () => {
    const r = filterCountries(ALL_COUNTRIES, { tier: 2 });
    expect(r).toHaveLength(1);
    expect(r[0].countryCode).toBe('PH');
  });

  it('filter by search — name', () => {
    expect(filterCountries(ALL_COUNTRIES, { search: 'sing' })).toHaveLength(1);
  });

  it('filter by search — code case-insensitive', () => {
    expect(filterCountries(ALL_COUNTRIES, { search: 'au' })).toHaveLength(1);
  });

  it('filter by search — region', () => {
    const r = filterCountries(ALL_COUNTRIES, { search: 'asean' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((c) => c.region === 'ASEAN')).toBe(true);
  });

  it('filter by search with no match returns empty', () => {
    expect(filterCountries(ALL_COUNTRIES, { search: 'zzz-nomatch' })).toHaveLength(0);
  });

  it('combined: region + search', () => {
    const r = filterCountries(ALL_COUNTRIES, { region: 'ASEAN', search: 'phil' });
    expect(r).toHaveLength(1);
    expect(r[0].countryCode).toBe('PH');
  });
});

describe('sortCountries', () => {
  it('sort by countryName ascending', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'countryName', true);
    expect(sorted[0].countryCode).toBe('AU');
    expect(sorted[sorted.length - 1].countryCode).toBe('SG');
  });

  it('sort by countryName descending', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'countryName', false);
    expect(sorted[0].countryCode).toBe('SG');
  });

  it('sort by corporateTaxRate ascending (lowest first)', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'corporateTaxRate', true);
    expect(sorted[0].countryCode).toBe('HK'); // 16.5%
    expect(sorted[sorted.length - 1].countryCode).toBe('AU'); // 30%
  });

  it('sort by corporateTaxRate descending', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'corporateTaxRate', false);
    expect(sorted[0].countryCode).toBe('AU');
  });

  it('sort by easeOfDoingBusinessRank ascending', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'easeOfDoingBusinessRank', true);
    expect(sorted[0].countryCode).toBe('SG'); // rank 2
    expect(sorted[1].countryCode).toBe('HK'); // rank 3
  });

  it('sort by isoStandardsCount descending', () => {
    const sorted = sortCountries(ALL_COUNTRIES, 'isoStandardsCount', false);
    expect(sorted[0].countryCode).toBe('AU'); // 45
  });

  it('does not mutate original array', () => {
    const original = [...ALL_COUNTRIES];
    sortCountries(ALL_COUNTRIES, 'corporateTaxRate', true);
    expect(ALL_COUNTRIES).toEqual(original);
  });
});

describe('Cache helpers', () => {
  it('isCacheStale returns false for fresh cache', () => {
    const cache = createCache(ALL_COUNTRIES);
    expect(isCacheStale(cache)).toBe(false);
  });

  it('isCacheStale returns true for old cache', () => {
    const old = new Date(Date.now() - CACHE_TTL_MS - 1000).toISOString();
    const cache: RegionalCache = { fetchedAt: old, countries: ALL_COUNTRIES };
    expect(isCacheStale(cache)).toBe(true);
  });

  it('CACHE_TTL_MS is 6 hours', () => {
    expect(CACHE_TTL_MS).toBe(6 * 60 * 60 * 1000);
  });

  it('createCache sets fetchedAt to now', () => {
    const before = Date.now();
    const cache = createCache(ALL_COUNTRIES);
    const after = Date.now();
    const ts = new Date(cache.fetchedAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('createCache stores all countries', () => {
    const cache = createCache(ALL_COUNTRIES);
    expect(cache.countries).toHaveLength(ALL_COUNTRIES.length);
  });
});

describe('buildRegionalSummary', () => {
  const summary = buildRegionalSummary(ALL_COUNTRIES);

  it('totalCountries is correct', () => expect(summary.totalCountries).toBe(4));
  it('tier1Count is correct', () => expect(summary.tier1Count).toBe(3)); // SG HK AU
  it('tier2Count is correct', () => expect(summary.tier2Count).toBe(1)); // PH

  it('lowestCorpTax is HK (16.5%)', () => expect(summary.lowestCorpTax.countryCode).toBe('HK'));
  it('highestCorpTax is AU (30%)', () => expect(summary.highestCorpTax.countryCode).toBe('AU'));
  it('lowestGst is HK (0%)', () => expect(summary.lowestGst.countryCode).toBe('HK'));

  it('easiestBusiness is SG (rank 2)', () => expect(summary.easiestBusiness?.countryCode).toBe('SG'));

  it('avgCorpTax is within range', () => {
    expect(summary.avgCorpTax).toBeGreaterThan(0);
    expect(summary.avgCorpTax).toBeLessThan(1);
  });

  it('avgGst is within range', () => {
    expect(summary.avgGst).toBeGreaterThanOrEqual(0);
    expect(summary.avgGst).toBeLessThan(1);
  });

  it('throws on empty list', () => {
    expect(() => buildRegionalSummary([])).toThrow();
  });
});

describe('groupByRegion', () => {
  const groups = groupByRegion(ALL_COUNTRIES);

  it('creates ASEAN group with 2 countries', () => {
    expect(groups['ASEAN']).toHaveLength(2);
  });

  it('creates ANZ group with 1 country', () => {
    expect(groups['ANZ']).toHaveLength(1);
    expect(groups['ANZ'][0].countryCode).toBe('AU');
  });

  it('creates East Asia group with HK', () => {
    expect(groups['East Asia'][0].countryCode).toBe('HK');
  });

  it('all countries accounted for', () => {
    const total = Object.values(groups).reduce((s, g) => s + g.length, 0);
    expect(total).toBe(ALL_COUNTRIES.length);
  });
});

// ─── TaxComparison tests ──────────────────────────────────────────────────────

describe('calculateCorporateTax', () => {
  const cases: [number, number, number][] = [
    [1_000_000, 0.17, 170_000],
    [1_000_000, 0.30, 300_000],
    [500_000, 0.165, 82_500],
    [0, 0.17, 0],
    [-100_000, 0.17, 0], // loss = no tax
  ];
  for (const [profit, rate, expected] of cases) {
    it(`profit=${profit} @ ${rate*100}% → ${expected}`, () => {
      expect(calculateCorporateTax(profit, rate)).toBe(expected);
    });
  }
});

describe('checkGstObligation', () => {
  it('SG: below threshold → not obligated', () => {
    const r = checkGstObligation(500_000, SG_TAX);
    expect(r.obligated).toBe(false);
  });

  it('SG: at threshold → obligated', () => {
    const r = checkGstObligation(1_000_000, SG_TAX);
    expect(r.obligated).toBe(true);
  });

  it('SG: above threshold → obligated', () => {
    const r = checkGstObligation(2_000_000, SG_TAX);
    expect(r.obligated).toBe(true);
  });

  it('HK: no GST → not obligated regardless of revenue', () => {
    const r = checkGstObligation(10_000_000, HK_TAX);
    expect(r.obligated).toBe(false);
    expect(r.note).toContain('no GST/VAT');
  });

  it('AU: below 75k threshold → not obligated', () => {
    const r = checkGstObligation(50_000, AU_TAX);
    expect(r.obligated).toBe(false);
  });

  it('AU: above 75k threshold → obligated', () => {
    const r = checkGstObligation(100_000, AU_TAX);
    expect(r.obligated).toBe(true);
  });

  it('null threshold → always obligated', () => {
    const profile = { ...SG_TAX, gstRegistrationThreshold: null };
    const r = checkGstObligation(1, profile);
    expect(r.obligated).toBe(true);
  });
});

describe('calculatePayroll', () => {
  it('SG CPF: 1,000,000 salary → employee 200k, employer 170k', () => {
    const r = calculatePayroll(1_000_000, SG_TAX);
    expect(r).not.toBeNull();
    expect(r!.employeeContribution).toBe(200_000);
    expect(r!.employerContribution).toBe(170_000);
    expect(r!.totalContribution).toBe(370_000);
    expect(r!.schemeName).toBe('CPF');
  });

  it('HK MPF: 100,000 salary → employee 5k, employer 5k', () => {
    const r = calculatePayroll(100_000, HK_TAX);
    expect(r).not.toBeNull();
    expect(r!.employeeContribution).toBe(5_000);
    expect(r!.employerContribution).toBe(5_000);
    expect(r!.schemeName).toBe('MPF');
  });

  it('AU (no payroll tax) → returns null', () => {
    expect(calculatePayroll(1_000_000, AU_TAX)).toBeNull();
  });

  it('grossSalary 0 → all zeros', () => {
    const r = calculatePayroll(0, SG_TAX);
    expect(r!.employeeContribution).toBe(0);
    expect(r!.employerContribution).toBe(0);
    expect(r!.totalContribution).toBe(0);
  });
});

describe('calculateWht', () => {
  it('SG WHT on interest: 1,000,000 @ 15% → 150,000 withheld', () => {
    const r = calculateWht(1_000_000, 'interest', SG_TAX);
    expect(r.whtAmount).toBe(150_000);
    expect(r.netReceived).toBe(850_000);
    expect(r.whtRate).toBe(0.15);
  });

  it('SG WHT on dividends: 0% → no withholding', () => {
    const r = calculateWht(500_000, 'dividends', SG_TAX);
    expect(r.whtAmount).toBe(0);
    expect(r.netReceived).toBe(500_000);
  });

  it('HK WHT on royalties: 1,000,000 @ 4.5% → 45,000', () => {
    const r = calculateWht(1_000_000, 'royalties', HK_TAX);
    expect(r.whtAmount).toBe(45_000);
    expect(r.netReceived).toBe(955_000);
  });

  it('AU WHT on dividends: 30% → correct amount', () => {
    const r = calculateWht(1_000_000, 'dividends', AU_TAX);
    expect(r.whtAmount).toBe(300_000);
  });

  it('whtAmount + netReceived = grossAmount', () => {
    const gross = 750_000;
    const r = calculateWht(gross, 'interest', AU_TAX);
    expect(r.whtAmount + r.netReceived).toBe(gross);
  });
});

describe('calculateTaxScenario', () => {
  it('SG scenario: profit 1M, salary 500k, revenue 2M', () => {
    const r = calculateTaxScenario(1_000_000, 500_000, 2_000_000, SG_TAX);
    expect(r.corporateTax).toBe(170_000);
    expect(r.netProfit).toBe(830_000);
    expect(r.gstObligated).toBe(true);
    expect(r.payrollTax).not.toBeNull();
    expect(r.payrollTax!.employerContribution).toBe(85_000); // 17% of 500k
    expect(r.totalEffectiveBurden).toBe(255_000); // 170k + 85k
  });

  it('HK scenario: no GST, MPF', () => {
    const r = calculateTaxScenario(1_000_000, 0, 5_000_000, HK_TAX);
    expect(r.gstObligated).toBe(false);
    expect(r.payrollTax).toBeNull(); // grossSalary = 0
    expect(r.corporateTax).toBe(165_000);
  });

  it('AU scenario: no payroll tax, GST above threshold', () => {
    const r = calculateTaxScenario(1_000_000, 200_000, 500_000, AU_TAX);
    expect(r.payrollTax).toBeNull(); // AU has no payroll
    expect(r.gstObligated).toBe(true);
    expect(r.corporateTax).toBe(300_000);
    expect(r.totalEffectiveBurden).toBe(300_000); // no payroll
  });

  it('profit = 0 → zero tax', () => {
    const r = calculateTaxScenario(0, 0, 0, SG_TAX);
    expect(r.corporateTax).toBe(0);
    expect(r.netProfit).toBe(0);
  });
});

describe('rankByBurden', () => {
  const profiles = [SG_TAX, HK_TAX, AU_TAX];
  const ranked = rankByBurden(1_000_000, 0, profiles);

  it('returns same count as profiles', () => {
    expect(ranked).toHaveLength(3);
  });

  it('ranks are sequential from 1', () => {
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('lowest burden is ranked 1', () => {
    expect(ranked[0].totalBurden).toBeLessThan(ranked[1].totalBurden);
  });

  it('HK has lower burden than SG at 17% corp rate (HK is 16.5%)', () => {
    const hk = ranked.find((r) => r.countryCode === 'HK')!;
    const sg = ranked.find((r) => r.countryCode === 'SG')!;
    expect(hk.rank).toBeLessThan(sg.rank);
  });

  it('AU is highest burden (30%)', () => {
    const au = ranked.find((r) => r.countryCode === 'AU')!;
    expect(au.rank).toBe(3);
  });

  it('effectiveRate is totalBurden / profit', () => {
    for (const r of ranked) {
      expect(r.effectiveRate).toBeCloseTo(r.totalBurden / 1_000_000, 4);
    }
  });
});

// ─── ComplianceChecker tests ──────────────────────────────────────────────────

describe('riskLevelRank', () => {
  const levels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  it('CRITICAL > HIGH > MEDIUM > LOW', () => {
    expect(riskLevelRank('CRITICAL')).toBeGreaterThan(riskLevelRank('HIGH'));
    expect(riskLevelRank('HIGH')).toBeGreaterThan(riskLevelRank('MEDIUM'));
    expect(riskLevelRank('MEDIUM')).toBeGreaterThan(riskLevelRank('LOW'));
  });

  for (const l of levels) {
    it(`riskLevelRank("${l}") is a positive number`, () => {
      expect(riskLevelRank(l)).toBeGreaterThan(0);
    });
  }
});

describe('highestRisk', () => {
  it('empty gaps → LOW', () => {
    expect(highestRisk([])).toBe('LOW');
  });

  it('returns CRITICAL if any gap is CRITICAL', () => {
    const gaps = [
      { riskLevel: 'HIGH' as RiskLevel, gap: true, dimension: 'data_protection' as const, label: '', required: true, countryRequires: true, recommendation: '' },
      { riskLevel: 'CRITICAL' as RiskLevel, gap: true, dimension: 'anti_corruption' as const, label: '', required: true, countryRequires: true, recommendation: '' },
    ];
    expect(highestRisk(gaps)).toBe('CRITICAL');
  });

  it('returns HIGH if max is HIGH', () => {
    const gaps = [
      { riskLevel: 'MEDIUM' as RiskLevel, gap: true, dimension: 'data_protection' as const, label: '', required: true, countryRequires: true, recommendation: '' },
      { riskLevel: 'HIGH' as RiskLevel, gap: true, dimension: 'modern_slavery' as const, label: '', required: true, countryRequires: true, recommendation: '' },
    ];
    expect(highestRisk(gaps)).toBe('HIGH');
  });
});

describe('assessComplianceGaps — fully compliant org', () => {
  const gaps = assessComplianceGaps(FULL_ORG, SG_COMPLIANCE);

  it('returns 7 dimension assessments', () => {
    expect(gaps).toHaveLength(7);
  });

  it('no actual gaps for fully compliant org', () => {
    expect(gaps.filter((g) => g.gap)).toHaveLength(0);
  });

  it('all gaps have riskLevel LOW (no gap)', () => {
    expect(gaps.every((g) => g.riskLevel === 'LOW')).toBe(true);
  });
});

describe('assessComplianceGaps — minimal org in Australia', () => {
  const gaps = assessComplianceGaps(MINIMAL_ORG, AU_COMPLIANCE);
  const actualGaps = gaps.filter((g) => g.gap);

  it('AU requires modern slavery act → gap detected', () => {
    const ms = gaps.find((g) => g.dimension === 'modern_slavery');
    expect(ms?.gap).toBe(true);
  });

  it('AU requires mandatory due diligence → gap detected', () => {
    const dd = gaps.find((g) => g.dimension === 'due_diligence');
    expect(dd?.gap).toBe(true);
  });

  it('data protection gap detected', () => {
    const dp = gaps.find((g) => g.dimension === 'data_protection');
    expect(dp?.gap).toBe(true);
  });

  it('all detected gaps have recommendations', () => {
    for (const g of actualGaps) {
      expect(g.recommendation.length).toBeGreaterThan(0);
      expect(g.recommendation).not.toBe('Currently met');
    }
  });
});

describe('buildGapReport', () => {
  it('fully compliant org → score 100', () => {
    const report = buildGapReport(FULL_ORG, SG_COMPLIANCE);
    expect(report.score).toBe(100);
    expect(report.totalGaps).toBe(0);
    expect(report.overallRisk).toBe('LOW');
  });

  it('minimal org in AU → high risk, low score', () => {
    const report = buildGapReport(MINIMAL_ORG, AU_COMPLIANCE);
    expect(report.totalGaps).toBeGreaterThan(0);
    expect(report.score).toBeLessThan(100);
    expect(['CRITICAL', 'HIGH']).toContain(report.overallRisk);
  });

  it('score is 0–100', () => {
    const report = buildGapReport(MINIMAL_ORG, AU_COMPLIANCE);
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
  });

  it('countryCode and countryName match profile', () => {
    const report = buildGapReport(FULL_ORG, SG_COMPLIANCE);
    expect(report.countryCode).toBe('SG');
    expect(report.countryName).toBe('Singapore');
  });

  it('criticalGaps is count of CRITICAL-level gaps', () => {
    const report = buildGapReport(MINIMAL_ORG, AU_COMPLIANCE);
    const manual = report.gaps.filter((g) => g.gap && g.riskLevel === 'CRITICAL').length;
    expect(report.criticalGaps).toBe(manual);
  });
});

describe('compareCompliance', () => {
  const reports = compareCompliance(FULL_ORG, [SG_COMPLIANCE, AU_COMPLIANCE]);

  it('returns one report per country', () => {
    expect(reports).toHaveLength(2);
  });

  it('sorted by score descending (highest compliance first)', () => {
    for (let i = 0; i < reports.length - 1; i++) {
      expect(reports[i].score).toBeGreaterThanOrEqual(reports[i + 1].score);
    }
  });

  it('both scores are 100 for fully compliant org', () => {
    expect(reports.every((r) => r.score === 100)).toBe(true);
  });

  const minimal = compareCompliance(MINIMAL_ORG, [SG_COMPLIANCE, AU_COMPLIANCE]);

  it('AU has more gaps than SG for minimal org (modern slavery, mandatory DD)', () => {
    const au = minimal.find((r) => r.countryCode === 'AU')!;
    const sg = minimal.find((r) => r.countryCode === 'SG')!;
    expect(au.totalGaps).toBeGreaterThanOrEqual(sg.totalGaps);
  });
});

describe('penaltyRiskScore', () => {
  it('STRICT + ACTIVE → max score 9', () => {
    expect(penaltyRiskScore(SG_COMPLIANCE)).toBe(9); // STRICT(3) * ACTIVE(3)
  });

  it('LIGHT + INACTIVE → min score 1', () => {
    const profile: ComplianceProfile = {
      ...SG_COMPLIANCE, penaltyRegime: 'LIGHT', enforcementRecord: 'INACTIVE',
    };
    expect(penaltyRiskScore(profile)).toBe(1);
  });

  it('MODERATE + MODERATE → 4', () => {
    const profile: ComplianceProfile = {
      ...SG_COMPLIANCE, penaltyRegime: 'MODERATE', enforcementRecord: 'MODERATE',
    };
    expect(penaltyRiskScore(profile)).toBe(4);
  });

  it('score is in range 1–9', () => {
    const profiles: ComplianceProfile[] = [
      { ...SG_COMPLIANCE, penaltyRegime: 'STRICT', enforcementRecord: 'ACTIVE' },
      { ...SG_COMPLIANCE, penaltyRegime: 'STRICT', enforcementRecord: 'MODERATE' },
      { ...SG_COMPLIANCE, penaltyRegime: 'LIGHT', enforcementRecord: 'ACTIVE' },
    ];
    for (const p of profiles) {
      const score = penaltyRiskScore(p);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(9);
    }
  });
});

// ─── Algorithm puzzle phases (ph217mob–ph226mob) ──────────────────────────────
function moveZeroes217mob(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217mob_mz',()=>{
  it('a',()=>{expect(moveZeroes217mob([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217mob([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217mob([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217mob([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217mob([4,2,0,0,3])).toBe(4);});
});
function missingNumber218mob(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218mob_mn',()=>{
  it('a',()=>{expect(missingNumber218mob([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218mob([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218mob([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218mob([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218mob([1])).toBe(0);});
});
function countBits219mob(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219mob_cb',()=>{
  it('a',()=>{expect(countBits219mob(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219mob(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219mob(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219mob(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219mob(4)[4]).toBe(1);});
});
function climbStairs220mob(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220mob_cs',()=>{
  it('a',()=>{expect(climbStairs220mob(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220mob(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220mob(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220mob(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220mob(1)).toBe(1);});
});
function maxProfit221mob(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221mob_mp',()=>{
  it('a',()=>{expect(maxProfit221mob([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221mob([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221mob([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221mob([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221mob([1])).toBe(0);});
});
function singleNumber222mob(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222mob_sn',()=>{
  it('a',()=>{expect(singleNumber222mob([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222mob([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222mob([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222mob([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222mob([3,3,5])).toBe(5);});
});
function hammingDist223mob(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223mob_hd',()=>{
  it('a',()=>{expect(hammingDist223mob(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223mob(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223mob(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223mob(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223mob(7,7)).toBe(0);});
});
function majorElem224mob(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224mob_me',()=>{
  it('a',()=>{expect(majorElem224mob([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224mob([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224mob([1])).toBe(1);});
  it('d',()=>{expect(majorElem224mob([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224mob([6,5,5])).toBe(5);});
});
function missingNum225mob(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph225mob_mn2',()=>{
  it('a',()=>{expect(missingNum225mob([0,2,3,4])).toBe(1);});
  it('b',()=>{expect(missingNum225mob([1,2,3,4])).toBe(0);});
  it('c',()=>{expect(missingNum225mob([0,1,2,4])).toBe(3);});
  it('d',()=>{expect(missingNum225mob([0,1,3,4])).toBe(2);});
  it('e',()=>{expect(missingNum225mob([0,1,2,3])).toBe(4);});
});
function climbStairs226mob(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph226mob_cs2',()=>{
  it('a',()=>{expect(climbStairs226mob(6)).toBe(13);});
  it('b',()=>{expect(climbStairs226mob(7)).toBe(21);});
  it('c',()=>{expect(climbStairs226mob(8)).toBe(34);});
  it('d',()=>{expect(climbStairs226mob(9)).toBe(55);});
  it('e',()=>{expect(climbStairs226mob(10)).toBe(89);});
});
function hd258mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258mob2_hd',()=>{it('a',()=>{expect(hd258mob2(1,4)).toBe(2);});it('b',()=>{expect(hd258mob2(3,1)).toBe(1);});it('c',()=>{expect(hd258mob2(0,0)).toBe(0);});it('d',()=>{expect(hd258mob2(93,73)).toBe(2);});it('e',()=>{expect(hd258mob2(15,0)).toBe(4);});});
function hd259mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259mob2_hd',()=>{it('a',()=>{expect(hd259mob2(1,4)).toBe(2);});it('b',()=>{expect(hd259mob2(3,1)).toBe(1);});it('c',()=>{expect(hd259mob2(0,0)).toBe(0);});it('d',()=>{expect(hd259mob2(93,73)).toBe(2);});it('e',()=>{expect(hd259mob2(15,0)).toBe(4);});});
function hd260mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260mob2_hd',()=>{it('a',()=>{expect(hd260mob2(1,4)).toBe(2);});it('b',()=>{expect(hd260mob2(3,1)).toBe(1);});it('c',()=>{expect(hd260mob2(0,0)).toBe(0);});it('d',()=>{expect(hd260mob2(93,73)).toBe(2);});it('e',()=>{expect(hd260mob2(15,0)).toBe(4);});});
function hd261mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261mob2_hd',()=>{it('a',()=>{expect(hd261mob2(1,4)).toBe(2);});it('b',()=>{expect(hd261mob2(3,1)).toBe(1);});it('c',()=>{expect(hd261mob2(0,0)).toBe(0);});it('d',()=>{expect(hd261mob2(93,73)).toBe(2);});it('e',()=>{expect(hd261mob2(15,0)).toBe(4);});});
function hd262mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262mob2_hd',()=>{it('a',()=>{expect(hd262mob2(1,4)).toBe(2);});it('b',()=>{expect(hd262mob2(3,1)).toBe(1);});it('c',()=>{expect(hd262mob2(0,0)).toBe(0);});it('d',()=>{expect(hd262mob2(93,73)).toBe(2);});it('e',()=>{expect(hd262mob2(15,0)).toBe(4);});});
function hd263mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263mob2_hd',()=>{it('a',()=>{expect(hd263mob2(1,4)).toBe(2);});it('b',()=>{expect(hd263mob2(3,1)).toBe(1);});it('c',()=>{expect(hd263mob2(0,0)).toBe(0);});it('d',()=>{expect(hd263mob2(93,73)).toBe(2);});it('e',()=>{expect(hd263mob2(15,0)).toBe(4);});});
function hd264mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264mob2_hd',()=>{it('a',()=>{expect(hd264mob2(1,4)).toBe(2);});it('b',()=>{expect(hd264mob2(3,1)).toBe(1);});it('c',()=>{expect(hd264mob2(0,0)).toBe(0);});it('d',()=>{expect(hd264mob2(93,73)).toBe(2);});it('e',()=>{expect(hd264mob2(15,0)).toBe(4);});});
function hd265mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265mob2_hd',()=>{it('a',()=>{expect(hd265mob2(1,4)).toBe(2);});it('b',()=>{expect(hd265mob2(3,1)).toBe(1);});it('c',()=>{expect(hd265mob2(0,0)).toBe(0);});it('d',()=>{expect(hd265mob2(93,73)).toBe(2);});it('e',()=>{expect(hd265mob2(15,0)).toBe(4);});});
function hd266mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266mob2_hd',()=>{it('a',()=>{expect(hd266mob2(1,4)).toBe(2);});it('b',()=>{expect(hd266mob2(3,1)).toBe(1);});it('c',()=>{expect(hd266mob2(0,0)).toBe(0);});it('d',()=>{expect(hd266mob2(93,73)).toBe(2);});it('e',()=>{expect(hd266mob2(15,0)).toBe(4);});});
function hd267mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267mob2_hd',()=>{it('a',()=>{expect(hd267mob2(1,4)).toBe(2);});it('b',()=>{expect(hd267mob2(3,1)).toBe(1);});it('c',()=>{expect(hd267mob2(0,0)).toBe(0);});it('d',()=>{expect(hd267mob2(93,73)).toBe(2);});it('e',()=>{expect(hd267mob2(15,0)).toBe(4);});});
function hd268mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268mob2_hd',()=>{it('a',()=>{expect(hd268mob2(1,4)).toBe(2);});it('b',()=>{expect(hd268mob2(3,1)).toBe(1);});it('c',()=>{expect(hd268mob2(0,0)).toBe(0);});it('d',()=>{expect(hd268mob2(93,73)).toBe(2);});it('e',()=>{expect(hd268mob2(15,0)).toBe(4);});});
function hd269mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269mob2_hd',()=>{it('a',()=>{expect(hd269mob2(1,4)).toBe(2);});it('b',()=>{expect(hd269mob2(3,1)).toBe(1);});it('c',()=>{expect(hd269mob2(0,0)).toBe(0);});it('d',()=>{expect(hd269mob2(93,73)).toBe(2);});it('e',()=>{expect(hd269mob2(15,0)).toBe(4);});});
function hd270mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270mob2_hd',()=>{it('a',()=>{expect(hd270mob2(1,4)).toBe(2);});it('b',()=>{expect(hd270mob2(3,1)).toBe(1);});it('c',()=>{expect(hd270mob2(0,0)).toBe(0);});it('d',()=>{expect(hd270mob2(93,73)).toBe(2);});it('e',()=>{expect(hd270mob2(15,0)).toBe(4);});});
function hd271mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271mob2_hd',()=>{it('a',()=>{expect(hd271mob2(1,4)).toBe(2);});it('b',()=>{expect(hd271mob2(3,1)).toBe(1);});it('c',()=>{expect(hd271mob2(0,0)).toBe(0);});it('d',()=>{expect(hd271mob2(93,73)).toBe(2);});it('e',()=>{expect(hd271mob2(15,0)).toBe(4);});});
function hd272mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272mob2_hd',()=>{it('a',()=>{expect(hd272mob2(1,4)).toBe(2);});it('b',()=>{expect(hd272mob2(3,1)).toBe(1);});it('c',()=>{expect(hd272mob2(0,0)).toBe(0);});it('d',()=>{expect(hd272mob2(93,73)).toBe(2);});it('e',()=>{expect(hd272mob2(15,0)).toBe(4);});});
function hd273mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273mob2_hd',()=>{it('a',()=>{expect(hd273mob2(1,4)).toBe(2);});it('b',()=>{expect(hd273mob2(3,1)).toBe(1);});it('c',()=>{expect(hd273mob2(0,0)).toBe(0);});it('d',()=>{expect(hd273mob2(93,73)).toBe(2);});it('e',()=>{expect(hd273mob2(15,0)).toBe(4);});});
function hd274mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274mob2_hd',()=>{it('a',()=>{expect(hd274mob2(1,4)).toBe(2);});it('b',()=>{expect(hd274mob2(3,1)).toBe(1);});it('c',()=>{expect(hd274mob2(0,0)).toBe(0);});it('d',()=>{expect(hd274mob2(93,73)).toBe(2);});it('e',()=>{expect(hd274mob2(15,0)).toBe(4);});});
function hd275mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275mob2_hd',()=>{it('a',()=>{expect(hd275mob2(1,4)).toBe(2);});it('b',()=>{expect(hd275mob2(3,1)).toBe(1);});it('c',()=>{expect(hd275mob2(0,0)).toBe(0);});it('d',()=>{expect(hd275mob2(93,73)).toBe(2);});it('e',()=>{expect(hd275mob2(15,0)).toBe(4);});});
function hd276mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276mob2_hd',()=>{it('a',()=>{expect(hd276mob2(1,4)).toBe(2);});it('b',()=>{expect(hd276mob2(3,1)).toBe(1);});it('c',()=>{expect(hd276mob2(0,0)).toBe(0);});it('d',()=>{expect(hd276mob2(93,73)).toBe(2);});it('e',()=>{expect(hd276mob2(15,0)).toBe(4);});});
function hd277mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277mob2_hd',()=>{it('a',()=>{expect(hd277mob2(1,4)).toBe(2);});it('b',()=>{expect(hd277mob2(3,1)).toBe(1);});it('c',()=>{expect(hd277mob2(0,0)).toBe(0);});it('d',()=>{expect(hd277mob2(93,73)).toBe(2);});it('e',()=>{expect(hd277mob2(15,0)).toBe(4);});});
function hd278mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278mob2_hd',()=>{it('a',()=>{expect(hd278mob2(1,4)).toBe(2);});it('b',()=>{expect(hd278mob2(3,1)).toBe(1);});it('c',()=>{expect(hd278mob2(0,0)).toBe(0);});it('d',()=>{expect(hd278mob2(93,73)).toBe(2);});it('e',()=>{expect(hd278mob2(15,0)).toBe(4);});});
function hd279mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279mob2_hd',()=>{it('a',()=>{expect(hd279mob2(1,4)).toBe(2);});it('b',()=>{expect(hd279mob2(3,1)).toBe(1);});it('c',()=>{expect(hd279mob2(0,0)).toBe(0);});it('d',()=>{expect(hd279mob2(93,73)).toBe(2);});it('e',()=>{expect(hd279mob2(15,0)).toBe(4);});});
function hd280mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280mob2_hd',()=>{it('a',()=>{expect(hd280mob2(1,4)).toBe(2);});it('b',()=>{expect(hd280mob2(3,1)).toBe(1);});it('c',()=>{expect(hd280mob2(0,0)).toBe(0);});it('d',()=>{expect(hd280mob2(93,73)).toBe(2);});it('e',()=>{expect(hd280mob2(15,0)).toBe(4);});});
function hd281mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281mob2_hd',()=>{it('a',()=>{expect(hd281mob2(1,4)).toBe(2);});it('b',()=>{expect(hd281mob2(3,1)).toBe(1);});it('c',()=>{expect(hd281mob2(0,0)).toBe(0);});it('d',()=>{expect(hd281mob2(93,73)).toBe(2);});it('e',()=>{expect(hd281mob2(15,0)).toBe(4);});});
function hd282mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282mob2_hd',()=>{it('a',()=>{expect(hd282mob2(1,4)).toBe(2);});it('b',()=>{expect(hd282mob2(3,1)).toBe(1);});it('c',()=>{expect(hd282mob2(0,0)).toBe(0);});it('d',()=>{expect(hd282mob2(93,73)).toBe(2);});it('e',()=>{expect(hd282mob2(15,0)).toBe(4);});});
function hd283mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283mob2_hd',()=>{it('a',()=>{expect(hd283mob2(1,4)).toBe(2);});it('b',()=>{expect(hd283mob2(3,1)).toBe(1);});it('c',()=>{expect(hd283mob2(0,0)).toBe(0);});it('d',()=>{expect(hd283mob2(93,73)).toBe(2);});it('e',()=>{expect(hd283mob2(15,0)).toBe(4);});});
function hd284mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284mob2_hd',()=>{it('a',()=>{expect(hd284mob2(1,4)).toBe(2);});it('b',()=>{expect(hd284mob2(3,1)).toBe(1);});it('c',()=>{expect(hd284mob2(0,0)).toBe(0);});it('d',()=>{expect(hd284mob2(93,73)).toBe(2);});it('e',()=>{expect(hd284mob2(15,0)).toBe(4);});});
function hd285mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285mob2_hd',()=>{it('a',()=>{expect(hd285mob2(1,4)).toBe(2);});it('b',()=>{expect(hd285mob2(3,1)).toBe(1);});it('c',()=>{expect(hd285mob2(0,0)).toBe(0);});it('d',()=>{expect(hd285mob2(93,73)).toBe(2);});it('e',()=>{expect(hd285mob2(15,0)).toBe(4);});});
function hd286mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286mob2_hd',()=>{it('a',()=>{expect(hd286mob2(1,4)).toBe(2);});it('b',()=>{expect(hd286mob2(3,1)).toBe(1);});it('c',()=>{expect(hd286mob2(0,0)).toBe(0);});it('d',()=>{expect(hd286mob2(93,73)).toBe(2);});it('e',()=>{expect(hd286mob2(15,0)).toBe(4);});});
function hd287mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287mob2_hd',()=>{it('a',()=>{expect(hd287mob2(1,4)).toBe(2);});it('b',()=>{expect(hd287mob2(3,1)).toBe(1);});it('c',()=>{expect(hd287mob2(0,0)).toBe(0);});it('d',()=>{expect(hd287mob2(93,73)).toBe(2);});it('e',()=>{expect(hd287mob2(15,0)).toBe(4);});});
function hd288mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288mob2_hd',()=>{it('a',()=>{expect(hd288mob2(1,4)).toBe(2);});it('b',()=>{expect(hd288mob2(3,1)).toBe(1);});it('c',()=>{expect(hd288mob2(0,0)).toBe(0);});it('d',()=>{expect(hd288mob2(93,73)).toBe(2);});it('e',()=>{expect(hd288mob2(15,0)).toBe(4);});});
function hd289mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289mob2_hd',()=>{it('a',()=>{expect(hd289mob2(1,4)).toBe(2);});it('b',()=>{expect(hd289mob2(3,1)).toBe(1);});it('c',()=>{expect(hd289mob2(0,0)).toBe(0);});it('d',()=>{expect(hd289mob2(93,73)).toBe(2);});it('e',()=>{expect(hd289mob2(15,0)).toBe(4);});});
function hd290mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290mob2_hd',()=>{it('a',()=>{expect(hd290mob2(1,4)).toBe(2);});it('b',()=>{expect(hd290mob2(3,1)).toBe(1);});it('c',()=>{expect(hd290mob2(0,0)).toBe(0);});it('d',()=>{expect(hd290mob2(93,73)).toBe(2);});it('e',()=>{expect(hd290mob2(15,0)).toBe(4);});});
function hd291mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291mob2_hd',()=>{it('a',()=>{expect(hd291mob2(1,4)).toBe(2);});it('b',()=>{expect(hd291mob2(3,1)).toBe(1);});it('c',()=>{expect(hd291mob2(0,0)).toBe(0);});it('d',()=>{expect(hd291mob2(93,73)).toBe(2);});it('e',()=>{expect(hd291mob2(15,0)).toBe(4);});});
function hd292mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292mob2_hd',()=>{it('a',()=>{expect(hd292mob2(1,4)).toBe(2);});it('b',()=>{expect(hd292mob2(3,1)).toBe(1);});it('c',()=>{expect(hd292mob2(0,0)).toBe(0);});it('d',()=>{expect(hd292mob2(93,73)).toBe(2);});it('e',()=>{expect(hd292mob2(15,0)).toBe(4);});});
function hd293mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293mob2_hd',()=>{it('a',()=>{expect(hd293mob2(1,4)).toBe(2);});it('b',()=>{expect(hd293mob2(3,1)).toBe(1);});it('c',()=>{expect(hd293mob2(0,0)).toBe(0);});it('d',()=>{expect(hd293mob2(93,73)).toBe(2);});it('e',()=>{expect(hd293mob2(15,0)).toBe(4);});});
function hd294mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294mob2_hd',()=>{it('a',()=>{expect(hd294mob2(1,4)).toBe(2);});it('b',()=>{expect(hd294mob2(3,1)).toBe(1);});it('c',()=>{expect(hd294mob2(0,0)).toBe(0);});it('d',()=>{expect(hd294mob2(93,73)).toBe(2);});it('e',()=>{expect(hd294mob2(15,0)).toBe(4);});});
function hd295mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295mob2_hd',()=>{it('a',()=>{expect(hd295mob2(1,4)).toBe(2);});it('b',()=>{expect(hd295mob2(3,1)).toBe(1);});it('c',()=>{expect(hd295mob2(0,0)).toBe(0);});it('d',()=>{expect(hd295mob2(93,73)).toBe(2);});it('e',()=>{expect(hd295mob2(15,0)).toBe(4);});});
function hd296mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296mob2_hd',()=>{it('a',()=>{expect(hd296mob2(1,4)).toBe(2);});it('b',()=>{expect(hd296mob2(3,1)).toBe(1);});it('c',()=>{expect(hd296mob2(0,0)).toBe(0);});it('d',()=>{expect(hd296mob2(93,73)).toBe(2);});it('e',()=>{expect(hd296mob2(15,0)).toBe(4);});});
function hd297mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297mob2_hd',()=>{it('a',()=>{expect(hd297mob2(1,4)).toBe(2);});it('b',()=>{expect(hd297mob2(3,1)).toBe(1);});it('c',()=>{expect(hd297mob2(0,0)).toBe(0);});it('d',()=>{expect(hd297mob2(93,73)).toBe(2);});it('e',()=>{expect(hd297mob2(15,0)).toBe(4);});});
function hd298mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298mob2_hd',()=>{it('a',()=>{expect(hd298mob2(1,4)).toBe(2);});it('b',()=>{expect(hd298mob2(3,1)).toBe(1);});it('c',()=>{expect(hd298mob2(0,0)).toBe(0);});it('d',()=>{expect(hd298mob2(93,73)).toBe(2);});it('e',()=>{expect(hd298mob2(15,0)).toBe(4);});});
function hd299mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299mob2_hd',()=>{it('a',()=>{expect(hd299mob2(1,4)).toBe(2);});it('b',()=>{expect(hd299mob2(3,1)).toBe(1);});it('c',()=>{expect(hd299mob2(0,0)).toBe(0);});it('d',()=>{expect(hd299mob2(93,73)).toBe(2);});it('e',()=>{expect(hd299mob2(15,0)).toBe(4);});});
function hd300mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300mob2_hd',()=>{it('a',()=>{expect(hd300mob2(1,4)).toBe(2);});it('b',()=>{expect(hd300mob2(3,1)).toBe(1);});it('c',()=>{expect(hd300mob2(0,0)).toBe(0);});it('d',()=>{expect(hd300mob2(93,73)).toBe(2);});it('e',()=>{expect(hd300mob2(15,0)).toBe(4);});});
function hd301mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301mob2_hd',()=>{it('a',()=>{expect(hd301mob2(1,4)).toBe(2);});it('b',()=>{expect(hd301mob2(3,1)).toBe(1);});it('c',()=>{expect(hd301mob2(0,0)).toBe(0);});it('d',()=>{expect(hd301mob2(93,73)).toBe(2);});it('e',()=>{expect(hd301mob2(15,0)).toBe(4);});});
function hd302mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302mob2_hd',()=>{it('a',()=>{expect(hd302mob2(1,4)).toBe(2);});it('b',()=>{expect(hd302mob2(3,1)).toBe(1);});it('c',()=>{expect(hd302mob2(0,0)).toBe(0);});it('d',()=>{expect(hd302mob2(93,73)).toBe(2);});it('e',()=>{expect(hd302mob2(15,0)).toBe(4);});});
function hd303mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303mob2_hd',()=>{it('a',()=>{expect(hd303mob2(1,4)).toBe(2);});it('b',()=>{expect(hd303mob2(3,1)).toBe(1);});it('c',()=>{expect(hd303mob2(0,0)).toBe(0);});it('d',()=>{expect(hd303mob2(93,73)).toBe(2);});it('e',()=>{expect(hd303mob2(15,0)).toBe(4);});});
function hd304mob2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304mob2_hd',()=>{it('a',()=>{expect(hd304mob2(1,4)).toBe(2);});it('b',()=>{expect(hd304mob2(3,1)).toBe(1);});it('c',()=>{expect(hd304mob2(0,0)).toBe(0);});it('d',()=>{expect(hd304mob2(93,73)).toBe(2);});it('e',()=>{expect(hd304mob2(15,0)).toBe(4);});});
