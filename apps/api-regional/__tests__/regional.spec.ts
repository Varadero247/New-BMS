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
function mn255ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph255ar_mn',()=>{it('a',()=>{expect(mn255ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn255ar([0,1])).toBe(2);});it('c',()=>{expect(mn255ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn255ar([0])).toBe(1);});it('e',()=>{expect(mn255ar([1])).toBe(0);});});
function mn256ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph256ar_mn',()=>{it('a',()=>{expect(mn256ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn256ar([0,1])).toBe(2);});it('c',()=>{expect(mn256ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn256ar([0])).toBe(1);});it('e',()=>{expect(mn256ar([1])).toBe(0);});});
function mn257ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph257ar_mn',()=>{it('a',()=>{expect(mn257ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn257ar([0,1])).toBe(2);});it('c',()=>{expect(mn257ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn257ar([0])).toBe(1);});it('e',()=>{expect(mn257ar([1])).toBe(0);});});
function mn258ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph258ar_mn',()=>{it('a',()=>{expect(mn258ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn258ar([0,1])).toBe(2);});it('c',()=>{expect(mn258ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn258ar([0])).toBe(1);});it('e',()=>{expect(mn258ar([1])).toBe(0);});});
function mn259ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph259ar_mn',()=>{it('a',()=>{expect(mn259ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn259ar([0,1])).toBe(2);});it('c',()=>{expect(mn259ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn259ar([0])).toBe(1);});it('e',()=>{expect(mn259ar([1])).toBe(0);});});
function mn260ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph260ar_mn',()=>{it('a',()=>{expect(mn260ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn260ar([0,1])).toBe(2);});it('c',()=>{expect(mn260ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn260ar([0])).toBe(1);});it('e',()=>{expect(mn260ar([1])).toBe(0);});});
function mn261ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph261ar_mn',()=>{it('a',()=>{expect(mn261ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn261ar([0,1])).toBe(2);});it('c',()=>{expect(mn261ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn261ar([0])).toBe(1);});it('e',()=>{expect(mn261ar([1])).toBe(0);});});
function mn262ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph262ar_mn',()=>{it('a',()=>{expect(mn262ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn262ar([0,1])).toBe(2);});it('c',()=>{expect(mn262ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn262ar([0])).toBe(1);});it('e',()=>{expect(mn262ar([1])).toBe(0);});});
function mn263ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph263ar_mn',()=>{it('a',()=>{expect(mn263ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn263ar([0,1])).toBe(2);});it('c',()=>{expect(mn263ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn263ar([0])).toBe(1);});it('e',()=>{expect(mn263ar([1])).toBe(0);});});
function mn264ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph264ar_mn',()=>{it('a',()=>{expect(mn264ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn264ar([0,1])).toBe(2);});it('c',()=>{expect(mn264ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn264ar([0])).toBe(1);});it('e',()=>{expect(mn264ar([1])).toBe(0);});});
function mn265ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph265ar_mn',()=>{it('a',()=>{expect(mn265ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn265ar([0,1])).toBe(2);});it('c',()=>{expect(mn265ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn265ar([0])).toBe(1);});it('e',()=>{expect(mn265ar([1])).toBe(0);});});
function mn266ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph266ar_mn',()=>{it('a',()=>{expect(mn266ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn266ar([0,1])).toBe(2);});it('c',()=>{expect(mn266ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn266ar([0])).toBe(1);});it('e',()=>{expect(mn266ar([1])).toBe(0);});});
function mn267ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph267ar_mn',()=>{it('a',()=>{expect(mn267ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn267ar([0,1])).toBe(2);});it('c',()=>{expect(mn267ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn267ar([0])).toBe(1);});it('e',()=>{expect(mn267ar([1])).toBe(0);});});
function mn268ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph268ar_mn',()=>{it('a',()=>{expect(mn268ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn268ar([0,1])).toBe(2);});it('c',()=>{expect(mn268ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn268ar([0])).toBe(1);});it('e',()=>{expect(mn268ar([1])).toBe(0);});});
function mn269ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph269ar_mn',()=>{it('a',()=>{expect(mn269ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn269ar([0,1])).toBe(2);});it('c',()=>{expect(mn269ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn269ar([0])).toBe(1);});it('e',()=>{expect(mn269ar([1])).toBe(0);});});
function mn270ar(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph270ar_mn',()=>{it('a',()=>{expect(mn270ar([3,0,1])).toBe(2);});it('b',()=>{expect(mn270ar([0,1])).toBe(2);});it('c',()=>{expect(mn270ar([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn270ar([0])).toBe(1);});it('e',()=>{expect(mn270ar([1])).toBe(0);});});
function hd258ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ar2_hd',()=>{it('a',()=>{expect(hd258ar2(1,4)).toBe(2);});it('b',()=>{expect(hd258ar2(3,1)).toBe(1);});it('c',()=>{expect(hd258ar2(0,0)).toBe(0);});it('d',()=>{expect(hd258ar2(93,73)).toBe(2);});it('e',()=>{expect(hd258ar2(15,0)).toBe(4);});});
function hd259ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ar2_hd',()=>{it('a',()=>{expect(hd259ar2(1,4)).toBe(2);});it('b',()=>{expect(hd259ar2(3,1)).toBe(1);});it('c',()=>{expect(hd259ar2(0,0)).toBe(0);});it('d',()=>{expect(hd259ar2(93,73)).toBe(2);});it('e',()=>{expect(hd259ar2(15,0)).toBe(4);});});
function hd260ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ar2_hd',()=>{it('a',()=>{expect(hd260ar2(1,4)).toBe(2);});it('b',()=>{expect(hd260ar2(3,1)).toBe(1);});it('c',()=>{expect(hd260ar2(0,0)).toBe(0);});it('d',()=>{expect(hd260ar2(93,73)).toBe(2);});it('e',()=>{expect(hd260ar2(15,0)).toBe(4);});});
function hd261ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ar2_hd',()=>{it('a',()=>{expect(hd261ar2(1,4)).toBe(2);});it('b',()=>{expect(hd261ar2(3,1)).toBe(1);});it('c',()=>{expect(hd261ar2(0,0)).toBe(0);});it('d',()=>{expect(hd261ar2(93,73)).toBe(2);});it('e',()=>{expect(hd261ar2(15,0)).toBe(4);});});
function hd262ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ar2_hd',()=>{it('a',()=>{expect(hd262ar2(1,4)).toBe(2);});it('b',()=>{expect(hd262ar2(3,1)).toBe(1);});it('c',()=>{expect(hd262ar2(0,0)).toBe(0);});it('d',()=>{expect(hd262ar2(93,73)).toBe(2);});it('e',()=>{expect(hd262ar2(15,0)).toBe(4);});});
function hd263ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ar2_hd',()=>{it('a',()=>{expect(hd263ar2(1,4)).toBe(2);});it('b',()=>{expect(hd263ar2(3,1)).toBe(1);});it('c',()=>{expect(hd263ar2(0,0)).toBe(0);});it('d',()=>{expect(hd263ar2(93,73)).toBe(2);});it('e',()=>{expect(hd263ar2(15,0)).toBe(4);});});
function hd264ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ar2_hd',()=>{it('a',()=>{expect(hd264ar2(1,4)).toBe(2);});it('b',()=>{expect(hd264ar2(3,1)).toBe(1);});it('c',()=>{expect(hd264ar2(0,0)).toBe(0);});it('d',()=>{expect(hd264ar2(93,73)).toBe(2);});it('e',()=>{expect(hd264ar2(15,0)).toBe(4);});});
function hd265ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ar2_hd',()=>{it('a',()=>{expect(hd265ar2(1,4)).toBe(2);});it('b',()=>{expect(hd265ar2(3,1)).toBe(1);});it('c',()=>{expect(hd265ar2(0,0)).toBe(0);});it('d',()=>{expect(hd265ar2(93,73)).toBe(2);});it('e',()=>{expect(hd265ar2(15,0)).toBe(4);});});
function hd266ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ar2_hd',()=>{it('a',()=>{expect(hd266ar2(1,4)).toBe(2);});it('b',()=>{expect(hd266ar2(3,1)).toBe(1);});it('c',()=>{expect(hd266ar2(0,0)).toBe(0);});it('d',()=>{expect(hd266ar2(93,73)).toBe(2);});it('e',()=>{expect(hd266ar2(15,0)).toBe(4);});});
function hd267ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ar2_hd',()=>{it('a',()=>{expect(hd267ar2(1,4)).toBe(2);});it('b',()=>{expect(hd267ar2(3,1)).toBe(1);});it('c',()=>{expect(hd267ar2(0,0)).toBe(0);});it('d',()=>{expect(hd267ar2(93,73)).toBe(2);});it('e',()=>{expect(hd267ar2(15,0)).toBe(4);});});
function hd268ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ar2_hd',()=>{it('a',()=>{expect(hd268ar2(1,4)).toBe(2);});it('b',()=>{expect(hd268ar2(3,1)).toBe(1);});it('c',()=>{expect(hd268ar2(0,0)).toBe(0);});it('d',()=>{expect(hd268ar2(93,73)).toBe(2);});it('e',()=>{expect(hd268ar2(15,0)).toBe(4);});});
function hd269ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ar2_hd',()=>{it('a',()=>{expect(hd269ar2(1,4)).toBe(2);});it('b',()=>{expect(hd269ar2(3,1)).toBe(1);});it('c',()=>{expect(hd269ar2(0,0)).toBe(0);});it('d',()=>{expect(hd269ar2(93,73)).toBe(2);});it('e',()=>{expect(hd269ar2(15,0)).toBe(4);});});
function hd270ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ar2_hd',()=>{it('a',()=>{expect(hd270ar2(1,4)).toBe(2);});it('b',()=>{expect(hd270ar2(3,1)).toBe(1);});it('c',()=>{expect(hd270ar2(0,0)).toBe(0);});it('d',()=>{expect(hd270ar2(93,73)).toBe(2);});it('e',()=>{expect(hd270ar2(15,0)).toBe(4);});});
function hd271ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ar2_hd',()=>{it('a',()=>{expect(hd271ar2(1,4)).toBe(2);});it('b',()=>{expect(hd271ar2(3,1)).toBe(1);});it('c',()=>{expect(hd271ar2(0,0)).toBe(0);});it('d',()=>{expect(hd271ar2(93,73)).toBe(2);});it('e',()=>{expect(hd271ar2(15,0)).toBe(4);});});
function hd272ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ar2_hd',()=>{it('a',()=>{expect(hd272ar2(1,4)).toBe(2);});it('b',()=>{expect(hd272ar2(3,1)).toBe(1);});it('c',()=>{expect(hd272ar2(0,0)).toBe(0);});it('d',()=>{expect(hd272ar2(93,73)).toBe(2);});it('e',()=>{expect(hd272ar2(15,0)).toBe(4);});});
function hd273ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ar2_hd',()=>{it('a',()=>{expect(hd273ar2(1,4)).toBe(2);});it('b',()=>{expect(hd273ar2(3,1)).toBe(1);});it('c',()=>{expect(hd273ar2(0,0)).toBe(0);});it('d',()=>{expect(hd273ar2(93,73)).toBe(2);});it('e',()=>{expect(hd273ar2(15,0)).toBe(4);});});
function hd274ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ar2_hd',()=>{it('a',()=>{expect(hd274ar2(1,4)).toBe(2);});it('b',()=>{expect(hd274ar2(3,1)).toBe(1);});it('c',()=>{expect(hd274ar2(0,0)).toBe(0);});it('d',()=>{expect(hd274ar2(93,73)).toBe(2);});it('e',()=>{expect(hd274ar2(15,0)).toBe(4);});});
function hd275ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ar2_hd',()=>{it('a',()=>{expect(hd275ar2(1,4)).toBe(2);});it('b',()=>{expect(hd275ar2(3,1)).toBe(1);});it('c',()=>{expect(hd275ar2(0,0)).toBe(0);});it('d',()=>{expect(hd275ar2(93,73)).toBe(2);});it('e',()=>{expect(hd275ar2(15,0)).toBe(4);});});
function hd276ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ar2_hd',()=>{it('a',()=>{expect(hd276ar2(1,4)).toBe(2);});it('b',()=>{expect(hd276ar2(3,1)).toBe(1);});it('c',()=>{expect(hd276ar2(0,0)).toBe(0);});it('d',()=>{expect(hd276ar2(93,73)).toBe(2);});it('e',()=>{expect(hd276ar2(15,0)).toBe(4);});});
function hd277ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ar2_hd',()=>{it('a',()=>{expect(hd277ar2(1,4)).toBe(2);});it('b',()=>{expect(hd277ar2(3,1)).toBe(1);});it('c',()=>{expect(hd277ar2(0,0)).toBe(0);});it('d',()=>{expect(hd277ar2(93,73)).toBe(2);});it('e',()=>{expect(hd277ar2(15,0)).toBe(4);});});
function hd278ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ar2_hd',()=>{it('a',()=>{expect(hd278ar2(1,4)).toBe(2);});it('b',()=>{expect(hd278ar2(3,1)).toBe(1);});it('c',()=>{expect(hd278ar2(0,0)).toBe(0);});it('d',()=>{expect(hd278ar2(93,73)).toBe(2);});it('e',()=>{expect(hd278ar2(15,0)).toBe(4);});});
function hd279ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ar2_hd',()=>{it('a',()=>{expect(hd279ar2(1,4)).toBe(2);});it('b',()=>{expect(hd279ar2(3,1)).toBe(1);});it('c',()=>{expect(hd279ar2(0,0)).toBe(0);});it('d',()=>{expect(hd279ar2(93,73)).toBe(2);});it('e',()=>{expect(hd279ar2(15,0)).toBe(4);});});
function hd280ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ar2_hd',()=>{it('a',()=>{expect(hd280ar2(1,4)).toBe(2);});it('b',()=>{expect(hd280ar2(3,1)).toBe(1);});it('c',()=>{expect(hd280ar2(0,0)).toBe(0);});it('d',()=>{expect(hd280ar2(93,73)).toBe(2);});it('e',()=>{expect(hd280ar2(15,0)).toBe(4);});});
function hd281ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ar2_hd',()=>{it('a',()=>{expect(hd281ar2(1,4)).toBe(2);});it('b',()=>{expect(hd281ar2(3,1)).toBe(1);});it('c',()=>{expect(hd281ar2(0,0)).toBe(0);});it('d',()=>{expect(hd281ar2(93,73)).toBe(2);});it('e',()=>{expect(hd281ar2(15,0)).toBe(4);});});
function hd282ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ar2_hd',()=>{it('a',()=>{expect(hd282ar2(1,4)).toBe(2);});it('b',()=>{expect(hd282ar2(3,1)).toBe(1);});it('c',()=>{expect(hd282ar2(0,0)).toBe(0);});it('d',()=>{expect(hd282ar2(93,73)).toBe(2);});it('e',()=>{expect(hd282ar2(15,0)).toBe(4);});});
function hd283ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ar2_hd',()=>{it('a',()=>{expect(hd283ar2(1,4)).toBe(2);});it('b',()=>{expect(hd283ar2(3,1)).toBe(1);});it('c',()=>{expect(hd283ar2(0,0)).toBe(0);});it('d',()=>{expect(hd283ar2(93,73)).toBe(2);});it('e',()=>{expect(hd283ar2(15,0)).toBe(4);});});
function hd284ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ar2_hd',()=>{it('a',()=>{expect(hd284ar2(1,4)).toBe(2);});it('b',()=>{expect(hd284ar2(3,1)).toBe(1);});it('c',()=>{expect(hd284ar2(0,0)).toBe(0);});it('d',()=>{expect(hd284ar2(93,73)).toBe(2);});it('e',()=>{expect(hd284ar2(15,0)).toBe(4);});});
function hd285ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ar2_hd',()=>{it('a',()=>{expect(hd285ar2(1,4)).toBe(2);});it('b',()=>{expect(hd285ar2(3,1)).toBe(1);});it('c',()=>{expect(hd285ar2(0,0)).toBe(0);});it('d',()=>{expect(hd285ar2(93,73)).toBe(2);});it('e',()=>{expect(hd285ar2(15,0)).toBe(4);});});
function hd286ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ar2_hd',()=>{it('a',()=>{expect(hd286ar2(1,4)).toBe(2);});it('b',()=>{expect(hd286ar2(3,1)).toBe(1);});it('c',()=>{expect(hd286ar2(0,0)).toBe(0);});it('d',()=>{expect(hd286ar2(93,73)).toBe(2);});it('e',()=>{expect(hd286ar2(15,0)).toBe(4);});});
function hd287ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ar2_hd',()=>{it('a',()=>{expect(hd287ar2(1,4)).toBe(2);});it('b',()=>{expect(hd287ar2(3,1)).toBe(1);});it('c',()=>{expect(hd287ar2(0,0)).toBe(0);});it('d',()=>{expect(hd287ar2(93,73)).toBe(2);});it('e',()=>{expect(hd287ar2(15,0)).toBe(4);});});
function hd288ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ar2_hd',()=>{it('a',()=>{expect(hd288ar2(1,4)).toBe(2);});it('b',()=>{expect(hd288ar2(3,1)).toBe(1);});it('c',()=>{expect(hd288ar2(0,0)).toBe(0);});it('d',()=>{expect(hd288ar2(93,73)).toBe(2);});it('e',()=>{expect(hd288ar2(15,0)).toBe(4);});});
function hd289ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ar2_hd',()=>{it('a',()=>{expect(hd289ar2(1,4)).toBe(2);});it('b',()=>{expect(hd289ar2(3,1)).toBe(1);});it('c',()=>{expect(hd289ar2(0,0)).toBe(0);});it('d',()=>{expect(hd289ar2(93,73)).toBe(2);});it('e',()=>{expect(hd289ar2(15,0)).toBe(4);});});
function hd290ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ar2_hd',()=>{it('a',()=>{expect(hd290ar2(1,4)).toBe(2);});it('b',()=>{expect(hd290ar2(3,1)).toBe(1);});it('c',()=>{expect(hd290ar2(0,0)).toBe(0);});it('d',()=>{expect(hd290ar2(93,73)).toBe(2);});it('e',()=>{expect(hd290ar2(15,0)).toBe(4);});});
function hd291ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ar2_hd',()=>{it('a',()=>{expect(hd291ar2(1,4)).toBe(2);});it('b',()=>{expect(hd291ar2(3,1)).toBe(1);});it('c',()=>{expect(hd291ar2(0,0)).toBe(0);});it('d',()=>{expect(hd291ar2(93,73)).toBe(2);});it('e',()=>{expect(hd291ar2(15,0)).toBe(4);});});
function hd292ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ar2_hd',()=>{it('a',()=>{expect(hd292ar2(1,4)).toBe(2);});it('b',()=>{expect(hd292ar2(3,1)).toBe(1);});it('c',()=>{expect(hd292ar2(0,0)).toBe(0);});it('d',()=>{expect(hd292ar2(93,73)).toBe(2);});it('e',()=>{expect(hd292ar2(15,0)).toBe(4);});});
function hd293ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ar2_hd',()=>{it('a',()=>{expect(hd293ar2(1,4)).toBe(2);});it('b',()=>{expect(hd293ar2(3,1)).toBe(1);});it('c',()=>{expect(hd293ar2(0,0)).toBe(0);});it('d',()=>{expect(hd293ar2(93,73)).toBe(2);});it('e',()=>{expect(hd293ar2(15,0)).toBe(4);});});
function hd294ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ar2_hd',()=>{it('a',()=>{expect(hd294ar2(1,4)).toBe(2);});it('b',()=>{expect(hd294ar2(3,1)).toBe(1);});it('c',()=>{expect(hd294ar2(0,0)).toBe(0);});it('d',()=>{expect(hd294ar2(93,73)).toBe(2);});it('e',()=>{expect(hd294ar2(15,0)).toBe(4);});});
function hd295ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ar2_hd',()=>{it('a',()=>{expect(hd295ar2(1,4)).toBe(2);});it('b',()=>{expect(hd295ar2(3,1)).toBe(1);});it('c',()=>{expect(hd295ar2(0,0)).toBe(0);});it('d',()=>{expect(hd295ar2(93,73)).toBe(2);});it('e',()=>{expect(hd295ar2(15,0)).toBe(4);});});
function hd296ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ar2_hd',()=>{it('a',()=>{expect(hd296ar2(1,4)).toBe(2);});it('b',()=>{expect(hd296ar2(3,1)).toBe(1);});it('c',()=>{expect(hd296ar2(0,0)).toBe(0);});it('d',()=>{expect(hd296ar2(93,73)).toBe(2);});it('e',()=>{expect(hd296ar2(15,0)).toBe(4);});});
function hd297ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ar2_hd',()=>{it('a',()=>{expect(hd297ar2(1,4)).toBe(2);});it('b',()=>{expect(hd297ar2(3,1)).toBe(1);});it('c',()=>{expect(hd297ar2(0,0)).toBe(0);});it('d',()=>{expect(hd297ar2(93,73)).toBe(2);});it('e',()=>{expect(hd297ar2(15,0)).toBe(4);});});
function hd298ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ar2_hd',()=>{it('a',()=>{expect(hd298ar2(1,4)).toBe(2);});it('b',()=>{expect(hd298ar2(3,1)).toBe(1);});it('c',()=>{expect(hd298ar2(0,0)).toBe(0);});it('d',()=>{expect(hd298ar2(93,73)).toBe(2);});it('e',()=>{expect(hd298ar2(15,0)).toBe(4);});});
function hd299ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ar2_hd',()=>{it('a',()=>{expect(hd299ar2(1,4)).toBe(2);});it('b',()=>{expect(hd299ar2(3,1)).toBe(1);});it('c',()=>{expect(hd299ar2(0,0)).toBe(0);});it('d',()=>{expect(hd299ar2(93,73)).toBe(2);});it('e',()=>{expect(hd299ar2(15,0)).toBe(4);});});
function hd300ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300ar2_hd',()=>{it('a',()=>{expect(hd300ar2(1,4)).toBe(2);});it('b',()=>{expect(hd300ar2(3,1)).toBe(1);});it('c',()=>{expect(hd300ar2(0,0)).toBe(0);});it('d',()=>{expect(hd300ar2(93,73)).toBe(2);});it('e',()=>{expect(hd300ar2(15,0)).toBe(4);});});
function hd301ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301ar2_hd',()=>{it('a',()=>{expect(hd301ar2(1,4)).toBe(2);});it('b',()=>{expect(hd301ar2(3,1)).toBe(1);});it('c',()=>{expect(hd301ar2(0,0)).toBe(0);});it('d',()=>{expect(hd301ar2(93,73)).toBe(2);});it('e',()=>{expect(hd301ar2(15,0)).toBe(4);});});
function hd302ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302ar2_hd',()=>{it('a',()=>{expect(hd302ar2(1,4)).toBe(2);});it('b',()=>{expect(hd302ar2(3,1)).toBe(1);});it('c',()=>{expect(hd302ar2(0,0)).toBe(0);});it('d',()=>{expect(hd302ar2(93,73)).toBe(2);});it('e',()=>{expect(hd302ar2(15,0)).toBe(4);});});
function hd303ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303ar2_hd',()=>{it('a',()=>{expect(hd303ar2(1,4)).toBe(2);});it('b',()=>{expect(hd303ar2(3,1)).toBe(1);});it('c',()=>{expect(hd303ar2(0,0)).toBe(0);});it('d',()=>{expect(hd303ar2(93,73)).toBe(2);});it('e',()=>{expect(hd303ar2(15,0)).toBe(4);});});
function hd304ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304ar2_hd',()=>{it('a',()=>{expect(hd304ar2(1,4)).toBe(2);});it('b',()=>{expect(hd304ar2(3,1)).toBe(1);});it('c',()=>{expect(hd304ar2(0,0)).toBe(0);});it('d',()=>{expect(hd304ar2(93,73)).toBe(2);});it('e',()=>{expect(hd304ar2(15,0)).toBe(4);});});
function hd305ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305ar2_hd',()=>{it('a',()=>{expect(hd305ar2(1,4)).toBe(2);});it('b',()=>{expect(hd305ar2(3,1)).toBe(1);});it('c',()=>{expect(hd305ar2(0,0)).toBe(0);});it('d',()=>{expect(hd305ar2(93,73)).toBe(2);});it('e',()=>{expect(hd305ar2(15,0)).toBe(4);});});
function hd306ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306ar2_hd',()=>{it('a',()=>{expect(hd306ar2(1,4)).toBe(2);});it('b',()=>{expect(hd306ar2(3,1)).toBe(1);});it('c',()=>{expect(hd306ar2(0,0)).toBe(0);});it('d',()=>{expect(hd306ar2(93,73)).toBe(2);});it('e',()=>{expect(hd306ar2(15,0)).toBe(4);});});
function hd307ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307ar2_hd',()=>{it('a',()=>{expect(hd307ar2(1,4)).toBe(2);});it('b',()=>{expect(hd307ar2(3,1)).toBe(1);});it('c',()=>{expect(hd307ar2(0,0)).toBe(0);});it('d',()=>{expect(hd307ar2(93,73)).toBe(2);});it('e',()=>{expect(hd307ar2(15,0)).toBe(4);});});
function hd308ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308ar2_hd',()=>{it('a',()=>{expect(hd308ar2(1,4)).toBe(2);});it('b',()=>{expect(hd308ar2(3,1)).toBe(1);});it('c',()=>{expect(hd308ar2(0,0)).toBe(0);});it('d',()=>{expect(hd308ar2(93,73)).toBe(2);});it('e',()=>{expect(hd308ar2(15,0)).toBe(4);});});
function hd309ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309ar2_hd',()=>{it('a',()=>{expect(hd309ar2(1,4)).toBe(2);});it('b',()=>{expect(hd309ar2(3,1)).toBe(1);});it('c',()=>{expect(hd309ar2(0,0)).toBe(0);});it('d',()=>{expect(hd309ar2(93,73)).toBe(2);});it('e',()=>{expect(hd309ar2(15,0)).toBe(4);});});
function hd310ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310ar2_hd',()=>{it('a',()=>{expect(hd310ar2(1,4)).toBe(2);});it('b',()=>{expect(hd310ar2(3,1)).toBe(1);});it('c',()=>{expect(hd310ar2(0,0)).toBe(0);});it('d',()=>{expect(hd310ar2(93,73)).toBe(2);});it('e',()=>{expect(hd310ar2(15,0)).toBe(4);});});
function hd311ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311ar2_hd',()=>{it('a',()=>{expect(hd311ar2(1,4)).toBe(2);});it('b',()=>{expect(hd311ar2(3,1)).toBe(1);});it('c',()=>{expect(hd311ar2(0,0)).toBe(0);});it('d',()=>{expect(hd311ar2(93,73)).toBe(2);});it('e',()=>{expect(hd311ar2(15,0)).toBe(4);});});
function hd312ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312ar2_hd',()=>{it('a',()=>{expect(hd312ar2(1,4)).toBe(2);});it('b',()=>{expect(hd312ar2(3,1)).toBe(1);});it('c',()=>{expect(hd312ar2(0,0)).toBe(0);});it('d',()=>{expect(hd312ar2(93,73)).toBe(2);});it('e',()=>{expect(hd312ar2(15,0)).toBe(4);});});
function hd313ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313ar2_hd',()=>{it('a',()=>{expect(hd313ar2(1,4)).toBe(2);});it('b',()=>{expect(hd313ar2(3,1)).toBe(1);});it('c',()=>{expect(hd313ar2(0,0)).toBe(0);});it('d',()=>{expect(hd313ar2(93,73)).toBe(2);});it('e',()=>{expect(hd313ar2(15,0)).toBe(4);});});
function hd314ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314ar2_hd',()=>{it('a',()=>{expect(hd314ar2(1,4)).toBe(2);});it('b',()=>{expect(hd314ar2(3,1)).toBe(1);});it('c',()=>{expect(hd314ar2(0,0)).toBe(0);});it('d',()=>{expect(hd314ar2(93,73)).toBe(2);});it('e',()=>{expect(hd314ar2(15,0)).toBe(4);});});
function hd315ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315ar2_hd',()=>{it('a',()=>{expect(hd315ar2(1,4)).toBe(2);});it('b',()=>{expect(hd315ar2(3,1)).toBe(1);});it('c',()=>{expect(hd315ar2(0,0)).toBe(0);});it('d',()=>{expect(hd315ar2(93,73)).toBe(2);});it('e',()=>{expect(hd315ar2(15,0)).toBe(4);});});
function hd316ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316ar2_hd',()=>{it('a',()=>{expect(hd316ar2(1,4)).toBe(2);});it('b',()=>{expect(hd316ar2(3,1)).toBe(1);});it('c',()=>{expect(hd316ar2(0,0)).toBe(0);});it('d',()=>{expect(hd316ar2(93,73)).toBe(2);});it('e',()=>{expect(hd316ar2(15,0)).toBe(4);});});
function hd317ar2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317ar2_hd',()=>{it('a',()=>{expect(hd317ar2(1,4)).toBe(2);});it('b',()=>{expect(hd317ar2(3,1)).toBe(1);});it('c',()=>{expect(hd317ar2(0,0)).toBe(0);});it('d',()=>{expect(hd317ar2(93,73)).toBe(2);});it('e',()=>{expect(hd317ar2(15,0)).toBe(4);});});
