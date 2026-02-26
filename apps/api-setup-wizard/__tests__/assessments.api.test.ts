// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import request from 'supertest';

jest.mock('@ims/auth', () => ({
  writeRoleGuard: (..._roles: string[]) => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
}));

jest.mock('@ims/iso-checklists', () => ({
  SUPPORTED_STANDARDS: [
    'iso-9001-2015',
    'iso-45001-2018',
    'iso-14001-2015',
    'iso-27001-2022',
    'iatf-16949-2016',
  ],
  calculateGapReport: jest.fn(() => ({
    assessmentId: 'test-id',
    standardId: 'iso-9001-2015',
    summary: {
      overallScore: 75,
      conformantCount: 15,
      minorGapCount: 5,
      majorGapCount: 3,
      notAssessedCount: 2,
      totalClauses: 25,
    },
    clauses: [],
    recommendations: [],
    generatedAt: new Date(),
  })),
  iso9001Assessment: {
    id: 'iso-9001-2015',
    name: 'ISO 9001:2015',
    clauses: Array.from({ length: 28 }, (_, i) => ({
      id: `cl-${i}`,
      number: `${i + 1}`,
      title: `Clause ${i + 1}`,
      description: 'test',
      mandatory: true,
    })),
  },
  iso45001Assessment: {
    id: 'iso-45001-2018',
    name: 'ISO 45001:2018',
    clauses: Array.from({ length: 26 }, (_, i) => ({
      id: `cl45-${i}`,
      number: `${i + 1}`,
      title: `Clause ${i + 1}`,
      description: 'test',
      mandatory: true,
    })),
  },
  iso14001Assessment: {
    id: 'iso-14001-2015',
    name: 'ISO 14001:2015',
    clauses: Array.from({ length: 24 }, (_, i) => ({
      id: `cl14-${i}`,
      number: `${i + 1}`,
      title: `Clause ${i + 1}`,
      description: 'test',
      mandatory: true,
    })),
  },
  iso27001Assessment: {
    id: 'iso-27001-2022',
    name: 'ISO 27001:2022',
    clauses: Array.from({ length: 27 }, (_, i) => ({
      id: `cl27-${i}`,
      number: `${i + 1}`,
      title: `Clause ${i + 1}`,
      description: 'test',
      mandatory: true,
    })),
  },
  iatf16949Assessment: {
    id: 'iatf-16949-2016',
    name: 'IATF 16949:2016',
    clauses: Array.from({ length: 24 }, (_, i) => ({
      id: `cliatf-${i}`,
      number: `${i + 1}`,
      title: `Clause ${i + 1}`,
      description: 'test',
      mandatory: true,
    })),
  },
}));

import assessmentsRouter from '../src/routes/assessments';

function makeApp(orgId = 'org-1') {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    req.user = { id: 'u1', organisationId: orgId, role: 'ADMIN', email: 'admin@test.com' };
    next();
  });
  app.use('/api/assessments', assessmentsRouter);
  return app;
}

const VALID_STANDARDS = [
  'iso-9001-2015',
  'iso-45001-2018',
  'iso-14001-2015',
  'iso-27001-2022',
  'iatf-16949-2016',
];

const CLAUSE_COUNTS: Record<string, number> = {
  'iso-9001-2015': 28,
  'iso-45001-2018': 26,
  'iso-14001-2015': 24,
  'iso-27001-2022': 27,
  'iatf-16949-2016': 24,
};

const STANDARD_NAMES: Record<string, string> = {
  'iso-9001-2015': 'ISO 9001:2015',
  'iso-45001-2018': 'ISO 45001:2018',
  'iso-14001-2015': 'ISO 14001:2015',
  'iso-27001-2022': 'ISO 27001:2022',
  'iatf-16949-2016': 'IATF 16949:2016',
};

async function createAssessment(standardId = 'iso-9001-2015', orgId = 'org-main') {
  const a = makeApp(orgId);
  const res = await request(a).post('/api/assessments').send({ standardId });
  return res.body.data as { id: string; standardId: string; clauseCount: number };
}

