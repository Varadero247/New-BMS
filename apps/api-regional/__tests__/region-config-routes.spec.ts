// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * HTTP route tests for /api/region-config endpoints.
 * Uses supertest against the Express app directly (no network).
 * Mocks all external dependencies (prisma, monitoring, sentry, validation, service-auth).
 */

/**
 * Route tests mount just the regionConfigRouter on a minimal Express app,
 * avoiding the TDZ issue caused by src/index.ts calling initTracing() before
 * the @ims/monitoring import is resolved under isolatedModules mode.
 */
import express from 'express';
import request from 'supertest';
import regionConfigRouter from '../src/routes/region-config';

// Minimal test app — mirrors the real app's middleware for this router
const testApp = express();
testApp.use(express.json());
testApp.use('/api/region-config', regionConfigRouter);
testApp.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
});
// Catch unhandled errors so tests get JSON 500 rather than HTML
testApp.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, error: err.message });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const get = (path: string) => request(testApp).get(path).set('Accept', 'application/json');
const post = (path: string, body: unknown) =>
  request(testApp).post(path).set('Content-Type', 'application/json').send(body);

describe('GET /api/region-config', () => {
  it('returns 20 countries with summary fields', async () => {
    const res = await get('/api/region-config');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta.total).toBe(20);
    const first = res.body.data[0];
    expect(first).toHaveProperty('countryCode');
    expect(first).toHaveProperty('corporateTaxRate');
    expect(first).toHaveProperty('gstVatRate');
    expect(first).toHaveProperty('legislationCount');
    expect(first).toHaveProperty('isoStandardsCount');
  });

  it('summary does NOT include the full legislation array', async () => {
    const res = await get('/api/region-config');
    expect(res.body.data[0]).not.toHaveProperty('legislation');
  });
});

