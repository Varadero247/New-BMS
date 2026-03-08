// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
/**
 * api-regional — unit specification tests
 *
 * Tests pure logic: data shapes, country codes, legislation categories,
 * financial rule types, trade agreement data, and currency/locale utilities.
 * No DB, no HTTP — all in-process.
 */

// ─── Types mirrored from @ims/regional-data ──────────────────────────────────

type LegislationCategory =
  | 'EMPLOYMENT'
  | 'HEALTH_SAFETY'
  | 'ENVIRONMENT'
  | 'DATA_PRIVACY'
  | 'FINANCIAL'
  | 'CORPORATE'
  | 'TRADE'
  | 'ANTI_CORRUPTION'
  | 'CONSUMER_PROTECTION'
  | 'INDUSTRY_SPECIFIC';

type FinancialRuleType =
  | 'CORPORATE_TAX'
  | 'VAT_GST'
  | 'WITHHOLDING_TAX'
  | 'TRANSFER_PRICING'
  | 'CUSTOMS_DUTY'
  | 'PAYROLL_TAX'
  | 'CAPITAL_GAINS'
  | 'STAMP_DUTY';

interface CountryData {
  code: string;           // ISO 3166-1 alpha-2
  name: string;
  currency: string;       // ISO 4217
  locale: string;         // BCP 47
  region: string;
  vatRate?: number;
  corporateTaxRate?: number;
  legislation: { category: LegislationCategory; title: string; mandatory: boolean }[];
  financialRules: { type: FinancialRuleType; rate: number; name: string }[];
}

interface TradeAgreement {
  shortCode: string;
  name: string;
  parties: string[];      // ISO 3166-1 alpha-2 codes
  type: string;
}

// ─── Static fixture data ──────────────────────────────────────────────────────

const COUNTRIES: CountryData[] = [
  {
    code: 'SG', name: 'Singapore', currency: 'SGD', locale: 'en-SG', region: 'ASEAN',
    vatRate: 9, corporateTaxRate: 17,
    legislation: [
      { category: 'EMPLOYMENT', title: 'Employment Act', mandatory: true },
      { category: 'DATA_PRIVACY', title: 'Personal Data Protection Act', mandatory: true },
      { category: 'HEALTH_SAFETY', title: 'Workplace Safety and Health Act', mandatory: true },
      { category: 'ENVIRONMENT', title: 'Environmental Protection and Management Act', mandatory: true },
      { category: 'ANTI_CORRUPTION', title: 'Prevention of Corruption Act', mandatory: true },
      { category: 'FINANCIAL', title: 'Income Tax Act', mandatory: true },
    ],
    financialRules: [
      { type: 'VAT_GST', rate: 9, name: 'Goods and Services Tax' },
      { type: 'CORPORATE_TAX', rate: 17, name: 'Corporate Income Tax' },
      { type: 'WITHHOLDING_TAX', rate: 10, name: 'Withholding Tax (Services)' },
    ],
  },
  {
    code: 'AU', name: 'Australia', currency: 'AUD', locale: 'en-AU', region: 'Pacific',
    vatRate: 10, corporateTaxRate: 30,
    legislation: [
      { category: 'EMPLOYMENT', title: 'Fair Work Act 2009', mandatory: true },
      { category: 'DATA_PRIVACY', title: 'Privacy Act 1988', mandatory: true },
      { category: 'HEALTH_SAFETY', title: 'Work Health and Safety Act', mandatory: true },
      { category: 'ENVIRONMENT', title: 'Environment Protection and Biodiversity Conservation Act', mandatory: true },
      { category: 'CORPORATE', title: 'Corporations Act 2001', mandatory: true },
    ],
    financialRules: [
      { type: 'VAT_GST', rate: 10, name: 'Goods and Services Tax' },
      { type: 'CORPORATE_TAX', rate: 30, name: 'Corporate Income Tax' },
      { type: 'PAYROLL_TAX', rate: 4.85, name: 'Payroll Tax (NSW rate)' },
    ],
  },
  {
    code: 'JP', name: 'Japan', currency: 'JPY', locale: 'ja-JP', region: 'East Asia',
    vatRate: 10, corporateTaxRate: 23.2,
    legislation: [
      { category: 'EMPLOYMENT', title: 'Labor Standards Act', mandatory: true },
      { category: 'DATA_PRIVACY', title: 'Act on Protection of Personal Information', mandatory: true },
    ],
    financialRules: [
      { type: 'VAT_GST', rate: 10, name: 'Consumption Tax' },
      { type: 'CORPORATE_TAX', rate: 23.2, name: 'Corporate Tax' },
    ],
  },
  {
    code: 'IN', name: 'India', currency: 'INR', locale: 'en-IN', region: 'South Asia',
    vatRate: 18, corporateTaxRate: 22,
    legislation: [
      { category: 'EMPLOYMENT', title: 'Code on Wages 2019', mandatory: true },
      { category: 'DATA_PRIVACY', title: 'Digital Personal Data Protection Act 2023', mandatory: true },
      { category: 'HEALTH_SAFETY', title: 'Occupational Safety, Health and Working Conditions Code', mandatory: true },
    ],
    financialRules: [
      { type: 'VAT_GST', rate: 18, name: 'Goods and Services Tax (standard rate)' },
      { type: 'CORPORATE_TAX', rate: 22, name: 'Corporate Income Tax' },
    ],
  },
  {
    code: 'CN', name: 'China', currency: 'CNY', locale: 'zh-CN', region: 'East Asia',
    vatRate: 13, corporateTaxRate: 25,
    legislation: [
      { category: 'EMPLOYMENT', title: 'Labour Law', mandatory: true },
      { category: 'DATA_PRIVACY', title: 'Personal Information Protection Law', mandatory: true },
    ],
    financialRules: [
      { type: 'VAT_GST', rate: 13, name: 'Value Added Tax (standard rate)' },
      { type: 'CORPORATE_TAX', rate: 25, name: 'Enterprise Income Tax' },
    ],
  },
];

