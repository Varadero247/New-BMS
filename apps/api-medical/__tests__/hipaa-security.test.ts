import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hipaaSecurityControl: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    return { skip: (page - 1) * limit, limit, page };
  },
}));

import router from '../src/routes/hipaa-security';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const mockControl = {
  id: 'ctrl-1',
  cfr45Section: '164.308(a)(1)(ii)(A)',
  category: 'ADMINISTRATIVE',
  specification: 'Required',
  title: 'Risk Analysis',
  description: 'Conduct risk assessment',
  implementationStatus: 'NOT_IMPLEMENTED',
};

describe('HIPAA Security Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated security controls', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([mockControl]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by category', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([mockControl]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(1);
    const res = await request(app).get('/?category=ADMINISTRATIVE');
    expect(res.status).toBe(200);
    expect(prisma.hipaaSecurityControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'ADMINISTRATIVE' }) })
    );
  });

  it('GET / filters by implementationStatus', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(0);
    const res = await request(app).get('/?implementationStatus=FULLY_IMPLEMENTED');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hipaaSecurityControl.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // GET /dashboard
  it('GET /dashboard returns compliance percentages by category', async () => {
    const controls = [
      { ...mockControl, category: 'ADMINISTRATIVE', implementationStatus: 'FULLY_IMPLEMENTED' },
      { ...mockControl, id: 'ctrl-2', category: 'ADMINISTRATIVE', implementationStatus: 'NOT_IMPLEMENTED' },
      { ...mockControl, id: 'ctrl-3', category: 'PHYSICAL', implementationStatus: 'FULLY_IMPLEMENTED' },
      { ...mockControl, id: 'ctrl-4', category: 'TECHNICAL', implementationStatus: 'PARTIALLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total', 4);
    expect(res.body.data).toHaveProperty('fullyImplemented', 2);
    expect(res.body.data).toHaveProperty('administrative');
    expect(res.body.data).toHaveProperty('physical');
    expect(res.body.data).toHaveProperty('technical');
    expect(res.body.data.administrative).toHaveProperty('compliancePercent');
    expect(res.body.data).toHaveProperty('overallCompliancePercent');
  });

  it('GET /dashboard returns 0% compliance when no controls', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([]);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.overallCompliancePercent).toBe(0);
  });

  it('GET /dashboard returns 500 on DB error', async () => {
    prisma.hipaaSecurityControl.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(500);
  });

  // POST /seed
  it('POST /seed seeds controls when none exist', async () => {
    prisma.hipaaSecurityControl.count
      .mockResolvedValueOnce(0)   // initial check
      .mockResolvedValueOnce(41); // final count after seed
    prisma.hipaaSecurityControl.createMany.mockResolvedValue({ count: 41 });
    const res = await request(app).post('/seed');
    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(41);
  });

  it('POST /seed skips seeding when controls already exist', async () => {
    prisma.hipaaSecurityControl.count.mockResolvedValue(41);
    const res = await request(app).post('/seed');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('already seeded');
    expect(prisma.hipaaSecurityControl.createMany).not.toHaveBeenCalled();
  });

  it('POST /seed returns 500 on DB error', async () => {
    prisma.hipaaSecurityControl.count.mockResolvedValueOnce(0);
    prisma.hipaaSecurityControl.createMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/seed');
    expect(res.status).toBe(500);
  });

  // GET /:id
  it('GET /:id returns a single control', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).get('/ctrl-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ctrl-1');
    expect(res.body.data.cfr45Section).toBe('164.308(a)(1)(ii)(A)');
  });

  it('GET /:id returns 404 for unknown control', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 500 on DB error', async () => {
    prisma.hipaaSecurityControl.findUnique.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/ctrl-1');
    expect(res.status).toBe(500);
  });

  // PUT /:id/implementation
  it('PUT /:id/implementation updates implementation status', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'FULLY_IMPLEMENTED' });
    const res = await request(app)
      .put('/ctrl-1/implementation')
      .send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(200);
    expect(res.body.data.implementationStatus).toBe('FULLY_IMPLEMENTED');
  });

  it('PUT /:id/implementation updates with notes and evidence', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({
      ...mockControl,
      implementationStatus: 'PARTIALLY_IMPLEMENTED',
      implementationNotes: 'In progress',
      evidence: 'policy-v1.pdf',
      owner: 'CISO',
    });
    const res = await request(app).put('/ctrl-1/implementation').send({
      implementationStatus: 'PARTIALLY_IMPLEMENTED',
      implementationNotes: 'In progress',
      evidence: 'policy-v1.pdf',
      owner: 'CISO',
    });
    expect(res.status).toBe(200);
  });

  it('PUT /:id/implementation accepts NOT_APPLICABLE status', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'NOT_APPLICABLE' });
    const res = await request(app)
      .put('/ctrl-1/implementation')
      .send({ implementationStatus: 'NOT_APPLICABLE' });
    expect(res.status).toBe(200);
  });

  it('PUT /:id/implementation returns 400 on invalid status', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).put('/ctrl-1/implementation').send({ implementationStatus: 'INVALID' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id/implementation returns 404 for unknown control', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .put('/unknown/implementation')
      .send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(404);
  });

  it('PUT /:id/implementation sets lastAssessed on update', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({ ...mockControl, lastAssessed: new Date() });
    await request(app).put('/ctrl-1/implementation').send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(prisma.hipaaSecurityControl.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ lastAssessed: expect.any(Date) }) })
    );
  });

  it('PUT /:id/implementation returns 400 on missing implementationStatus', async () => {
    const res = await request(app).put('/ctrl-1/implementation').send({ implementationNotes: 'note only' });
    expect(res.status).toBe(400);
  });
});