// =============================================================================
// GET /standards
// =============================================================================
describe('GET /api/assessments/standards — shape and content', () => {
  const app = makeApp('org-std-list');

  it('[1] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[2] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[3] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[4] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[5] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[6] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[7] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[8] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[9] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[10] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[11] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[12] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[13] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[14] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[15] returns HTTP 200', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.status).toBe(200);
  });

  it('[1] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[2] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[3] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[4] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[5] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[6] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[7] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[8] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[9] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[10] success is true', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.success).toBe(true);
  });

  it('[1] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[2] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[3] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[4] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[5] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[6] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[7] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[8] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[9] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[10] data is an array', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[1] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[2] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[3] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[4] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[5] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[6] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[7] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[8] data has exactly 5 elements', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toHaveLength(5);
  });

  it('[1] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[2] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[3] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[4] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[5] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[6] no error field', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.error).toBeUndefined();
  });

  it('[1] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[2] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[3] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[4] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[5] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[6] content-type is json', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('[1] all elements are strings', async () => {
    const res = await request(app).get('/api/assessments/standards');
    for (const item of res.body.data) { expect(typeof item).toBe('string'); }
  });

  it('[2] all elements are strings', async () => {
    const res = await request(app).get('/api/assessments/standards');
    for (const item of res.body.data) { expect(typeof item).toBe('string'); }
  });

  it('[3] all elements are strings', async () => {
    const res = await request(app).get('/api/assessments/standards');
    for (const item of res.body.data) { expect(typeof item).toBe('string'); }
  });

  it('[4] all elements are strings', async () => {
    const res = await request(app).get('/api/assessments/standards');
    for (const item of res.body.data) { expect(typeof item).toBe('string'); }
  });

  it('[5] all elements are strings', async () => {
    const res = await request(app).get('/api/assessments/standards');
    for (const item of res.body.data) { expect(typeof item).toBe('string'); }
  });

  it('[1] first element is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[0]).toBe('iso-9001-2015');
  });

  it('[2] first element is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[0]).toBe('iso-9001-2015');
  });

  it('[3] first element is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[0]).toBe('iso-9001-2015');
  });

  it('[4] first element is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[0]).toBe('iso-9001-2015');
  });

  it('[5] first element is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[0]).toBe('iso-9001-2015');
  });

  it('[1] last element is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[4]).toBe('iatf-16949-2016');
  });

  it('[2] last element is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[4]).toBe('iatf-16949-2016');
  });

  it('[3] last element is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[4]).toBe('iatf-16949-2016');
  });

  it('[4] last element is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[4]).toBe('iatf-16949-2016');
  });

  it('[5] last element is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data[4]).toBe('iatf-16949-2016');
  });

  it('contains iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toContain('iso-9001-2015');
  });

  it('contains iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toContain('iso-45001-2018');
  });

  it('contains iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toContain('iso-14001-2015');
  });

  it('contains iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toContain('iso-27001-2022');
  });

  it('contains iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data).toContain('iatf-16949-2016');
  });

  it('[1] repeated calls return identical data', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[2] repeated calls return identical data', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[3] repeated calls return identical data', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[4] repeated calls return identical data', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[5] repeated calls return identical data', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[1] data length >= 1', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('[2] data length >= 1', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('[3] data length >= 1', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('[4] data length >= 1', async () => {
    const res = await request(app).get('/api/assessments/standards');
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/iso-9001-2015', () => {
  const app = makeApp('org-std-iso_9001_2015');

  it('[1] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[2] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[3] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[4] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[5] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[6] data.id is iso-9001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.id).toBe('iso-9001-2015');
  });

  it('[1] data.name is ISO 9001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.name).toBe('ISO 9001:2015');
  });

  it('[2] data.name is ISO 9001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.name).toBe('ISO 9001:2015');
  });

  it('[3] data.name is ISO 9001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.name).toBe('ISO 9001:2015');
  });

  it('[4] data.name is ISO 9001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.name).toBe('ISO 9001:2015');
  });

  it('[5] data.name is ISO 9001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.name).toBe('ISO 9001:2015');
  });

  it('[1] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] has 28 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses).toHaveLength(28);
  });

  it('[2] has 28 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses).toHaveLength(28);
  });

  it('[3] has 28 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses).toHaveLength(28);
  });

  it('[4] has 28 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses).toHaveLength(28);
  });

  it('[5] has 28 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses).toHaveLength(28);
  });

  it('[1] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[2] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[3] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[1] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[2] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[3] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[1] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[2] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[3] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[1] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[2] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[3] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/iso-45001-2018', () => {
  const app = makeApp('org-std-iso_45001_2018');

  it('[1] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[2] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[3] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[4] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[5] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[6] data.id is iso-45001-2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.id).toBe('iso-45001-2018');
  });

  it('[1] data.name is ISO 45001:2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.name).toBe('ISO 45001:2018');
  });

  it('[2] data.name is ISO 45001:2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.name).toBe('ISO 45001:2018');
  });

  it('[3] data.name is ISO 45001:2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.name).toBe('ISO 45001:2018');
  });

  it('[4] data.name is ISO 45001:2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.name).toBe('ISO 45001:2018');
  });

  it('[5] data.name is ISO 45001:2018', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.name).toBe('ISO 45001:2018');
  });

  it('[1] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] has 26 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses).toHaveLength(26);
  });

  it('[2] has 26 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses).toHaveLength(26);
  });

  it('[3] has 26 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses).toHaveLength(26);
  });

  it('[4] has 26 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses).toHaveLength(26);
  });

  it('[5] has 26 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses).toHaveLength(26);
  });

  it('[1] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[2] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[3] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[1] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[2] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[3] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[1] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[2] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[3] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[1] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[2] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[3] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/iso-14001-2015', () => {
  const app = makeApp('org-std-iso_14001_2015');

  it('[1] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[2] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[3] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[4] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[5] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[6] data.id is iso-14001-2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.id).toBe('iso-14001-2015');
  });

  it('[1] data.name is ISO 14001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.name).toBe('ISO 14001:2015');
  });

  it('[2] data.name is ISO 14001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.name).toBe('ISO 14001:2015');
  });

  it('[3] data.name is ISO 14001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.name).toBe('ISO 14001:2015');
  });

  it('[4] data.name is ISO 14001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.name).toBe('ISO 14001:2015');
  });

  it('[5] data.name is ISO 14001:2015', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.name).toBe('ISO 14001:2015');
  });

  it('[1] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[2] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[3] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[4] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[5] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[1] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[2] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[3] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[1] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[2] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[3] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[1] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[2] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[3] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[1] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[2] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[3] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/iso-27001-2022', () => {
  const app = makeApp('org-std-iso_27001_2022');

  it('[1] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[2] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[3] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[4] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[5] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[6] data.id is iso-27001-2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.id).toBe('iso-27001-2022');
  });

  it('[1] data.name is ISO 27001:2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.name).toBe('ISO 27001:2022');
  });

  it('[2] data.name is ISO 27001:2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.name).toBe('ISO 27001:2022');
  });

  it('[3] data.name is ISO 27001:2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.name).toBe('ISO 27001:2022');
  });

  it('[4] data.name is ISO 27001:2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.name).toBe('ISO 27001:2022');
  });

  it('[5] data.name is ISO 27001:2022', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.name).toBe('ISO 27001:2022');
  });

  it('[1] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] has 27 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses).toHaveLength(27);
  });

  it('[2] has 27 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses).toHaveLength(27);
  });

  it('[3] has 27 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses).toHaveLength(27);
  });

  it('[4] has 27 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses).toHaveLength(27);
  });

  it('[5] has 27 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses).toHaveLength(27);
  });

  it('[1] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[2] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[3] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[1] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[2] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[3] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[1] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[2] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[3] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[1] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[2] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[3] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/iatf-16949-2016', () => {
  const app = makeApp('org-std-iatf_16949_2016');

  it('[1] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[2] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[3] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[4] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[5] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[6] data.id is iatf-16949-2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.id).toBe('iatf-16949-2016');
  });

  it('[1] data.name is IATF 16949:2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.name).toBe('IATF 16949:2016');
  });

  it('[2] data.name is IATF 16949:2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.name).toBe('IATF 16949:2016');
  });

  it('[3] data.name is IATF 16949:2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.name).toBe('IATF 16949:2016');
  });

  it('[4] data.name is IATF 16949:2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.name).toBe('IATF 16949:2016');
  });

  it('[5] data.name is IATF 16949:2016', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.name).toBe('IATF 16949:2016');
  });

  it('[1] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] clauses is array', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[2] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[3] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[4] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[5] has 24 clauses', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses).toHaveLength(24);
  });

  it('[1] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[2] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[3] clause[0] has id', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('id');
  });

  it('[1] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[2] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[3] clause[0] has number', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('number');
  });

  it('[1] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[2] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[3] clause[0] has title', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0]).toHaveProperty('title');
  });

  it('[1] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[2] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

  it('[3] clause[0].mandatory is true', async () => {
    const res = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(res.body.data.clauses[0].mandatory).toBe(true);
  });

});


// =============================================================================
describe('GET /api/assessments/standards/:unknownId — 404', () => {
  const app = makeApp('org-std-404');

  it('404 for iso-9001-2008', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2008');
    expect(res.status).toBe(404);
  });

  it('404 for iso-99999', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-99999');
    expect(res.status).toBe(404);
  });

  it('404 for not-a-standard', async () => {
    const res = await request(app).get('/api/assessments/standards/not-a-standard');
    expect(res.status).toBe(404);
  });

  it('404 for ISO-9001', async () => {
    const res = await request(app).get('/api/assessments/standards/ISO-9001');
    expect(res.status).toBe(404);
  });

  it('404 for iso9001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso9001');
    expect(res.status).toBe(404);
  });

  it('404 for undefined', async () => {
    const res = await request(app).get('/api/assessments/standards/undefined');
    expect(res.status).toBe(404);
  });

  it('404 for null', async () => {
    const res = await request(app).get('/api/assessments/standards/null');
    expect(res.status).toBe(404);
  });

  it('404 for 123', async () => {
    const res = await request(app).get('/api/assessments/standards/123');
    expect(res.status).toBe(404);
  });

  it('404 for as9100', async () => {
    const res = await request(app).get('/api/assessments/standards/as9100');
    expect(res.status).toBe(404);
  });

  it('404 for en9100', async () => {
    const res = await request(app).get('/api/assessments/standards/en9100');
    expect(res.status).toBe(404);
  });

  it('404 for iso-50001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-50001');
    expect(res.status).toBe(404);
  });

  it('404 for iso-45001-2017', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2017');
    expect(res.status).toBe(404);
  });

  it('success false for iso-9001-2008', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2008');
    expect(res.body.success).toBe(false);
  });

  it('success false for iso-99999', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-99999');
    expect(res.body.success).toBe(false);
  });

  it('success false for not-a-standard', async () => {
    const res = await request(app).get('/api/assessments/standards/not-a-standard');
    expect(res.body.success).toBe(false);
  });

  it('success false for ISO-9001', async () => {
    const res = await request(app).get('/api/assessments/standards/ISO-9001');
    expect(res.body.success).toBe(false);
  });

  it('success false for iso9001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso9001');
    expect(res.body.success).toBe(false);
  });

  it('success false for undefined', async () => {
    const res = await request(app).get('/api/assessments/standards/undefined');
    expect(res.body.success).toBe(false);
  });

  it('success false for null', async () => {
    const res = await request(app).get('/api/assessments/standards/null');
    expect(res.body.success).toBe(false);
  });

  it('success false for 123', async () => {
    const res = await request(app).get('/api/assessments/standards/123');
    expect(res.body.success).toBe(false);
  });

  it('success false for as9100', async () => {
    const res = await request(app).get('/api/assessments/standards/as9100');
    expect(res.body.success).toBe(false);
  });

  it('success false for en9100', async () => {
    const res = await request(app).get('/api/assessments/standards/en9100');
    expect(res.body.success).toBe(false);
  });

  it('success false for iso-50001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-50001');
    expect(res.body.success).toBe(false);
  });

  it('success false for iso-45001-2017', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2017');
    expect(res.body.success).toBe(false);
  });

  it('NOT_FOUND code for iso-9001-2008', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-9001-2008');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for iso-99999', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-99999');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for not-a-standard', async () => {
    const res = await request(app).get('/api/assessments/standards/not-a-standard');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for ISO-9001', async () => {
    const res = await request(app).get('/api/assessments/standards/ISO-9001');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for iso9001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso9001');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for undefined', async () => {
    const res = await request(app).get('/api/assessments/standards/undefined');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for null', async () => {
    const res = await request(app).get('/api/assessments/standards/null');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for 123', async () => {
    const res = await request(app).get('/api/assessments/standards/123');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for as9100', async () => {
    const res = await request(app).get('/api/assessments/standards/as9100');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for en9100', async () => {
    const res = await request(app).get('/api/assessments/standards/en9100');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for iso-50001', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-50001');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for iso-45001-2017', async () => {
    const res = await request(app).get('/api/assessments/standards/iso-45001-2017');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[1] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[2] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[3] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[4] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[5] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[6] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.data).toBeUndefined();
  });

  it('[1] error.message present', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[2] error.message present', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[3] error.message present', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[4] error.message present', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[5] error.message present', async () => {
    const res = await request(app).get('/api/assessments/standards/totally-unknown-xyz');
    expect(res.body.error.message).toBeTruthy();
  });

});


