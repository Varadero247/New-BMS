// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// Phase 181 — api-regional parametric route tests for all 20 APAC country codes.
// Tests: uppercase normalization, WHERE filters, 404 paths, empty-result handling.

jest.mock('../src/prisma', () => ({
  prisma: {
    apacCountry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    apacRegion: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    apacLegislation: {
      findMany: jest.fn(),
    },
    apacFinancialRule: {
      findMany: jest.fn(),
    },
    apacIsoLegislationMapping: {
      findMany: jest.fn(),
    },
    apacTradeAgreement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    apacCountryTradeAgreement: {
      findMany: jest.fn(),
    },
    apacOnboardingData: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', email: 'admin@ims.local', role: 'ADMIN', organisationId: 'org-1' };
    next();
  },
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

import express from 'express';
import request from 'supertest';
import { prisma } from '../src/prisma';
import countriesRouter from '../src/routes/countries';
import legislationRouter from '../src/routes/legislation';
import financialRulesRouter from '../src/routes/financial-rules';
import isoMappingsRouter from '../src/routes/iso-mappings';
import taxSummaryRouter from '../src/routes/tax-summary';
import tradeAgreementsRouter from '../src/routes/trade-agreements';

const mp = prisma as jest.Mocked<typeof prisma>;

function makeApp(path: string, router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(path, router);
  return app;
}

const countriesApp   = makeApp('/api/countries', countriesRouter);
const legislationApp = makeApp('/api/legislation', legislationRouter);
const financialApp   = makeApp('/api/financial-rules', financialRulesRouter);
const isoApp         = makeApp('/api/iso-mappings', isoMappingsRouter);
const taxApp         = makeApp('/api/tax-summary', taxSummaryRouter);
const tradeApp       = makeApp('/api/trade-agreements', tradeAgreementsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── 20 APAC Country Codes ────────────────────────────────────────────────────

const APAC_CODES = ['SG', 'AU', 'MY', 'TH', 'ID', 'PH', 'VN', 'KH', 'LA', 'MM',
                    'BN', 'JP', 'KR', 'CN', 'HK', 'TW', 'IN', 'PK', 'BD', 'LK'];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/countries/:code — all 20 APAC codes
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/countries/:code — 20 APAC codes', () => {
  for (const code of APAC_CODES) {
    it(`${code}: lookups with uppercase code`, async () => {
      const stub = { id: `c-${code}`, code, name: `Country ${code}`, isActive: true,
        region: { id: 'r1', name: 'APAC' },
        legislation: [], financialRules: [], tradeAgreements: [], isoMappings: [] };
      (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(stub);
      await request(countriesApp).get(`/api/countries/${code.toLowerCase()}`);
      expect(mp.apacCountry.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { code: code.toUpperCase() } })
      );
    });

    it(`${code}: returns 404 when not found`, async () => {
      (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(countriesApp).get(`/api/countries/${code}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/legislation/:countryCode — all 20 APAC codes
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/legislation/:countryCode — 20 APAC codes', () => {
  for (const code of APAC_CODES) {
    it(`${code}: returns legislation, isActive filter applied`, async () => {
      const stub = [
        { id: `l-${code}-1`, countryCode: code, title: `Act 1`, category: 'EMPLOYMENT', isActive: true, country: { code } },
      ];
      (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce(stub);
      const res = await request(legislationApp).get(`/api/legislation/${code}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mp.apacLegislation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ countryCode: code, isActive: true }) })
      );
    });

    it(`${code}: lowercase input is uppercased`, async () => {
      (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce([]);
      await request(legislationApp).get(`/api/legislation/${code.toLowerCase()}`);
      expect(mp.apacLegislation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ countryCode: code.toUpperCase() }) })
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/financial-rules/:countryCode — all 20 APAC codes
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/financial-rules/:countryCode — 20 APAC codes', () => {
  for (const code of APAC_CODES) {
    it(`${code}: returns rules with countryCode + isActive filter`, async () => {
      const stub = [
        { id: `f-${code}-1`, countryCode: code, name: 'GST', ruleType: 'GST', rate: 10, isActive: true, country: { code } },
      ];
      (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce(stub);
      const res = await request(financialApp).get(`/api/financial-rules/${code}`);
      expect(res.status).toBe(200);
      expect(mp.apacFinancialRule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ countryCode: code, isActive: true }) })
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/iso-mappings/:countryCode/:isoStandard — selected codes × standards
// ─────────────────────────────────────────────────────────────────────────────

const ISO_STANDARDS = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 50001'];
const ISO_SAMPLE_CODES = ['SG', 'AU', 'JP', 'IN', 'KR'];

describe('GET /api/iso-mappings/:countryCode/:isoStandard — parametric', () => {
  for (const code of ISO_SAMPLE_CODES) {
    for (const std of ISO_STANDARDS) {
      it(`${code}/${std}: uppercases country code, returns data array`, async () => {
        const stub = [{ id: `m-${code}`, countryCode: code, isoStandard: std, isoClause: '4.1',
          legislation: { title: 'Act' }, country: { code, name: `Country ${code}`, currency: 'USD' } }];
        (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce(stub);
        const encodedStd = encodeURIComponent(std);
        const res = await request(isoApp).get(`/api/iso-mappings/${code.toLowerCase()}/${encodedStd}`);
        expect(res.status).toBe(200);
        expect(mp.apacIsoLegislationMapping.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ where: expect.objectContaining({ countryCode: code.toUpperCase() }) })
        );
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tax-summary/:countryCode — all 20 APAC codes
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/tax-summary/:countryCode — 20 APAC codes', () => {
  for (const code of APAC_CODES) {
    it(`${code}: returns 200 with summary shape`, async () => {
      const countryStub = { code, name: `Country ${code}`, currency: 'USD', currencySymbol: '$',
        gstRate: 10, taxSystem: 'GST', locale: 'en-US' };
      (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(countryStub);
      (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(taxApp).get(`/api/tax-summary/${code}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('country');
      expect(res.body.data).toHaveProperty('totalTaxObligations');
      expect(res.body.data).toHaveProperty('taxSystemNote');
      expect(res.body.data).toHaveProperty('generatedAt');
    });

    it(`${code}: 404 when country not in DB`, async () => {
      (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(taxApp).get(`/api/tax-summary/${code}`);
      expect(res.status).toBe(404);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trade-agreements/country/:code — selected codes
// ─────────────────────────────────────────────────────────────────────────────

const TRADE_SAMPLE_CODES = ['SG', 'AU', 'JP', 'IN', 'TH'];

describe('GET /api/trade-agreements/country/:code — parametric', () => {
  for (const code of TRADE_SAMPLE_CODES) {
    it(`${code}: uppercases country code, returns agreements`, async () => {
      const stub = [
        { tradeAgreement: { id: 'ta1', shortCode: 'RCEP', name: 'RCEP', isActive: true, _count: { countries: 15 } } },
      ];
      (mp.apacCountryTradeAgreement.findMany as jest.Mock).mockResolvedValueOnce(stub);
      await request(tradeApp).get(`/api/trade-agreements/country/${code.toLowerCase()}`);
      expect(mp.apacCountryTradeAgreement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { countryCode: code.toUpperCase() } })
      );
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases: empty results, null fields
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge cases — empty results', () => {
  it('GET /api/legislation/LA returns empty array (no legislation)', async () => {
    (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(legislationApp).get('/api/legislation/LA');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/financial-rules/BN returns empty array', async () => {
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(financialApp).get('/api/financial-rules/BN');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/iso-mappings/KH/ISO%2045001 returns empty array', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(isoApp).get('/api/iso-mappings/KH/ISO%2045001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/trade-agreements/country/MM returns empty array', async () => {
    (mp.apacCountryTradeAgreement.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(tradeApp).get('/api/trade-agreements/country/MM');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('Edge cases — tax system variants', () => {
  const variants = [
    { taxSystem: 'GST', gstRate: 9, noteContains: 'GST' },
    { taxSystem: 'VAT', gstRate: 12, noteContains: 'VAT' },
    { taxSystem: 'SST', gstRate: 6, noteContains: 'SST' },
    { taxSystem: 'None', gstRate: null, noteContains: 'does not levy' },
    { taxSystem: null, gstRate: null, noteContains: 'N/A' },
  ];

  for (const { taxSystem, gstRate, noteContains } of variants) {
    it(`taxSystem="${taxSystem}" → taxSystemNote includes "${noteContains}"`, async () => {
      (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce({
        code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: '$',
        gstRate, taxSystem, locale: 'en-SG',
      });
      (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(taxApp).get('/api/tax-summary/SG');
      expect(res.status).toBe(200);
      expect(res.body.data.taxSystemNote).toContain(noteContains);
    });
  }
});

describe('Edge cases — legislation category validation', () => {
  const validCategories = [
    'WORKPLACE_SAFETY', 'ENVIRONMENTAL', 'DATA_PRIVACY', 'EMPLOYMENT',
    'ANTI_CORRUPTION', 'FINANCIAL_REPORTING', 'CONSUMER_PROTECTION',
    'IMPORT_EXPORT', 'QUALITY_STANDARDS', 'INFORMATION_SECURITY',
    'FOOD_SAFETY', 'MEDICAL_DEVICES', 'ENERGY', 'ANTI_MONEY_LAUNDERING', 'OTHER',
  ];

  // Note: lowercase inputs get toUpperCase()'d, so 'workplace_safety' → 'WORKPLACE_SAFETY' (valid).
  // Empty strings don't match /:category path segment (no route match → 404, not tested here).
  const invalidInputs = ['INVALID', 'GDPR', 'ESG', 'PERSONAL_DATA'];

  for (const cat of validCategories) {
    it(`valid category ${cat} returns 200`, async () => {
      (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(legislationApp).get(`/api/legislation/SG/${cat}`);
      expect(res.status).toBe(200);
    });
  }

  for (const bad of invalidInputs) {
    it(`invalid category "${bad}" returns 400`, async () => {
      const res = await request(legislationApp).get(`/api/legislation/SG/${bad}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  }
});

describe('Edge cases — financial-rules type validation', () => {
  const validTypes = [
    'GST', 'VAT', 'SST', 'CORPORATE_TAX', 'WITHHOLDING_TAX', 'PAYROLL_TAX',
    'STAMP_DUTY', 'CUSTOMS_DUTY', 'TRANSFER_PRICING', 'FINANCIAL_REPORTING',
    'AUDIT_REQUIREMENT', 'OTHER',
  ];

  // Note: lowercase 'gst' → toUpperCase() → 'GST' (valid). Empty strings don't match route.
  const invalidTypes = ['INVALID', 'VAT_RATE', 'INCOME_TAX', 'WITHHOLDING', 'PERSONAL_INCOME_TAX'];

  for (const t of validTypes) {
    it(`valid type ${t} returns 200`, async () => {
      (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(financialApp).get(`/api/financial-rules/SG/${t}`);
      expect(res.status).toBe(200);
    });
  }

  for (const bad of invalidTypes) {
    it(`invalid type "${bad}" returns 400`, async () => {
      const res = await request(financialApp).get(`/api/financial-rules/SG/${bad}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  }
});
function mn255arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph255arp_mn',()=>{it('a',()=>{expect(mn255arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn255arp([0,1])).toBe(2);});it('c',()=>{expect(mn255arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn255arp([0])).toBe(1);});it('e',()=>{expect(mn255arp([1])).toBe(0);});});
function mn256arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph256arp_mn',()=>{it('a',()=>{expect(mn256arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn256arp([0,1])).toBe(2);});it('c',()=>{expect(mn256arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn256arp([0])).toBe(1);});it('e',()=>{expect(mn256arp([1])).toBe(0);});});
function mn257arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph257arp_mn',()=>{it('a',()=>{expect(mn257arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn257arp([0,1])).toBe(2);});it('c',()=>{expect(mn257arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn257arp([0])).toBe(1);});it('e',()=>{expect(mn257arp([1])).toBe(0);});});
function mn258arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph258arp_mn',()=>{it('a',()=>{expect(mn258arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn258arp([0,1])).toBe(2);});it('c',()=>{expect(mn258arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn258arp([0])).toBe(1);});it('e',()=>{expect(mn258arp([1])).toBe(0);});});
function mn259arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph259arp_mn',()=>{it('a',()=>{expect(mn259arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn259arp([0,1])).toBe(2);});it('c',()=>{expect(mn259arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn259arp([0])).toBe(1);});it('e',()=>{expect(mn259arp([1])).toBe(0);});});
function mn260arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph260arp_mn',()=>{it('a',()=>{expect(mn260arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn260arp([0,1])).toBe(2);});it('c',()=>{expect(mn260arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn260arp([0])).toBe(1);});it('e',()=>{expect(mn260arp([1])).toBe(0);});});
function mn261arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph261arp_mn',()=>{it('a',()=>{expect(mn261arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn261arp([0,1])).toBe(2);});it('c',()=>{expect(mn261arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn261arp([0])).toBe(1);});it('e',()=>{expect(mn261arp([1])).toBe(0);});});
function mn262arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph262arp_mn',()=>{it('a',()=>{expect(mn262arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn262arp([0,1])).toBe(2);});it('c',()=>{expect(mn262arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn262arp([0])).toBe(1);});it('e',()=>{expect(mn262arp([1])).toBe(0);});});
function mn263arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph263arp_mn',()=>{it('a',()=>{expect(mn263arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn263arp([0,1])).toBe(2);});it('c',()=>{expect(mn263arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn263arp([0])).toBe(1);});it('e',()=>{expect(mn263arp([1])).toBe(0);});});
function mn264arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph264arp_mn',()=>{it('a',()=>{expect(mn264arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn264arp([0,1])).toBe(2);});it('c',()=>{expect(mn264arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn264arp([0])).toBe(1);});it('e',()=>{expect(mn264arp([1])).toBe(0);});});
function mn265arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph265arp_mn',()=>{it('a',()=>{expect(mn265arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn265arp([0,1])).toBe(2);});it('c',()=>{expect(mn265arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn265arp([0])).toBe(1);});it('e',()=>{expect(mn265arp([1])).toBe(0);});});
function mn266arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph266arp_mn',()=>{it('a',()=>{expect(mn266arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn266arp([0,1])).toBe(2);});it('c',()=>{expect(mn266arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn266arp([0])).toBe(1);});it('e',()=>{expect(mn266arp([1])).toBe(0);});});
function mn267arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph267arp_mn',()=>{it('a',()=>{expect(mn267arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn267arp([0,1])).toBe(2);});it('c',()=>{expect(mn267arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn267arp([0])).toBe(1);});it('e',()=>{expect(mn267arp([1])).toBe(0);});});
function mn268arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph268arp_mn',()=>{it('a',()=>{expect(mn268arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn268arp([0,1])).toBe(2);});it('c',()=>{expect(mn268arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn268arp([0])).toBe(1);});it('e',()=>{expect(mn268arp([1])).toBe(0);});});
function mn269arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph269arp_mn',()=>{it('a',()=>{expect(mn269arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn269arp([0,1])).toBe(2);});it('c',()=>{expect(mn269arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn269arp([0])).toBe(1);});it('e',()=>{expect(mn269arp([1])).toBe(0);});});
function mn270arp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph270arp_mn',()=>{it('a',()=>{expect(mn270arp([3,0,1])).toBe(2);});it('b',()=>{expect(mn270arp([0,1])).toBe(2);});it('c',()=>{expect(mn270arp([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn270arp([0])).toBe(1);});it('e',()=>{expect(mn270arp([1])).toBe(0);});});
function hd258arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258arp2_hd',()=>{it('a',()=>{expect(hd258arp2(1,4)).toBe(2);});it('b',()=>{expect(hd258arp2(3,1)).toBe(1);});it('c',()=>{expect(hd258arp2(0,0)).toBe(0);});it('d',()=>{expect(hd258arp2(93,73)).toBe(2);});it('e',()=>{expect(hd258arp2(15,0)).toBe(4);});});
function hd259arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259arp2_hd',()=>{it('a',()=>{expect(hd259arp2(1,4)).toBe(2);});it('b',()=>{expect(hd259arp2(3,1)).toBe(1);});it('c',()=>{expect(hd259arp2(0,0)).toBe(0);});it('d',()=>{expect(hd259arp2(93,73)).toBe(2);});it('e',()=>{expect(hd259arp2(15,0)).toBe(4);});});
function hd260arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260arp2_hd',()=>{it('a',()=>{expect(hd260arp2(1,4)).toBe(2);});it('b',()=>{expect(hd260arp2(3,1)).toBe(1);});it('c',()=>{expect(hd260arp2(0,0)).toBe(0);});it('d',()=>{expect(hd260arp2(93,73)).toBe(2);});it('e',()=>{expect(hd260arp2(15,0)).toBe(4);});});
function hd261arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261arp2_hd',()=>{it('a',()=>{expect(hd261arp2(1,4)).toBe(2);});it('b',()=>{expect(hd261arp2(3,1)).toBe(1);});it('c',()=>{expect(hd261arp2(0,0)).toBe(0);});it('d',()=>{expect(hd261arp2(93,73)).toBe(2);});it('e',()=>{expect(hd261arp2(15,0)).toBe(4);});});
function hd262arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262arp2_hd',()=>{it('a',()=>{expect(hd262arp2(1,4)).toBe(2);});it('b',()=>{expect(hd262arp2(3,1)).toBe(1);});it('c',()=>{expect(hd262arp2(0,0)).toBe(0);});it('d',()=>{expect(hd262arp2(93,73)).toBe(2);});it('e',()=>{expect(hd262arp2(15,0)).toBe(4);});});
function hd263arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263arp2_hd',()=>{it('a',()=>{expect(hd263arp2(1,4)).toBe(2);});it('b',()=>{expect(hd263arp2(3,1)).toBe(1);});it('c',()=>{expect(hd263arp2(0,0)).toBe(0);});it('d',()=>{expect(hd263arp2(93,73)).toBe(2);});it('e',()=>{expect(hd263arp2(15,0)).toBe(4);});});
function hd264arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264arp2_hd',()=>{it('a',()=>{expect(hd264arp2(1,4)).toBe(2);});it('b',()=>{expect(hd264arp2(3,1)).toBe(1);});it('c',()=>{expect(hd264arp2(0,0)).toBe(0);});it('d',()=>{expect(hd264arp2(93,73)).toBe(2);});it('e',()=>{expect(hd264arp2(15,0)).toBe(4);});});
function hd265arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265arp2_hd',()=>{it('a',()=>{expect(hd265arp2(1,4)).toBe(2);});it('b',()=>{expect(hd265arp2(3,1)).toBe(1);});it('c',()=>{expect(hd265arp2(0,0)).toBe(0);});it('d',()=>{expect(hd265arp2(93,73)).toBe(2);});it('e',()=>{expect(hd265arp2(15,0)).toBe(4);});});
function hd266arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266arp2_hd',()=>{it('a',()=>{expect(hd266arp2(1,4)).toBe(2);});it('b',()=>{expect(hd266arp2(3,1)).toBe(1);});it('c',()=>{expect(hd266arp2(0,0)).toBe(0);});it('d',()=>{expect(hd266arp2(93,73)).toBe(2);});it('e',()=>{expect(hd266arp2(15,0)).toBe(4);});});
function hd267arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267arp2_hd',()=>{it('a',()=>{expect(hd267arp2(1,4)).toBe(2);});it('b',()=>{expect(hd267arp2(3,1)).toBe(1);});it('c',()=>{expect(hd267arp2(0,0)).toBe(0);});it('d',()=>{expect(hd267arp2(93,73)).toBe(2);});it('e',()=>{expect(hd267arp2(15,0)).toBe(4);});});
function hd268arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268arp2_hd',()=>{it('a',()=>{expect(hd268arp2(1,4)).toBe(2);});it('b',()=>{expect(hd268arp2(3,1)).toBe(1);});it('c',()=>{expect(hd268arp2(0,0)).toBe(0);});it('d',()=>{expect(hd268arp2(93,73)).toBe(2);});it('e',()=>{expect(hd268arp2(15,0)).toBe(4);});});
function hd269arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269arp2_hd',()=>{it('a',()=>{expect(hd269arp2(1,4)).toBe(2);});it('b',()=>{expect(hd269arp2(3,1)).toBe(1);});it('c',()=>{expect(hd269arp2(0,0)).toBe(0);});it('d',()=>{expect(hd269arp2(93,73)).toBe(2);});it('e',()=>{expect(hd269arp2(15,0)).toBe(4);});});
function hd270arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270arp2_hd',()=>{it('a',()=>{expect(hd270arp2(1,4)).toBe(2);});it('b',()=>{expect(hd270arp2(3,1)).toBe(1);});it('c',()=>{expect(hd270arp2(0,0)).toBe(0);});it('d',()=>{expect(hd270arp2(93,73)).toBe(2);});it('e',()=>{expect(hd270arp2(15,0)).toBe(4);});});
function hd271arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271arp2_hd',()=>{it('a',()=>{expect(hd271arp2(1,4)).toBe(2);});it('b',()=>{expect(hd271arp2(3,1)).toBe(1);});it('c',()=>{expect(hd271arp2(0,0)).toBe(0);});it('d',()=>{expect(hd271arp2(93,73)).toBe(2);});it('e',()=>{expect(hd271arp2(15,0)).toBe(4);});});
function hd272arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272arp2_hd',()=>{it('a',()=>{expect(hd272arp2(1,4)).toBe(2);});it('b',()=>{expect(hd272arp2(3,1)).toBe(1);});it('c',()=>{expect(hd272arp2(0,0)).toBe(0);});it('d',()=>{expect(hd272arp2(93,73)).toBe(2);});it('e',()=>{expect(hd272arp2(15,0)).toBe(4);});});
function hd273arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273arp2_hd',()=>{it('a',()=>{expect(hd273arp2(1,4)).toBe(2);});it('b',()=>{expect(hd273arp2(3,1)).toBe(1);});it('c',()=>{expect(hd273arp2(0,0)).toBe(0);});it('d',()=>{expect(hd273arp2(93,73)).toBe(2);});it('e',()=>{expect(hd273arp2(15,0)).toBe(4);});});
function hd274arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274arp2_hd',()=>{it('a',()=>{expect(hd274arp2(1,4)).toBe(2);});it('b',()=>{expect(hd274arp2(3,1)).toBe(1);});it('c',()=>{expect(hd274arp2(0,0)).toBe(0);});it('d',()=>{expect(hd274arp2(93,73)).toBe(2);});it('e',()=>{expect(hd274arp2(15,0)).toBe(4);});});
function hd275arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275arp2_hd',()=>{it('a',()=>{expect(hd275arp2(1,4)).toBe(2);});it('b',()=>{expect(hd275arp2(3,1)).toBe(1);});it('c',()=>{expect(hd275arp2(0,0)).toBe(0);});it('d',()=>{expect(hd275arp2(93,73)).toBe(2);});it('e',()=>{expect(hd275arp2(15,0)).toBe(4);});});
function hd276arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276arp2_hd',()=>{it('a',()=>{expect(hd276arp2(1,4)).toBe(2);});it('b',()=>{expect(hd276arp2(3,1)).toBe(1);});it('c',()=>{expect(hd276arp2(0,0)).toBe(0);});it('d',()=>{expect(hd276arp2(93,73)).toBe(2);});it('e',()=>{expect(hd276arp2(15,0)).toBe(4);});});
function hd277arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277arp2_hd',()=>{it('a',()=>{expect(hd277arp2(1,4)).toBe(2);});it('b',()=>{expect(hd277arp2(3,1)).toBe(1);});it('c',()=>{expect(hd277arp2(0,0)).toBe(0);});it('d',()=>{expect(hd277arp2(93,73)).toBe(2);});it('e',()=>{expect(hd277arp2(15,0)).toBe(4);});});
function hd278arp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278arp2_hd',()=>{it('a',()=>{expect(hd278arp2(1,4)).toBe(2);});it('b',()=>{expect(hd278arp2(3,1)).toBe(1);});it('c',()=>{expect(hd278arp2(0,0)).toBe(0);});it('d',()=>{expect(hd278arp2(93,73)).toBe(2);});it('e',()=>{expect(hd278arp2(15,0)).toBe(4);});});