const TRADE_AGREEMENTS: TradeAgreement[] = [
  { shortCode: 'RCEP', name: 'Regional Comprehensive Economic Partnership', parties: ['CN','JP','KR','AU','NZ','SG','MY','ID','TH','PH','VN','BN','MM','KH','LA'], type: 'FTA' },
  { shortCode: 'CPTPP', name: 'Comprehensive and Progressive Agreement for Trans-Pacific Partnership', parties: ['AU','NZ','SG','MY','VN','BN','JP','CA','MX','CL','PE'], type: 'FTA' },
  { shortCode: 'ASEAN-FTA', name: 'ASEAN Free Trade Area', parties: ['SG','MY','ID','TH','PH','VN','BN','MM','KH','LA'], type: 'FTA' },
  { shortCode: 'AUSFTA', name: 'Australia-United States Free Trade Agreement', parties: ['AU','US'], type: 'BILATERAL_FTA' },
  { shortCode: 'ChAFTA', name: 'China-Australia Free Trade Agreement', parties: ['CN','AU'], type: 'BILATERAL_FTA' },
];

const ASEAN_MEMBERS = ['SG','MY','ID','TH','PH','VN','BN','MM','KH','LA'];
const ISO_STANDARDS = ['ISO 9001:2015','ISO 14001:2015','ISO 45001:2018','ISO 27001:2022','ISO 31000:2018'];

// ─── Country data ─────────────────────────────────────────────────────────────