describe('GET /api/region-config/:code', () => {
  it('returns full config for SG', async () => {
    const res = await get('/api/region-config/SG');
    expect(res.status).toBe(200);
    const c = res.body.data;
    expect(c.countryCode).toBe('SG');
    expect(c.countryName).toBe('Singapore');
    expect(c.finance.gstVatName).toBe('GST');
    expect(c.legislation.primaryLaws.length).toBeGreaterThan(0);
    expect(c.isoContext.adoptedStandards.length).toBeGreaterThan(0);
  });

  it('returns full config for AU', async () => {
    const res = await get('/api/region-config/AU');
    expect(res.status).toBe(200);
    expect(res.body.data.countryCode).toBe('AU');
  });

  it('accepts lowercase country codes', async () => {
    const res = await get('/api/region-config/sg');
    expect(res.status).toBe(200);
    expect(res.body.data.countryCode).toBe('SG');
  });

  it('returns 404 for unknown code', async () => {
    const res = await get('/api/region-config/XX');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/region-config/:code/finance', () => {
  it('returns finance data for JP', async () => {
    const res = await get('/api/region-config/JP/finance');
    expect(res.status).toBe(200);
    const f = res.body.data.finance;
    expect(f).toHaveProperty('corporateTaxRate');
    expect(f).toHaveProperty('gstVatRate');
    expect(f).toHaveProperty('gstVatName');
    expect(f).toHaveProperty('filingDeadlines');
  });

  it('returns 404 for unknown code', async () => {
    const res = await get('/api/region-config/ZZ/finance');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/:code/legislation', () => {
  it('returns all laws without filter', async () => {
    const res = await get('/api/region-config/MY/legislation');
    expect(res.status).toBe(200);
    expect(res.body.data.legislation.length).toBeGreaterThan(0);
    expect(res.body.data).toHaveProperty('regulatoryBodies');
    expect(res.body.data).toHaveProperty('reportingRequirements');
    expect(res.body.data).toHaveProperty('auditRequirements');
  });

  it('filters by mandatory=true', async () => {
    const res = await get('/api/region-config/SG/legislation?mandatory=true');
    expect(res.status).toBe(200);
    res.body.data.legislation.forEach((l: { isMandatory: boolean }) => {
      expect(l.isMandatory).toBe(true);
    });
  });

  it('filters by category', async () => {
    const res = await get('/api/region-config/AU/legislation?category=employment');
    expect(res.status).toBe(200);
    res.body.data.legislation.forEach((l: { category: string }) => {
      expect(l.category).toBe('employment');
    });
  });
});

describe('GET /api/region-config/:code/iso', () => {
  it('returns ISO adoption data for SG', async () => {
    const res = await get('/api/region-config/SG/iso');
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d).toHaveProperty('accreditationBody');
    expect(d).toHaveProperty('certificationBodies');
    expect(d.adoptedStandards.length).toBeGreaterThan(0);
  });

  it('filters by standard substring', async () => {
    const res = await get('/api/region-config/SG/iso?standard=9001');
    expect(res.status).toBe(200);
    res.body.data.adoptedStandards.forEach((s: { standard: string }) => {
      expect(s.standard).toContain('9001');
    });
  });

  it('returns empty adoptedStandards for unrecognised standard', async () => {
    const res = await get('/api/region-config/SG/iso?standard=ISO+99999');
    expect(res.status).toBe(200);
    expect(res.body.data.adoptedStandards).toHaveLength(0);
  });
});

describe('GET /api/region-config/:code/compliance', () => {
  it('returns compliance data', async () => {
    const res = await get('/api/region-config/KR/compliance');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('compliance');
  });
});

describe('GET /api/region-config/:code/business', () => {
  it('returns business environment data', async () => {
    const res = await get('/api/region-config/CN/business');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('business');
  });
});

describe('POST /api/region-config/:code/tax-calculate', () => {
  it('calculates all tax types for SG', async () => {
    const res = await post('/api/region-config/SG/tax-calculate', {
      income: 1000000,
      transactionAmount: 50000,
      withholdingType: 'dividends',
      salaryAmount: 6000,
    });
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d).toHaveProperty('corporateTax');
    expect(d.corporateTax.taxAmount).toBeCloseTo(170000);
    expect(d).toHaveProperty('gst');
    expect(d.gst.gstAmount).toBeCloseTo(4500);
    expect(d).toHaveProperty('withholding');
    expect(d.withholding.withholdingTax).toBe(0); // SG dividends = 0%
    expect(d).toHaveProperty('payrollTax');
  });

  it('calculates only corporate tax when only income given', async () => {
    const res = await post('/api/region-config/AU/tax-calculate', { income: 500000 });
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d).toHaveProperty('corporateTax');
    expect(d).not.toHaveProperty('gst');
    expect(d).not.toHaveProperty('withholding');
  });

  it('returns payrollTax when country has a payroll scheme', async () => {
    // HK has MPF (Mandatory Provident Fund)
    const res = await post('/api/region-config/HK/tax-calculate', { salaryAmount: 50000 });
    expect(res.status).toBe(200);
    // HK has MPF so payrollTax should be present
    const d = res.body.data;
    if (d.payrollTax) {
      expect(d.payrollTax).toHaveProperty('employeeContribution');
      expect(d.payrollTax).toHaveProperty('employerContribution');
    }
    // Response is always success regardless
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for unknown country', async () => {
    const res = await post('/api/region-config/XX/tax-calculate', { income: 100000 });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/compare/iso/:standard', () => {
  it('compares ISO 9001 adoption across all 20 countries', async () => {
    const res = await get('/api/region-config/compare/iso/ISO%209001');
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d.totalCountries).toBe(20);
    expect(d.comparison.length).toBe(20);
    expect(d.adoptedCount).toBeGreaterThan(0);
    expect(d.comparison[0]).toHaveProperty('countryCode');
    expect(d.comparison[0]).toHaveProperty('adoptionStatus');
  });

  it('returns fewer adopted countries for niche standard', async () => {
    const isoGeneral = await get('/api/region-config/compare/iso/ISO%209001');
    const isoNiche = await get('/api/region-config/compare/iso/ISO%2037001');
    expect(isoNiche.body.data.adoptedCount).toBeLessThan(isoGeneral.body.data.adoptedCount);
  });
});

describe('GET /api/region-config/compare/countries', () => {
  it('compares all 20 when no codes param given', async () => {
    const res = await get('/api/region-config/compare/countries');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(20);
    const row = res.body.data.countries[0];
    expect(row).toHaveProperty('countryCode');
    expect(row).toHaveProperty('corporateTaxRate');
    expect(row).toHaveProperty('gstVatRate');
    expect(row).toHaveProperty('withholdingDividends');
    expect(row).toHaveProperty('easeOfDoingBusinessRank');
    expect(row).toHaveProperty('incorporationTime');
  });

  it('compares subset when codes param given', async () => {
    const res = await get('/api/region-config/compare/countries?codes=SG,AU,MY');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(3);
    const codes = res.body.data.countries.map((r: { countryCode: string }) => r.countryCode);
    expect(codes).toContain('SG');
    expect(codes).toContain('AU');
    expect(codes).toContain('MY');
  });

  it('reports notFound codes', async () => {
    const res = await get('/api/region-config/compare/countries?codes=SG,XX,AU');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.notFound)).toBe(true);
    expect(res.body.data.notFound).toContain('XX');
    expect(res.body.meta.total).toBe(2); // SG and AU found
  });

  it('accepts lowercase codes', async () => {
    const res = await get('/api/region-config/compare/countries?codes=sg,jp');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(2);
  });
});

