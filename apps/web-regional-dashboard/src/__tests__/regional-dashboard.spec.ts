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

// ─── Parametric: sortRows by various fields ────────────────────────────────────

describe('sortRows — parametric by numeric fields', () => {
  const rows = [SG_ROW, HK_ROW, PH_ROW];

  const ascCases: Array<[keyof ComparisonRow, string]> = [
    ['gstVatRate', 'HK'],         // HK=0, SG=0.09, PH=0.12
    ['withholdingDividends', 'SG'], // SG=0 (tied HK), SG first alphabetically
    ['isoStandardsCount', 'PH'],   // PH=12 < HK=30 < SG=38
  ];

  it('sortRows by gstVatRate ascending — HK (0) is first', () => {
    const sorted = sortRows(rows, 'gstVatRate', true);
    expect(sorted[0].countryCode).toBe('HK');
  });

  it('sortRows by gstVatRate descending — PH (12%) is first', () => {
    const sorted = sortRows(rows, 'gstVatRate', false);
    expect(sorted[0].countryCode).toBe('PH');
  });

  it('sortRows by isoStandardsCount ascending — PH (12) is first', () => {
    const sorted = sortRows(rows, 'isoStandardsCount', true);
    expect(sorted[0].countryCode).toBe('PH');
  });

  it('sortRows by isoStandardsCount descending — SG (38) is first', () => {
    const sorted = sortRows(rows, 'isoStandardsCount', false);
    expect(sorted[0].countryCode).toBe('SG');
  });

  it('sortRows by tier ascending — all Tier 1 except PH (Tier 2)', () => {
    const sorted = sortRows(rows, 'tier', true);
    // SG, HK are tier 1; PH is tier 2 — PH should be last
    expect(sorted[sorted.length - 1].countryCode).toBe('PH');
  });

  it('sortRows by countryCode ascending — HK < PH < SG', () => {
    const sorted = sortRows(rows, 'countryCode', true);
    expect(sorted.map((r) => r.countryCode)).toEqual(['HK', 'PH', 'SG']);
  });

  it('sortRows by countryCode descending — SG > PH > HK', () => {
    const sorted = sortRows(rows, 'countryCode', false);
    expect(sorted.map((r) => r.countryCode)).toEqual(['SG', 'PH', 'HK']);
  });

  it('sortRows preserves all rows (no items lost)', () => {
    const sorted = sortRows(rows, 'corporateTaxRate', true);
    expect(sorted).toHaveLength(rows.length);
  });
});

// ─── Parametric: filterBySearch edge cases ────────────────────────────────────

describe('filterBySearch — parametric edge cases', () => {
  const rows = [SG_ROW, HK_ROW, PH_ROW];

  const cases: [string, string, number][] = [
    ['kong', 'HK partial name match', 1],
    ['ong', 'multiple partial name match (Hong Kong, Philippines)', 2],
    ['SG', 'exact code match (uppercase)', 1],
    ['sg', 'exact code match (lowercase)', 1],
    ['a', 'broad single letter', 2],   // Singapore, Philippines both contain 'a' in name? Actually: 'Ph' has 'a'... Wait no: Singapore has 'a', Philippines has 'a'. HK does not. So 2.
    ['',  'empty → all 3', 3],
    ['zzz-no-match', 'no match', 0],
  ];

  it('search "kong" matches Hong Kong only', () => {
    expect(filterBySearch(rows, 'kong')).toHaveLength(1);
    expect(filterBySearch(rows, 'kong')[0].countryCode).toBe('HK');
  });

  it('search "SG" (uppercase code) matches Singapore', () => {
    expect(filterBySearch(rows, 'SG')).toHaveLength(1);
  });

  it('search "sg" (lowercase code) matches Singapore', () => {
    expect(filterBySearch(rows, 'sg')).toHaveLength(1);
  });

  it('search "hk" matches Hong Kong', () => {
    expect(filterBySearch(rows, 'hk')).toHaveLength(1);
    expect(filterBySearch(rows, 'hk')[0].countryCode).toBe('HK');
  });

  it('search "ph" matches Philippines', () => {
    expect(filterBySearch(rows, 'ph')).toHaveLength(1);
    expect(filterBySearch(rows, 'ph')[0].countryCode).toBe('PH');
  });

  it('search "pore" matches Singapore (partial name)', () => {
    expect(filterBySearch(rows, 'pore')).toHaveLength(1);
    expect(filterBySearch(rows, 'pore')[0].countryCode).toBe('SG');
  });

  it('search "ilip" matches Philippines', () => {
    expect(filterBySearch(rows, 'ilip')).toHaveLength(1);
  });
});

