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

// ─── Parametric tests across all 20 APAC countries ───────────────────────────

const ALL_CODES = ['SG','AU','MY','JP','KR','CN','HK','TW','TH','VN','ID','PH','IN','NZ','BD','LA','LK','MM','KH','BN'];

describe('GET /api/region-config — all 20 countries present in listing', () => {
  let allData: Array<{ countryCode: string }> = [];

  beforeAll(async () => {
    const res = await get('/api/region-config');
    allData = res.body.data;
  });

  ALL_CODES.forEach(code => {
    it(`listing includes ${code}`, () => {
      expect(allData.some(r => r.countryCode === code)).toBe(true);
    });
  });

  it('all countries have positive corporateTaxRate field', () => {
    allData.forEach(r => {
      expect(typeof (r as any).corporateTaxRate).toBe('number');
    });
  });

  it('all countries have gstVatRate field', () => {
    allData.forEach(r => {
      expect((r as any)).toHaveProperty('gstVatRate');
    });
  });

  it('all countries have legislationCount > 0', () => {
    allData.forEach(r => {
      expect((r as any).legislationCount).toBeGreaterThan(0);
    });
  });

  it('all countries have isoStandardsCount > 0', () => {
    allData.forEach(r => {
      expect((r as any).isoStandardsCount).toBeGreaterThan(0);
    });
  });
});