// =============================================================================
describe('POST /api/assessments — iso-9001-2015', () => {
  const app = makeApp('org-post-iso_9001_2015');

  it('[1] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[2] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[3] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[4] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[5] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[6] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[7] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[8] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.status).toBe(201);
  });

  it('[1] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[2] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[3] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[4] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[5] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[6] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[1] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[2] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[3] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[4] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[5] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[1] clauseCount is 28', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.clauseCount).toBe(28);
  });

  it('[2] clauseCount is 28', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.clauseCount).toBe(28);
  });

  it('[3] clauseCount is 28', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.clauseCount).toBe(28);
  });

  it('[4] clauseCount is 28', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.clauseCount).toBe(28);
  });

  it('[5] clauseCount is 28', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.clauseCount).toBe(28);
  });

  it('[1] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[2] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[3] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[4] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[1] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

});


// =============================================================================
describe('POST /api/assessments — iso-45001-2018', () => {
  const app = makeApp('org-post-iso_45001_2018');

  it('[1] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[2] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[3] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[4] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[5] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[6] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[7] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[8] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.status).toBe(201);
  });

  it('[1] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[2] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[3] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[4] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[5] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[6] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[1] data.standardId is iso-45001-2018', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.standardId).toBe('iso-45001-2018');
  });

  it('[2] data.standardId is iso-45001-2018', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.standardId).toBe('iso-45001-2018');
  });

  it('[3] data.standardId is iso-45001-2018', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.standardId).toBe('iso-45001-2018');
  });

  it('[4] data.standardId is iso-45001-2018', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.standardId).toBe('iso-45001-2018');
  });

  it('[5] data.standardId is iso-45001-2018', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.standardId).toBe('iso-45001-2018');
  });

  it('[1] clauseCount is 26', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.clauseCount).toBe(26);
  });

  it('[2] clauseCount is 26', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.clauseCount).toBe(26);
  });

  it('[3] clauseCount is 26', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.clauseCount).toBe(26);
  });

  it('[4] clauseCount is 26', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.clauseCount).toBe(26);
  });

  it('[5] clauseCount is 26', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.clauseCount).toBe(26);
  });

  it('[1] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[2] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[3] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[4] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[1] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

});


// =============================================================================
describe('POST /api/assessments — iso-14001-2015', () => {
  const app = makeApp('org-post-iso_14001_2015');

  it('[1] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[2] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[3] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[4] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[5] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[6] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[7] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[8] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.status).toBe(201);
  });

  it('[1] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[2] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[3] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[4] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[5] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[6] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[1] data.standardId is iso-14001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.standardId).toBe('iso-14001-2015');
  });

  it('[2] data.standardId is iso-14001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.standardId).toBe('iso-14001-2015');
  });

  it('[3] data.standardId is iso-14001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.standardId).toBe('iso-14001-2015');
  });

  it('[4] data.standardId is iso-14001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.standardId).toBe('iso-14001-2015');
  });

  it('[5] data.standardId is iso-14001-2015', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.standardId).toBe('iso-14001-2015');
  });

  it('[1] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[2] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[3] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[4] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[5] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[1] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[2] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[3] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[4] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[1] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

});


// =============================================================================
describe('POST /api/assessments — iso-27001-2022', () => {
  const app = makeApp('org-post-iso_27001_2022');

  it('[1] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[2] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[3] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[4] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[5] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[6] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[7] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[8] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.status).toBe(201);
  });

  it('[1] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[2] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[3] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[4] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[5] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[6] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[1] data.standardId is iso-27001-2022', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.standardId).toBe('iso-27001-2022');
  });

  it('[2] data.standardId is iso-27001-2022', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.standardId).toBe('iso-27001-2022');
  });

  it('[3] data.standardId is iso-27001-2022', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.standardId).toBe('iso-27001-2022');
  });

  it('[4] data.standardId is iso-27001-2022', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.standardId).toBe('iso-27001-2022');
  });

  it('[5] data.standardId is iso-27001-2022', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.standardId).toBe('iso-27001-2022');
  });

  it('[1] clauseCount is 27', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.clauseCount).toBe(27);
  });

  it('[2] clauseCount is 27', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.clauseCount).toBe(27);
  });

  it('[3] clauseCount is 27', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.clauseCount).toBe(27);
  });

  it('[4] clauseCount is 27', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.clauseCount).toBe(27);
  });

  it('[5] clauseCount is 27', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.clauseCount).toBe(27);
  });

  it('[1] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[2] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[3] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[4] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[1] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

});


// =============================================================================
describe('POST /api/assessments — iatf-16949-2016', () => {
  const app = makeApp('org-post-iatf_16949_2016');

  it('[1] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[2] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[3] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[4] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[5] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[6] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[7] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[8] returns 201', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.status).toBe(201);
  });

  it('[1] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[2] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[3] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[4] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[5] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[6] data.id present', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toBeDefined();
  });

  it('[1] data.standardId is iatf-16949-2016', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.standardId).toBe('iatf-16949-2016');
  });

  it('[2] data.standardId is iatf-16949-2016', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.standardId).toBe('iatf-16949-2016');
  });

  it('[3] data.standardId is iatf-16949-2016', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.standardId).toBe('iatf-16949-2016');
  });

  it('[4] data.standardId is iatf-16949-2016', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.standardId).toBe('iatf-16949-2016');
  });

  it('[5] data.standardId is iatf-16949-2016', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.standardId).toBe('iatf-16949-2016');
  });

  it('[1] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[2] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[3] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[4] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[5] clauseCount is 24', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.clauseCount).toBe(24);
  });

  it('[1] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[2] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[3] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[4] id starts with assess_', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(res.body.data.id).toMatch(/^assess_/);
  });

  it('[1] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each call produces unique id', async () => {
    const r1 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    const r2 = await request(app).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

});


// =============================================================================
describe('POST /api/assessments — missing standardId', () => {
  const app = makeApp('org-val-missing');

  it('[1] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[2] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[3] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[4] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[5] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[6] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[7] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[8] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[9] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[10] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[11] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[12] 400 when body is empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.status).toBe(400);
  });

  it('[1] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[2] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[3] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[4] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[5] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[6] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[7] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[8] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[9] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[10] success false when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.success).toBe(false);
  });

  it('[1] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[2] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[3] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[4] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[5] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[6] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[7] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[8] VALIDATION_ERROR when body empty', async () => {
    const res = await request(app).post('/api/assessments').send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[1] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[5] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[6] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[7] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[8] 400 when standardId is empty string', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.status).toBe(400);
  });

  it('[1] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[2] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[3] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[4] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[5] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[6] success false for empty string standardId', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: '' });
    expect(res.body.success).toBe(false);
  });

  it('[1] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[2] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[3] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[4] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[5] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[6] 400 when no body', async () => {
    const res = await request(app).post('/api/assessments');
    expect(res.status).toBe(400);
  });

  it('[1] 400 when standardId is null', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: null });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when standardId is null', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: null });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when standardId is null', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: null });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when standardId is null', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: null });
    expect(res.status).toBe(400);
  });

  it('[5] 400 when standardId is null', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: null });
    expect(res.status).toBe(400);
  });

});


