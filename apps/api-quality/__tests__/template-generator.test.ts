import request from 'supertest';
import express from 'express';

// Mock prisma
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockFindUnique = jest.fn();
const mockCount = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../src/prisma', () => ({
  prisma: {
    qualGeneratedTemplate: {
      create: (...args: any[]) => mockCreate(...args),
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      count: (...args: any[]) => mockCount(...args),
      delete: (...args: any[]) => mockDelete(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', organisationId: 'org-1', role: 'ADMIN' };
    next();
  },
}));

jest.mock('@ims/rbac', () => ({
  attachPermissions: () => (_req: any, _res: any, next: any) => next(),
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  PermissionLevel: { MANAGE: 'MANAGE', READ: 'READ', WRITE: 'WRITE' },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

import templateGeneratorRouter from '../src/routes/template-generator';

const app = express();
app.use(express.json());
app.use('/api/template-generator', templateGeneratorRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/template-generator', () => {
  it('should generate a quality procedure template from prompt', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      docNumber: 'PRO-100',
      title: 'Quality Inspection Procedure',
      category: 'PROCEDURE',
      isoStandard: 'ISO 9001:2015',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a quality inspection procedure' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('PROCEDURE');
    expect(res.body.data.configJson).toBeDefined();
    expect(res.body.data.configJson.sections.length).toBeGreaterThan(0);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('should detect ISO 45001 for safety-related prompts', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-2',
      docNumber: 'SWP-100',
      title: 'Forklift Safety SWP',
      category: 'SWP',
      isoStandard: 'ISO 45001:2018',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a safe working procedure for forklift operations and safety' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('ISO 45001:2018');
  });

  it('should detect ISO 27001 for infosec prompts', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-3',
      docNumber: 'POL-100',
      title: 'Information Security Policy',
      category: 'POLICY',
      isoStandard: 'ISO/IEC 27001:2022',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Generate an information security policy' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('ISO/IEC 27001:2022');
  });

  it('should detect GDPR for data protection prompts', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-4',
      docNumber: 'PRO-100',
      title: 'Data Protection Procedure',
      category: 'PROCEDURE',
      isoStandard: 'UK GDPR / DPA 2018',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a GDPR data protection procedure' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('UK GDPR / DPA 2018');
  });

  it('should generate a form template', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-5',
      docNumber: 'FRM-100',
      title: 'Equipment Inspection Form',
      category: 'FORM',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create an equipment inspection checklist form' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.docNumber).toMatch(/^FRM-/);
  });

  it('should generate a register template', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-6',
      docNumber: 'REG-100',
      title: 'Chemical Register',
      category: 'REGISTER',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a chemical substances register for environmental compliance' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.docNumber).toMatch(/^REG-/);
    expect(res.body.data.configJson.isoRef).toBe('ISO 14001:2015');
  });

  it('should generate a plan template', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-7',
      docNumber: 'PLN-100',
      title: 'Waste Reduction Plan',
      category: 'PLAN',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a waste reduction plan for environmental management' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.docNumber).toMatch(/^PLN-/);
  });

  it('should generate a report template', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-8',
      docNumber: 'RPT-100',
      title: 'Energy Performance Review',
      category: 'REPORT',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create an energy performance review report' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.docNumber).toMatch(/^RPT-/);
    expect(res.body.data.configJson.isoRef).toBe('ISO 50001:2018');
  });

  it('should generate an audit checklist', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-9',
      docNumber: 'AUD-100',
      title: 'Food Safety Audit',
      category: 'AUDIT',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a food safety audit checklist' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.docNumber).toMatch(/^AUD-/);
    expect(res.body.data.configJson.isoRef).toBe('ISO 22000:2018');
  });

  it('should allow overriding category and ISO standard', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-10',
      docNumber: 'POL-100',
      title: 'Custom Policy',
      category: 'POLICY',
    });

    const res = await request(app).post('/api/template-generator').send({
      prompt: 'Create a custom compliance document',
      category: 'POLICY',
      isoStandard: 'ISO 37001:2016',
      title: 'Anti-Bribery Compliance Policy',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('ISO 37001:2016');
  });

  it('should reject empty prompt', async () => {
    const res = await request(app).post('/api/template-generator').send({ prompt: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject too-short prompt', async () => {
    const res = await request(app).post('/api/template-generator').send({ prompt: 'hi' });

    expect(res.status).toBe(400);
  });

  it('should detect ESG for sustainability prompts', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-11',
      docNumber: 'RPT-100',
      title: 'Sustainability Report',
      category: 'REPORT',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create a sustainability report for ESG compliance' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('CSRD / ESRS / GRI');
  });

  it('should detect ISO 42001 for AI prompts', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue({
      id: 'tpl-12',
      docNumber: 'FRM-100',
      title: 'AI Impact Assessment Form',
      category: 'FORM',
    });

    const res = await request(app)
      .post('/api/template-generator')
      .send({ prompt: 'Create an AI impact assessment form' });

    expect(res.status).toBe(201);
    expect(res.body.data.configJson.isoRef).toBe('ISO/IEC 42001:2023');
  });
});

describe('GET /api/template-generator', () => {
  it('should list generated templates', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: '00000000-0000-0000-0000-000000000001',
        docNumber: 'PRO-100',
        title: 'Test',
        category: 'PROCEDURE',
      },
    ]);
    mockCount.mockResolvedValue(1);

    const res = await request(app).get('/api/template-generator');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by category', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const res = await request(app).get('/api/template-generator?category=POLICY');

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'POLICY' }),
      })
    );
  });
});

describe('GET /api/template-generator/:id', () => {
  it('should return a specific template with parsed configJson', async () => {
    mockFindUnique.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      docNumber: 'PRO-100',
      title: 'Test',
      configJson: JSON.stringify({ sections: [] }),
    });

    const res = await request(app).get(
      '/api/template-generator/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.configJson.sections).toBeDefined();
  });

  it('should return 404 for unknown template', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/template-generator/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/template-generator/:id', () => {
  it('should delete a template', async () => {
    mockUpdate.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete(
      '/api/template-generator/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Template deleted');
  });
});

describe('GET /api/template-generator/categories', () => {
  it('should return available categories', async () => {
    const res = await request(app).get('/api/template-generator/categories');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(8);
    expect(res.body.data.map((c: any) => c.category)).toContain('POLICY');
    expect(res.body.data.map((c: any) => c.category)).toContain('SWP');
    expect(res.body.data.map((c: any) => c.category)).toContain('AUDIT');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/template-generator');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/template-generator').send({ prompt: 'Create a quality inspection procedure' });
    expect(res.status).toBe(500);
  });
});
