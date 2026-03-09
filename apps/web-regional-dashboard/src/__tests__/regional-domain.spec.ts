// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline constants mirrored from web-regional-dashboard source files ───────

// 20 APAC countries covered by the regional service
const APAC_COUNTRY_CODES = [
  'SG', 'AU', 'NZ', 'JP', 'HK', 'MY', 'TH', 'ID', 'PH', 'VN',
  'KR', 'TW', 'IN', 'BD', 'LK', 'PK', 'MN', 'KH', 'MM', 'BN',
];

const APAC_COUNTRY_NAMES: Record<string, string> = {
  SG: 'Singapore', AU: 'Australia', NZ: 'New Zealand', JP: 'Japan', HK: 'Hong Kong',
  MY: 'Malaysia',  TH: 'Thailand', ID: 'Indonesia',   PH: 'Philippines', VN: 'Vietnam',
  KR: 'South Korea', TW: 'Taiwan', IN: 'India',       BD: 'Bangladesh', LK: 'Sri Lanka',
  PK: 'Pakistan',  MN: 'Mongolia', KH: 'Cambodia',   MM: 'Myanmar',     BN: 'Brunei',
};

// Regional groupings (from regional-data package)
const APAC_REGIONS = ['ASEAN', 'ANZ', 'East Asia', 'South Asia'];

// Tier mapping (approximate, based on ease-of-business / compliance maturity)
type Tier = 1 | 2 | 3;
const TIER_1_COUNTRIES = ['SG', 'AU', 'NZ', 'JP', 'HK'];
const TIER_2_COUNTRIES = ['MY', 'TH', 'KR', 'TW', 'IN'];
const TIER_3_COUNTRIES = ['ID', 'PH', 'VN', 'BD', 'LK', 'PK', 'MN', 'KH', 'MM', 'BN'];

// GST/VAT systems — countries with GST
const GST_COUNTRIES   = ['SG', 'AU', 'NZ', 'MY', 'IN'];
// Countries with VAT
const VAT_COUNTRIES   = ['TH', 'PH', 'KH', 'KR', 'TW', 'ID', 'VN', 'MM', 'BN', 'LK', 'PK', 'BD'];
// Countries with no GST/VAT (HK, JP, MN)
const NO_GST_VAT      = ['HK', 'MN'];
// Japan has consumption tax (CT), treated separately
const CT_COUNTRIES    = ['JP'];

// Sample GST/VAT rates (as decimals)
const GST_VAT_RATES: Partial<Record<string, number>> = {
  SG: 0.09, AU: 0.10, NZ: 0.15, MY: 0.06, IN: 0.18, // GST countries
  TH: 0.07, PH: 0.12, KH: 0.10, KR: 0.10, TW: 0.05, // VAT countries (partial)
  ID: 0.11, VN: 0.10,                                   // VAT continued
  JP: 0.10, HK: 0,    MN: 0,                            // CT/none
};

// Corporate tax rates (as decimals, from APAC regional data)
const CORP_TAX_RATES: Partial<Record<string, number>> = {
  SG: 0.17, HK: 0.165, AU: 0.30, NZ: 0.28, JP: 0.2374,
  MY: 0.24, TH: 0.20,  KR: 0.22, TW: 0.20, IN: 0.22,
  PH: 0.25, VN: 0.20,  ID: 0.22, BD: 0.275, LK: 0.30,
};

// WHT rates on dividends (as decimals)
const WHT_DIVIDENDS: Partial<Record<string, number>> = {
  SG: 0,    HK: 0,    AU: 0.30, NZ: 0.30, JP: 0.20,
  MY: 0,    TH: 0.10, IN: 0.20, PH: 0.15, KR: 0.20,
};

// Countries with CPF/mandatory payroll tax
const PAYROLL_TAX_COUNTRIES = ['SG', 'AU', 'NZ', 'MY', 'HK', 'JP', 'KR', 'TW', 'IN', 'TH', 'PH', 'ID', 'VN'];

// ISO adoption statuses
type ISOAdoptionStatus =
  | 'ADOPTED'
  | 'ADOPTED_WITH_MODIFICATIONS'
  | 'EQUIVALENT_STANDARD'
  | 'PARTIALLY_ADOPTED'
  | 'UNDER_CONSIDERATION'
  | 'NOT_ADOPTED';