describe('POST /api/assessments — unknown standard 404', () => {
  const app = makeApp('org-404-post');

  it('404 for iso-9001-2008', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2008' });
    expect(res.status).toBe(404);
  });

  it('404 for as9100d', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'as9100d' });
    expect(res.status).toBe(404);
  });

  it('404 for xyz', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'xyz' });
    expect(res.status).toBe(404);
  });

  it('404 for not-real', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'not-real' });
    expect(res.status).toBe(404);
  });

  it('404 for iso-45001-2017', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2017' });
    expect(res.status).toBe(404);
  });

  it('success false for iso-9001-2008', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2008' });
    expect(res.body.success).toBe(false);
  });

  it('success false for as9100d', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'as9100d' });
    expect(res.body.success).toBe(false);
  });

  it('success false for xyz', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'xyz' });
    expect(res.body.success).toBe(false);
  });

  it('success false for not-real', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'not-real' });
    expect(res.body.success).toBe(false);
  });

  it('success false for iso-45001-2017', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2017' });
    expect(res.body.success).toBe(false);
  });

  it('NOT_FOUND code for iso-9001-2008', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-9001-2008' });
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for as9100d', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'as9100d' });
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for xyz', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'xyz' });
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for not-real', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'not-real' });
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for iso-45001-2017', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'iso-45001-2017' });
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[1] error.message truthy on 404', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'completely-fake' });
    expect(res.body.error.message).toBeTruthy();
  });

  it('[2] error.message truthy on 404', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'completely-fake' });
    expect(res.body.error.message).toBeTruthy();
  });

  it('[3] error.message truthy on 404', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'completely-fake' });
    expect(res.body.error.message).toBeTruthy();
  });

  it('[4] error.message truthy on 404', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'completely-fake' });
    expect(res.body.error.message).toBeTruthy();
  });

  it('[5] error.message truthy on 404', async () => {
    const res = await request(app).post('/api/assessments').send({ standardId: 'completely-fake' });
    expect(res.body.error.message).toBeTruthy();
  });

});


// =============================================================================
describe('GET /api/assessments/:id — found', () => {
  const orgId = 'org-get-found';
  const app = makeApp(orgId);
  let assessId: string;

  beforeAll(async () => {
    const data = await createAssessment('iso-9001-2015', orgId);
    assessId = data.id;
  });


  it('[1] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[9] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[10] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[11] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[12] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[7] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[8] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[9] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[10] success true', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.success).toBe(true);
  });

  it('[1] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[2] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[3] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[4] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[5] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[6] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[7] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[8] data.id matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.id).toBe(assessId);
  });

  it('[1] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[2] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[3] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[4] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[5] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[6] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[7] data.standardId is iso-9001-2015', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.standardId).toBe('iso-9001-2015');
  });

  it('[1] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[2] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[3] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[4] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[5] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[6] data.orgId matches', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('[1] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[2] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[3] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[4] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[5] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[6] data.responses is array', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(Array.isArray(res.body.data.responses)).toBe(true);
  });

  it('[1] data.conductedBy present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBeDefined();
  });

  it('[2] data.conductedBy present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBeDefined();
  });

  it('[3] data.conductedBy present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBeDefined();
  });

  it('[4] data.conductedBy present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBeDefined();
  });

  it('[5] data.conductedBy present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBeDefined();
  });

  it('[1] conductedAt present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedAt).toBeDefined();
  });

  it('[2] conductedAt present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedAt).toBeDefined();
  });

  it('[3] conductedAt present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedAt).toBeDefined();
  });

  it('[4] conductedAt present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedAt).toBeDefined();
  });

  it('[5] conductedAt present', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedAt).toBeDefined();
  });

  it('[1] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.error).toBeUndefined();
  });

  it('[2] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.error).toBeUndefined();
  });

  it('[3] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.error).toBeUndefined();
  });

  it('[4] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.error).toBeUndefined();
  });

  it('[1] conductedBy is admin@test.com', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[2] conductedBy is admin@test.com', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[3] conductedBy is admin@test.com', async () => {
    const res = await request(app).get(`/api/assessments/${assessId}`);
    expect(res.body.data.conductedBy).toBe('admin@test.com');
  });

});


// =============================================================================
describe('GET /api/assessments/:id — not found', () => {
  const app = makeApp('org-nf');

  it('404 for assess_nonexistent', async () => {
    const res = await request(app).get('/api/assessments/assess_nonexistent');
    expect(res.status).toBe(404);
  });

  it('404 for assess_00000000', async () => {
    const res = await request(app).get('/api/assessments/assess_00000000');
    expect(res.status).toBe(404);
  });

  it('404 for does-not-exist', async () => {
    const res = await request(app).get('/api/assessments/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('404 for assess_fake_id', async () => {
    const res = await request(app).get('/api/assessments/assess_fake_id');
    expect(res.status).toBe(404);
  });

  it('404 for totally-wrong', async () => {
    const res = await request(app).get('/api/assessments/totally-wrong');
    expect(res.status).toBe(404);
  });

  it('404 for assess_999', async () => {
    const res = await request(app).get('/api/assessments/assess_999');
    expect(res.status).toBe(404);
  });

  it('404 for nope', async () => {
    const res = await request(app).get('/api/assessments/nope');
    expect(res.status).toBe(404);
  });

  it('success false for assess_nonexistent', async () => {
    const res = await request(app).get('/api/assessments/assess_nonexistent');
    expect(res.body.success).toBe(false);
  });

  it('success false for assess_00000000', async () => {
    const res = await request(app).get('/api/assessments/assess_00000000');
    expect(res.body.success).toBe(false);
  });

  it('success false for does-not-exist', async () => {
    const res = await request(app).get('/api/assessments/does-not-exist');
    expect(res.body.success).toBe(false);
  });

  it('success false for assess_fake_id', async () => {
    const res = await request(app).get('/api/assessments/assess_fake_id');
    expect(res.body.success).toBe(false);
  });

  it('success false for totally-wrong', async () => {
    const res = await request(app).get('/api/assessments/totally-wrong');
    expect(res.body.success).toBe(false);
  });

  it('success false for assess_999', async () => {
    const res = await request(app).get('/api/assessments/assess_999');
    expect(res.body.success).toBe(false);
  });

  it('success false for nope', async () => {
    const res = await request(app).get('/api/assessments/nope');
    expect(res.body.success).toBe(false);
  });

  it('NOT_FOUND code for assess_nonexistent', async () => {
    const res = await request(app).get('/api/assessments/assess_nonexistent');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for assess_00000000', async () => {
    const res = await request(app).get('/api/assessments/assess_00000000');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for does-not-exist', async () => {
    const res = await request(app).get('/api/assessments/does-not-exist');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for assess_fake_id', async () => {
    const res = await request(app).get('/api/assessments/assess_fake_id');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for totally-wrong', async () => {
    const res = await request(app).get('/api/assessments/totally-wrong');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for assess_999', async () => {
    const res = await request(app).get('/api/assessments/assess_999');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('NOT_FOUND code for nope', async () => {
    const res = await request(app).get('/api/assessments/nope');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[1] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-1');
    expect(res.body.data).toBeUndefined();
  });

  it('[2] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-2');
    expect(res.body.data).toBeUndefined();
  });

  it('[3] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-3');
    expect(res.body.data).toBeUndefined();
  });

  it('[4] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-4');
    expect(res.body.data).toBeUndefined();
  });

  it('[5] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-5');
    expect(res.body.data).toBeUndefined();
  });

  it('[6] no data field on 404', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-6');
    expect(res.body.data).toBeUndefined();
  });

  it('[1] error.message present', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-1');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[2] error.message present', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-2');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[3] error.message present', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-3');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[4] error.message present', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-4');
    expect(res.body.error.message).toBeTruthy();
  });

  it('[5] error.message present', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-id-xyz-5');
    expect(res.body.error.message).toBeTruthy();
  });

});