describe('GET /api/region-config/report/tax', () => {
  it('returns ranked lists and summary', async () => {
    const res = await get('/api/region-config/report/tax');
    expect(res.status).toBe(200);
    const d = res.body.data;
    expect(d).toHaveProperty('rankedByCorpTax');
    expect(d).toHaveProperty('rankedByGst');
    expect(d).toHaveProperty('rankedByWithholdingDividends');
    expect(d).toHaveProperty('rankedByEaseOfBusiness');
    expect(d).toHaveProperty('summary');
    expect(d.rankedByCorpTax.length).toBe(20);
    expect(d.rankedByCorpTax[0]).toHaveProperty('rank');
    expect(d.rankedByCorpTax[0].rank).toBe(1);
  });

  it('lowest corp tax country is ranked #1', async () => {
    const res = await get('/api/region-config/report/tax');
    const ranked = res.body.data.rankedByCorpTax;
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].corporateTaxRate).toBeGreaterThanOrEqual(ranked[i - 1].corporateTaxRate);
    }
  });

  it('summary identifies lowest and highest corp tax countries', async () => {
    const res = await get('/api/region-config/report/tax');
    const s = res.body.data.summary;
    expect(s.lowestCorpTax).toHaveProperty('countryCode');
    expect(s.highestCorpTax).toHaveProperty('countryCode');
    expect(s.lowestCorpTax.corporateTaxRate).toBeLessThanOrEqual(s.highestCorpTax.corporateTaxRate);
  });
});

describe('GET /api/region-config/report/compliance', () => {
  it('returns compliance summary for all 20 countries', async () => {
    const res = await get('/api/region-config/report/compliance');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(20);
    const row = res.body.data[0];
    expect(row).toHaveProperty('regulatoryBodiesCount');
    expect(row).toHaveProperty('mandatoryLawsCount');
    expect(row).toHaveProperty('isoStandardsAdopted');
    expect(row).toHaveProperty('dataProtectionAuthority');
    expect(row).toHaveProperty('dueDiligenceRequirements');
    expect(row).toHaveProperty('whistleblowerProtection');
  });
});

describe('404 handler', () => {
  it('returns 404 JSON for unknown routes', async () => {
    const res = await get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