describe('Country data', () => {
  it('should have unique ISO 3166-1 alpha-2 codes', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('should have valid 2-letter ISO codes', () => {
    for (const c of COUNTRIES) {
      expect(c.code).toMatch(/^[A-Z]{2}$/);
    }
  });

  it('should have non-empty names', () => {
    for (const c of COUNTRIES) {
      expect(c.name.trim().length).toBeGreaterThan(0);
    }
  });

  it('should have valid ISO 4217 currency codes (3 uppercase letters)', () => {
    for (const c of COUNTRIES) {
      expect(c.currency).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('should have valid BCP 47 locale codes', () => {
    for (const c of COUNTRIES) {
      expect(c.locale).toMatch(/^[a-z]{2,3}(-[A-Z]{2})?$/);
    }
  });

  it('should have at least one legislation entry', () => {
    for (const c of COUNTRIES) {
      expect(c.legislation.length).toBeGreaterThan(0);
    }
  });

  it('should have at least one financial rule', () => {
    for (const c of COUNTRIES) {
      expect(c.financialRules.length).toBeGreaterThan(0);
    }
  });

  it('Singapore GST rate should be 9%', () => {
    const sg = COUNTRIES.find((c) => c.code === 'SG')!;
    expect(sg.vatRate).toBe(9);
  });

  it('Australia corporate tax rate should be 30%', () => {
    const au = COUNTRIES.find((c) => c.code === 'AU')!;
    expect(au.corporateTaxRate).toBe(30);
  });

  it('Japan locale should be ja-JP', () => {
    const jp = COUNTRIES.find((c) => c.code === 'JP')!;
    expect(jp.locale).toBe('ja-JP');
  });

  it('India GST standard rate should be 18%', () => {
    const india = COUNTRIES.find((c) => c.code === 'IN')!;
    const gst = india.financialRules.find((r) => r.type === 'VAT_GST')!;
    expect(gst.rate).toBe(18);
  });
});

// ─── Legislation categories ───────────────────────────────────────────────────

describe('Legislation categories', () => {
  const VALID_CATEGORIES: LegislationCategory[] = [
    'EMPLOYMENT','HEALTH_SAFETY','ENVIRONMENT','DATA_PRIVACY','FINANCIAL',
    'CORPORATE','TRADE','ANTI_CORRUPTION','CONSUMER_PROTECTION','INDUSTRY_SPECIFIC',
  ];

  it('all legislation entries should have a valid category', () => {
    for (const country of COUNTRIES) {
      for (const leg of country.legislation) {
        expect(VALID_CATEGORIES).toContain(leg.category);
      }
    }
  });

  it('all legislation entries should have a non-empty title', () => {
    for (const country of COUNTRIES) {
      for (const leg of country.legislation) {
        expect(leg.title.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('mandatory legislation should be boolean', () => {
    for (const country of COUNTRIES) {
      for (const leg of country.legislation) {
        expect(typeof leg.mandatory).toBe('boolean');
      }
    }
  });

  it('Singapore should have Data Privacy legislation', () => {
    const sg = COUNTRIES.find((c) => c.code === 'SG')!;
    const dp = sg.legislation.find((l) => l.category === 'DATA_PRIVACY');
    expect(dp).toBeDefined();
    expect(dp!.mandatory).toBe(true);
  });

  it('should categorise legislation correctly', () => {
    const categoryCounts = new Map<LegislationCategory, number>();
    for (const country of COUNTRIES) {
      for (const leg of country.legislation) {
        categoryCounts.set(leg.category, (categoryCounts.get(leg.category) || 0) + 1);
      }
    }
    expect(categoryCounts.get('EMPLOYMENT')).toBeGreaterThan(0);
    expect(categoryCounts.get('DATA_PRIVACY')).toBeGreaterThan(0);
  });
});

// ─── Financial rule types ─────────────────────────────────────────────────────

describe('Financial rule types', () => {
  const VALID_RULE_TYPES: FinancialRuleType[] = [
    'CORPORATE_TAX','VAT_GST','WITHHOLDING_TAX','TRANSFER_PRICING',
    'CUSTOMS_DUTY','PAYROLL_TAX','CAPITAL_GAINS','STAMP_DUTY',
  ];

  it('all financial rules should have a valid type', () => {
    for (const country of COUNTRIES) {
      for (const rule of country.financialRules) {
        expect(VALID_RULE_TYPES).toContain(rule.type);
      }
    }
  });

  it('tax rates should be non-negative numbers', () => {
    for (const country of COUNTRIES) {
      for (const rule of country.financialRules) {
        expect(typeof rule.rate).toBe('number');
        expect(rule.rate).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('tax rates should not exceed 100%', () => {
    for (const country of COUNTRIES) {
      for (const rule of country.financialRules) {
        expect(rule.rate).toBeLessThanOrEqual(100);
      }
    }
  });

  it('all financial rules should have a non-empty name', () => {
    for (const country of COUNTRIES) {
      for (const rule of country.financialRules) {
        expect(rule.name.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── Trade agreements ─────────────────────────────────────────────────────────

describe('Trade agreements', () => {
  it('all agreements should have a unique shortCode', () => {
    const codes = TRADE_AGREEMENTS.map((a) => a.shortCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all agreements should have at least 2 parties', () => {
    for (const ta of TRADE_AGREEMENTS) {
      expect(ta.parties.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('all party codes should be valid ISO 3166-1 alpha-2', () => {
    for (const ta of TRADE_AGREEMENTS) {
      for (const code of ta.parties) {
        expect(code).toMatch(/^[A-Z]{2}$/);
      }
    }
  });

  it('RCEP should include all ASEAN members', () => {
    const rcep = TRADE_AGREEMENTS.find((a) => a.shortCode === 'RCEP')!;
    for (const member of ASEAN_MEMBERS) {
      expect(rcep.parties).toContain(member);
    }
  });

  it('CPTPP should include Australia, Singapore, Japan and New Zealand', () => {
    const cptpp = TRADE_AGREEMENTS.find((a) => a.shortCode === 'CPTPP')!;
    for (const code of ['AU','SG','JP','NZ']) {
      expect(cptpp.parties).toContain(code);
    }
  });

  it('ASEAN-FTA should include exactly 10 members', () => {
    const asean = TRADE_AGREEMENTS.find((a) => a.shortCode === 'ASEAN-FTA')!;
    expect(asean.parties.length).toBe(10);
  });

  it('bilateral agreements should have exactly 2 parties', () => {
    const bilateral = TRADE_AGREEMENTS.filter((a) => a.type === 'BILATERAL_FTA');
    for (const b of bilateral) {
      expect(b.parties.length).toBe(2);
    }
  });

  it('Singapore should be party to RCEP, CPTPP, and ASEAN-FTA', () => {
    for (const code of ['RCEP','CPTPP','ASEAN-FTA']) {
      const ta = TRADE_AGREEMENTS.find((a) => a.shortCode === code)!;
      expect(ta.parties).toContain('SG');
    }
  });
});

// ─── ISO standard mappings ────────────────────────────────────────────────────

describe('ISO standard codes', () => {
  it('should follow the ISO NNNNN:YYYY format', () => {
    for (const std of ISO_STANDARDS) {
      expect(std).toMatch(/^ISO \d+:\d{4}$/);
    }
  });

  it('all years should be between 1990 and 2030', () => {
    for (const std of ISO_STANDARDS) {
      const year = parseInt(std.split(':')[1]);
      expect(year).toBeGreaterThanOrEqual(1990);
      expect(year).toBeLessThanOrEqual(2030);
    }
  });
});

// ─── Currency formatting ──────────────────────────────────────────────────────

describe('Currency formatting logic', () => {
  const formatCurrency = (amount: number, currency: string, locale: string): string =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

  const cases: [number, string, string][] = [
    [100, 'SGD', 'en-SG'],
    [100, 'AUD', 'en-AU'],
    [100, 'JPY', 'ja-JP'],
    [100, 'INR', 'en-IN'],
    [100, 'CNY', 'zh-CN'],
  ];

  for (const [amount, currency, locale] of cases) {
    it(`should format ${amount} ${currency} without throwing (${locale})`, () => {
      expect(() => formatCurrency(amount, currency, locale)).not.toThrow();
      const result = formatCurrency(amount, currency, locale);
      expect(result.length).toBeGreaterThan(0);
    });
  }

  it('SGD 0 should format to a valid string', () => {
    const result = formatCurrency(0, 'SGD', 'en-SG');
    expect(result).toContain('0');
  });

  it('large JPY amounts should not show decimal places', () => {
    const result = formatCurrency(10000, 'JPY', 'ja-JP');
    expect(result).not.toContain('.');
  });
});

// ─── Region grouping ──────────────────────────────────────────────────────────

describe('Region grouping', () => {
  const VALID_REGIONS = ['ASEAN', 'East Asia', 'South Asia', 'Pacific', 'Middle East'];

  it('all country regions should be from the known region list', () => {
    for (const c of COUNTRIES) {
      expect(VALID_REGIONS).toContain(c.region);
    }
  });

  it('ASEAN countries should be grouped correctly', () => {
    const asean = COUNTRIES.filter((c) => c.region === 'ASEAN');
    // Our fixture only has SG from ASEAN
    expect(asean.length).toBeGreaterThanOrEqual(1);
    for (const c of asean) {
      expect(ASEAN_MEMBERS).toContain(c.code);
    }
  });

  it('East Asia group should include Japan and China', () => {
    const eastAsia = COUNTRIES.filter((c) => c.region === 'East Asia');
    const codes = eastAsia.map((c) => c.code);
    expect(codes).toContain('JP');
    expect(codes).toContain('CN');
  });
});

// ─── API response shape ───────────────────────────────────────────────────────

describe('API response shape helpers', () => {
  const ok = <T>(data: T) => ({ success: true, data });
  const fail = (code: string, message: string) => ({
    success: false,
    error: { code, message },
  });

  it('ok() should wrap data correctly', () => {
    const r = ok({ count: 24 });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({ count: 24 });
  });

  it('fail() should structure error correctly', () => {
    const r = fail('NOT_FOUND', 'Country not found');
    expect(r.success).toBe(false);
    expect(r.error.code).toBe('NOT_FOUND');
    expect(r.error.message).toBe('Country not found');
  });

  it('ok() should handle array data', () => {
    const r = ok(COUNTRIES);
    expect(Array.isArray(r.data)).toBe(true);
    expect(r.data.length).toBe(COUNTRIES.length);
  });
});