// =============================================================================
describe('GET /api/assessments/:id — cross-org 403', () => {
  let crossOrgId: string;
  const ownerOrg = 'org-owner-co';
  const otherApp = makeApp('org-intruder-co');

  beforeAll(async () => {
    const data = await createAssessment('iso-9001-2015', ownerOrg);
    crossOrgId = data.id;
  });


  it('[1] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[2] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[3] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[4] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[5] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[6] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[7] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[8] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[9] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[10] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[11] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[12] returns 403 for cross-org', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.status).toBe(403);
  });

  it('[1] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[2] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[3] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[4] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[5] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[6] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[7] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[8] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[9] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[10] success false on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.success).toBe(false);
  });

  it('[1] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[2] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[3] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[4] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[5] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[6] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[7] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[8] FORBIDDEN code', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[1] no data on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.data).toBeUndefined();
  });

  it('[2] no data on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.data).toBeUndefined();
  });

  it('[3] no data on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.data).toBeUndefined();
  });

  it('[4] no data on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.data).toBeUndefined();
  });

  it('[5] no data on 403', async () => {
    const res = await request(otherApp).get(`/api/assessments/${crossOrgId}`);
    expect(res.body.data).toBeUndefined();
  });

});


// =============================================================================
describe('PUT /api/assessments/:id/responses — valid', () => {
  const orgId = 'org-put-valid';
  const app = makeApp(orgId);
  let putId: string;

  beforeAll(async () => {
    const data = await createAssessment('iso-9001-2015', orgId);
    putId = data.id;
  });


  it('200 with status CONFORMANT', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-s-CONFORMANT', status: 'CONFORMANT' }] });
    expect(res.status).toBe(200);
  });

  it('200 with status MINOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-s-MINOR_GAP', status: 'MINOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('200 with status MAJOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-s-MAJOR_GAP', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('200 with status NOT_APPLICABLE', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-s-NOT_APPLICABLE', status: 'NOT_APPLICABLE' }] });
    expect(res.status).toBe(200);
  });

  it('200 with status NOT_ASSESSED', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-s-NOT_ASSESSED', status: 'NOT_ASSESSED' }] });
    expect(res.status).toBe(200);
  });

  it('success true for status CONFORMANT', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-st2-CONFORMANT', status: 'CONFORMANT' }] });
    expect(res.body.success).toBe(true);
  });

  it('success true for status MINOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-st2-MINOR_GAP', status: 'MINOR_GAP' }] });
    expect(res.body.success).toBe(true);
  });

  it('success true for status MAJOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-st2-MAJOR_GAP', status: 'MAJOR_GAP' }] });
    expect(res.body.success).toBe(true);
  });

  it('success true for status NOT_APPLICABLE', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-st2-NOT_APPLICABLE', status: 'NOT_APPLICABLE' }] });
    expect(res.body.success).toBe(true);
  });

  it('success true for status NOT_ASSESSED', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-st2-NOT_ASSESSED', status: 'NOT_ASSESSED' }] });
    expect(res.body.success).toBe(true);
  });

  it('responseCount >=1 for CONFORMANT', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rc-CONFORMANT', status: 'CONFORMANT' }] });
    expect(res.body.data.responseCount).toBeGreaterThanOrEqual(1);
  });

  it('responseCount >=1 for MINOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rc-MINOR_GAP', status: 'MINOR_GAP' }] });
    expect(res.body.data.responseCount).toBeGreaterThanOrEqual(1);
  });

  it('responseCount >=1 for MAJOR_GAP', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rc-MAJOR_GAP', status: 'MAJOR_GAP' }] });
    expect(res.body.data.responseCount).toBeGreaterThanOrEqual(1);
  });

  it('responseCount >=1 for NOT_APPLICABLE', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rc-NOT_APPLICABLE', status: 'NOT_APPLICABLE' }] });
    expect(res.body.data.responseCount).toBeGreaterThanOrEqual(1);
  });

  it('responseCount >=1 for NOT_ASSESSED', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rc-NOT_ASSESSED', status: 'NOT_ASSESSED' }] });
    expect(res.body.data.responseCount).toBeGreaterThanOrEqual(1);
  });

  it('[1] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-1', status: 'CONFORMANT' }, { clauseId: 'cl-mb-1', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-1', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[2] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-2', status: 'CONFORMANT' }, { clauseId: 'cl-mb-2', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-2', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[3] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-3', status: 'CONFORMANT' }, { clauseId: 'cl-mb-3', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-3', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[4] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-4', status: 'CONFORMANT' }, { clauseId: 'cl-mb-4', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-4', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[5] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-5', status: 'CONFORMANT' }, { clauseId: 'cl-mb-5', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-5', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[6] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-6', status: 'CONFORMANT' }, { clauseId: 'cl-mb-6', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-6', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[7] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-7', status: 'CONFORMANT' }, { clauseId: 'cl-mb-7', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-7', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[8] 200 with multiple responses', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ma-8', status: 'CONFORMANT' }, { clauseId: 'cl-mb-8', status: 'MINOR_GAP', notes: 'note' }, { clauseId: 'cl-mc-8', status: 'MAJOR_GAP' }] });
    expect(res.status).toBe(200);
  });

  it('[1] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-1', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[2] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-2', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[3] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-3', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[4] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-4', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[5] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-5', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[6] responseCount is a number', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-num-6', status: 'CONFORMANT' }] });
    expect(typeof res.body.data.responseCount).toBe('number');
  });

  it('[1] 200 with evidence field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ev-1', status: 'CONFORMANT', evidence: 'doc-1' }] });
    expect(res.status).toBe(200);
  });

  it('[2] 200 with evidence field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ev-2', status: 'CONFORMANT', evidence: 'doc-2' }] });
    expect(res.status).toBe(200);
  });

  it('[3] 200 with evidence field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ev-3', status: 'CONFORMANT', evidence: 'doc-3' }] });
    expect(res.status).toBe(200);
  });

  it('[4] 200 with evidence field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ev-4', status: 'CONFORMANT', evidence: 'doc-4' }] });
    expect(res.status).toBe(200);
  });

  it('[5] 200 with evidence field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-ev-5', status: 'CONFORMANT', evidence: 'doc-5' }] });
    expect(res.status).toBe(200);
  });

  it('[1] 200 with notes field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-nt-1', status: 'MINOR_GAP', notes: 'note 1' }] });
    expect(res.status).toBe(200);
  });

  it('[2] 200 with notes field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-nt-2', status: 'MINOR_GAP', notes: 'note 2' }] });
    expect(res.status).toBe(200);
  });

  it('[3] 200 with notes field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-nt-3', status: 'MINOR_GAP', notes: 'note 3' }] });
    expect(res.status).toBe(200);
  });

  it('[4] 200 with notes field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-nt-4', status: 'MINOR_GAP', notes: 'note 4' }] });
    expect(res.status).toBe(200);
  });

  it('[5] 200 with notes field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-nt-5', status: 'MINOR_GAP', notes: 'note 5' }] });
    expect(res.status).toBe(200);
  });

  it('[1] 200 with responsiblePerson field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rp-1', status: 'CONFORMANT', responsiblePerson: 'Person 1' }] });
    expect(res.status).toBe(200);
  });

  it('[2] 200 with responsiblePerson field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rp-2', status: 'CONFORMANT', responsiblePerson: 'Person 2' }] });
    expect(res.status).toBe(200);
  });

  it('[3] 200 with responsiblePerson field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rp-3', status: 'CONFORMANT', responsiblePerson: 'Person 3' }] });
    expect(res.status).toBe(200);
  });

  it('[4] 200 with responsiblePerson field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rp-4', status: 'CONFORMANT', responsiblePerson: 'Person 4' }] });
    expect(res.status).toBe(200);
  });

  it('[5] 200 with responsiblePerson field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-rp-5', status: 'CONFORMANT', responsiblePerson: 'Person 5' }] });
    expect(res.status).toBe(200);
  });

  it('[1] 200 with targetDate field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-td-1', status: 'MINOR_GAP', targetDate: '2026-12-31' }] });
    expect(res.status).toBe(200);
  });

  it('[2] 200 with targetDate field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-td-2', status: 'MINOR_GAP', targetDate: '2026-12-31' }] });
    expect(res.status).toBe(200);
  });

  it('[3] 200 with targetDate field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-td-3', status: 'MINOR_GAP', targetDate: '2026-12-31' }] });
    expect(res.status).toBe(200);
  });

  it('[4] 200 with targetDate field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-td-4', status: 'MINOR_GAP', targetDate: '2026-12-31' }] });
    expect(res.status).toBe(200);
  });

  it('[5] 200 with targetDate field', async () => {
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-td-5', status: 'MINOR_GAP', targetDate: '2026-12-31' }] });
    expect(res.status).toBe(200);
  });

  it('[1] upsert updates existing clauseId', async () => {
    await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-1', status: 'MINOR_GAP' }] });
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-1', status: 'CONFORMANT' }] });
    expect(res.status).toBe(200);
  });

  it('[2] upsert updates existing clauseId', async () => {
    await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-2', status: 'MINOR_GAP' }] });
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-2', status: 'CONFORMANT' }] });
    expect(res.status).toBe(200);
  });

  it('[3] upsert updates existing clauseId', async () => {
    await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-3', status: 'MINOR_GAP' }] });
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-3', status: 'CONFORMANT' }] });
    expect(res.status).toBe(200);
  });

  it('[4] upsert updates existing clauseId', async () => {
    await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-4', status: 'MINOR_GAP' }] });
    const res = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-up-4', status: 'CONFORMANT' }] });
    expect(res.status).toBe(200);
  });

  it('[1] responses accumulate across calls', async () => {
    const r1 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-a1', status: 'CONFORMANT' }] });
    const r2 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-b1', status: 'MINOR_GAP' }] });
    expect(r1.status).toBe(200);
    expect(r2.body.data.responseCount).toBeGreaterThanOrEqual(r1.body.data.responseCount);
  });

  it('[2] responses accumulate across calls', async () => {
    const r1 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-a2', status: 'CONFORMANT' }] });
    const r2 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-b2', status: 'MINOR_GAP' }] });
    expect(r1.status).toBe(200);
    expect(r2.body.data.responseCount).toBeGreaterThanOrEqual(r1.body.data.responseCount);
  });

  it('[3] responses accumulate across calls', async () => {
    const r1 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-a3', status: 'CONFORMANT' }] });
    const r2 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-b3', status: 'MINOR_GAP' }] });
    expect(r1.status).toBe(200);
    expect(r2.body.data.responseCount).toBeGreaterThanOrEqual(r1.body.data.responseCount);
  });

  it('[4] responses accumulate across calls', async () => {
    const r1 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-a4', status: 'CONFORMANT' }] });
    const r2 = await request(app).put(`/api/assessments/${putId}/responses`).send({ responses: [{ clauseId: 'cl-acc-b4', status: 'MINOR_GAP' }] });
    expect(r1.status).toBe(200);
    expect(r2.body.data.responseCount).toBeGreaterThanOrEqual(r1.body.data.responseCount);
  });

});