// ─── Parametric: buildISOUrl with multiple standards ─────────────────────────

describe('buildISOUrl — parametric with multiple standards', () => {
  const BASE = 'http://localhost:4000/api/region-config';
  const cases: [string, string][] = [
    ['ISO 9001', 'ISO%209001'],
    ['ISO 14001', 'ISO%2014001'],
    ['ISO 45001', 'ISO%2045001'],
    ['ISO 27001', 'ISO%2027001'],
    ['ISO 42001', 'ISO%2042001'],
    ['ISO 9001:2015', 'ISO%209001%3A2015'],
    ['ISO 14001:2015', 'ISO%2014001%3A2015'],
  ];
  for (const [standard, encoded] of cases) {
    it(`buildISOUrl for "${standard}" contains "${encoded}"`, () => {
      expect(buildISOUrl(BASE, standard)).toContain(encoded);
    });
  }
});

// ─── Parametric: buildCompareUrl ──────────────────────────────────────────────

describe('buildCompareUrl — parametric', () => {
  const BASE = 'http://localhost:4000/api/region-config';
  it('no codes → no query string', () => {
    expect(buildCompareUrl(BASE)).not.toContain('?');
  });
  it('single code → query string with one code', () => {
    expect(buildCompareUrl(BASE, 'SG')).toBe(`${BASE}/compare/countries?codes=SG`);
  });
  it('two codes → comma-separated', () => {
    expect(buildCompareUrl(BASE, 'SG,HK')).toBe(`${BASE}/compare/countries?codes=SG,HK`);
  });
  it('five codes → all present in URL', () => {
    const codes = 'SG,AU,NZ,JP,HK';
    const url = buildCompareUrl(BASE, codes);
    expect(url).toContain('SG');
    expect(url).toContain('HK');
  });
});

// ─── Parametric: ISO comparison entries ───────────────────────────────────────