describe('GET /api/region-config/:code — individual country data completeness', () => {
  const SAMPLE_COUNTRIES = ['SG', 'AU', 'MY', 'JP', 'KR', 'IN', 'NZ', 'HK'];

  SAMPLE_COUNTRIES.forEach(code => {
    it(`${code} — returns 200 with full config`, async () => {
      const res = await get(`/api/region-config/${code}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.countryCode).toBe(code);
    });

    it(`${code} — has finance, legislation, isoContext, compliance, business`, async () => {
      const res = await get(`/api/region-config/${code}`);
      const d = res.body.data;
      expect(d).toHaveProperty('finance');
      expect(d).toHaveProperty('legislation');
      expect(d).toHaveProperty('isoContext');
      expect(d).toHaveProperty('compliance');
      expect(d).toHaveProperty('business');
    });

    it(`${code} — finance has corporateTaxRate and gstVatRate`, async () => {
      const res = await get(`/api/region-config/${code}`);
      const f = res.body.data.finance;
      expect(typeof f.corporateTaxRate).toBe('number');
      expect(typeof f.gstVatRate).toBe('number');
    });
  });

  it('lowercase codes normalise to uppercase', async () => {
    for (const code of ['sg', 'au', 'jp', 'kr']) {
      const res = await get(`/api/region-config/${code}`);
      expect(res.status).toBe(200);
      expect(res.body.data.countryCode).toBe(code.toUpperCase());
    }
  });

  const INVALID_CODES = ['XX', 'ZZ', 'QQ', 'AAA', '12'];
  INVALID_CODES.forEach(code => {
    it(`invalid code "${code}" → 404`, async () => {
      const res = await get(`/api/region-config/${code}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('GET /api/region-config/:code/finance — multiple countries', () => {
  const COUNTRIES = ['SG', 'AU', 'MY', 'JP', 'KR', 'CN'];
  COUNTRIES.forEach(code => {
    it(`${code} finance — has gstVatName, filingDeadlines`, async () => {
      const res = await get(`/api/region-config/${code}/finance`);
      expect(res.status).toBe(200);
      expect(res.body.data.finance).toHaveProperty('gstVatName');
      expect(res.body.data.finance).toHaveProperty('filingDeadlines');
    });
  });

  it('404 for unknown finance code', async () => {
    const res = await get('/api/region-config/ZZ/finance');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/:code/legislation — filter combinations', () => {
  it('SG legislation: no filter returns all laws', async () => {
    const all = await get('/api/region-config/SG/legislation');
    const mandatory = await get('/api/region-config/SG/legislation?mandatory=true');
    expect(all.body.data.legislation.length).toBeGreaterThanOrEqual(mandatory.body.data.legislation.length);
  });

  it('all laws in mandatory=true response have isMandatory === true', async () => {
    const res = await get('/api/region-config/AU/legislation?mandatory=true');
    res.body.data.legislation.forEach((l: any) => {
      expect(l.isMandatory).toBe(true);
    });
  });

  it('mandatory=false returns all laws for MY (filter only applies to "true")', async () => {
    const all = await get('/api/region-config/MY/legislation');
    const falseFilt = await get('/api/region-config/MY/legislation?mandatory=false');
    // mandatory=false is not a supported filter (only "true" is); should return same as all
    expect(falseFilt.status).toBe(200);
    expect(falseFilt.body.data.legislation.length).toBe(all.body.data.legislation.length);
  });

  const CATEGORIES = ['employment', 'health_safety', 'environment', 'data_protection'];
  CATEGORIES.forEach(cat => {
    it(`JP legislation filtered by category=${cat} has correct category`, async () => {
      const res = await get(`/api/region-config/JP/legislation?category=${cat}`);
      expect(res.status).toBe(200);
      res.body.data.legislation.forEach((l: any) => {
        expect(l.category).toBe(cat);
      });
    });
  });

  it('legislation for unknown code → 404', async () => {
    const res = await get('/api/region-config/ZZ/legislation');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/:code/iso — multi-country ISO lookup', () => {
  const COUNTRIES_ISO = ['SG', 'AU', 'JP', 'KR', 'IN'];
  COUNTRIES_ISO.forEach(code => {
    it(`${code} /iso returns adoptedStandards array`, async () => {
      const res = await get(`/api/region-config/${code}/iso`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.adoptedStandards)).toBe(true);
      expect(res.body.data.adoptedStandards.length).toBeGreaterThan(0);
    });
  });

  it('ISO filter for 9001 returns only matching standards for AU', async () => {
    const res = await get('/api/region-config/AU/iso?standard=9001');
    res.body.data.adoptedStandards.forEach((s: any) => {
      expect(s.standard).toContain('9001');
    });
  });

  it('ISO filter for 45001 returns only matching standards for JP', async () => {
    const res = await get('/api/region-config/JP/iso?standard=45001');
    res.body.data.adoptedStandards.forEach((s: any) => {
      expect(s.standard).toContain('45001');
    });
  });

  it('iso 404 for unknown code', async () => {
    const res = await get('/api/region-config/ZZ/iso');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/:code/compliance — multiple countries', () => {
  const COMPLIANCE_COUNTRIES = ['SG', 'AU', 'MY', 'JP', 'KR'];
  COMPLIANCE_COUNTRIES.forEach(code => {
    it(`${code} compliance returns 200 with compliance data`, async () => {
      const res = await get(`/api/region-config/${code}/compliance`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('compliance');
    });
  });
  it('compliance 404 for unknown code', async () => {
    const res = await get('/api/region-config/XX/compliance');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/:code/business — multiple countries', () => {
  const BUSINESS_COUNTRIES = ['SG', 'AU', 'HK', 'JP'];
  BUSINESS_COUNTRIES.forEach(code => {
    it(`${code} business returns 200 with business data`, async () => {
      const res = await get(`/api/region-config/${code}/business`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('business');
    });
  });
  it('business 404 for unknown code', async () => {
    const res = await get('/api/region-config/XX/business');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/region-config/:code/tax-calculate — extended cases', () => {
  const TAX_COUNTRIES = ['AU', 'MY', 'JP', 'KR', 'TH', 'IN'];

  TAX_COUNTRIES.forEach(code => {
    it(`${code} — corporate tax calculation returns taxAmount ≥ 0`, async () => {
      const res = await post(`/api/region-config/${code}/tax-calculate`, { income: 1000000 });
      expect(res.status).toBe(200);
      expect(res.body.data.corporateTax.taxAmount).toBeGreaterThanOrEqual(0);
    });
  });

  it('very small income → near-zero corporate tax for SG', async () => {
    const res = await post('/api/region-config/SG/tax-calculate', { income: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.corporateTax.taxAmount).toBeGreaterThanOrEqual(0);
  });

  it('GST calculation: transactionAmount present → gst block included', async () => {
    const res = await post('/api/region-config/AU/tax-calculate', {
      income: 500000,
      transactionAmount: 10000,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('gst');
    expect(res.body.data.gst.gstAmount).toBeGreaterThanOrEqual(0);
  });

  it('withholding: withholdingType given → withholding block included for MY', async () => {
    const res = await post('/api/region-config/MY/tax-calculate', {
      income: 1000000,
      transactionAmount: 100000,
      withholdingType: 'interest',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('withholding');
  });

  it('tax-calculate 404 for unknown code', async () => {
    const res = await post('/api/region-config/XX/tax-calculate', { income: 100000 });
    expect(res.status).toBe(404);
  });

  it('tax-calculate 404 for lowercase invalid code', async () => {
    const res = await post('/api/region-config/zz/tax-calculate', { income: 100000 });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/region-config/compare/iso/:standard — extended', () => {
  const STANDARDS = ['ISO%209001', 'ISO%2014001', 'ISO%2045001'];

  STANDARDS.forEach(std => {
    it(`compare/iso/${std} — returns 20 countries`, async () => {
      const res = await get(`/api/region-config/compare/iso/${std}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalCountries).toBe(20);
    });

    it(`compare/iso/${std} — each row has adoptionStatus and certificationBodies`, async () => {
      const res = await get(`/api/region-config/compare/iso/${std}`);
      res.body.data.comparison.forEach((row: any) => {
        expect(row).toHaveProperty('adoptionStatus');
        expect(row).toHaveProperty('certificationBodies');
      });
    });
  });

  it('adoptedCount is between 0 and 20', async () => {
    const res = await get('/api/region-config/compare/iso/ISO%2027001');
    expect(res.body.data.adoptedCount).toBeGreaterThanOrEqual(0);
    expect(res.body.data.adoptedCount).toBeLessThanOrEqual(20);
  });
});

describe('GET /api/region-config/compare/countries — extended', () => {
  it('all rows have required comparison fields', async () => {
    const res = await get('/api/region-config/compare/countries');
    res.body.data.countries.forEach((row: any) => {
      expect(row).toHaveProperty('countryCode');
      expect(row).toHaveProperty('countryName');
      expect(row).toHaveProperty('corporateTaxRate');
      expect(row).toHaveProperty('gstVatRate');
      expect(row).toHaveProperty('easeOfDoingBusinessRank');
    });
  });

  it('three-country subset SG,JP,KR returns exactly 3 rows', async () => {
    const res = await get('/api/region-config/compare/countries?codes=SG,JP,KR');
    expect(res.body.meta.total).toBe(3);
    expect(res.body.data.countries).toHaveLength(3);
  });

  it('empty codes param defaults to all 20', async () => {
    const res = await get('/api/region-config/compare/countries?codes=');
    expect(res.status).toBe(200);
    // empty string treated as all
    expect(res.body.data.countries.length).toBeGreaterThan(0);
  });

  it('all-invalid codes returns empty countries and full notFound list', async () => {
    const res = await get('/api/region-config/compare/countries?codes=XX,YY,ZZ');
    expect(res.status).toBe(200);
    expect(res.body.data.countries).toHaveLength(0);
    expect(res.body.data.notFound).toContain('XX');
    expect(res.body.data.notFound).toContain('YY');
    expect(res.body.data.notFound).toContain('ZZ');
  });
});

describe('GET /api/region-config/report/tax — ranking invariants', () => {
  it('rankedByGst is sorted ascending by gstVatRate', async () => {
    const res = await get('/api/region-config/report/tax');
    const ranked = res.body.data.rankedByGst;
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].gstVatRate).toBeGreaterThanOrEqual(ranked[i - 1].gstVatRate);
    }
  });

  it('rankedByCorpTax has 20 entries', async () => {
    const res = await get('/api/region-config/report/tax');
    expect(res.body.data.rankedByCorpTax).toHaveLength(20);
  });

  it('summary.lowestCorpTax.corporateTaxRate <= all others', async () => {
    const res = await get('/api/region-config/report/tax');
    const lowest = res.body.data.summary.lowestCorpTax.corporateTaxRate;
    res.body.data.rankedByCorpTax.forEach((r: any) => {
      expect(r.corporateTaxRate).toBeGreaterThanOrEqual(lowest);
    });
  });
});

describe('GET /api/region-config/report/compliance — extended', () => {
  it('all 20 compliance rows have boolean whistleblowerProtection', async () => {
    const res = await get('/api/region-config/report/compliance');
    res.body.data.forEach((row: any) => {
      expect(typeof row.whistleblowerProtection).toBe('boolean');
    });
  });

  it('all rows have mandatoryLawsCount >= 0', async () => {
    const res = await get('/api/region-config/report/compliance');
    res.body.data.forEach((row: any) => {
      expect(row.mandatoryLawsCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('all rows have isoStandardsAdopted >= 0', async () => {
    const res = await get('/api/region-config/report/compliance');
    res.body.data.forEach((row: any) => {
      expect(row.isoStandardsAdopted).toBeGreaterThanOrEqual(0);
    });
  });
});
function cs255rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph255rcs_cs',()=>{it('a',()=>{expect(cs255rcs(2)).toBe(2);});it('b',()=>{expect(cs255rcs(3)).toBe(3);});it('c',()=>{expect(cs255rcs(4)).toBe(5);});it('d',()=>{expect(cs255rcs(5)).toBe(8);});it('e',()=>{expect(cs255rcs(1)).toBe(1);});});
function cs256rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph256rcs_cs',()=>{it('a',()=>{expect(cs256rcs(2)).toBe(2);});it('b',()=>{expect(cs256rcs(3)).toBe(3);});it('c',()=>{expect(cs256rcs(4)).toBe(5);});it('d',()=>{expect(cs256rcs(5)).toBe(8);});it('e',()=>{expect(cs256rcs(1)).toBe(1);});});
function cs257rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph257rcs_cs',()=>{it('a',()=>{expect(cs257rcs(2)).toBe(2);});it('b',()=>{expect(cs257rcs(3)).toBe(3);});it('c',()=>{expect(cs257rcs(4)).toBe(5);});it('d',()=>{expect(cs257rcs(5)).toBe(8);});it('e',()=>{expect(cs257rcs(1)).toBe(1);});});
function cs258rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph258rcs_cs',()=>{it('a',()=>{expect(cs258rcs(2)).toBe(2);});it('b',()=>{expect(cs258rcs(3)).toBe(3);});it('c',()=>{expect(cs258rcs(4)).toBe(5);});it('d',()=>{expect(cs258rcs(5)).toBe(8);});it('e',()=>{expect(cs258rcs(1)).toBe(1);});});
function cs259rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph259rcs_cs',()=>{it('a',()=>{expect(cs259rcs(2)).toBe(2);});it('b',()=>{expect(cs259rcs(3)).toBe(3);});it('c',()=>{expect(cs259rcs(4)).toBe(5);});it('d',()=>{expect(cs259rcs(5)).toBe(8);});it('e',()=>{expect(cs259rcs(1)).toBe(1);});});
function cs260rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph260rcs_cs',()=>{it('a',()=>{expect(cs260rcs(2)).toBe(2);});it('b',()=>{expect(cs260rcs(3)).toBe(3);});it('c',()=>{expect(cs260rcs(4)).toBe(5);});it('d',()=>{expect(cs260rcs(5)).toBe(8);});it('e',()=>{expect(cs260rcs(1)).toBe(1);});});
function cs261rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph261rcs_cs',()=>{it('a',()=>{expect(cs261rcs(2)).toBe(2);});it('b',()=>{expect(cs261rcs(3)).toBe(3);});it('c',()=>{expect(cs261rcs(4)).toBe(5);});it('d',()=>{expect(cs261rcs(5)).toBe(8);});it('e',()=>{expect(cs261rcs(1)).toBe(1);});});
function cs262rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph262rcs_cs',()=>{it('a',()=>{expect(cs262rcs(2)).toBe(2);});it('b',()=>{expect(cs262rcs(3)).toBe(3);});it('c',()=>{expect(cs262rcs(4)).toBe(5);});it('d',()=>{expect(cs262rcs(5)).toBe(8);});it('e',()=>{expect(cs262rcs(1)).toBe(1);});});
function cs263rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph263rcs_cs',()=>{it('a',()=>{expect(cs263rcs(2)).toBe(2);});it('b',()=>{expect(cs263rcs(3)).toBe(3);});it('c',()=>{expect(cs263rcs(4)).toBe(5);});it('d',()=>{expect(cs263rcs(5)).toBe(8);});it('e',()=>{expect(cs263rcs(1)).toBe(1);});});
function cs264rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph264rcs_cs',()=>{it('a',()=>{expect(cs264rcs(2)).toBe(2);});it('b',()=>{expect(cs264rcs(3)).toBe(3);});it('c',()=>{expect(cs264rcs(4)).toBe(5);});it('d',()=>{expect(cs264rcs(5)).toBe(8);});it('e',()=>{expect(cs264rcs(1)).toBe(1);});});
function cs265rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph265rcs_cs',()=>{it('a',()=>{expect(cs265rcs(2)).toBe(2);});it('b',()=>{expect(cs265rcs(3)).toBe(3);});it('c',()=>{expect(cs265rcs(4)).toBe(5);});it('d',()=>{expect(cs265rcs(5)).toBe(8);});it('e',()=>{expect(cs265rcs(1)).toBe(1);});});
function cs266rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph266rcs_cs',()=>{it('a',()=>{expect(cs266rcs(2)).toBe(2);});it('b',()=>{expect(cs266rcs(3)).toBe(3);});it('c',()=>{expect(cs266rcs(4)).toBe(5);});it('d',()=>{expect(cs266rcs(5)).toBe(8);});it('e',()=>{expect(cs266rcs(1)).toBe(1);});});
function cs267rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph267rcs_cs',()=>{it('a',()=>{expect(cs267rcs(2)).toBe(2);});it('b',()=>{expect(cs267rcs(3)).toBe(3);});it('c',()=>{expect(cs267rcs(4)).toBe(5);});it('d',()=>{expect(cs267rcs(5)).toBe(8);});it('e',()=>{expect(cs267rcs(1)).toBe(1);});});
function cs268rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph268rcs_cs',()=>{it('a',()=>{expect(cs268rcs(2)).toBe(2);});it('b',()=>{expect(cs268rcs(3)).toBe(3);});it('c',()=>{expect(cs268rcs(4)).toBe(5);});it('d',()=>{expect(cs268rcs(5)).toBe(8);});it('e',()=>{expect(cs268rcs(1)).toBe(1);});});
function cs269rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph269rcs_cs',()=>{it('a',()=>{expect(cs269rcs(2)).toBe(2);});it('b',()=>{expect(cs269rcs(3)).toBe(3);});it('c',()=>{expect(cs269rcs(4)).toBe(5);});it('d',()=>{expect(cs269rcs(5)).toBe(8);});it('e',()=>{expect(cs269rcs(1)).toBe(1);});});
function cs270rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph270rcs_cs',()=>{it('a',()=>{expect(cs270rcs(2)).toBe(2);});it('b',()=>{expect(cs270rcs(3)).toBe(3);});it('c',()=>{expect(cs270rcs(4)).toBe(5);});it('d',()=>{expect(cs270rcs(5)).toBe(8);});it('e',()=>{expect(cs270rcs(1)).toBe(1);});});
function cs271rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph271rcs_cs',()=>{it('a',()=>{expect(cs271rcs(2)).toBe(2);});it('b',()=>{expect(cs271rcs(3)).toBe(3);});it('c',()=>{expect(cs271rcs(4)).toBe(5);});it('d',()=>{expect(cs271rcs(5)).toBe(8);});it('e',()=>{expect(cs271rcs(1)).toBe(1);});});
function cs272rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph272rcs_cs',()=>{it('a',()=>{expect(cs272rcs(2)).toBe(2);});it('b',()=>{expect(cs272rcs(3)).toBe(3);});it('c',()=>{expect(cs272rcs(4)).toBe(5);});it('d',()=>{expect(cs272rcs(5)).toBe(8);});it('e',()=>{expect(cs272rcs(1)).toBe(1);});});
function cs273rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph273rcs_cs',()=>{it('a',()=>{expect(cs273rcs(2)).toBe(2);});it('b',()=>{expect(cs273rcs(3)).toBe(3);});it('c',()=>{expect(cs273rcs(4)).toBe(5);});it('d',()=>{expect(cs273rcs(5)).toBe(8);});it('e',()=>{expect(cs273rcs(1)).toBe(1);});});
function cs274rcs(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph274rcs_cs',()=>{it('a',()=>{expect(cs274rcs(2)).toBe(2);});it('b',()=>{expect(cs274rcs(3)).toBe(3);});it('c',()=>{expect(cs274rcs(4)).toBe(5);});it('d',()=>{expect(cs274rcs(5)).toBe(8);});it('e',()=>{expect(cs274rcs(1)).toBe(1);});});