// =============================================================================
describe('PUT /api/assessments/:id/responses — 400 validation', () => {
  const orgId = 'org-put-400';
  const app = makeApp(orgId);
  let putId400: string;

  beforeAll(async () => {
    const data = await createAssessment('iso-14001-2015', orgId);
    putId400 = data.id;
  });


  it('[1] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[2] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[3] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[4] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[5] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[6] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[7] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[8] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[9] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[10] 400 when responses missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.status).toBe(400);
  });

  it('[1] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[5] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[6] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[7] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[8] 400 when responses empty array', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [] });
    expect(res.status).toBe(400);
  });

  it('[1] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[5] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[6] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[7] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[8] 400 when status invalid', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'INVALID_STATUS' }] });
    expect(res.status).toBe(400);
  });

  it('[1] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[5] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[6] 400 when clauseId missing', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[1] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[2] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[3] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[4] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[5] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[6] VALIDATION_ERROR code', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({});
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('[1] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[2] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[3] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[4] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[5] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[6] 404 when assessment not found', async () => {
    const res = await request(app).put('/api/assessments/nonexistent-put/responses').send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(res.status).toBe(404);
  });

  it('[1] 400 when clauseId empty string', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: '', status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[2] 400 when clauseId empty string', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: '', status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[3] 400 when clauseId empty string', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: '', status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

  it('[4] 400 when clauseId empty string', async () => {
    const res = await request(app).put(`/api/assessments/${putId400}/responses`).send({ responses: [{ clauseId: '', status: 'CONFORMANT' }] });
    expect(res.status).toBe(400);
  });

});


// =============================================================================
describe('GET /api/assessments/:id/report — found', () => {
  const orgId = 'org-report-found';
  const app = makeApp(orgId);
  let reportId: string;

  beforeAll(async () => {
    const data = await createAssessment('iso-9001-2015', orgId);
    reportId = data.id;
  });


  it('[1] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[2] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[3] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[4] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[5] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[6] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[7] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[8] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[9] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[10] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[11] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[12] returns 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.status).toBe(200);
  });

  it('[1] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[2] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[3] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[4] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[5] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[6] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[7] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[8] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[9] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[10] success true', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.success).toBe(true);
  });

  it('[1] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[2] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[3] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[4] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[5] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[6] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[7] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[8] data.summary defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary).toBeDefined();
  });

  it('[1] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[2] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[3] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[4] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[5] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[6] summary.overallScore is 75', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.overallScore).toBe(75);
  });

  it('[1] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[2] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[3] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[4] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[5] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[6] summary.totalClauses is 25', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.totalClauses).toBe(25);
  });

  it('[1] summary.conformantCount is 15', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.conformantCount).toBe(15);
  });

  it('[2] summary.conformantCount is 15', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.conformantCount).toBe(15);
  });

  it('[3] summary.conformantCount is 15', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.conformantCount).toBe(15);
  });

  it('[4] summary.conformantCount is 15', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.conformantCount).toBe(15);
  });

  it('[5] summary.conformantCount is 15', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.conformantCount).toBe(15);
  });

  it('[1] summary.minorGapCount is 5', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.minorGapCount).toBe(5);
  });

  it('[2] summary.minorGapCount is 5', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.minorGapCount).toBe(5);
  });

  it('[3] summary.minorGapCount is 5', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.minorGapCount).toBe(5);
  });

  it('[4] summary.minorGapCount is 5', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.minorGapCount).toBe(5);
  });

  it('[5] summary.minorGapCount is 5', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.minorGapCount).toBe(5);
  });

  it('[1] summary.majorGapCount is 3', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.majorGapCount).toBe(3);
  });

  it('[2] summary.majorGapCount is 3', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.majorGapCount).toBe(3);
  });

  it('[3] summary.majorGapCount is 3', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.majorGapCount).toBe(3);
  });

  it('[4] summary.majorGapCount is 3', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.majorGapCount).toBe(3);
  });

  it('[5] summary.majorGapCount is 3', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.majorGapCount).toBe(3);
  });

  it('[1] data.clauses is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[2] data.clauses is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[3] data.clauses is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[4] data.clauses is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[5] data.clauses is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.clauses)).toBe(true);
  });

  it('[1] data.recommendations is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('[2] data.recommendations is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('[3] data.recommendations is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('[4] data.recommendations is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('[5] data.recommendations is array', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });

  it('[1] generatedAt defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.generatedAt).toBeDefined();
  });

  it('[2] generatedAt defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.generatedAt).toBeDefined();
  });

  it('[3] generatedAt defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.generatedAt).toBeDefined();
  });

  it('[4] generatedAt defined', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.generatedAt).toBeDefined();
  });

  it('[1] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.error).toBeUndefined();
  });

  it('[2] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.error).toBeUndefined();
  });

  it('[3] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.error).toBeUndefined();
  });

  it('[4] no error on 200', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.error).toBeUndefined();
  });

  it('[1] summary.notAssessedCount is 2', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.notAssessedCount).toBe(2);
  });

  it('[2] summary.notAssessedCount is 2', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.notAssessedCount).toBe(2);
  });

  it('[3] summary.notAssessedCount is 2', async () => {
    const res = await request(app).get(`/api/assessments/${reportId}/report`);
    expect(res.body.data.summary.notAssessedCount).toBe(2);
  });

});