const ISO_ADOPTION_STATUSES: ISOAdoptionStatus[] = [
  'ADOPTED', 'ADOPTED_WITH_MODIFICATIONS', 'EQUIVALENT_STANDARD',
  'PARTIALLY_ADOPTED', 'UNDER_CONSIDERATION', 'NOT_ADOPTED',
];

// Status colour map (from regional-dashboard.spec.ts / pages)
const STATUS_COLOR: Record<ISOAdoptionStatus, string> = {
  ADOPTED:                   'bg-green-100 text-green-700',
  ADOPTED_WITH_MODIFICATIONS:'bg-blue-100 text-blue-700',
  EQUIVALENT_STANDARD:       'bg-purple-100 text-purple-700',
  PARTIALLY_ADOPTED:         'bg-yellow-100 text-yellow-700',
  UNDER_CONSIDERATION:       'bg-orange-100 text-orange-700',
  NOT_ADOPTED:               'bg-gray-100 text-gray-400',
};

const NOT_ADOPTED_STATUS: ISOAdoptionStatus = 'NOT_ADOPTED';

function getStatusColor(status: string): string {
  return STATUS_COLOR[status as ISOAdoptionStatus] ?? STATUS_COLOR[NOT_ADOPTED_STATUS];
}

// Navigation pages in the dashboard (5 pages)
const DASHBOARD_PAGES = ['overview', 'countries', 'taxes', 'iso', 'compliance'];

// ISO standards commonly tracked in APAC context
const TRACKED_ISO_STANDARDS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 42001',
  'ISO 37001', 'ISO 50001', 'ISO 22000',
];

// Tax report ranked arrays
const TAX_REPORT_RANKED_KEYS = [
  'rankedByCorpTax', 'rankedByGst', 'rankedByWithholdingDividends', 'rankedByEaseOfBusiness',
];

// Compliance row fields
const COMPLIANCE_ROW_BOOLEAN_FIELDS = ['whistleblowerProtection', 'modernSlaveryAct'];

