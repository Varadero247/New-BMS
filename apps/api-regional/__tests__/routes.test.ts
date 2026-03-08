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