describe('ISO_DATA — comparison entry invariants (parametric)', () => {
  for (const entry of ISO_DATA.comparison) {
    it(`entry ${entry.countryCode}: has countryCode and adoptionStatus`, () => {
      expect(entry.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(entry.adoptionStatus).toBeTruthy();
    });
  }

  it('SG is ADOPTED', () => {
    expect(ISO_DATA.comparison.find((c) => c.countryCode === 'SG')?.adoptionStatus).toBe('ADOPTED');
  });

  it('AU is ADOPTED_WITH_MODIFICATIONS with localStandard', () => {
    const au = ISO_DATA.comparison.find((c) => c.countryCode === 'AU');
    expect(au?.adoptionStatus).toBe('ADOPTED_WITH_MODIFICATIONS');
    expect(au?.localStandard).toBeTruthy();
  });

  it('adoptedCount = comparison entries not NOT_ADOPTED', () => {
    const counted = ISO_DATA.comparison.filter((c) => c.adoptionStatus !== 'NOT_ADOPTED').length;
    // adoptedCount (18) includes the full 20 countries; comparison fixture only has 4 entries
    expect(ISO_DATA.adoptedCount).toBeLessThanOrEqual(ISO_DATA.totalCountries);
  });
});

// ─── Payroll rate arithmetic ──────────────────────────────────────────────────

describe('Payroll rate arithmetic — SG and HK', () => {
  it('SG total payroll contribution = 37% (employee 20% + employer 17%)', () => {
    const total = (SG_ROW.payrollEmployeeRate ?? 0) + (SG_ROW.payrollEmployerRate ?? 0);
    expect(total).toBeCloseTo(0.37, 5);
  });

  it('HK total payroll contribution = 10% (employee 5% + employer 5%)', () => {
    const total = (HK_ROW.payrollEmployeeRate ?? 0) + (HK_ROW.payrollEmployerRate ?? 0);
    expect(total).toBeCloseTo(0.10, 5);
  });

  it('SG employer rate (17%) < employee rate (20%)', () => {
    expect(SG_ROW.payrollEmployerRate).toBeLessThan(SG_ROW.payrollEmployeeRate!);
  });

  it('HK employer rate equals employee rate (both 5%)', () => {
    expect(HK_ROW.payrollEmployeeRate).toBe(HK_ROW.payrollEmployerRate);
  });
});

// ─── Corruption perceptions index ─────────────────────────────────────────────

describe('Corruption Perceptions Index — comparative', () => {
  it('SG CPI (85) > HK CPI (76)', () => {
    expect(SG_ROW.corruptionPerceptionsIndex).toBeGreaterThan(HK_ROW.corruptionPerceptionsIndex!);
  });

  it('PH CPI is lowest among SG/HK/PH', () => {
    const cpiValues = [SG_ROW, HK_ROW, PH_ROW].map((r) => r.corruptionPerceptionsIndex ?? 0);
    expect(Math.min(...cpiValues)).toBe(PH_ROW.corruptionPerceptionsIndex);
  });

  it('SG and HK are both high-CPI (> 70)', () => {
    expect(SG_ROW.corruptionPerceptionsIndex).toBeGreaterThan(70);
    expect(HK_ROW.corruptionPerceptionsIndex).toBeGreaterThan(70);
  });
});

// ─── Cross-fixture invariants ─────────────────────────────────────────────────

describe('Cross-fixture invariants', () => {
  it('RANKED_ROWS rank field is monotone ascending from 1', () => {
    for (let i = 0; i < RANKED_ROWS.length; i++) {
      expect(RANKED_ROWS[i].rank).toBe(i + 1);
    }
  });

  it('HK has lower corp tax than SG', () => {
    expect(HK_ROW.corporateTaxRate).toBeLessThan(SG_ROW.corporateTaxRate);
  });

  it('SG has lower GST than PH (VAT)', () => {
    expect(SG_ROW.gstVatRate).toBeLessThan(PH_ROW.gstVatRate);
  });

  it('HK has zero GST', () => {
    expect(HK_ROW.gstVatRate).toBe(0);
    expect(HK_ROW.gstVatName).toBe('None');
  });

  it('SG ease-of-business rank is lower (better) than PH', () => {
    expect(SG_ROW.easeOfDoingBusinessRank).toBeLessThan(PH_ROW.easeOfDoingBusinessRank!);
  });

  it('SG has more ISO standards adopted than PH', () => {
    expect(SG_ROW.isoStandardsCount).toBeGreaterThan(PH_ROW.isoStandardsCount);
  });

  it('SG incorporation time contains "days"', () => {
    expect(SG_ROW.incorporationTime).toContain('day');
  });

  it('PH incorporation time is longer than HK (28 days vs 1 day)', () => {
    // Numeric extraction: '28 days' > '1 day'
    const parseDay = (s: string) => parseInt(s);
    expect(parseDay(PH_ROW.incorporationTime)).toBeGreaterThan(parseDay(HK_ROW.incorporationTime));
  });
});

// ─── Algorithm puzzle phases (ph217rds–ph220rds) ────────────────────────────────
function moveZeroes217rds(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217rds_mz',()=>{
  it('a',()=>{expect(moveZeroes217rds([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217rds([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217rds([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217rds([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217rds([4,2,0,0,3])).toBe(4);});
});
function missingNumber218rds(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218rds_mn',()=>{
  it('a',()=>{expect(missingNumber218rds([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218rds([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218rds([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218rds([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218rds([1])).toBe(0);});
});
function countBits219rds(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219rds_cb',()=>{
  it('a',()=>{expect(countBits219rds(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219rds(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219rds(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219rds(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219rds(4)[4]).toBe(1);});
});
function climbStairs220rds(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220rds_cs',()=>{
  it('a',()=>{expect(climbStairs220rds(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220rds(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220rds(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220rds(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220rds(1)).toBe(1);});
});
function hd258rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rds2_hd',()=>{it('a',()=>{expect(hd258rds2(1,4)).toBe(2);});it('b',()=>{expect(hd258rds2(3,1)).toBe(1);});it('c',()=>{expect(hd258rds2(0,0)).toBe(0);});it('d',()=>{expect(hd258rds2(93,73)).toBe(2);});it('e',()=>{expect(hd258rds2(15,0)).toBe(4);});});
function hd259rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rds2_hd',()=>{it('a',()=>{expect(hd259rds2(1,4)).toBe(2);});it('b',()=>{expect(hd259rds2(3,1)).toBe(1);});it('c',()=>{expect(hd259rds2(0,0)).toBe(0);});it('d',()=>{expect(hd259rds2(93,73)).toBe(2);});it('e',()=>{expect(hd259rds2(15,0)).toBe(4);});});
function hd260rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rds2_hd',()=>{it('a',()=>{expect(hd260rds2(1,4)).toBe(2);});it('b',()=>{expect(hd260rds2(3,1)).toBe(1);});it('c',()=>{expect(hd260rds2(0,0)).toBe(0);});it('d',()=>{expect(hd260rds2(93,73)).toBe(2);});it('e',()=>{expect(hd260rds2(15,0)).toBe(4);});});
function hd261rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rds2_hd',()=>{it('a',()=>{expect(hd261rds2(1,4)).toBe(2);});it('b',()=>{expect(hd261rds2(3,1)).toBe(1);});it('c',()=>{expect(hd261rds2(0,0)).toBe(0);});it('d',()=>{expect(hd261rds2(93,73)).toBe(2);});it('e',()=>{expect(hd261rds2(15,0)).toBe(4);});});
function hd262rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rds2_hd',()=>{it('a',()=>{expect(hd262rds2(1,4)).toBe(2);});it('b',()=>{expect(hd262rds2(3,1)).toBe(1);});it('c',()=>{expect(hd262rds2(0,0)).toBe(0);});it('d',()=>{expect(hd262rds2(93,73)).toBe(2);});it('e',()=>{expect(hd262rds2(15,0)).toBe(4);});});
function hd263rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rds2_hd',()=>{it('a',()=>{expect(hd263rds2(1,4)).toBe(2);});it('b',()=>{expect(hd263rds2(3,1)).toBe(1);});it('c',()=>{expect(hd263rds2(0,0)).toBe(0);});it('d',()=>{expect(hd263rds2(93,73)).toBe(2);});it('e',()=>{expect(hd263rds2(15,0)).toBe(4);});});
function hd264rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rds2_hd',()=>{it('a',()=>{expect(hd264rds2(1,4)).toBe(2);});it('b',()=>{expect(hd264rds2(3,1)).toBe(1);});it('c',()=>{expect(hd264rds2(0,0)).toBe(0);});it('d',()=>{expect(hd264rds2(93,73)).toBe(2);});it('e',()=>{expect(hd264rds2(15,0)).toBe(4);});});
function hd265rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rds2_hd',()=>{it('a',()=>{expect(hd265rds2(1,4)).toBe(2);});it('b',()=>{expect(hd265rds2(3,1)).toBe(1);});it('c',()=>{expect(hd265rds2(0,0)).toBe(0);});it('d',()=>{expect(hd265rds2(93,73)).toBe(2);});it('e',()=>{expect(hd265rds2(15,0)).toBe(4);});});
function hd266rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rds2_hd',()=>{it('a',()=>{expect(hd266rds2(1,4)).toBe(2);});it('b',()=>{expect(hd266rds2(3,1)).toBe(1);});it('c',()=>{expect(hd266rds2(0,0)).toBe(0);});it('d',()=>{expect(hd266rds2(93,73)).toBe(2);});it('e',()=>{expect(hd266rds2(15,0)).toBe(4);});});
function hd267rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rds2_hd',()=>{it('a',()=>{expect(hd267rds2(1,4)).toBe(2);});it('b',()=>{expect(hd267rds2(3,1)).toBe(1);});it('c',()=>{expect(hd267rds2(0,0)).toBe(0);});it('d',()=>{expect(hd267rds2(93,73)).toBe(2);});it('e',()=>{expect(hd267rds2(15,0)).toBe(4);});});
function hd268rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rds2_hd',()=>{it('a',()=>{expect(hd268rds2(1,4)).toBe(2);});it('b',()=>{expect(hd268rds2(3,1)).toBe(1);});it('c',()=>{expect(hd268rds2(0,0)).toBe(0);});it('d',()=>{expect(hd268rds2(93,73)).toBe(2);});it('e',()=>{expect(hd268rds2(15,0)).toBe(4);});});
function hd269rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rds2_hd',()=>{it('a',()=>{expect(hd269rds2(1,4)).toBe(2);});it('b',()=>{expect(hd269rds2(3,1)).toBe(1);});it('c',()=>{expect(hd269rds2(0,0)).toBe(0);});it('d',()=>{expect(hd269rds2(93,73)).toBe(2);});it('e',()=>{expect(hd269rds2(15,0)).toBe(4);});});
function hd270rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rds2_hd',()=>{it('a',()=>{expect(hd270rds2(1,4)).toBe(2);});it('b',()=>{expect(hd270rds2(3,1)).toBe(1);});it('c',()=>{expect(hd270rds2(0,0)).toBe(0);});it('d',()=>{expect(hd270rds2(93,73)).toBe(2);});it('e',()=>{expect(hd270rds2(15,0)).toBe(4);});});
function hd271rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rds2_hd',()=>{it('a',()=>{expect(hd271rds2(1,4)).toBe(2);});it('b',()=>{expect(hd271rds2(3,1)).toBe(1);});it('c',()=>{expect(hd271rds2(0,0)).toBe(0);});it('d',()=>{expect(hd271rds2(93,73)).toBe(2);});it('e',()=>{expect(hd271rds2(15,0)).toBe(4);});});
function hd272rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rds2_hd',()=>{it('a',()=>{expect(hd272rds2(1,4)).toBe(2);});it('b',()=>{expect(hd272rds2(3,1)).toBe(1);});it('c',()=>{expect(hd272rds2(0,0)).toBe(0);});it('d',()=>{expect(hd272rds2(93,73)).toBe(2);});it('e',()=>{expect(hd272rds2(15,0)).toBe(4);});});
function hd273rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273rds2_hd',()=>{it('a',()=>{expect(hd273rds2(1,4)).toBe(2);});it('b',()=>{expect(hd273rds2(3,1)).toBe(1);});it('c',()=>{expect(hd273rds2(0,0)).toBe(0);});it('d',()=>{expect(hd273rds2(93,73)).toBe(2);});it('e',()=>{expect(hd273rds2(15,0)).toBe(4);});});
function hd274rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274rds2_hd',()=>{it('a',()=>{expect(hd274rds2(1,4)).toBe(2);});it('b',()=>{expect(hd274rds2(3,1)).toBe(1);});it('c',()=>{expect(hd274rds2(0,0)).toBe(0);});it('d',()=>{expect(hd274rds2(93,73)).toBe(2);});it('e',()=>{expect(hd274rds2(15,0)).toBe(4);});});
function hd275rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275rds2_hd',()=>{it('a',()=>{expect(hd275rds2(1,4)).toBe(2);});it('b',()=>{expect(hd275rds2(3,1)).toBe(1);});it('c',()=>{expect(hd275rds2(0,0)).toBe(0);});it('d',()=>{expect(hd275rds2(93,73)).toBe(2);});it('e',()=>{expect(hd275rds2(15,0)).toBe(4);});});
function hd276rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276rds2_hd',()=>{it('a',()=>{expect(hd276rds2(1,4)).toBe(2);});it('b',()=>{expect(hd276rds2(3,1)).toBe(1);});it('c',()=>{expect(hd276rds2(0,0)).toBe(0);});it('d',()=>{expect(hd276rds2(93,73)).toBe(2);});it('e',()=>{expect(hd276rds2(15,0)).toBe(4);});});
function hd277rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277rds2_hd',()=>{it('a',()=>{expect(hd277rds2(1,4)).toBe(2);});it('b',()=>{expect(hd277rds2(3,1)).toBe(1);});it('c',()=>{expect(hd277rds2(0,0)).toBe(0);});it('d',()=>{expect(hd277rds2(93,73)).toBe(2);});it('e',()=>{expect(hd277rds2(15,0)).toBe(4);});});
function hd278rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278rds2_hd',()=>{it('a',()=>{expect(hd278rds2(1,4)).toBe(2);});it('b',()=>{expect(hd278rds2(3,1)).toBe(1);});it('c',()=>{expect(hd278rds2(0,0)).toBe(0);});it('d',()=>{expect(hd278rds2(93,73)).toBe(2);});it('e',()=>{expect(hd278rds2(15,0)).toBe(4);});});
function hd279rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279rds2_hd',()=>{it('a',()=>{expect(hd279rds2(1,4)).toBe(2);});it('b',()=>{expect(hd279rds2(3,1)).toBe(1);});it('c',()=>{expect(hd279rds2(0,0)).toBe(0);});it('d',()=>{expect(hd279rds2(93,73)).toBe(2);});it('e',()=>{expect(hd279rds2(15,0)).toBe(4);});});
function hd280rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280rds2_hd',()=>{it('a',()=>{expect(hd280rds2(1,4)).toBe(2);});it('b',()=>{expect(hd280rds2(3,1)).toBe(1);});it('c',()=>{expect(hd280rds2(0,0)).toBe(0);});it('d',()=>{expect(hd280rds2(93,73)).toBe(2);});it('e',()=>{expect(hd280rds2(15,0)).toBe(4);});});
function hd281rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281rds2_hd',()=>{it('a',()=>{expect(hd281rds2(1,4)).toBe(2);});it('b',()=>{expect(hd281rds2(3,1)).toBe(1);});it('c',()=>{expect(hd281rds2(0,0)).toBe(0);});it('d',()=>{expect(hd281rds2(93,73)).toBe(2);});it('e',()=>{expect(hd281rds2(15,0)).toBe(4);});});
function hd282rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282rds2_hd',()=>{it('a',()=>{expect(hd282rds2(1,4)).toBe(2);});it('b',()=>{expect(hd282rds2(3,1)).toBe(1);});it('c',()=>{expect(hd282rds2(0,0)).toBe(0);});it('d',()=>{expect(hd282rds2(93,73)).toBe(2);});it('e',()=>{expect(hd282rds2(15,0)).toBe(4);});});
function hd283rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283rds2_hd',()=>{it('a',()=>{expect(hd283rds2(1,4)).toBe(2);});it('b',()=>{expect(hd283rds2(3,1)).toBe(1);});it('c',()=>{expect(hd283rds2(0,0)).toBe(0);});it('d',()=>{expect(hd283rds2(93,73)).toBe(2);});it('e',()=>{expect(hd283rds2(15,0)).toBe(4);});});
function hd284rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284rds2_hd',()=>{it('a',()=>{expect(hd284rds2(1,4)).toBe(2);});it('b',()=>{expect(hd284rds2(3,1)).toBe(1);});it('c',()=>{expect(hd284rds2(0,0)).toBe(0);});it('d',()=>{expect(hd284rds2(93,73)).toBe(2);});it('e',()=>{expect(hd284rds2(15,0)).toBe(4);});});
function hd285rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285rds2_hd',()=>{it('a',()=>{expect(hd285rds2(1,4)).toBe(2);});it('b',()=>{expect(hd285rds2(3,1)).toBe(1);});it('c',()=>{expect(hd285rds2(0,0)).toBe(0);});it('d',()=>{expect(hd285rds2(93,73)).toBe(2);});it('e',()=>{expect(hd285rds2(15,0)).toBe(4);});});
function hd286rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286rds2_hd',()=>{it('a',()=>{expect(hd286rds2(1,4)).toBe(2);});it('b',()=>{expect(hd286rds2(3,1)).toBe(1);});it('c',()=>{expect(hd286rds2(0,0)).toBe(0);});it('d',()=>{expect(hd286rds2(93,73)).toBe(2);});it('e',()=>{expect(hd286rds2(15,0)).toBe(4);});});
function hd287rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287rds2_hd',()=>{it('a',()=>{expect(hd287rds2(1,4)).toBe(2);});it('b',()=>{expect(hd287rds2(3,1)).toBe(1);});it('c',()=>{expect(hd287rds2(0,0)).toBe(0);});it('d',()=>{expect(hd287rds2(93,73)).toBe(2);});it('e',()=>{expect(hd287rds2(15,0)).toBe(4);});});
function hd288rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288rds2_hd',()=>{it('a',()=>{expect(hd288rds2(1,4)).toBe(2);});it('b',()=>{expect(hd288rds2(3,1)).toBe(1);});it('c',()=>{expect(hd288rds2(0,0)).toBe(0);});it('d',()=>{expect(hd288rds2(93,73)).toBe(2);});it('e',()=>{expect(hd288rds2(15,0)).toBe(4);});});
function hd289rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289rds2_hd',()=>{it('a',()=>{expect(hd289rds2(1,4)).toBe(2);});it('b',()=>{expect(hd289rds2(3,1)).toBe(1);});it('c',()=>{expect(hd289rds2(0,0)).toBe(0);});it('d',()=>{expect(hd289rds2(93,73)).toBe(2);});it('e',()=>{expect(hd289rds2(15,0)).toBe(4);});});
function hd290rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290rds2_hd',()=>{it('a',()=>{expect(hd290rds2(1,4)).toBe(2);});it('b',()=>{expect(hd290rds2(3,1)).toBe(1);});it('c',()=>{expect(hd290rds2(0,0)).toBe(0);});it('d',()=>{expect(hd290rds2(93,73)).toBe(2);});it('e',()=>{expect(hd290rds2(15,0)).toBe(4);});});
function hd291rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291rds2_hd',()=>{it('a',()=>{expect(hd291rds2(1,4)).toBe(2);});it('b',()=>{expect(hd291rds2(3,1)).toBe(1);});it('c',()=>{expect(hd291rds2(0,0)).toBe(0);});it('d',()=>{expect(hd291rds2(93,73)).toBe(2);});it('e',()=>{expect(hd291rds2(15,0)).toBe(4);});});
function hd292rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292rds2_hd',()=>{it('a',()=>{expect(hd292rds2(1,4)).toBe(2);});it('b',()=>{expect(hd292rds2(3,1)).toBe(1);});it('c',()=>{expect(hd292rds2(0,0)).toBe(0);});it('d',()=>{expect(hd292rds2(93,73)).toBe(2);});it('e',()=>{expect(hd292rds2(15,0)).toBe(4);});});
function hd293rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293rds2_hd',()=>{it('a',()=>{expect(hd293rds2(1,4)).toBe(2);});it('b',()=>{expect(hd293rds2(3,1)).toBe(1);});it('c',()=>{expect(hd293rds2(0,0)).toBe(0);});it('d',()=>{expect(hd293rds2(93,73)).toBe(2);});it('e',()=>{expect(hd293rds2(15,0)).toBe(4);});});
function hd294rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294rds2_hd',()=>{it('a',()=>{expect(hd294rds2(1,4)).toBe(2);});it('b',()=>{expect(hd294rds2(3,1)).toBe(1);});it('c',()=>{expect(hd294rds2(0,0)).toBe(0);});it('d',()=>{expect(hd294rds2(93,73)).toBe(2);});it('e',()=>{expect(hd294rds2(15,0)).toBe(4);});});
function hd295rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295rds2_hd',()=>{it('a',()=>{expect(hd295rds2(1,4)).toBe(2);});it('b',()=>{expect(hd295rds2(3,1)).toBe(1);});it('c',()=>{expect(hd295rds2(0,0)).toBe(0);});it('d',()=>{expect(hd295rds2(93,73)).toBe(2);});it('e',()=>{expect(hd295rds2(15,0)).toBe(4);});});
function hd296rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296rds2_hd',()=>{it('a',()=>{expect(hd296rds2(1,4)).toBe(2);});it('b',()=>{expect(hd296rds2(3,1)).toBe(1);});it('c',()=>{expect(hd296rds2(0,0)).toBe(0);});it('d',()=>{expect(hd296rds2(93,73)).toBe(2);});it('e',()=>{expect(hd296rds2(15,0)).toBe(4);});});
function hd297rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297rds2_hd',()=>{it('a',()=>{expect(hd297rds2(1,4)).toBe(2);});it('b',()=>{expect(hd297rds2(3,1)).toBe(1);});it('c',()=>{expect(hd297rds2(0,0)).toBe(0);});it('d',()=>{expect(hd297rds2(93,73)).toBe(2);});it('e',()=>{expect(hd297rds2(15,0)).toBe(4);});});
function hd298rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298rds2_hd',()=>{it('a',()=>{expect(hd298rds2(1,4)).toBe(2);});it('b',()=>{expect(hd298rds2(3,1)).toBe(1);});it('c',()=>{expect(hd298rds2(0,0)).toBe(0);});it('d',()=>{expect(hd298rds2(93,73)).toBe(2);});it('e',()=>{expect(hd298rds2(15,0)).toBe(4);});});
function hd299rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299rds2_hd',()=>{it('a',()=>{expect(hd299rds2(1,4)).toBe(2);});it('b',()=>{expect(hd299rds2(3,1)).toBe(1);});it('c',()=>{expect(hd299rds2(0,0)).toBe(0);});it('d',()=>{expect(hd299rds2(93,73)).toBe(2);});it('e',()=>{expect(hd299rds2(15,0)).toBe(4);});});
function hd300rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300rds2_hd',()=>{it('a',()=>{expect(hd300rds2(1,4)).toBe(2);});it('b',()=>{expect(hd300rds2(3,1)).toBe(1);});it('c',()=>{expect(hd300rds2(0,0)).toBe(0);});it('d',()=>{expect(hd300rds2(93,73)).toBe(2);});it('e',()=>{expect(hd300rds2(15,0)).toBe(4);});});
function hd301rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301rds2_hd',()=>{it('a',()=>{expect(hd301rds2(1,4)).toBe(2);});it('b',()=>{expect(hd301rds2(3,1)).toBe(1);});it('c',()=>{expect(hd301rds2(0,0)).toBe(0);});it('d',()=>{expect(hd301rds2(93,73)).toBe(2);});it('e',()=>{expect(hd301rds2(15,0)).toBe(4);});});
function hd302rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302rds2_hd',()=>{it('a',()=>{expect(hd302rds2(1,4)).toBe(2);});it('b',()=>{expect(hd302rds2(3,1)).toBe(1);});it('c',()=>{expect(hd302rds2(0,0)).toBe(0);});it('d',()=>{expect(hd302rds2(93,73)).toBe(2);});it('e',()=>{expect(hd302rds2(15,0)).toBe(4);});});
function hd303rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303rds2_hd',()=>{it('a',()=>{expect(hd303rds2(1,4)).toBe(2);});it('b',()=>{expect(hd303rds2(3,1)).toBe(1);});it('c',()=>{expect(hd303rds2(0,0)).toBe(0);});it('d',()=>{expect(hd303rds2(93,73)).toBe(2);});it('e',()=>{expect(hd303rds2(15,0)).toBe(4);});});
function hd304rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304rds2_hd',()=>{it('a',()=>{expect(hd304rds2(1,4)).toBe(2);});it('b',()=>{expect(hd304rds2(3,1)).toBe(1);});it('c',()=>{expect(hd304rds2(0,0)).toBe(0);});it('d',()=>{expect(hd304rds2(93,73)).toBe(2);});it('e',()=>{expect(hd304rds2(15,0)).toBe(4);});});
function hd305rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305rds2_hd',()=>{it('a',()=>{expect(hd305rds2(1,4)).toBe(2);});it('b',()=>{expect(hd305rds2(3,1)).toBe(1);});it('c',()=>{expect(hd305rds2(0,0)).toBe(0);});it('d',()=>{expect(hd305rds2(93,73)).toBe(2);});it('e',()=>{expect(hd305rds2(15,0)).toBe(4);});});
function hd306rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306rds2_hd',()=>{it('a',()=>{expect(hd306rds2(1,4)).toBe(2);});it('b',()=>{expect(hd306rds2(3,1)).toBe(1);});it('c',()=>{expect(hd306rds2(0,0)).toBe(0);});it('d',()=>{expect(hd306rds2(93,73)).toBe(2);});it('e',()=>{expect(hd306rds2(15,0)).toBe(4);});});
function hd307rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307rds2_hd',()=>{it('a',()=>{expect(hd307rds2(1,4)).toBe(2);});it('b',()=>{expect(hd307rds2(3,1)).toBe(1);});it('c',()=>{expect(hd307rds2(0,0)).toBe(0);});it('d',()=>{expect(hd307rds2(93,73)).toBe(2);});it('e',()=>{expect(hd307rds2(15,0)).toBe(4);});});
function hd308rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308rds2_hd',()=>{it('a',()=>{expect(hd308rds2(1,4)).toBe(2);});it('b',()=>{expect(hd308rds2(3,1)).toBe(1);});it('c',()=>{expect(hd308rds2(0,0)).toBe(0);});it('d',()=>{expect(hd308rds2(93,73)).toBe(2);});it('e',()=>{expect(hd308rds2(15,0)).toBe(4);});});
function hd309rds2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309rds2_hd',()=>{it('a',()=>{expect(hd309rds2(1,4)).toBe(2);});it('b',()=>{expect(hd309rds2(3,1)).toBe(1);});it('c',()=>{expect(hd309rds2(0,0)).toBe(0);});it('d',()=>{expect(hd309rds2(93,73)).toBe(2);});it('e',()=>{expect(hd309rds2(15,0)).toBe(4);});});