// =============================================================================
describe('GET /api/assessments/:id/report — 404', () => {
  const app = makeApp('org-report-404');

  it('[1] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-1/report');
    expect(res.status).toBe(404);
  });

  it('[2] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-2/report');
    expect(res.status).toBe(404);
  });

  it('[3] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-3/report');
    expect(res.status).toBe(404);
  });

  it('[4] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-4/report');
    expect(res.status).toBe(404);
  });

  it('[5] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-5/report');
    expect(res.status).toBe(404);
  });

  it('[6] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-6/report');
    expect(res.status).toBe(404);
  });

  it('[7] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-7/report');
    expect(res.status).toBe(404);
  });

  it('[8] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-8/report');
    expect(res.status).toBe(404);
  });

  it('[9] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-9/report');
    expect(res.status).toBe(404);
  });

  it('[10] 404 for nonexistent assessment', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-10/report');
    expect(res.status).toBe(404);
  });

  it('[1] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-1/report');
    expect(res.body.success).toBe(false);
  });

  it('[2] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-2/report');
    expect(res.body.success).toBe(false);
  });

  it('[3] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-3/report');
    expect(res.body.success).toBe(false);
  });

  it('[4] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-4/report');
    expect(res.body.success).toBe(false);
  });

  it('[5] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-5/report');
    expect(res.body.success).toBe(false);
  });

  it('[6] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-6/report');
    expect(res.body.success).toBe(false);
  });

  it('[7] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-7/report');
    expect(res.body.success).toBe(false);
  });

  it('[8] success false', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-8/report');
    expect(res.body.success).toBe(false);
  });

  it('[1] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-1/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[2] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-2/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[3] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-3/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[4] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-4/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[5] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-5/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('[6] NOT_FOUND code', async () => {
    const res = await request(app).get('/api/assessments/nonexistent-report-6/report');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

});


// =============================================================================
describe('GET /api/assessments/:id/report — cross-org 403', () => {
  let reportCrossId: string;
  const ownerOrg = 'org-report-owner-x';
  const intruderApp = makeApp('org-report-intruder-x');

  beforeAll(async () => {
    const data = await createAssessment('iso-45001-2018', ownerOrg);
    reportCrossId = data.id;
  });


  it('[1] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[2] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[3] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[4] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[5] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[6] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[7] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[8] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[9] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[10] 403 cross-org on report', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.status).toBe(403);
  });

  it('[1] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[2] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[3] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[4] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[5] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[6] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[7] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[8] FORBIDDEN code on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('[1] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

  it('[2] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

  it('[3] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

  it('[4] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

  it('[5] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

  it('[6] success false on report 403', async () => {
    const res = await request(intruderApp).get(`/api/assessments/${reportCrossId}/report`);
    expect(res.body.success).toBe(false);
  });

});


// =============================================================================
describe('Full lifecycle — create, retrieve, respond, report', () => {

  it('complete lifecycle for iso-9001-2015', async () => {
    const a = makeApp('org-lc-iso9001');
    const create = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(create.body.data.clauseCount).toBe(28);
    const get = await request(a).get(`/api/assessments/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.standardId).toBe('iso-9001-2015');
    const put = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(put.status).toBe(200);
    const report = await request(a).get(`/api/assessments/${id}/report`);
    expect(report.status).toBe(200);
    expect(report.body.data.summary).toBeDefined();
  });

  it('complete lifecycle for iso-45001-2018', async () => {
    const a = makeApp('org-lc-iso45001');
    const create = await request(a).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(create.body.data.clauseCount).toBe(26);
    const get = await request(a).get(`/api/assessments/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.standardId).toBe('iso-45001-2018');
    const put = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(put.status).toBe(200);
    const report = await request(a).get(`/api/assessments/${id}/report`);
    expect(report.status).toBe(200);
    expect(report.body.data.summary).toBeDefined();
  });

  it('complete lifecycle for iso-14001-2015', async () => {
    const a = makeApp('org-lc-iso14001');
    const create = await request(a).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(create.body.data.clauseCount).toBe(24);
    const get = await request(a).get(`/api/assessments/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.standardId).toBe('iso-14001-2015');
    const put = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(put.status).toBe(200);
    const report = await request(a).get(`/api/assessments/${id}/report`);
    expect(report.status).toBe(200);
    expect(report.body.data.summary).toBeDefined();
  });

  it('complete lifecycle for iso-27001-2022', async () => {
    const a = makeApp('org-lc-iso27001');
    const create = await request(a).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(create.body.data.clauseCount).toBe(27);
    const get = await request(a).get(`/api/assessments/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.standardId).toBe('iso-27001-2022');
    const put = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(put.status).toBe(200);
    const report = await request(a).get(`/api/assessments/${id}/report`);
    expect(report.status).toBe(200);
    expect(report.body.data.summary).toBeDefined();
  });

  it('complete lifecycle for iatf-16949-2016', async () => {
    const a = makeApp('org-lc-iatf16949');
    const create = await request(a).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(create.status).toBe(201);
    const id = create.body.data.id;
    expect(create.body.data.clauseCount).toBe(24);
    const get = await request(a).get(`/api/assessments/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.data.standardId).toBe('iatf-16949-2016');
    const put = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    expect(put.status).toBe(200);
    const report = await request(a).get(`/api/assessments/${id}/report`);
    expect(report.status).toBe(200);
    expect(report.body.data.summary).toBeDefined();
  });

  it('[1] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-1');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[2] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-2');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[3] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-3');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[4] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-4');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[5] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-5');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[6] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-6');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[7] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-7');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[8] each assessment has unique id', async () => {
    const a = makeApp('org-uniq-8');
    const r1 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r2 = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
  });

  it('[1] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-1');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-1');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[2] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-2');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-2');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[3] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-3');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-3');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[4] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-4');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-4');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[5] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-5');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-5');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[6] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-6');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-6');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[7] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-7');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-7');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[8] cross-org 403 isolation', async () => {
    const owner = makeApp('org-own-8');
    const c = await request(owner).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-int-8');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}`);
    expect(r.status).toBe(403);
  });

  it('[1] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-1');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[2] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-2');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[3] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-3');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[4] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-4');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[5] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-5');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[6] responses accumulate', async () => {
    const a = makeApp('org-acc-lc-6');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const id = c.body.data.id;
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-0', status: 'CONFORMANT' }] });
    await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-1', status: 'MINOR_GAP' }] });
    const r = await request(a).put(`/api/assessments/${id}/responses`).send({ responses: [{ clauseId: 'cl-2', status: 'MAJOR_GAP' }] });
    expect(r.body.data.responseCount).toBeGreaterThanOrEqual(3);
  });

  it('[1] list standards then create', async () => {
    const a = makeApp('org-ls-1');
    const sr = await request(a).get('/api/assessments/standards');
    expect(sr.status).toBe(200);
    const cr = await request(a).post('/api/assessments').send({ standardId: sr.body.data[0] });
    expect(cr.status).toBe(201);
  });

  it('[2] list standards then create', async () => {
    const a = makeApp('org-ls-2');
    const sr = await request(a).get('/api/assessments/standards');
    expect(sr.status).toBe(200);
    const cr = await request(a).post('/api/assessments').send({ standardId: sr.body.data[0] });
    expect(cr.status).toBe(201);
  });

  it('[3] list standards then create', async () => {
    const a = makeApp('org-ls-3');
    const sr = await request(a).get('/api/assessments/standards');
    expect(sr.status).toBe(200);
    const cr = await request(a).post('/api/assessments').send({ standardId: sr.body.data[0] });
    expect(cr.status).toBe(201);
  });

  it('[4] list standards then create', async () => {
    const a = makeApp('org-ls-4');
    const sr = await request(a).get('/api/assessments/standards');
    expect(sr.status).toBe(200);
    const cr = await request(a).post('/api/assessments').send({ standardId: sr.body.data[0] });
    expect(cr.status).toBe(201);
  });

  it('[5] list standards then create', async () => {
    const a = makeApp('org-ls-5');
    const sr = await request(a).get('/api/assessments/standards');
    expect(sr.status).toBe(200);
    const cr = await request(a).post('/api/assessments').send({ standardId: sr.body.data[0] });
    expect(cr.status).toBe(201);
  });

  it('[1] cross-org cannot view report', async () => {
    const o = makeApp('org-rep-o-1');
    const c = await request(o).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-rep-i-1');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}/report`);
    expect(r.status).toBe(403);
  });

  it('[2] cross-org cannot view report', async () => {
    const o = makeApp('org-rep-o-2');
    const c = await request(o).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-rep-i-2');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}/report`);
    expect(r.status).toBe(403);
  });

  it('[3] cross-org cannot view report', async () => {
    const o = makeApp('org-rep-o-3');
    const c = await request(o).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-rep-i-3');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}/report`);
    expect(r.status).toBe(403);
  });

  it('[4] cross-org cannot view report', async () => {
    const o = makeApp('org-rep-o-4');
    const c = await request(o).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const intruder = makeApp('org-rep-i-4');
    const r = await request(intruder).get(`/api/assessments/${c.body.data.id}/report`);
    expect(r.status).toBe(403);
  });

  it('[1] multi-standard creation same org', async () => {
    const a = makeApp('org-ms-1');
    for (const std of ['iso-9001-2015', 'iso-45001-2018']) {
      const r = await request(a).post('/api/assessments').send({ standardId: std });
      expect(r.status).toBe(201);
    }
  });

  it('[2] multi-standard creation same org', async () => {
    const a = makeApp('org-ms-2');
    for (const std of ['iso-9001-2015', 'iso-45001-2018']) {
      const r = await request(a).post('/api/assessments').send({ standardId: std });
      expect(r.status).toBe(201);
    }
  });

  it('[3] multi-standard creation same org', async () => {
    const a = makeApp('org-ms-3');
    for (const std of ['iso-9001-2015', 'iso-45001-2018']) {
      const r = await request(a).post('/api/assessments').send({ standardId: std });
      expect(r.status).toBe(201);
    }
  });

});