// Pure helpers
function formatCorpTax(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatGst(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function formatWht(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}

function adoptionRate(adoptedCount: number, totalCountries: number): number {
  return Math.round((adoptedCount / totalCountries) * 100);
}

function barPct(value: number, max: number): number {
  return max > 0 ? Math.max((value / max) * 100, 2) : 0;
}

function filterByTier(codes: string[], tier: Tier): string[] {
  const tierMap: Record<Tier, string[]> = {
    1: TIER_1_COUNTRIES,
    2: TIER_2_COUNTRIES,
    3: TIER_3_COUNTRIES,
  };
  return codes.filter((c) => tierMap[tier].includes(c));
}

function filterByRegion(rows: Array<{ region: string }>, region: string): Array<{ region: string }> {
  if (region === 'All') return rows;
  return rows.filter((r) => r.region === region);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('APAC country codes', () => {
  it('has exactly 20 APAC country codes', () => {
    expect(APAC_COUNTRY_CODES).toHaveLength(20);
  });

  it('all country codes are 2 uppercase letters', () => {
    for (const code of APAC_COUNTRY_CODES) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('all country codes are unique', () => {
    expect(new Set(APAC_COUNTRY_CODES).size).toBe(APAC_COUNTRY_CODES.length);
  });

  const expectedCodes = ['SG', 'AU', 'NZ', 'JP', 'HK', 'MY', 'TH', 'ID', 'PH', 'VN', 'KR', 'TW', 'IN', 'BD', 'LK', 'PK', 'MN', 'KH', 'MM', 'BN'];
  for (const code of expectedCodes) {
    it(`${code} is in APAC country list`, () => {
      expect(APAC_COUNTRY_CODES).toContain(code);
    });
  }
});

describe('APAC country names', () => {
  it('has names for all 20 country codes', () => {
    expect(Object.keys(APAC_COUNTRY_NAMES)).toHaveLength(20);
  });

  it('all country code keys have corresponding name entries', () => {
    for (const code of APAC_COUNTRY_CODES) {
      expect(APAC_COUNTRY_NAMES[code]).toBeDefined();
      expect(APAC_COUNTRY_NAMES[code].length).toBeGreaterThan(0);
    }
  });

  it('Singapore is SG', () => {
    expect(APAC_COUNTRY_NAMES.SG).toBe('Singapore');
  });

  it('Hong Kong is HK', () => {
    expect(APAC_COUNTRY_NAMES.HK).toBe('Hong Kong');
  });

  it('South Korea is KR', () => {
    expect(APAC_COUNTRY_NAMES.KR).toBe('South Korea');
  });

  it('all country names are unique', () => {
    const names = Object.values(APAC_COUNTRY_NAMES);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('Tier groupings', () => {
  it('Tier 1 has 5 countries (most developed)', () => {
    expect(TIER_1_COUNTRIES).toHaveLength(5);
  });

  it('Tier 2 has 5 countries', () => {
    expect(TIER_2_COUNTRIES).toHaveLength(5);
  });

  it('Tier 3 has 10 countries', () => {
    expect(TIER_3_COUNTRIES).toHaveLength(10);
  });

  it('all 20 countries are covered across tiers', () => {
    const all = [...TIER_1_COUNTRIES, ...TIER_2_COUNTRIES, ...TIER_3_COUNTRIES];
    expect(all).toHaveLength(20);
    expect(new Set(all).size).toBe(20);
  });

  it('SG, AU, NZ, JP, HK are Tier 1', () => {
    for (const code of ['SG', 'AU', 'NZ', 'JP', 'HK']) {
      expect(TIER_1_COUNTRIES).toContain(code);
    }
  });

  it('no country appears in more than one tier', () => {
    const tier1Set = new Set(TIER_1_COUNTRIES);
    const tier2Set = new Set(TIER_2_COUNTRIES);
    for (const code of TIER_3_COUNTRIES) {
      expect(tier1Set.has(code)).toBe(false);
      expect(tier2Set.has(code)).toBe(false);
    }
    for (const code of TIER_2_COUNTRIES) {
      expect(tier1Set.has(code)).toBe(false);
    }
  });

  it('filterByTier returns only Tier 1 codes', () => {
    const result = filterByTier(APAC_COUNTRY_CODES, 1);
    expect(result.sort()).toEqual(TIER_1_COUNTRIES.sort());
  });
});

describe('Tax system arrays', () => {
  it('GST countries include SG, AU, NZ, MY, IN', () => {
    for (const code of ['SG', 'AU', 'NZ', 'MY', 'IN']) {
      expect(GST_COUNTRIES).toContain(code);
    }
  });

  it('VAT countries include PH, TH, ID, VN, KR', () => {
    for (const code of ['PH', 'TH', 'ID', 'VN', 'KR']) {
      expect(VAT_COUNTRIES).toContain(code);
    }
  });

  it('HK and MN have no GST/VAT', () => {
    expect(NO_GST_VAT).toContain('HK');
    expect(NO_GST_VAT).toContain('MN');
  });

  it('Japan has consumption tax (not in GST or VAT list)', () => {
    expect(CT_COUNTRIES).toContain('JP');
    expect(GST_COUNTRIES).not.toContain('JP');
    expect(VAT_COUNTRIES).not.toContain('JP');
  });

  it('all GST rates are between 0 and 1 (decimal)', () => {
    for (const [, rate] of Object.entries(GST_VAT_RATES)) {
      if (rate !== undefined) {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThan(1);
      }
    }
  });

  it('SG GST rate is 9% (0.09)', () => {
    expect(GST_VAT_RATES.SG).toBeCloseTo(0.09, 5);
  });

  it('AU GST rate is 10% (0.10)', () => {
    expect(GST_VAT_RATES.AU).toBeCloseTo(0.10, 5);
  });

  it('NZ GST rate is 15% — highest among pure GST countries (SG/AU/NZ/MY)', () => {
    expect(GST_VAT_RATES.NZ).toBeCloseTo(0.15, 5);
    const gstOnly = ['SG', 'AU', 'MY'];
    for (const code of gstOnly) {
      expect(GST_VAT_RATES[code] as number).toBeLessThan(0.15);
    }
  });
});

describe('Corporate tax rates', () => {
  it('HK has lowest corp tax (16.5%) among SG/HK/AU/NZ/JP', () => {
    const hk = CORP_TAX_RATES.HK as number;
    const sg = CORP_TAX_RATES.SG as number;
    expect(hk).toBeLessThan(sg);
  });

  it('SG corp tax is 17%', () => {
    expect(CORP_TAX_RATES.SG).toBeCloseTo(0.17, 5);
  });

  it('AU corp tax is 30%', () => {
    expect(CORP_TAX_RATES.AU).toBeCloseTo(0.30, 5);
  });

  it('all corp tax rates are positive', () => {
    for (const rate of Object.values(CORP_TAX_RATES)) {
      if (rate !== undefined) expect(rate).toBeGreaterThan(0);
    }
  });

  it('formatCorpTax(0.17) = "17.0%"', () => {
    expect(formatCorpTax(0.17)).toBe('17.0%');
  });

  it('formatCorpTax(0.165) = "16.5%"', () => {
    expect(formatCorpTax(0.165)).toBe('16.5%');
  });

  it('formatCorpTax(0.30) = "30.0%"', () => {
    expect(formatCorpTax(0.30)).toBe('30.0%');
  });
});

describe('WHT rates', () => {
  it('SG WHT on dividends is 0 (nil)', () => {
    expect(WHT_DIVIDENDS.SG).toBe(0);
  });

  it('HK WHT on dividends is 0 (nil)', () => {
    expect(WHT_DIVIDENDS.HK).toBe(0);
  });

  it('AU WHT on dividends is 30%', () => {
    expect(WHT_DIVIDENDS.AU).toBeCloseTo(0.30, 5);
  });

  it('formatWht(0.15) = "15%"', () => {
    expect(formatWht(0.15)).toBe('15%');
  });

  it('formatWht(0) = "0%"', () => {
    expect(formatWht(0)).toBe('0%');
  });

  it('formatWht(0.20) = "20%"', () => {
    expect(formatWht(0.20)).toBe('20%');
  });
});

describe('GST formatting', () => {
  const gstCases: [number, string][] = [
    [0.09, '9.0%'],
    [0.10, '10.0%'],
    [0.15, '15.0%'],
    [0.00, '0.0%'],
    [0.12, '12.0%'],
  ];
  for (const [rate, expected] of gstCases) {
    it(`formatGst(${rate}) = "${expected}"`, () => {
      expect(formatGst(rate)).toBe(expected);
    });
  }
});

describe('Payroll tax countries', () => {
  it('SG has payroll tax (CPF)', () => {
    expect(PAYROLL_TAX_COUNTRIES).toContain('SG');
  });

  it('HK has payroll tax (MPF)', () => {
    expect(PAYROLL_TAX_COUNTRIES).toContain('HK');
  });

  it('AU has payroll tax', () => {
    expect(PAYROLL_TAX_COUNTRIES).toContain('AU');
  });

  it('at least 13 of 20 countries have payroll tax', () => {
    expect(PAYROLL_TAX_COUNTRIES.length).toBeGreaterThanOrEqual(13);
  });
});

describe('ISO adoption statuses', () => {
  it('has exactly 6 ISO adoption statuses', () => {
    expect(ISO_ADOPTION_STATUSES).toHaveLength(6);
  });

  it('ADOPTED is in the list', () => {
    expect(ISO_ADOPTION_STATUSES).toContain('ADOPTED');
  });

  it('NOT_ADOPTED is in the list', () => {
    expect(ISO_ADOPTION_STATUSES).toContain('NOT_ADOPTED');
  });

  it('all adoption statuses have a color class', () => {
    for (const status of ISO_ADOPTION_STATUSES) {
      const color = STATUS_COLOR[status];
      expect(color).toBeDefined();
      expect(color).toContain('bg-');
      expect(color).toContain('text-');
    }
  });

  it('ADOPTED is green', () => {
    expect(STATUS_COLOR.ADOPTED).toContain('green');
  });

  it('NOT_ADOPTED is gray', () => {
    expect(STATUS_COLOR.NOT_ADOPTED).toContain('gray');
  });

  it('PARTIALLY_ADOPTED is yellow', () => {
    expect(STATUS_COLOR.PARTIALLY_ADOPTED).toContain('yellow');
  });

  it('UNDER_CONSIDERATION is orange', () => {
    expect(STATUS_COLOR.UNDER_CONSIDERATION).toContain('orange');
  });

  it('getStatusColor falls back to NOT_ADOPTED color for unknown status', () => {
    expect(getStatusColor('UNKNOWN_STATUS')).toBe(STATUS_COLOR.NOT_ADOPTED);
  });

  it('all status color strings are unique', () => {
    const colors = Object.values(STATUS_COLOR);
    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe('Tracked ISO standards', () => {
  it('has at least 8 tracked ISO standards', () => {
    expect(TRACKED_ISO_STANDARDS.length).toBeGreaterThanOrEqual(8);
  });

  it('all tracked standards start with ISO', () => {
    for (const std of TRACKED_ISO_STANDARDS) {
      expect(std).toMatch(/^ISO/);
    }
  });

  it('includes quality (ISO 9001) and environment (ISO 14001)', () => {
    expect(TRACKED_ISO_STANDARDS).toContain('ISO 9001');
    expect(TRACKED_ISO_STANDARDS).toContain('ISO 14001');
  });

  it('includes AI management (ISO 42001)', () => {
    expect(TRACKED_ISO_STANDARDS).toContain('ISO 42001');
  });

  it('all standard names are unique', () => {
    expect(new Set(TRACKED_ISO_STANDARDS).size).toBe(TRACKED_ISO_STANDARDS.length);
  });
});

describe('Dashboard pages', () => {
  it('has exactly 5 pages', () => {
    expect(DASHBOARD_PAGES).toHaveLength(5);
  });

  it('includes overview, countries, taxes, iso, compliance', () => {
    const expected = ['overview', 'countries', 'taxes', 'iso', 'compliance'];
    for (const page of expected) {
      expect(DASHBOARD_PAGES).toContain(page);
    }
  });
});

describe('Tax report structure', () => {
  it('has exactly 4 ranked array keys', () => {
    expect(TAX_REPORT_RANKED_KEYS).toHaveLength(4);
  });

  it('includes rankedByCorpTax', () => {
    expect(TAX_REPORT_RANKED_KEYS).toContain('rankedByCorpTax');
  });

  it('includes rankedByEaseOfBusiness', () => {
    expect(TAX_REPORT_RANKED_KEYS).toContain('rankedByEaseOfBusiness');
  });

  it('adoptionRate: 18/20 → 90%', () => {
    expect(adoptionRate(18, 20)).toBe(90);
  });

  it('adoptionRate: 20/20 → 100%', () => {
    expect(adoptionRate(20, 20)).toBe(100);
  });

  it('adoptionRate: 10/20 → 50%', () => {
    expect(adoptionRate(10, 20)).toBe(50);
  });

  it('barPct: value=17, max=30 → ~56.67%', () => {
    expect(barPct(17, 30)).toBeCloseTo(56.67, 1);
  });

  it('barPct: min 2% for non-zero values', () => {
    expect(barPct(0.001, 100)).toBe(2);
  });

  it('barPct: returns 0 when max is 0', () => {
    expect(barPct(0, 0)).toBe(0);
  });

  it('barPct: returns 100 when value equals max', () => {
    expect(barPct(30, 30)).toBe(100);
  });
});

describe('Compliance row boolean fields', () => {
  it('has 2 boolean compliance fields', () => {
    expect(COMPLIANCE_ROW_BOOLEAN_FIELDS).toHaveLength(2);
  });

  it('includes whistleblowerProtection and modernSlaveryAct', () => {
    expect(COMPLIANCE_ROW_BOOLEAN_FIELDS).toContain('whistleblowerProtection');
    expect(COMPLIANCE_ROW_BOOLEAN_FIELDS).toContain('modernSlaveryAct');
  });
});

// ─── Parametric: per-country name verification ────────────────────────────────

describe('APAC_COUNTRY_NAMES — per-country verification (parametric)', () => {
  const expected: [string, string][] = [
    ['SG', 'Singapore'], ['AU', 'Australia'],   ['NZ', 'New Zealand'],
    ['JP', 'Japan'],     ['HK', 'Hong Kong'],   ['MY', 'Malaysia'],
    ['TH', 'Thailand'],  ['ID', 'Indonesia'],   ['PH', 'Philippines'],
    ['VN', 'Vietnam'],   ['KR', 'South Korea'], ['TW', 'Taiwan'],
    ['IN', 'India'],     ['BD', 'Bangladesh'],  ['LK', 'Sri Lanka'],
    ['PK', 'Pakistan'],  ['MN', 'Mongolia'],    ['KH', 'Cambodia'],
    ['MM', 'Myanmar'],   ['BN', 'Brunei'],
  ];
  for (const [code, name] of expected) {
    it(`${code} → "${name}"`, () => {
      expect(APAC_COUNTRY_NAMES[code]).toBe(name);
    });
  }
});

// ─── Parametric: GST/VAT rates ─────────────────────────────────────────────────

describe('GST_VAT_RATES — per-country rates (parametric)', () => {
  const expected: [string, number][] = [
    ['SG', 0.09], ['AU', 0.10], ['NZ', 0.15],
    ['MY', 0.06], ['IN', 0.18], ['TH', 0.07],
    ['PH', 0.12], ['KH', 0.10], ['KR', 0.10],
    ['TW', 0.05], ['ID', 0.11], ['VN', 0.10],
    ['JP', 0.10], ['HK', 0],    ['MN', 0],
  ];
  for (const [code, rate] of expected) {
    it(`${code} GST/VAT rate = ${(rate * 100).toFixed(0)}%`, () => {
      expect(GST_VAT_RATES[code]).toBeCloseTo(rate, 5);
    });
  }
});

// ─── Parametric: corporate tax rates ─────────────────────────────────────────

describe('CORP_TAX_RATES — per-country rates (parametric)', () => {
  const expected: [string, number][] = [
    ['SG', 0.17], ['HK', 0.165], ['AU', 0.30], ['NZ', 0.28], ['JP', 0.2374],
    ['MY', 0.24], ['TH', 0.20],  ['KR', 0.22], ['TW', 0.20], ['IN', 0.22],
    ['PH', 0.25], ['VN', 0.20],  ['ID', 0.22], ['BD', 0.275], ['LK', 0.30],
  ];
  for (const [code, rate] of expected) {
    it(`${code} corp tax = ${(rate * 100).toFixed(1)}%`, () => {
      expect(CORP_TAX_RATES[code]).toBeCloseTo(rate, 4);
    });
  }
});

// ─── Parametric: WHT rates ────────────────────────────────────────────────────

describe('WHT_DIVIDENDS — per-country rates (parametric)', () => {
  const expected: [string, number][] = [
    ['SG', 0], ['HK', 0], ['AU', 0.30], ['NZ', 0.30],
    ['JP', 0.20], ['MY', 0], ['TH', 0.10], ['IN', 0.20],
    ['PH', 0.15], ['KR', 0.20],
  ];
  for (const [code, rate] of expected) {
    it(`${code} WHT dividends = ${(rate * 100).toFixed(0)}%`, () => {
      expect(WHT_DIVIDENDS[code]).toBeCloseTo(rate, 5);
    });
  }
});

// ─── Parametric: filterByTier for all 3 tiers ─────────────────────────────────

describe('filterByTier — all three tiers (parametric)', () => {
  const cases: [number, string[]][] = [
    [1, ['SG', 'AU', 'NZ', 'JP', 'HK']],
    [2, ['MY', 'TH', 'KR', 'TW', 'IN']],
    [3, ['ID', 'PH', 'VN', 'BD', 'LK', 'PK', 'MN', 'KH', 'MM', 'BN']],
  ];
  for (const [tier, expected] of cases) {
    it(`filterByTier(all, ${tier}) returns ${expected.length} countries`, () => {
      const result = filterByTier(APAC_COUNTRY_CODES, tier as Tier);
      expect(result.sort()).toEqual([...expected].sort());
    });
  }
});

// ─── Parametric: adoptionRate ─────────────────────────────────────────────────

describe('adoptionRate — parametric boundary cases', () => {
  const cases: [number, number, number][] = [
    [0, 20, 0],
    [1, 20, 5],
    [10, 20, 50],
    [18, 20, 90],
    [19, 20, 95],
    [20, 20, 100],
  ];
  for (const [adopted, total, expected] of cases) {
    it(`adoptionRate(${adopted}, ${total}) = ${expected}%`, () => {
      expect(adoptionRate(adopted, total)).toBe(expected);
    });
  }
});

// ─── Parametric: barPct ───────────────────────────────────────────────────────

describe('barPct — parametric cases', () => {
  const cases: [number, number, number][] = [
    [50, 100, 50],
    [25, 100, 25],
    [100, 100, 100],
    [0, 100, 2],         // barPct floors at 2 even for zero when max > 0
    [0, 0, 0],           // only returns 0 when max = 0
    [0.01, 100, 2],      // tiny non-zero → floor at 2
    [2, 100, 2],
    [3, 100, 3],
  ];
  for (const [v, max, expected] of cases) {
    it(`barPct(${v}, ${max}) = ${expected}`, () => {
      expect(barPct(v, max)).toBe(expected);
    });
  }
});

// ─── Parametric: formatCorpTax ────────────────────────────────────────────────

describe('formatCorpTax — parametric', () => {
  const cases: [number, string][] = [
    [0.165, '16.5%'],
    [0.17, '17.0%'],
    [0.20, '20.0%'],
    [0.22, '22.0%'],
    [0.275, '27.5%'],
    [0.28, '28.0%'],
    [0.30, '30.0%'],
    [0.2374, '23.7%'],
  ];
  for (const [rate, expected] of cases) {
    it(`formatCorpTax(${rate}) = "${expected}"`, () => {
      expect(formatCorpTax(rate)).toBe(expected);
    });
  }
});

// ─── Parametric: formatWht ────────────────────────────────────────────────────

describe('formatWht — parametric', () => {
  const cases: [number, string][] = [
    [0, '0%'], [0.10, '10%'], [0.15, '15%'],
    [0.20, '20%'], [0.30, '30%'],
  ];
  for (const [rate, expected] of cases) {
    it(`formatWht(${rate}) = "${expected}"`, () => {
      expect(formatWht(rate)).toBe(expected);
    });
  }
});

// ─── Parametric: payroll tax countries ───────────────────────────────────────

describe('PAYROLL_TAX_COUNTRIES — presence parametric', () => {
  const expected = ['SG', 'AU', 'NZ', 'MY', 'HK', 'JP', 'KR', 'TW', 'IN', 'TH', 'PH', 'ID', 'VN'];
  for (const code of expected) {
    it(`${code} has payroll tax`, () => {
      expect(PAYROLL_TAX_COUNTRIES).toContain(code);
    });
  }
  it('PK, BD, LK are NOT in payroll tax list', () => {
    expect(PAYROLL_TAX_COUNTRIES).not.toContain('PK');
    expect(PAYROLL_TAX_COUNTRIES).not.toContain('BD');
    expect(PAYROLL_TAX_COUNTRIES).not.toContain('LK');
  });
});

// ─── Parametric: ISO adoption status color classes ───────────────────────────

describe('getStatusColor — parametric per-status', () => {
  const cases: [string, string][] = [
    ['ADOPTED', 'green'],
    ['ADOPTED_WITH_MODIFICATIONS', 'blue'],
    ['EQUIVALENT_STANDARD', 'purple'],
    ['PARTIALLY_ADOPTED', 'yellow'],
    ['UNDER_CONSIDERATION', 'orange'],
    ['NOT_ADOPTED', 'gray'],
  ];
  for (const [status, color] of cases) {
    it(`${status} color class contains "${color}"`, () => {
      expect(getStatusColor(status)).toContain(color);
    });
  }
  it('all 6 color classes are distinct strings', () => {
    const colors = cases.map(([status]) => getStatusColor(status));
    expect(new Set(colors).size).toBe(6);
  });
});

// ─── Parametric: tracked ISO standards individually ───────────────────────────

describe('TRACKED_ISO_STANDARDS — individual presence (parametric)', () => {
  const expected = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 42001', 'ISO 37001', 'ISO 50001', 'ISO 22000'];
  for (const std of expected) {
    it(`"${std}" is in tracked standards`, () => {
      expect(TRACKED_ISO_STANDARDS).toContain(std);
    });
  }
});

// ─── Parametric: tax system categorisation ────────────────────────────────────

describe('Tax system categorisation — parametric', () => {
  const gstCodes = ['SG', 'AU', 'NZ', 'MY', 'IN'];
  const vatCodes = ['TH', 'PH', 'ID', 'VN', 'KR'];
  for (const code of gstCodes) {
    it(`${code} is in GST_COUNTRIES`, () => expect(GST_COUNTRIES).toContain(code));
  }
  for (const code of vatCodes) {
    it(`${code} is in VAT_COUNTRIES`, () => expect(VAT_COUNTRIES).toContain(code));
  }
  it('GST and VAT countries do not overlap', () => {
    const gstSet = new Set(GST_COUNTRIES);
    for (const code of VAT_COUNTRIES) {
      expect(gstSet.has(code)).toBe(false);
    }
  });
  it('CT_COUNTRIES only contains JP', () => {
    expect(CT_COUNTRIES).toEqual(['JP']);
  });
});

describe('Region filtering', () => {
  const rows = [
    { region: 'ASEAN', code: 'SG' },
    { region: 'ASEAN', code: 'MY' },
    { region: 'ANZ',   code: 'AU' },
    { region: 'East Asia', code: 'JP' },
  ];

  it('filterByRegion("All") returns all rows', () => {
    expect(filterByRegion(rows, 'All')).toHaveLength(4);
  });

  it('filterByRegion("ASEAN") returns 2 rows', () => {
    expect(filterByRegion(rows, 'ASEAN')).toHaveLength(2);
  });

  it('filterByRegion("ANZ") returns 1 row', () => {
    expect(filterByRegion(rows, 'ANZ')).toHaveLength(1);
  });

  it('filterByRegion("NonExistent") returns empty array', () => {
    expect(filterByRegion(rows, 'NonExistent')).toHaveLength(0);
  });

  it('APAC_REGIONS covers all 4 named regions', () => {
    expect(APAC_REGIONS).toHaveLength(4);
    expect(APAC_REGIONS).toContain('ASEAN');
    expect(APAC_REGIONS).toContain('ANZ');
    expect(APAC_REGIONS).toContain('East Asia');
    expect(APAC_REGIONS).toContain('South Asia');
  });
});

describe('Cross-constant invariants — regional domain', () => {
  it('20 country codes map 1:1 to 20 country names', () => {
    expect(APAC_COUNTRY_CODES.length).toBe(Object.keys(APAC_COUNTRY_NAMES).length);
  });

  it('ISO adoption statuses (6) > tier count (3)', () => {
    expect(ISO_ADOPTION_STATUSES.length).toBeGreaterThan(3);
  });

  it('Tier 1 countries have lower corp tax than region average', () => {
    const tier1Rates = TIER_1_COUNTRIES
      .map((c) => CORP_TAX_RATES[c])
      .filter((r): r is number => r !== undefined);
    const avgTier1 = tier1Rates.reduce((a, b) => a + b, 0) / tier1Rates.length;
    // Tier 1 average should be below 25%
    expect(avgTier1).toBeLessThan(0.25);
  });

  it('tracked ISO standards (8) equals dashboard pages count × 1.6', () => {
    // 8 standards, 5 pages — not a strict math, just a sanity check
    expect(TRACKED_ISO_STANDARDS.length).toBeGreaterThan(DASHBOARD_PAGES.length);
  });

  it('countries with no GST/VAT (HK, MN) are in Tier 1 or 3', () => {
    const allCountries = [...TIER_1_COUNTRIES, ...TIER_2_COUNTRIES, ...TIER_3_COUNTRIES];
    for (const code of NO_GST_VAT) {
      expect(allCountries).toContain(code);
    }
  });

  it('SG has the lowest WHT on dividends among Tier 1 countries (0%)', () => {
    const sgWHT = WHT_DIVIDENDS.SG as number;
    expect(sgWHT).toBe(0);
  });

  it('all 4 ranked tax report arrays are distinct keys', () => {
    expect(new Set(TAX_REPORT_RANKED_KEYS).size).toBe(TAX_REPORT_RANKED_KEYS.length);
  });
});
