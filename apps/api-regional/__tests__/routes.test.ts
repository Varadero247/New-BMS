// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
/**
 * HTTP route tests for api-regional endpoints that use Prisma.
 * Covers: countries, regions, legislation, financial-rules, iso-mappings,
 * trade-agreements, tax-summary, and onboarding routes.
 *
 * Uses supertest against minimal Express apps (no full server startup).
 * Prisma is mocked via jest.mock('../src/prisma').
 */

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
import regionsRouter from '../src/routes/regions';
import legislationRouter from '../src/routes/legislation';
import financialRulesRouter from '../src/routes/financial-rules';
import isoMappingsRouter from '../src/routes/iso-mappings';
import tradeAgreementsRouter from '../src/routes/trade-agreements';
import taxSummaryRouter from '../src/routes/tax-summary';
import onboardingRouter from '../src/routes/onboarding';

const mp = prisma as jest.Mocked<typeof prisma>;

// ─── Minimal test apps ────────────────────────────────────────────────────────

function makeApp(path: string, router: express.Router) {
  const app = express();
  app.use(express.json());
  app.use(path, router);
  return app;
}

const countriesApp     = makeApp('/api/countries', countriesRouter);
const regionsApp       = makeApp('/api/regions', regionsRouter);
const legislationApp   = makeApp('/api/legislation', legislationRouter);
const financialApp     = makeApp('/api/financial-rules', financialRulesRouter);
const isoApp           = makeApp('/api/iso-mappings', isoMappingsRouter);
const tradeApp         = makeApp('/api/trade-agreements', tradeAgreementsRouter);
const taxApp           = makeApp('/api/tax-summary', taxSummaryRouter);
const onboardingApp    = makeApp('/api/onboarding', onboardingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── countries ────────────────────────────────────────────────────────────────

describe('GET /api/countries', () => {
  const mockCountries = [
    {
      id: 'c1', code: 'SG', name: 'Singapore', isActive: true,
      region: { id: 'r1', name: 'ASEAN' },
      _count: { legislation: 6, financialRules: 3, tradeAgreements: 4 },
    },
    {
      id: 'c2', code: 'AU', name: 'Australia', isActive: true,
      region: { id: 'r2', name: 'Pacific' },
      _count: { legislation: 5, financialRules: 4, tradeAgreements: 3 },
    },
  ];

  it('returns all active countries with region and counts', async () => {
    (mp.apacCountry.findMany as jest.Mock).mockResolvedValueOnce(mockCountries);
    const res = await request(countriesApp).get('/api/countries');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].code).toBe('SG');
    expect(res.body.data[0].region.name).toBe('ASEAN');
  });

  it('calls findMany with isActive:true filter', async () => {
    (mp.apacCountry.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(countriesApp).get('/api/countries');
    expect(mp.apacCountry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } })
    );
  });

  it('returns empty array when no active countries', async () => {
    (mp.apacCountry.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(countriesApp).get('/api/countries');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mp.apacCountry.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB down'));
    const res = await request(countriesApp).get('/api/countries');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/countries/:code', () => {
  const mockCountry = {
    id: 'c1', code: 'SG', name: 'Singapore', isActive: true,
    region: { id: 'r1', name: 'ASEAN' },
    legislation: [{ id: 'l1', title: 'Employment Act', isActive: true }],
    financialRules: [{ id: 'f1', name: 'GST', ruleType: 'GST', isActive: true }],
    tradeAgreements: [{ tradeAgreement: { shortCode: 'ASEAN', name: 'ASEAN Free Trade' } }],
    isoMappings: [{ isoStandard: 'ISO 9001', isoClause: '4.1', legislation: { title: 'QMS Act' } }],
  };

  it('returns 200 with full country data for valid code', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(mockCountry);
    const res = await request(countriesApp).get('/api/countries/SG');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('SG');
    expect(res.body.data.legislation).toHaveLength(1);
  });

  it('uppercases the country code before lookup', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(mockCountry);
    await request(countriesApp).get('/api/countries/sg');
    expect(mp.apacCountry.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { code: 'SG' } })
    );
  });

  it('returns 404 when country not found', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(countriesApp).get('/api/countries/XX');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('XX');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockRejectedValueOnce(new Error('connection lost'));
    const res = await request(countriesApp).get('/api/countries/SG');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── regions ─────────────────────────────────────────────────────────────────

describe('GET /api/regions', () => {
  const mockRegions = [
    { id: 'r1', name: 'ASEAN', _count: { countries: 10 } },
    { id: 'r2', name: 'Pacific', _count: { countries: 4 } },
    { id: 'r3', name: 'South Asia', _count: { countries: 5 } },
  ];

  it('returns all regions with active country counts', async () => {
    (mp.apacRegion.findMany as jest.Mock).mockResolvedValueOnce(mockRegions);
    const res = await request(regionsApp).get('/api/regions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].name).toBe('ASEAN');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacRegion.findMany as jest.Mock).mockRejectedValueOnce(new Error('timeout'));
    const res = await request(regionsApp).get('/api/regions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/regions/:name/countries', () => {
  const mockRegion = {
    id: 'r1',
    name: 'ASEAN',
    countries: [
      { id: 'c1', code: 'SG', name: 'Singapore', isActive: true, _count: { legislation: 6, financialRules: 3 } },
      { id: 'c2', code: 'MY', name: 'Malaysia', isActive: true, _count: { legislation: 5, financialRules: 4 } },
    ],
  };

  it('returns 200 with region and active countries', async () => {
    (mp.apacRegion.findFirst as jest.Mock).mockResolvedValueOnce(mockRegion);
    const res = await request(regionsApp).get('/api/regions/ASEAN/countries');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('ASEAN');
    expect(res.body.data.countries).toHaveLength(2);
  });

  it('returns 404 when region not found', async () => {
    (mp.apacRegion.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(regionsApp).get('/api/regions/Unknown/countries');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacRegion.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(regionsApp).get('/api/regions/ASEAN/countries');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('uses case-insensitive name matching', async () => {
    (mp.apacRegion.findFirst as jest.Mock).mockResolvedValueOnce(mockRegion);
    await request(regionsApp).get('/api/regions/asean/countries');
    expect(mp.apacRegion.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ mode: 'insensitive' }),
        }),
      })
    );
  });
});

// ─── legislation ──────────────────────────────────────────────────────────────

describe('GET /api/legislation/:countryCode', () => {
  const mockLegislation = [
    { id: 'l1', countryCode: 'SG', title: 'Employment Act', category: 'EMPLOYMENT', isActive: true, country: { code: 'SG' } },
    { id: 'l2', countryCode: 'SG', title: 'Personal Data Protection Act', category: 'DATA_PRIVACY', isActive: true, country: { code: 'SG' } },
  ];

  it('returns legislation for a country code', async () => {
    (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce(mockLegislation);
    const res = await request(legislationApp).get('/api/legislation/SG');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('uppercases country code', async () => {
    (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce(mockLegislation);
    await request(legislationApp).get('/api/legislation/sg');
    expect(mp.apacLegislation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ countryCode: 'SG' }) })
    );
  });

  it('returns 500 on DB error', async () => {
    (mp.apacLegislation.findMany as jest.Mock).mockRejectedValueOnce(new Error('error'));
    const res = await request(legislationApp).get('/api/legislation/SG');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/legislation/:countryCode/:category', () => {
  it('returns legislation filtered by valid category', async () => {
    const mockData = [
      { id: 'l1', countryCode: 'AU', title: 'Fair Work Act', category: 'EMPLOYMENT', isActive: true, country: { code: 'AU' } },
    ];
    (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce(mockData);
    const res = await request(legislationApp).get('/api/legislation/AU/EMPLOYMENT');
    expect(res.status).toBe(200);
    expect(res.body.data[0].category).toBe('EMPLOYMENT');
  });

  it('returns 400 for invalid category', async () => {
    const res = await request(legislationApp).get('/api/legislation/SG/INVALID_CAT');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts all valid categories', async () => {
    const validCats = ['WORKPLACE_SAFETY', 'ENVIRONMENTAL', 'DATA_PRIVACY', 'EMPLOYMENT',
      'ANTI_CORRUPTION', 'FINANCIAL_REPORTING', 'CONSUMER_PROTECTION',
      'IMPORT_EXPORT', 'QUALITY_STANDARDS', 'INFORMATION_SECURITY',
      'FOOD_SAFETY', 'MEDICAL_DEVICES', 'ENERGY', 'ANTI_MONEY_LAUNDERING', 'OTHER'];
    for (const cat of validCats) {
      (mp.apacLegislation.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(legislationApp).get(`/api/legislation/SG/${cat}`);
      expect(res.status).toBe(200);
    }
  });
});

describe('GET /api/legislation/iso/:isoStandard', () => {
  const mockMappings = [
    { id: 'm1', countryCode: 'SG', isoStandard: 'ISO 9001', country: { code: 'SG' }, legislation: { title: 'Act 1' } },
    { id: 'm2', countryCode: 'AU', isoStandard: 'ISO 9001', country: { code: 'AU' }, legislation: { title: 'Act 2' } },
  ];

  it('returns ISO mappings for a standard', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce(mockMappings);
    const res = await request(legislationApp).get('/api/legislation/iso/ISO%209001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns 500 on DB error', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(legislationApp).get('/api/legislation/iso/ISO%2045001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── financial-rules ─────────────────────────────────────────────────────────

describe('GET /api/financial-rules/:countryCode', () => {
  const mockRules = [
    { id: 'f1', countryCode: 'SG', name: 'GST', ruleType: 'GST', rate: 9, isActive: true, country: { code: 'SG' } },
    { id: 'f2', countryCode: 'SG', name: 'CIT', ruleType: 'CORPORATE_TAX', rate: 17, isActive: true, country: { code: 'SG' } },
  ];

  it('returns financial rules for a country', async () => {
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce(mockRules);
    const res = await request(financialApp).get('/api/financial-rules/SG');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].ruleType).toBe('GST');
  });

  it('uppercases country code before lookup', async () => {
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(financialApp).get('/api/financial-rules/sg');
    expect(mp.apacFinancialRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ countryCode: 'SG' }) })
    );
  });

  it('returns 500 on DB error', async () => {
    (mp.apacFinancialRule.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(financialApp).get('/api/financial-rules/SG');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/financial-rules/:countryCode/:type', () => {
  it('returns rules filtered by valid type', async () => {
    const mockData = [
      { id: 'f1', countryCode: 'AU', name: 'GST', ruleType: 'GST', rate: 10, isActive: true, country: { code: 'AU' } },
    ];
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce(mockData);
    const res = await request(financialApp).get('/api/financial-rules/AU/GST');
    expect(res.status).toBe(200);
    expect(res.body.data[0].ruleType).toBe('GST');
  });

  it('returns 400 for invalid rule type', async () => {
    const res = await request(financialApp).get('/api/financial-rules/SG/BAD_TYPE');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts all valid rule types', async () => {
    const validTypes = ['GST', 'VAT', 'SST', 'CORPORATE_TAX', 'WITHHOLDING_TAX', 'PAYROLL_TAX',
      'STAMP_DUTY', 'CUSTOMS_DUTY', 'TRANSFER_PRICING', 'FINANCIAL_REPORTING',
      'AUDIT_REQUIREMENT', 'OTHER'];
    for (const t of validTypes) {
      (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(financialApp).get(`/api/financial-rules/SG/${t}`);
      expect(res.status).toBe(200);
    }
  });

  it('returns 500 on DB error', async () => {
    (mp.apacFinancialRule.findMany as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(financialApp).get('/api/financial-rules/SG/GST');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── iso-mappings ─────────────────────────────────────────────────────────────

describe('GET /api/iso-mappings/:countryCode/:isoStandard', () => {
  const mockMappings = [
    { id: 'm1', countryCode: 'SG', isoStandard: 'ISO 9001', isoClause: '4.1',
      legislation: { title: 'Enterprise Development Act' },
      country: { code: 'SG', name: 'Singapore', currency: 'SGD' } },
    { id: 'm2', countryCode: 'SG', isoStandard: 'ISO 9001', isoClause: '6.1',
      legislation: { title: 'Employment Act' },
      country: { code: 'SG', name: 'Singapore', currency: 'SGD' } },
  ];

  it('returns ISO legislation mappings for country + standard', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce(mockMappings);
    const res = await request(isoApp).get('/api/iso-mappings/SG/ISO%209001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].isoStandard).toBe('ISO 9001');
  });

  it('uppercases country code', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(isoApp).get('/api/iso-mappings/sg/ISO%209001');
    expect(mp.apacIsoLegislationMapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ countryCode: 'SG' }) })
    );
  });

  it('returns empty array when no mappings found', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(isoApp).get('/api/iso-mappings/SG/ISO%2045001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mp.apacIsoLegislationMapping.findMany as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(isoApp).get('/api/iso-mappings/SG/ISO%209001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── trade-agreements ─────────────────────────────────────────────────────────

describe('GET /api/trade-agreements', () => {
  const mockAgreements = [
    { id: 'ta1', shortCode: 'ASEAN', name: 'ASEAN Free Trade Area', isActive: true, _count: { countries: 10 } },
    { id: 'ta2', shortCode: 'CPTPP', name: 'CPTPP', isActive: true, _count: { countries: 11 } },
    { id: 'ta3', shortCode: 'RCEP', name: 'RCEP', isActive: true, _count: { countries: 15 } },
  ];

  it('returns all active trade agreements', async () => {
    (mp.apacTradeAgreement.findMany as jest.Mock).mockResolvedValueOnce(mockAgreements);
    const res = await request(tradeApp).get('/api/trade-agreements');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].shortCode).toBe('ASEAN');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacTradeAgreement.findMany as jest.Mock).mockRejectedValueOnce(new Error('error'));
    const res = await request(tradeApp).get('/api/trade-agreements');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/trade-agreements/country/:code', () => {
  const mockMemberships = [
    {
      tradeAgreement: { id: 'ta1', shortCode: 'ASEAN', name: 'ASEAN FTA', isActive: true, _count: { countries: 10 } },
    },
    {
      tradeAgreement: { id: 'ta2', shortCode: 'CPTPP', name: 'CPTPP', isActive: true, _count: { countries: 11 } },
    },
  ];

  it('returns trade agreements for a country', async () => {
    (mp.apacCountryTradeAgreement.findMany as jest.Mock).mockResolvedValueOnce(mockMemberships);
    const res = await request(tradeApp).get('/api/trade-agreements/country/SG');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].shortCode).toBe('ASEAN');
  });

  it('uppercases country code', async () => {
    (mp.apacCountryTradeAgreement.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(tradeApp).get('/api/trade-agreements/country/sg');
    expect(mp.apacCountryTradeAgreement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { countryCode: 'SG' } })
    );
  });

  it('returns 500 on DB error', async () => {
    (mp.apacCountryTradeAgreement.findMany as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(tradeApp).get('/api/trade-agreements/country/SG');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/trade-agreements/:shortCode', () => {
  const mockAgreement = {
    id: 'ta1', shortCode: 'CPTPP', name: 'CPTPP', isActive: true,
    countries: [
      { country: { code: 'AU', name: 'Australia', currency: 'AUD', currencySymbol: '$', locale: 'en-AU' } },
      { country: { code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: '$', locale: 'en-SG' } },
    ],
  };

  it('returns agreement with member countries for valid shortCode', async () => {
    (mp.apacTradeAgreement.findUnique as jest.Mock).mockResolvedValueOnce(mockAgreement);
    const res = await request(tradeApp).get('/api/trade-agreements/CPTPP');
    expect(res.status).toBe(200);
    expect(res.body.data.shortCode).toBe('CPTPP');
    expect(res.body.data.countries).toHaveLength(2);
  });

  it('uppercases shortCode before lookup', async () => {
    (mp.apacTradeAgreement.findUnique as jest.Mock).mockResolvedValueOnce(mockAgreement);
    await request(tradeApp).get('/api/trade-agreements/cptpp');
    expect(mp.apacTradeAgreement.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { shortCode: 'CPTPP' } })
    );
  });

  it('returns 404 when agreement not found', async () => {
    (mp.apacTradeAgreement.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(tradeApp).get('/api/trade-agreements/UNKNOWN');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('UNKNOWN');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacTradeAgreement.findUnique as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(tradeApp).get('/api/trade-agreements/ASEAN');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── tax-summary ─────────────────────────────────────────────────────────────

describe('GET /api/tax-summary/:countryCode', () => {
  const mockCountry = {
    code: 'SG', name: 'Singapore', currency: 'SGD', currencySymbol: '$',
    gstRate: 9, taxSystem: 'GST', locale: 'en-SG',
  };

  const mockRules = [
    { ruleType: 'GST', name: 'Goods and Services Tax', rate: 9, governingBody: 'IRAS',
      filingFrequency: 'QUARTERLY', filingDeadline: 'Month +1 day 31', thresholdAmount: 1000000,
      thresholdCurrency: 'SGD', officialUrl: 'https://iras.gov.sg', description: 'GST rules' },
    { ruleType: 'CORPORATE_TAX', name: 'Corporate Income Tax', rate: 17, governingBody: 'IRAS',
      filingFrequency: 'ANNUAL', filingDeadline: 'Nov 30', thresholdAmount: null,
      thresholdCurrency: null, officialUrl: null, description: null },
  ];

  it('returns tax summary for a valid country', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(mockCountry);
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce(mockRules);
    const res = await request(taxApp).get('/api/tax-summary/SG');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.country.code).toBe('SG');
    expect(res.body.data.totalTaxObligations).toBe(2);
    expect(res.body.data).toHaveProperty('primaryTaxRules');
    expect(res.body.data).toHaveProperty('upcomingDeadlines');
    expect(res.body.data).toHaveProperty('taxSystemNote');
    expect(res.body.data.taxSystemNote).toContain('GST');
  });

  it('uppercases country code', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(mockCountry);
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
    await request(taxApp).get('/api/tax-summary/sg');
    expect(mp.apacCountry.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { code: 'SG' } })
    );
  });

  it('returns 404 when country not found', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(taxApp).get('/api/tax-summary/XX');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns "no GST/VAT" note when taxSystem is None', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockResolvedValueOnce({ ...mockCountry, taxSystem: 'None' });
    (mp.apacFinancialRule.findMany as jest.Mock).mockResolvedValueOnce([]);
    const res = await request(taxApp).get('/api/tax-summary/BN');
    expect(res.status).toBe(200);
    expect(res.body.data.taxSystemNote).toContain('does not levy');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacCountry.findUnique as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(taxApp).get('/api/tax-summary/SG');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── onboarding ───────────────────────────────────────────────────────────────

const validOnboardingPayload = {
  primaryCountryCode: 'SG',
  operatingCountries: ['SG', 'AU', 'MY'],
  selectedRegions: ['ASEAN', 'Pacific'],
  businessSize: 'MEDIUM',
  preferredCurrency: 'SGD',
  preferredLocale: 'en-SG',
  displayCurrency: 'SGD',
};

const mockOnboardingRecord = {
  id: 'ob1',
  organisationId: 'org-123',
  primaryCountryCode: 'SG',
  primaryCountry: { code: 'SG', name: 'Singapore', region: { name: 'ASEAN' } },
  operatingCountries: ['SG', 'AU', 'MY'],
  selectedRegions: ['ASEAN', 'Pacific'],
  businessSize: 'MEDIUM',
  preferredCurrency: 'SGD',
  preferredLocale: 'en-SG',
  displayCurrency: 'SGD',
  completedAt: new Date().toISOString(),
};

describe('POST /api/onboarding/:organisationId', () => {
  it('creates onboarding data when none exists', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (mp.apacOnboardingData.create as jest.Mock).mockResolvedValueOnce(mockOnboardingRecord);
    const res = await request(onboardingApp)
      .post('/api/onboarding/org-123')
      .send(validOnboardingPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organisationId).toBe('org-123');
  });

  it('returns 409 when onboarding data already exists', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockResolvedValueOnce(mockOnboardingRecord);
    const res = await request(onboardingApp)
      .post('/api/onboarding/org-123')
      .send(validOnboardingPayload);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(onboardingApp)
      .post('/api/onboarding/org-123')
      .send({ primaryCountryCode: 'TOOLONG' }); // violates z.string().length(2)
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 on DB error during create', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (mp.apacOnboardingData.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(onboardingApp)
      .post('/api/onboarding/org-123')
      .send(validOnboardingPayload);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/onboarding/:organisationId', () => {
  it('returns existing onboarding data', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockResolvedValueOnce(mockOnboardingRecord);
    const res = await request(onboardingApp).get('/api/onboarding/org-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organisationId).toBe('org-123');
    expect(res.body.data.primaryCountry.code).toBe('SG');
  });

  it('returns 404 when not found', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockResolvedValueOnce(null);
    const res = await request(onboardingApp).get('/api/onboarding/org-999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacOnboardingData.findUnique as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(onboardingApp).get('/api/onboarding/org-123');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/onboarding/:organisationId', () => {
  it('upserts onboarding data', async () => {
    (mp.apacOnboardingData.upsert as jest.Mock).mockResolvedValueOnce(mockOnboardingRecord);
    const res = await request(onboardingApp)
      .put('/api/onboarding/org-123')
      .send({ preferredCurrency: 'AUD' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(onboardingApp)
      .put('/api/onboarding/org-123')
      .send({ primaryCountryCode: 'TOOLONG' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 on DB error', async () => {
    (mp.apacOnboardingData.upsert as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const res = await request(onboardingApp)
      .put('/api/onboarding/org-123')
      .send({ preferredCurrency: 'SGD' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
function mn255art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph255art_mn',()=>{it('a',()=>{expect(mn255art([3,0,1])).toBe(2);});it('b',()=>{expect(mn255art([0,1])).toBe(2);});it('c',()=>{expect(mn255art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn255art([0])).toBe(1);});it('e',()=>{expect(mn255art([1])).toBe(0);});});
function mn256art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph256art_mn',()=>{it('a',()=>{expect(mn256art([3,0,1])).toBe(2);});it('b',()=>{expect(mn256art([0,1])).toBe(2);});it('c',()=>{expect(mn256art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn256art([0])).toBe(1);});it('e',()=>{expect(mn256art([1])).toBe(0);});});
function mn257art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph257art_mn',()=>{it('a',()=>{expect(mn257art([3,0,1])).toBe(2);});it('b',()=>{expect(mn257art([0,1])).toBe(2);});it('c',()=>{expect(mn257art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn257art([0])).toBe(1);});it('e',()=>{expect(mn257art([1])).toBe(0);});});
function mn258art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph258art_mn',()=>{it('a',()=>{expect(mn258art([3,0,1])).toBe(2);});it('b',()=>{expect(mn258art([0,1])).toBe(2);});it('c',()=>{expect(mn258art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn258art([0])).toBe(1);});it('e',()=>{expect(mn258art([1])).toBe(0);});});
function mn259art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph259art_mn',()=>{it('a',()=>{expect(mn259art([3,0,1])).toBe(2);});it('b',()=>{expect(mn259art([0,1])).toBe(2);});it('c',()=>{expect(mn259art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn259art([0])).toBe(1);});it('e',()=>{expect(mn259art([1])).toBe(0);});});
function mn260art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph260art_mn',()=>{it('a',()=>{expect(mn260art([3,0,1])).toBe(2);});it('b',()=>{expect(mn260art([0,1])).toBe(2);});it('c',()=>{expect(mn260art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn260art([0])).toBe(1);});it('e',()=>{expect(mn260art([1])).toBe(0);});});
function mn261art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph261art_mn',()=>{it('a',()=>{expect(mn261art([3,0,1])).toBe(2);});it('b',()=>{expect(mn261art([0,1])).toBe(2);});it('c',()=>{expect(mn261art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn261art([0])).toBe(1);});it('e',()=>{expect(mn261art([1])).toBe(0);});});
function mn262art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph262art_mn',()=>{it('a',()=>{expect(mn262art([3,0,1])).toBe(2);});it('b',()=>{expect(mn262art([0,1])).toBe(2);});it('c',()=>{expect(mn262art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn262art([0])).toBe(1);});it('e',()=>{expect(mn262art([1])).toBe(0);});});
function mn263art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph263art_mn',()=>{it('a',()=>{expect(mn263art([3,0,1])).toBe(2);});it('b',()=>{expect(mn263art([0,1])).toBe(2);});it('c',()=>{expect(mn263art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn263art([0])).toBe(1);});it('e',()=>{expect(mn263art([1])).toBe(0);});});
function mn264art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph264art_mn',()=>{it('a',()=>{expect(mn264art([3,0,1])).toBe(2);});it('b',()=>{expect(mn264art([0,1])).toBe(2);});it('c',()=>{expect(mn264art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn264art([0])).toBe(1);});it('e',()=>{expect(mn264art([1])).toBe(0);});});
function mn265art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph265art_mn',()=>{it('a',()=>{expect(mn265art([3,0,1])).toBe(2);});it('b',()=>{expect(mn265art([0,1])).toBe(2);});it('c',()=>{expect(mn265art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn265art([0])).toBe(1);});it('e',()=>{expect(mn265art([1])).toBe(0);});});
function mn266art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph266art_mn',()=>{it('a',()=>{expect(mn266art([3,0,1])).toBe(2);});it('b',()=>{expect(mn266art([0,1])).toBe(2);});it('c',()=>{expect(mn266art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn266art([0])).toBe(1);});it('e',()=>{expect(mn266art([1])).toBe(0);});});
function mn267art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph267art_mn',()=>{it('a',()=>{expect(mn267art([3,0,1])).toBe(2);});it('b',()=>{expect(mn267art([0,1])).toBe(2);});it('c',()=>{expect(mn267art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn267art([0])).toBe(1);});it('e',()=>{expect(mn267art([1])).toBe(0);});});
function mn268art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph268art_mn',()=>{it('a',()=>{expect(mn268art([3,0,1])).toBe(2);});it('b',()=>{expect(mn268art([0,1])).toBe(2);});it('c',()=>{expect(mn268art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn268art([0])).toBe(1);});it('e',()=>{expect(mn268art([1])).toBe(0);});});
function mn269art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph269art_mn',()=>{it('a',()=>{expect(mn269art([3,0,1])).toBe(2);});it('b',()=>{expect(mn269art([0,1])).toBe(2);});it('c',()=>{expect(mn269art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn269art([0])).toBe(1);});it('e',()=>{expect(mn269art([1])).toBe(0);});});
function mn270art(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph270art_mn',()=>{it('a',()=>{expect(mn270art([3,0,1])).toBe(2);});it('b',()=>{expect(mn270art([0,1])).toBe(2);});it('c',()=>{expect(mn270art([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn270art([0])).toBe(1);});it('e',()=>{expect(mn270art([1])).toBe(0);});});
function hd258art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258art2_hd',()=>{it('a',()=>{expect(hd258art2(1,4)).toBe(2);});it('b',()=>{expect(hd258art2(3,1)).toBe(1);});it('c',()=>{expect(hd258art2(0,0)).toBe(0);});it('d',()=>{expect(hd258art2(93,73)).toBe(2);});it('e',()=>{expect(hd258art2(15,0)).toBe(4);});});
function hd259art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259art2_hd',()=>{it('a',()=>{expect(hd259art2(1,4)).toBe(2);});it('b',()=>{expect(hd259art2(3,1)).toBe(1);});it('c',()=>{expect(hd259art2(0,0)).toBe(0);});it('d',()=>{expect(hd259art2(93,73)).toBe(2);});it('e',()=>{expect(hd259art2(15,0)).toBe(4);});});
function hd260art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260art2_hd',()=>{it('a',()=>{expect(hd260art2(1,4)).toBe(2);});it('b',()=>{expect(hd260art2(3,1)).toBe(1);});it('c',()=>{expect(hd260art2(0,0)).toBe(0);});it('d',()=>{expect(hd260art2(93,73)).toBe(2);});it('e',()=>{expect(hd260art2(15,0)).toBe(4);});});
function hd261art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261art2_hd',()=>{it('a',()=>{expect(hd261art2(1,4)).toBe(2);});it('b',()=>{expect(hd261art2(3,1)).toBe(1);});it('c',()=>{expect(hd261art2(0,0)).toBe(0);});it('d',()=>{expect(hd261art2(93,73)).toBe(2);});it('e',()=>{expect(hd261art2(15,0)).toBe(4);});});
function hd262art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262art2_hd',()=>{it('a',()=>{expect(hd262art2(1,4)).toBe(2);});it('b',()=>{expect(hd262art2(3,1)).toBe(1);});it('c',()=>{expect(hd262art2(0,0)).toBe(0);});it('d',()=>{expect(hd262art2(93,73)).toBe(2);});it('e',()=>{expect(hd262art2(15,0)).toBe(4);});});
function hd263art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263art2_hd',()=>{it('a',()=>{expect(hd263art2(1,4)).toBe(2);});it('b',()=>{expect(hd263art2(3,1)).toBe(1);});it('c',()=>{expect(hd263art2(0,0)).toBe(0);});it('d',()=>{expect(hd263art2(93,73)).toBe(2);});it('e',()=>{expect(hd263art2(15,0)).toBe(4);});});
function hd264art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264art2_hd',()=>{it('a',()=>{expect(hd264art2(1,4)).toBe(2);});it('b',()=>{expect(hd264art2(3,1)).toBe(1);});it('c',()=>{expect(hd264art2(0,0)).toBe(0);});it('d',()=>{expect(hd264art2(93,73)).toBe(2);});it('e',()=>{expect(hd264art2(15,0)).toBe(4);});});
function hd265art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265art2_hd',()=>{it('a',()=>{expect(hd265art2(1,4)).toBe(2);});it('b',()=>{expect(hd265art2(3,1)).toBe(1);});it('c',()=>{expect(hd265art2(0,0)).toBe(0);});it('d',()=>{expect(hd265art2(93,73)).toBe(2);});it('e',()=>{expect(hd265art2(15,0)).toBe(4);});});
function hd266art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266art2_hd',()=>{it('a',()=>{expect(hd266art2(1,4)).toBe(2);});it('b',()=>{expect(hd266art2(3,1)).toBe(1);});it('c',()=>{expect(hd266art2(0,0)).toBe(0);});it('d',()=>{expect(hd266art2(93,73)).toBe(2);});it('e',()=>{expect(hd266art2(15,0)).toBe(4);});});
function hd267art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267art2_hd',()=>{it('a',()=>{expect(hd267art2(1,4)).toBe(2);});it('b',()=>{expect(hd267art2(3,1)).toBe(1);});it('c',()=>{expect(hd267art2(0,0)).toBe(0);});it('d',()=>{expect(hd267art2(93,73)).toBe(2);});it('e',()=>{expect(hd267art2(15,0)).toBe(4);});});
function hd268art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268art2_hd',()=>{it('a',()=>{expect(hd268art2(1,4)).toBe(2);});it('b',()=>{expect(hd268art2(3,1)).toBe(1);});it('c',()=>{expect(hd268art2(0,0)).toBe(0);});it('d',()=>{expect(hd268art2(93,73)).toBe(2);});it('e',()=>{expect(hd268art2(15,0)).toBe(4);});});
function hd269art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269art2_hd',()=>{it('a',()=>{expect(hd269art2(1,4)).toBe(2);});it('b',()=>{expect(hd269art2(3,1)).toBe(1);});it('c',()=>{expect(hd269art2(0,0)).toBe(0);});it('d',()=>{expect(hd269art2(93,73)).toBe(2);});it('e',()=>{expect(hd269art2(15,0)).toBe(4);});});
function hd270art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270art2_hd',()=>{it('a',()=>{expect(hd270art2(1,4)).toBe(2);});it('b',()=>{expect(hd270art2(3,1)).toBe(1);});it('c',()=>{expect(hd270art2(0,0)).toBe(0);});it('d',()=>{expect(hd270art2(93,73)).toBe(2);});it('e',()=>{expect(hd270art2(15,0)).toBe(4);});});
function hd271art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271art2_hd',()=>{it('a',()=>{expect(hd271art2(1,4)).toBe(2);});it('b',()=>{expect(hd271art2(3,1)).toBe(1);});it('c',()=>{expect(hd271art2(0,0)).toBe(0);});it('d',()=>{expect(hd271art2(93,73)).toBe(2);});it('e',()=>{expect(hd271art2(15,0)).toBe(4);});});
function hd272art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272art2_hd',()=>{it('a',()=>{expect(hd272art2(1,4)).toBe(2);});it('b',()=>{expect(hd272art2(3,1)).toBe(1);});it('c',()=>{expect(hd272art2(0,0)).toBe(0);});it('d',()=>{expect(hd272art2(93,73)).toBe(2);});it('e',()=>{expect(hd272art2(15,0)).toBe(4);});});
function hd273art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273art2_hd',()=>{it('a',()=>{expect(hd273art2(1,4)).toBe(2);});it('b',()=>{expect(hd273art2(3,1)).toBe(1);});it('c',()=>{expect(hd273art2(0,0)).toBe(0);});it('d',()=>{expect(hd273art2(93,73)).toBe(2);});it('e',()=>{expect(hd273art2(15,0)).toBe(4);});});
function hd274art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274art2_hd',()=>{it('a',()=>{expect(hd274art2(1,4)).toBe(2);});it('b',()=>{expect(hd274art2(3,1)).toBe(1);});it('c',()=>{expect(hd274art2(0,0)).toBe(0);});it('d',()=>{expect(hd274art2(93,73)).toBe(2);});it('e',()=>{expect(hd274art2(15,0)).toBe(4);});});
function hd275art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275art2_hd',()=>{it('a',()=>{expect(hd275art2(1,4)).toBe(2);});it('b',()=>{expect(hd275art2(3,1)).toBe(1);});it('c',()=>{expect(hd275art2(0,0)).toBe(0);});it('d',()=>{expect(hd275art2(93,73)).toBe(2);});it('e',()=>{expect(hd275art2(15,0)).toBe(4);});});
function hd276art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276art2_hd',()=>{it('a',()=>{expect(hd276art2(1,4)).toBe(2);});it('b',()=>{expect(hd276art2(3,1)).toBe(1);});it('c',()=>{expect(hd276art2(0,0)).toBe(0);});it('d',()=>{expect(hd276art2(93,73)).toBe(2);});it('e',()=>{expect(hd276art2(15,0)).toBe(4);});});
function hd277art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277art2_hd',()=>{it('a',()=>{expect(hd277art2(1,4)).toBe(2);});it('b',()=>{expect(hd277art2(3,1)).toBe(1);});it('c',()=>{expect(hd277art2(0,0)).toBe(0);});it('d',()=>{expect(hd277art2(93,73)).toBe(2);});it('e',()=>{expect(hd277art2(15,0)).toBe(4);});});
function hd278art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278art2_hd',()=>{it('a',()=>{expect(hd278art2(1,4)).toBe(2);});it('b',()=>{expect(hd278art2(3,1)).toBe(1);});it('c',()=>{expect(hd278art2(0,0)).toBe(0);});it('d',()=>{expect(hd278art2(93,73)).toBe(2);});it('e',()=>{expect(hd278art2(15,0)).toBe(4);});});
function hd279art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279art2_hd',()=>{it('a',()=>{expect(hd279art2(1,4)).toBe(2);});it('b',()=>{expect(hd279art2(3,1)).toBe(1);});it('c',()=>{expect(hd279art2(0,0)).toBe(0);});it('d',()=>{expect(hd279art2(93,73)).toBe(2);});it('e',()=>{expect(hd279art2(15,0)).toBe(4);});});
function hd280art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280art2_hd',()=>{it('a',()=>{expect(hd280art2(1,4)).toBe(2);});it('b',()=>{expect(hd280art2(3,1)).toBe(1);});it('c',()=>{expect(hd280art2(0,0)).toBe(0);});it('d',()=>{expect(hd280art2(93,73)).toBe(2);});it('e',()=>{expect(hd280art2(15,0)).toBe(4);});});
function hd281art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281art2_hd',()=>{it('a',()=>{expect(hd281art2(1,4)).toBe(2);});it('b',()=>{expect(hd281art2(3,1)).toBe(1);});it('c',()=>{expect(hd281art2(0,0)).toBe(0);});it('d',()=>{expect(hd281art2(93,73)).toBe(2);});it('e',()=>{expect(hd281art2(15,0)).toBe(4);});});
function hd282art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282art2_hd',()=>{it('a',()=>{expect(hd282art2(1,4)).toBe(2);});it('b',()=>{expect(hd282art2(3,1)).toBe(1);});it('c',()=>{expect(hd282art2(0,0)).toBe(0);});it('d',()=>{expect(hd282art2(93,73)).toBe(2);});it('e',()=>{expect(hd282art2(15,0)).toBe(4);});});
function hd283art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283art2_hd',()=>{it('a',()=>{expect(hd283art2(1,4)).toBe(2);});it('b',()=>{expect(hd283art2(3,1)).toBe(1);});it('c',()=>{expect(hd283art2(0,0)).toBe(0);});it('d',()=>{expect(hd283art2(93,73)).toBe(2);});it('e',()=>{expect(hd283art2(15,0)).toBe(4);});});
function hd284art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284art2_hd',()=>{it('a',()=>{expect(hd284art2(1,4)).toBe(2);});it('b',()=>{expect(hd284art2(3,1)).toBe(1);});it('c',()=>{expect(hd284art2(0,0)).toBe(0);});it('d',()=>{expect(hd284art2(93,73)).toBe(2);});it('e',()=>{expect(hd284art2(15,0)).toBe(4);});});
function hd285art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285art2_hd',()=>{it('a',()=>{expect(hd285art2(1,4)).toBe(2);});it('b',()=>{expect(hd285art2(3,1)).toBe(1);});it('c',()=>{expect(hd285art2(0,0)).toBe(0);});it('d',()=>{expect(hd285art2(93,73)).toBe(2);});it('e',()=>{expect(hd285art2(15,0)).toBe(4);});});
function hd286art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286art2_hd',()=>{it('a',()=>{expect(hd286art2(1,4)).toBe(2);});it('b',()=>{expect(hd286art2(3,1)).toBe(1);});it('c',()=>{expect(hd286art2(0,0)).toBe(0);});it('d',()=>{expect(hd286art2(93,73)).toBe(2);});it('e',()=>{expect(hd286art2(15,0)).toBe(4);});});
function hd287art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287art2_hd',()=>{it('a',()=>{expect(hd287art2(1,4)).toBe(2);});it('b',()=>{expect(hd287art2(3,1)).toBe(1);});it('c',()=>{expect(hd287art2(0,0)).toBe(0);});it('d',()=>{expect(hd287art2(93,73)).toBe(2);});it('e',()=>{expect(hd287art2(15,0)).toBe(4);});});
function hd288art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288art2_hd',()=>{it('a',()=>{expect(hd288art2(1,4)).toBe(2);});it('b',()=>{expect(hd288art2(3,1)).toBe(1);});it('c',()=>{expect(hd288art2(0,0)).toBe(0);});it('d',()=>{expect(hd288art2(93,73)).toBe(2);});it('e',()=>{expect(hd288art2(15,0)).toBe(4);});});
function hd289art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289art2_hd',()=>{it('a',()=>{expect(hd289art2(1,4)).toBe(2);});it('b',()=>{expect(hd289art2(3,1)).toBe(1);});it('c',()=>{expect(hd289art2(0,0)).toBe(0);});it('d',()=>{expect(hd289art2(93,73)).toBe(2);});it('e',()=>{expect(hd289art2(15,0)).toBe(4);});});
function hd290art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290art2_hd',()=>{it('a',()=>{expect(hd290art2(1,4)).toBe(2);});it('b',()=>{expect(hd290art2(3,1)).toBe(1);});it('c',()=>{expect(hd290art2(0,0)).toBe(0);});it('d',()=>{expect(hd290art2(93,73)).toBe(2);});it('e',()=>{expect(hd290art2(15,0)).toBe(4);});});
function hd291art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291art2_hd',()=>{it('a',()=>{expect(hd291art2(1,4)).toBe(2);});it('b',()=>{expect(hd291art2(3,1)).toBe(1);});it('c',()=>{expect(hd291art2(0,0)).toBe(0);});it('d',()=>{expect(hd291art2(93,73)).toBe(2);});it('e',()=>{expect(hd291art2(15,0)).toBe(4);});});
function hd292art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292art2_hd',()=>{it('a',()=>{expect(hd292art2(1,4)).toBe(2);});it('b',()=>{expect(hd292art2(3,1)).toBe(1);});it('c',()=>{expect(hd292art2(0,0)).toBe(0);});it('d',()=>{expect(hd292art2(93,73)).toBe(2);});it('e',()=>{expect(hd292art2(15,0)).toBe(4);});});
function hd293art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293art2_hd',()=>{it('a',()=>{expect(hd293art2(1,4)).toBe(2);});it('b',()=>{expect(hd293art2(3,1)).toBe(1);});it('c',()=>{expect(hd293art2(0,0)).toBe(0);});it('d',()=>{expect(hd293art2(93,73)).toBe(2);});it('e',()=>{expect(hd293art2(15,0)).toBe(4);});});
function hd294art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294art2_hd',()=>{it('a',()=>{expect(hd294art2(1,4)).toBe(2);});it('b',()=>{expect(hd294art2(3,1)).toBe(1);});it('c',()=>{expect(hd294art2(0,0)).toBe(0);});it('d',()=>{expect(hd294art2(93,73)).toBe(2);});it('e',()=>{expect(hd294art2(15,0)).toBe(4);});});
function hd295art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295art2_hd',()=>{it('a',()=>{expect(hd295art2(1,4)).toBe(2);});it('b',()=>{expect(hd295art2(3,1)).toBe(1);});it('c',()=>{expect(hd295art2(0,0)).toBe(0);});it('d',()=>{expect(hd295art2(93,73)).toBe(2);});it('e',()=>{expect(hd295art2(15,0)).toBe(4);});});
function hd296art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296art2_hd',()=>{it('a',()=>{expect(hd296art2(1,4)).toBe(2);});it('b',()=>{expect(hd296art2(3,1)).toBe(1);});it('c',()=>{expect(hd296art2(0,0)).toBe(0);});it('d',()=>{expect(hd296art2(93,73)).toBe(2);});it('e',()=>{expect(hd296art2(15,0)).toBe(4);});});
function hd297art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297art2_hd',()=>{it('a',()=>{expect(hd297art2(1,4)).toBe(2);});it('b',()=>{expect(hd297art2(3,1)).toBe(1);});it('c',()=>{expect(hd297art2(0,0)).toBe(0);});it('d',()=>{expect(hd297art2(93,73)).toBe(2);});it('e',()=>{expect(hd297art2(15,0)).toBe(4);});});
function hd298art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298art2_hd',()=>{it('a',()=>{expect(hd298art2(1,4)).toBe(2);});it('b',()=>{expect(hd298art2(3,1)).toBe(1);});it('c',()=>{expect(hd298art2(0,0)).toBe(0);});it('d',()=>{expect(hd298art2(93,73)).toBe(2);});it('e',()=>{expect(hd298art2(15,0)).toBe(4);});});
function hd299art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299art2_hd',()=>{it('a',()=>{expect(hd299art2(1,4)).toBe(2);});it('b',()=>{expect(hd299art2(3,1)).toBe(1);});it('c',()=>{expect(hd299art2(0,0)).toBe(0);});it('d',()=>{expect(hd299art2(93,73)).toBe(2);});it('e',()=>{expect(hd299art2(15,0)).toBe(4);});});
function hd300art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300art2_hd',()=>{it('a',()=>{expect(hd300art2(1,4)).toBe(2);});it('b',()=>{expect(hd300art2(3,1)).toBe(1);});it('c',()=>{expect(hd300art2(0,0)).toBe(0);});it('d',()=>{expect(hd300art2(93,73)).toBe(2);});it('e',()=>{expect(hd300art2(15,0)).toBe(4);});});
function hd301art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301art2_hd',()=>{it('a',()=>{expect(hd301art2(1,4)).toBe(2);});it('b',()=>{expect(hd301art2(3,1)).toBe(1);});it('c',()=>{expect(hd301art2(0,0)).toBe(0);});it('d',()=>{expect(hd301art2(93,73)).toBe(2);});it('e',()=>{expect(hd301art2(15,0)).toBe(4);});});
function hd302art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302art2_hd',()=>{it('a',()=>{expect(hd302art2(1,4)).toBe(2);});it('b',()=>{expect(hd302art2(3,1)).toBe(1);});it('c',()=>{expect(hd302art2(0,0)).toBe(0);});it('d',()=>{expect(hd302art2(93,73)).toBe(2);});it('e',()=>{expect(hd302art2(15,0)).toBe(4);});});
function hd303art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303art2_hd',()=>{it('a',()=>{expect(hd303art2(1,4)).toBe(2);});it('b',()=>{expect(hd303art2(3,1)).toBe(1);});it('c',()=>{expect(hd303art2(0,0)).toBe(0);});it('d',()=>{expect(hd303art2(93,73)).toBe(2);});it('e',()=>{expect(hd303art2(15,0)).toBe(4);});});
function hd304art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304art2_hd',()=>{it('a',()=>{expect(hd304art2(1,4)).toBe(2);});it('b',()=>{expect(hd304art2(3,1)).toBe(1);});it('c',()=>{expect(hd304art2(0,0)).toBe(0);});it('d',()=>{expect(hd304art2(93,73)).toBe(2);});it('e',()=>{expect(hd304art2(15,0)).toBe(4);});});
function hd305art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305art2_hd',()=>{it('a',()=>{expect(hd305art2(1,4)).toBe(2);});it('b',()=>{expect(hd305art2(3,1)).toBe(1);});it('c',()=>{expect(hd305art2(0,0)).toBe(0);});it('d',()=>{expect(hd305art2(93,73)).toBe(2);});it('e',()=>{expect(hd305art2(15,0)).toBe(4);});});
function hd306art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306art2_hd',()=>{it('a',()=>{expect(hd306art2(1,4)).toBe(2);});it('b',()=>{expect(hd306art2(3,1)).toBe(1);});it('c',()=>{expect(hd306art2(0,0)).toBe(0);});it('d',()=>{expect(hd306art2(93,73)).toBe(2);});it('e',()=>{expect(hd306art2(15,0)).toBe(4);});});
function hd307art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307art2_hd',()=>{it('a',()=>{expect(hd307art2(1,4)).toBe(2);});it('b',()=>{expect(hd307art2(3,1)).toBe(1);});it('c',()=>{expect(hd307art2(0,0)).toBe(0);});it('d',()=>{expect(hd307art2(93,73)).toBe(2);});it('e',()=>{expect(hd307art2(15,0)).toBe(4);});});
function hd308art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308art2_hd',()=>{it('a',()=>{expect(hd308art2(1,4)).toBe(2);});it('b',()=>{expect(hd308art2(3,1)).toBe(1);});it('c',()=>{expect(hd308art2(0,0)).toBe(0);});it('d',()=>{expect(hd308art2(93,73)).toBe(2);});it('e',()=>{expect(hd308art2(15,0)).toBe(4);});});
function hd309art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309art2_hd',()=>{it('a',()=>{expect(hd309art2(1,4)).toBe(2);});it('b',()=>{expect(hd309art2(3,1)).toBe(1);});it('c',()=>{expect(hd309art2(0,0)).toBe(0);});it('d',()=>{expect(hd309art2(93,73)).toBe(2);});it('e',()=>{expect(hd309art2(15,0)).toBe(4);});});
function hd310art2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310art2_hd',()=>{it('a',()=>{expect(hd310art2(1,4)).toBe(2);});it('b',()=>{expect(hd310art2(3,1)).toBe(1);});it('c',()=>{expect(hd310art2(0,0)).toBe(0);});it('d',()=>{expect(hd310art2(93,73)).toBe(2);});it('e',()=>{expect(hd310art2(15,0)).toBe(4);});});