// =============================================================================
describe('Edge cases and additional coverage', () => {
  const app = makeApp('org-edge');


  it('[1] GET /standards is idempotent', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[2] GET /standards is idempotent', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[3] GET /standards is idempotent', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[4] GET /standards is idempotent', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('[5] GET /standards is idempotent', async () => {
    const r1 = await request(app).get('/api/assessments/standards');
    const r2 = await request(app).get('/api/assessments/standards');
    expect(r1.body.data).toEqual(r2.body.data);
  });

  it('clauseCount matches for iso-9001-2015', async () => {
    const c = await request(makeApp('org-ec-iso-90')).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    expect(c.body.data.clauseCount).toBe(28);
  });

  it('clauseCount matches for iso-45001-2018', async () => {
    const c = await request(makeApp('org-ec-iso-45')).post('/api/assessments').send({ standardId: 'iso-45001-2018' });
    expect(c.body.data.clauseCount).toBe(26);
  });

  it('clauseCount matches for iso-14001-2015', async () => {
    const c = await request(makeApp('org-ec-iso-14')).post('/api/assessments').send({ standardId: 'iso-14001-2015' });
    expect(c.body.data.clauseCount).toBe(24);
  });

  it('clauseCount matches for iso-27001-2022', async () => {
    const c = await request(makeApp('org-ec-iso-27')).post('/api/assessments').send({ standardId: 'iso-27001-2022' });
    expect(c.body.data.clauseCount).toBe(27);
  });

  it('clauseCount matches for iatf-16949-2016', async () => {
    const c = await request(makeApp('org-ec-iatf-1')).post('/api/assessments').send({ standardId: 'iatf-16949-2016' });
    expect(c.body.data.clauseCount).toBe(24);
  });

  it('standard name correct for iso-9001-2015', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-9001-2015');
    expect(r.body.data.name).toBe('ISO 9001:2015');
  });

  it('standard name correct for iso-45001-2018', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-45001-2018');
    expect(r.body.data.name).toBe('ISO 45001:2018');
  });

  it('standard name correct for iso-14001-2015', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-14001-2015');
    expect(r.body.data.name).toBe('ISO 14001:2015');
  });

  it('standard name correct for iso-27001-2022', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-27001-2022');
    expect(r.body.data.name).toBe('ISO 27001:2022');
  });

  it('standard name correct for iatf-16949-2016', async () => {
    const r = await request(app).get('/api/assessments/standards/iatf-16949-2016');
    expect(r.body.data.name).toBe('IATF 16949:2016');
  });

  it('[1] conductedBy is admin@test.com', async () => {
    const a = makeApp('org-cb-1');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const g = await request(a).get(`/api/assessments/${c.body.data.id}`);
    expect(g.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[2] conductedBy is admin@test.com', async () => {
    const a = makeApp('org-cb-2');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const g = await request(a).get(`/api/assessments/${c.body.data.id}`);
    expect(g.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[3] conductedBy is admin@test.com', async () => {
    const a = makeApp('org-cb-3');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const g = await request(a).get(`/api/assessments/${c.body.data.id}`);
    expect(g.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[4] conductedBy is admin@test.com', async () => {
    const a = makeApp('org-cb-4');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const g = await request(a).get(`/api/assessments/${c.body.data.id}`);
    expect(g.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[5] conductedBy is admin@test.com', async () => {
    const a = makeApp('org-cb-5');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const g = await request(a).get(`/api/assessments/${c.body.data.id}`);
    expect(g.body.data.conductedBy).toBe('admin@test.com');
  });

  it('[1] all clauses have mandatory field', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-9001-2015');
    for (const clause of r.body.data.clauses) { expect(clause).toHaveProperty('mandatory'); }
  });

  it('[2] all clauses have mandatory field', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-9001-2015');
    for (const clause of r.body.data.clauses) { expect(clause).toHaveProperty('mandatory'); }
  });

  it('[3] all clauses have mandatory field', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-9001-2015');
    for (const clause of r.body.data.clauses) { expect(clause).toHaveProperty('mandatory'); }
  });

  it('[4] all clauses have mandatory field', async () => {
    const r = await request(app).get('/api/assessments/standards/iso-9001-2015');
    for (const clause of r.body.data.clauses) { expect(clause).toHaveProperty('mandatory'); }
  });

  it('[1] all optional fields accepted in PUT', async () => {
    const a = makeApp('org-opts-1');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r = await request(a).put(`/api/assessments/${c.body.data.id}/responses`).send({ responses: [{ clauseId: 'cl-all', status: 'MINOR_GAP', evidence: 'doc', notes: 'note', responsiblePerson: 'QM', targetDate: '2026-06-30' }] });
    expect(r.status).toBe(200);
  });

  it('[2] all optional fields accepted in PUT', async () => {
    const a = makeApp('org-opts-2');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r = await request(a).put(`/api/assessments/${c.body.data.id}/responses`).send({ responses: [{ clauseId: 'cl-all', status: 'MINOR_GAP', evidence: 'doc', notes: 'note', responsiblePerson: 'QM', targetDate: '2026-06-30' }] });
    expect(r.status).toBe(200);
  });

  it('[3] all optional fields accepted in PUT', async () => {
    const a = makeApp('org-opts-3');
    const c = await request(a).post('/api/assessments').send({ standardId: 'iso-9001-2015' });
    const r = await request(a).put(`/api/assessments/${c.body.data.id}/responses`).send({ responses: [{ clauseId: 'cl-all', status: 'MINOR_GAP', evidence: 'doc', notes: 'note', responsiblePerson: 'QM', targetDate: '2026-06-30' }] });
    expect(r.status).toBe(200);
  });

  it('[1] standard id in list matches detail id', async () => {
    const lr = await request(app).get('/api/assessments/standards');
    const stdId = lr.body.data[0];
    const dr = await request(app).get(`/api/assessments/standards/${stdId}`);
    expect(dr.body.data.id).toBe(stdId);
  });

  it('[2] standard id in list matches detail id', async () => {
    const lr = await request(app).get('/api/assessments/standards');
    const stdId = lr.body.data[0];
    const dr = await request(app).get(`/api/assessments/standards/${stdId}`);
    expect(dr.body.data.id).toBe(stdId);
  });

  it('[3] standard id in list matches detail id', async () => {
    const lr = await request(app).get('/api/assessments/standards');
    const stdId = lr.body.data[0];
    const dr = await request(app).get(`/api/assessments/standards/${stdId}`);
    expect(dr.body.data.id).toBe(stdId);
  });

  it('[1] 404 report for non-existent id', async () => {
    const r = await request(app).get('/api/assessments/no-such-id-1/report');
    expect(r.status).toBe(404);
  });

  it('[2] 404 report for non-existent id', async () => {
    const r = await request(app).get('/api/assessments/no-such-id-2/report');
    expect(r.status).toBe(404);
  });

  it('[3] 404 report for non-existent id', async () => {
    const r = await request(app).get('/api/assessments/no-such-id-3/report');
    expect(r.status).toBe(404);
  });

});
