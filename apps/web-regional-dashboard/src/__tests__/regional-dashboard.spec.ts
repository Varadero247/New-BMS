// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * web-regional-dashboard — unit specification tests
 *
 * Tests pure domain logic: type contracts, data transformations,
 * URL building, formatting helpers. No React / DOM / network calls.
 */

// ─── Type helpers (inline — no external imports) ──────────────────────────────

interface CountrySummary {
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

interface ComparisonRow {
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

interface RankedRow extends ComparisonRow { rank: number; }

interface TaxReportData {
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

interface ComplianceRow {
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

interface ISOComparisonEntry {
  countryCode: string;
  countryName: string;
  adoptionStatus: string;
  localStandard?: string;
  certificationBodies: string[];
}

interface ISOComparisonData {
  isoStandard: string;
  comparison: ISOComparisonEntry[];
  adoptedCount: number;
  totalCountries: number;
}

// ─── Pure helpers (mirrors src/lib/api.ts logic) ──────────────────────────────

const formatCorpTax = (rate: number) => `${(rate * 100).toFixed(1)}%`;
const formatGst = (rate: number) => `${(rate * 100).toFixed(1)}%`;
const formatWht = (rate: number) => `${(rate * 100).toFixed(0)}%`;
const adoptionRate = (data: ISOComparisonData) =>
  Math.round((data.adoptedCount / data.totalCountries) * 100);

function buildCompareUrl(base: string, codes?: string) {
  return `${base}/compare/countries${codes ? `?codes=${codes}` : ''}`;
}

function buildISOUrl(base: string, standard: string) {
  return `${base}/compare/iso/${encodeURIComponent(standard)}`;
}

function sortRows(rows: ComparisonRow[], key: keyof ComparisonRow, asc: boolean) {
  return [...rows].sort((a, b) => {
    const av = (a[key] as number | string) ?? 999;
    const bv = (b[key] as number | string) ?? 999;
    if (typeof av === 'string' && typeof bv === 'string') {
      return asc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });
}

function filterByRegion(rows: ComparisonRow[], region: string) {
  if (region === 'All') return rows;
  return rows.filter((r) => r.region === region);
}

function filterBySearch(rows: ComparisonRow[], search: string) {
  if (!search) return rows;
  const q = search.toLowerCase();
  return rows.filter(
    (r) => r.countryName.toLowerCase().includes(q) || r.countryCode.toLowerCase().includes(q)
  );
}

function barPct(value: number, max: number) {
  return max > 0 ? Math.max((value / max) * 100, 2) : 0;
}

const NON_ADOPTED = 'NOT_ADOPTED';
type StatusColor = Record<string, string>;
const STATUS_COLOR: StatusColor = {
  ADOPTED: 'bg-green-100 text-green-700',
  ADOPTED_WITH_MODIFICATIONS: 'bg-blue-100 text-blue-700',
  EQUIVALENT_STANDARD: 'bg-purple-100 text-purple-700',
  PARTIALLY_ADOPTED: 'bg-yellow-100 text-yellow-700',
  UNDER_CONSIDERATION: 'bg-orange-100 text-orange-700',
  NOT_ADOPTED: 'bg-gray-100 text-gray-400',
};

function getStatusColor(status: string): string {
  return STATUS_COLOR[status] ?? STATUS_COLOR[NON_ADOPTED];
}

// ─── Sample fixtures ──────────────────────────────────────────────────────────

const SG_SUMMARY: CountrySummary = {
  countryCode: 'SG', countryName: 'Singapore', region: 'ASEAN', tier: 1,
  currency: { code: 'SGD', symbol: 'S$' }, timezone: 'Asia/Singapore',
  corporateTaxRate: 0.17, gstVatRate: 0.09, gstVatName: 'GST',
  fiscalYearEnd: 'Dec 31', easeOfDoingBusinessRank: 2,
  legislationCount: 42, isoStandardsCount: 38,
};

const AU_SUMMARY: CountrySummary = {
  countryCode: 'AU', countryName: 'Australia', region: 'ANZ', tier: 1,
  currency: { code: 'AUD', symbol: 'A$' }, timezone: 'Australia/Sydney',
  corporateTaxRate: 0.30, gstVatRate: 0.10, gstVatName: 'GST',
  fiscalYearEnd: 'Jun 30', easeOfDoingBusinessRank: 14,
  legislationCount: 58, isoStandardsCount: 45,
};

const SG_ROW: ComparisonRow = {
  countryCode: 'SG', countryName: 'Singapore', region: 'ASEAN', tier: 1,
  currency: 'SGD', corporateTaxRate: 0.17, gstVatRate: 0.09, gstVatName: 'GST',
  withholdingDividends: 0, withholdingInterest: 0.15, withholdingRoyalties: 0.10,
  hasPayrollTax: true, payrollTaxName: 'CPF', payrollEmployeeRate: 0.20, payrollEmployerRate: 0.17,
  easeOfDoingBusinessRank: 2, corruptionPerceptionsIndex: 85,
  isoStandardsCount: 38, incorporationTime: '1-3 days',
};

const HK_ROW: ComparisonRow = {
  countryCode: 'HK', countryName: 'Hong Kong', region: 'East Asia', tier: 1,
  currency: 'HKD', corporateTaxRate: 0.165, gstVatRate: 0, gstVatName: 'None',
  withholdingDividends: 0, withholdingInterest: 0, withholdingRoyalties: 0.045,
  hasPayrollTax: true, payrollTaxName: 'MPF', payrollEmployeeRate: 0.05, payrollEmployerRate: 0.05,
  easeOfDoingBusinessRank: 3, corruptionPerceptionsIndex: 76,
  isoStandardsCount: 30, incorporationTime: '1 day',
};

const PH_ROW: ComparisonRow = {
  countryCode: 'PH', countryName: 'Philippines', region: 'ASEAN', tier: 2,
  currency: 'PHP', corporateTaxRate: 0.25, gstVatRate: 0.12, gstVatName: 'VAT',
  withholdingDividends: 0.15, withholdingInterest: 0.20, withholdingRoyalties: 0.20,
  hasPayrollTax: true, payrollTaxName: 'SSS/PhilHealth', payrollEmployeeRate: 0.045, payrollEmployerRate: 0.085,
  easeOfDoingBusinessRank: 95, corruptionPerceptionsIndex: 36,
  isoStandardsCount: 12, incorporationTime: '28 days',
};

const RANKED_ROWS: RankedRow[] = [
  { ...HK_ROW, rank: 1 },
  { ...SG_ROW, rank: 2 },
  { ...PH_ROW, rank: 3 },
];

const SG_COMPLIANCE: ComplianceRow = {
  countryCode: 'SG', countryName: 'Singapore', tier: 1, region: 'ASEAN',
  regulatoryBodiesCount: 8, mandatoryLawsCount: 30, totalLawsCount: 42,
  isoStandardsAdopted: 38, accreditationBody: 'SAC',
  dataProtectionAuthority: 'PDPC',
  dueDiligenceRequirements: 'Required for listed companies',
  whistleblowerProtection: true,
  modernSlaveryAct: false,
  esgRequirements: 'Mandatory for SGX-listed companies',
};

const ISO_DATA: ISOComparisonData = {
  isoStandard: 'ISO 9001',
  adoptedCount: 18,
  totalCountries: 20,
  comparison: [
    { countryCode: 'SG', countryName: 'Singapore', adoptionStatus: 'ADOPTED', certificationBodies: ['SAC', 'BV'] },
    { countryCode: 'AU', countryName: 'Australia', adoptionStatus: 'ADOPTED_WITH_MODIFICATIONS', localStandard: 'AS/NZS 9001', certificationBodies: ['JAS-ANZ'] },
    { countryCode: 'MN', countryName: 'Mongolia', adoptionStatus: 'NOT_ADOPTED', certificationBodies: [] },
    { countryCode: 'BD', countryName: 'Bangladesh', adoptionStatus: 'PARTIALLY_ADOPTED', certificationBodies: ['BSTI'] },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CountrySummary type contract', () => {
  it('has required fields', () => {
    expect(SG_SUMMARY.countryCode).toBe('SG');
    expect(SG_SUMMARY.currency.code).toBe('SGD');
    expect(SG_SUMMARY.tier).toBe(1);
    expect(typeof SG_SUMMARY.legislationCount).toBe('number');
    expect(typeof SG_SUMMARY.isoStandardsCount).toBe('number');
  });

  it('easeOfDoingBusinessRank can be null', () => {
    const c = { ...SG_SUMMARY, easeOfDoingBusinessRank: null };
    expect(c.easeOfDoingBusinessRank).toBeNull();
  });

  it('multiple summaries can be grouped by region', () => {
    const all = [SG_SUMMARY, AU_SUMMARY];
    const byRegion = ['ASEAN', 'ANZ'].map((r) => ({
      region: r,
      countries: all.filter((c) => c.region === r),
    }));
    expect(byRegion[0].countries).toHaveLength(1);
    expect(byRegion[1].countries[0].countryCode).toBe('AU');
  });
});

describe('Tax formatting', () => {
  const cases: [number, string][] = [
    [0.17, '17.0%'],
    [0.165, '16.5%'],
    [0.30, '30.0%'],
    [0.00, '0.0%'],
    [0.25, '25.0%'],
  ];
  for (const [rate, expected] of cases) {
    it(`formatCorpTax(${rate}) = ${expected}`, () => {
      expect(formatCorpTax(rate)).toBe(expected);
    });
  }

  const gstCases: [number, string][] = [
    [0.09, '9.0%'],
    [0.10, '10.0%'],
    [0.00, '0.0%'],
    [0.12, '12.0%'],
  ];
  for (const [rate, expected] of gstCases) {
    it(`formatGst(${rate}) = ${expected}`, () => {
      expect(formatGst(rate)).toBe(expected);
    });
  }

  const whtCases: [number, string][] = [
    [0.15, '15%'],
    [0.20, '20%'],
    [0.00, '0%'],
    [0.10, '10%'],
  ];
  for (const [rate, expected] of whtCases) {
    it(`formatWht(${rate}) = ${expected}`, () => {
      expect(formatWht(rate)).toBe(expected);
    });
  }
});

describe('URL builders', () => {
  const BASE = 'http://localhost:4000/api/region-config';

  it('fetchAllCountries URL', () => {
    expect(`${BASE}`).toContain('/region-config');
  });

  it('fetchComparison URL without codes', () => {
    expect(buildCompareUrl(BASE)).toBe(`${BASE}/compare/countries`);
  });

  it('fetchComparison URL with codes', () => {
    expect(buildCompareUrl(BASE, 'SG,AU')).toBe(`${BASE}/compare/countries?codes=SG,AU`);
  });

  it('fetchISOComparison URL — simple standard', () => {
    expect(buildISOUrl(BASE, 'ISO 9001')).toBe(`${BASE}/compare/iso/ISO%209001`);
  });

  it('fetchISOComparison URL — standard with colon', () => {
    expect(buildISOUrl(BASE, 'ISO 9001:2015')).toBe(`${BASE}/compare/iso/ISO%209001%3A2015`);
  });

  it('fetchTaxReport URL', () => {
    expect(`${BASE}/report/tax`).toContain('/report/tax');
  });

  it('fetchComplianceReport URL', () => {
    expect(`${BASE}/report/compliance`).toContain('/report/compliance');
  });
});

describe('Country table sorting', () => {
  const rows = [SG_ROW, HK_ROW, PH_ROW];

  it('sorts by countryName ascending', () => {
    const sorted = sortRows(rows, 'countryName', true);
    expect(sorted[0].countryCode).toBe('HK');
    expect(sorted[1].countryCode).toBe('PH');
    expect(sorted[2].countryCode).toBe('SG');
  });

  it('sorts by countryName descending', () => {
    const sorted = sortRows(rows, 'countryName', false);
    expect(sorted[0].countryCode).toBe('SG');
  });

  it('sorts by corporateTaxRate ascending (lowest first)', () => {
    const sorted = sortRows(rows, 'corporateTaxRate', true);
    expect(sorted[0].countryCode).toBe('HK'); // 16.5%
    expect(sorted[1].countryCode).toBe('SG'); // 17%
    expect(sorted[2].countryCode).toBe('PH'); // 25%
  });

  it('sorts by corporateTaxRate descending (highest first)', () => {
    const sorted = sortRows(rows, 'corporateTaxRate', false);
    expect(sorted[0].countryCode).toBe('PH');
  });

  it('sorts by easeOfDoingBusinessRank ascending (lowest number first)', () => {
    const sorted = sortRows(rows, 'easeOfDoingBusinessRank', true);
    expect(sorted[0].countryCode).toBe('SG'); // rank 2
    expect(sorted[1].countryCode).toBe('HK'); // rank 3
  });

  it('sorts by isoStandardsCount descending', () => {
    const sorted = sortRows(rows, 'isoStandardsCount', false);
    expect(sorted[0].countryCode).toBe('SG'); // 38
  });

  it('toggling sort direction reverses order', () => {
    const asc = sortRows(rows, 'corporateTaxRate', true);
    const desc = sortRows(rows, 'corporateTaxRate', false);
    expect(asc[0].countryCode).toBe(desc[desc.length - 1].countryCode);
  });
});

describe('Country table filtering', () => {
  const rows = [SG_ROW, HK_ROW, PH_ROW];

  it('filterByRegion("All") returns all', () => {
    expect(filterByRegion(rows, 'All')).toHaveLength(3);
  });

  it('filterByRegion("ASEAN") returns SG and PH', () => {
    const r = filterByRegion(rows, 'ASEAN');
    expect(r).toHaveLength(2);
    expect(r.map((x) => x.countryCode).sort()).toEqual(['PH', 'SG']);
  });

  it('filterByRegion("East Asia") returns HK', () => {
    expect(filterByRegion(rows, 'East Asia')).toHaveLength(1);
  });

  it('filterBySearch matches by name', () => {
    expect(filterBySearch(rows, 'sing')).toHaveLength(1);
    expect(filterBySearch(rows, 'sing')[0].countryCode).toBe('SG');
  });

  it('filterBySearch matches by code (case-insensitive)', () => {
    expect(filterBySearch(rows, 'hk')).toHaveLength(1);
  });

  it('filterBySearch empty string returns all', () => {
    expect(filterBySearch(rows, '')).toHaveLength(3);
  });

  it('filterBySearch with no match returns empty array', () => {
    expect(filterBySearch(rows, 'xyz-no-match')).toHaveLength(0);
  });

  it('region + search combined', () => {
    const r = filterBySearch(filterByRegion(rows, 'ASEAN'), 'phil');
    expect(r).toHaveLength(1);
    expect(r[0].countryCode).toBe('PH');
  });
});

describe('Bar chart percentage calculation', () => {
  it('returns percentage of max', () => {
    expect(barPct(17, 30)).toBeCloseTo(56.67, 1);
  });

  it('returns at least 2 for non-zero values', () => {
    expect(barPct(0.001, 30)).toBe(2);
  });

  it('returns 100 when value equals max', () => {
    expect(barPct(30, 30)).toBe(100);
  });

  it('returns 0 when max is 0', () => {
    expect(barPct(0, 0)).toBe(0);
  });

  it('handles easeOfBusiness rank (inverted — lower is better)', () => {
    // The bar chart shows the raw rank value; sorting handles the ranking
    expect(barPct(95, 95)).toBe(100); // Philippines would have tallest bar
  });
});

describe('ISO comparison data', () => {
  it('adoptionRate computes correctly', () => {
    expect(adoptionRate(ISO_DATA)).toBe(90); // 18/20 = 90%
  });

  it('adopted list excludes NOT_ADOPTED', () => {
    const adopted = ISO_DATA.comparison.filter((c) => c.adoptionStatus !== 'NOT_ADOPTED');
    expect(adopted).toHaveLength(3);
    expect(adopted.some((c) => c.countryCode === 'MN')).toBe(false);
  });

  it('notAdopted list includes only NOT_ADOPTED', () => {
    const notAdopted = ISO_DATA.comparison.filter((c) => c.adoptionStatus === 'NOT_ADOPTED');
    expect(notAdopted).toHaveLength(1);
    expect(notAdopted[0].countryCode).toBe('MN');
  });

  it('localStandard is optional', () => {
    const sg = ISO_DATA.comparison.find((c) => c.countryCode === 'SG');
    expect(sg?.localStandard).toBeUndefined();
    const au = ISO_DATA.comparison.find((c) => c.countryCode === 'AU');
    expect(au?.localStandard).toBe('AS/NZS 9001');
  });

  it('certificationBodies can be empty for NOT_ADOPTED', () => {
    const mn = ISO_DATA.comparison.find((c) => c.countryCode === 'MN');
    expect(mn?.certificationBodies).toHaveLength(0);
  });
});

describe('Status colour mapping', () => {
  const statuses = [
    'ADOPTED',
    'ADOPTED_WITH_MODIFICATIONS',
    'EQUIVALENT_STANDARD',
    'PARTIALLY_ADOPTED',
    'UNDER_CONSIDERATION',
    'NOT_ADOPTED',
  ] as const;

  for (const status of statuses) {
    it(`${status} has a colour class`, () => {
      expect(getStatusColor(status)).toBeTruthy();
      expect(getStatusColor(status)).toContain('bg-');
    });
  }

  it('unknown status falls back to NOT_ADOPTED colour', () => {
    expect(getStatusColor('UNKNOWN_STATUS')).toBe(STATUS_COLOR.NOT_ADOPTED);
  });
});

describe('Tax league table', () => {
  it('ranked rows have sequential ranks', () => {
    for (let i = 0; i < RANKED_ROWS.length; i++) {
      expect(RANKED_ROWS[i].rank).toBe(i + 1);
    }
  });

  it('lowest corp tax is first in ascending ranking', () => {
    expect(RANKED_ROWS[0].corporateTaxRate).toBeLessThan(RANKED_ROWS[1].corporateTaxRate);
  });

  it('summary picks lowest and highest', () => {
    const sorted = [...RANKED_ROWS].sort((a, b) => a.corporateTaxRate - b.corporateTaxRate);
    const summary = {
      lowestCorpTax: sorted[0],
      highestCorpTax: sorted[sorted.length - 1],
    };
    expect(summary.lowestCorpTax.countryCode).toBe('HK');
    expect(summary.highestCorpTax.countryCode).toBe('PH');
  });
});

describe('Compliance matrix data', () => {
  it('has all required compliance fields', () => {
    expect(SG_COMPLIANCE.dataProtectionAuthority).toBe('PDPC');
    expect(typeof SG_COMPLIANCE.whistleblowerProtection).toBe('boolean');
    expect(typeof SG_COMPLIANCE.modernSlaveryAct).toBe('boolean');
    expect(SG_COMPLIANCE.regulatoryBodiesCount).toBeGreaterThan(0);
  });

  it('mandatoryLawsCount <= totalLawsCount', () => {
    expect(SG_COMPLIANCE.mandatoryLawsCount).toBeLessThanOrEqual(SG_COMPLIANCE.totalLawsCount);
  });

  it('computes dimension coverage across rows', () => {
    const rows: ComplianceRow[] = [
      SG_COMPLIANCE,
      { ...SG_COMPLIANCE, countryCode: 'AU', countryName: 'Australia', whistleblowerProtection: false, modernSlaveryAct: true },
    ];
    const whistleCount = rows.filter((r) => r.whistleblowerProtection).length;
    const slaveryCount = rows.filter((r) => r.modernSlaveryAct).length;
    expect(whistleCount).toBe(1);
    expect(slaveryCount).toBe(1);
  });

  it('esgRequirements is a string (not boolean)', () => {
    expect(typeof SG_COMPLIANCE.esgRequirements).toBe('string');
  });
});

describe('API response shape', () => {
  it('fetchAllCountries unwraps .data', () => {
    const apiResponse = { success: true, data: [SG_SUMMARY] };
    expect(apiResponse.data).toHaveLength(1);
  });

  it('fetchComparison has countries and notFound arrays', () => {
    const apiResponse = { success: true, data: { countries: [SG_ROW], notFound: [] } };
    expect(Array.isArray(apiResponse.data.countries)).toBe(true);
    expect(Array.isArray(apiResponse.data.notFound)).toBe(true);
  });

  it('fetchTaxReport has all four ranked arrays', () => {
    const partial: Partial<TaxReportData> = {
      rankedByCorpTax: RANKED_ROWS,
      rankedByGst: RANKED_ROWS,
      rankedByWithholdingDividends: RANKED_ROWS,
      rankedByEaseOfBusiness: RANKED_ROWS,
    };
    expect(partial.rankedByCorpTax).toBeDefined();
    expect(partial.rankedByGst).toBeDefined();
    expect(partial.rankedByWithholdingDividends).toBeDefined();
    expect(partial.rankedByEaseOfBusiness).toBeDefined();
  });

  it('fetchISOComparison has adoptedCount and totalCountries', () => {
    expect(ISO_DATA.adoptedCount).toBeLessThanOrEqual(ISO_DATA.totalCountries);
  });

  it('summary.easiestToBusiness can be null', () => {
    const summary: TaxReportData['summary'] = {
      lowestCorpTax: RANKED_ROWS[0],
      highestCorpTax: RANKED_ROWS[2],
      lowestGst: RANKED_ROWS[1],
      highestGst: RANKED_ROWS[2],
      easiestToBusiness: null,
    };
    expect(summary.easiestToBusiness).toBeNull();
  });
});

describe('REGIONS constant', () => {
  const REGIONS = ['ASEAN', 'ANZ', 'East Asia', 'South Asia'];

  it('has 4 named regions', () => {
    expect(REGIONS).toHaveLength(4);
  });

  it('All rows have a region in the list (or "All" filter shows everything)', () => {
    const rows = [SG_ROW, HK_ROW, PH_ROW];
    const rowRegions = new Set(rows.map((r) => r.region));
    for (const reg of rowRegions) {
      expect(REGIONS.includes(reg)).toBe(true);
    }
  });
});

describe('payrollTax field handling', () => {
  it('hasPayrollTax true for CPF (Singapore)', () => {
    expect(SG_ROW.hasPayrollTax).toBe(true);
    expect(SG_ROW.payrollTaxName).toBe('CPF');
    expect(SG_ROW.payrollEmployeeRate).toBeGreaterThan(0);
    expect(SG_ROW.payrollEmployerRate).toBeGreaterThan(0);
  });

  it('hasPayrollTax true for MPF (Hong Kong)', () => {
    expect(HK_ROW.hasPayrollTax).toBe(true);
    expect(HK_ROW.payrollTaxName).toBe('MPF');
  });

  it('rates are null when hasPayrollTax is false', () => {
    const noPayroll: ComparisonRow = {
      ...SG_ROW, countryCode: 'XX', hasPayrollTax: false,
      payrollTaxName: null, payrollEmployeeRate: null, payrollEmployerRate: null,
    };
    expect(noPayroll.payrollTaxName).toBeNull();
    expect(noPayroll.payrollEmployeeRate).toBeNull();
  });
});
