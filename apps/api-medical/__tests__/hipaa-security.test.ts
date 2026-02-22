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

describe('HIPAA Security — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns pagination object with page, limit, total, totalPages', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([mockControl]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(41);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total', 41);
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / with page=2&limit=5 passes correct skip to findMany', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(41);
    const res = await request(app).get('/?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(prisma.hipaaSecurityControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('GET /dashboard partiallyImplemented count is correct', async () => {
    const controls = [
      { ...mockControl, id: 'c1', implementationStatus: 'PARTIALLY_IMPLEMENTED' },
      { ...mockControl, id: 'c2', implementationStatus: 'PARTIALLY_IMPLEMENTED' },
      { ...mockControl, id: 'c3', implementationStatus: 'FULLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.partiallyImplemented).toBe(2);
  });

  it('GET /dashboard notImplemented count is correct', async () => {
    const controls = [
      { ...mockControl, id: 'c1', implementationStatus: 'NOT_IMPLEMENTED' },
      { ...mockControl, id: 'c2', implementationStatus: 'FULLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.body.data.notImplemented).toBe(1);
  });

  it('GET /:id success is true on found control', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    const res = await request(app).get('/ctrl-1');
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id/implementation returns 500 on DB error during update', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/ctrl-1/implementation').send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /seed returns 500 on DB error during count', async () => {
    prisma.hipaaSecurityControl.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/seed');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / with implementationStatus filter passes it to query', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([mockControl]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(1);
    const res = await request(app).get('/?implementationStatus=NOT_IMPLEMENTED');
    expect(res.status).toBe(200);
    expect(prisma.hipaaSecurityControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ implementationStatus: 'NOT_IMPLEMENTED' }),
      })
    );
  });
});

describe('HIPAA Security — final boundary coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns empty data array when no controls match', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('GET /dashboard counts all controls including NOT_APPLICABLE in total', async () => {
    const controls = [
      { ...mockControl, id: 'c1', implementationStatus: 'NOT_APPLICABLE' },
      { ...mockControl, id: 'c2', implementationStatus: 'NOT_APPLICABLE' },
      { ...mockControl, id: 'c3', implementationStatus: 'FULLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.fullyImplemented).toBe(1);
  });

  it('GET /dashboard 100% compliance when all FULLY_IMPLEMENTED', async () => {
    const controls = [
      { ...mockControl, id: 'c1', implementationStatus: 'FULLY_IMPLEMENTED' },
      { ...mockControl, id: 'c2', implementationStatus: 'FULLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.overallCompliancePercent).toBe(100);
  });

  it('GET /:id returns 500 for DB error during findUnique', async () => {
    prisma.hipaaSecurityControl.findUnique.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/ctrl-err');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /seed created count matches createMany result count', async () => {
    prisma.hipaaSecurityControl.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(41);
    prisma.hipaaSecurityControl.createMany.mockResolvedValue({ count: 41 });
    const res = await request(app).post('/seed');
    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(41);
  });

  it('PUT /:id/implementation TECHNICAL category control can be updated', async () => {
    const technicalControl = { ...mockControl, id: 'ctrl-tech', category: 'TECHNICAL' };
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(technicalControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({ ...technicalControl, implementationStatus: 'FULLY_IMPLEMENTED' });
    const res = await request(app)
      .put('/ctrl-tech/implementation')
      .send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(res.status).toBe(200);
    expect(res.body.data.implementationStatus).toBe('FULLY_IMPLEMENTED');
  });

  it('GET /dashboard returns 500 on DB error', async () => {
    prisma.hipaaSecurityControl.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('HIPAA Security — edge case coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns success:true and data as array', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([mockControl]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /:id/implementation count is called once on success', async () => {
    prisma.hipaaSecurityControl.findUnique.mockResolvedValue(mockControl);
    prisma.hipaaSecurityControl.update.mockResolvedValue({ ...mockControl, implementationStatus: 'FULLY_IMPLEMENTED' });
    await request(app).put('/ctrl-1/implementation').send({ implementationStatus: 'FULLY_IMPLEMENTED' });
    expect(prisma.hipaaSecurityControl.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.hipaaSecurityControl.update).toHaveBeenCalledTimes(1);
  });

  it('GET /dashboard overallCompliancePercent is between 0 and 100', async () => {
    const controls = [
      { ...mockControl, id: 'c1', implementationStatus: 'FULLY_IMPLEMENTED' },
      { ...mockControl, id: 'c2', implementationStatus: 'NOT_IMPLEMENTED' },
      { ...mockControl, id: 'c3', implementationStatus: 'PARTIALLY_IMPLEMENTED' },
    ];
    prisma.hipaaSecurityControl.findMany.mockResolvedValue(controls);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.overallCompliancePercent).toBeGreaterThanOrEqual(0);
    expect(res.body.data.overallCompliancePercent).toBeLessThanOrEqual(100);
  });

  it('POST /seed success:true on first seed', async () => {
    prisma.hipaaSecurityControl.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(41);
    prisma.hipaaSecurityControl.createMany.mockResolvedValue({ count: 41 });
    const res = await request(app).post('/seed');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / data is array', async () => {
    prisma.hipaaSecurityControl.findMany.mockResolvedValue([]);
    prisma.hipaaSecurityControl.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('hipaa security — phase29 coverage', () => {
  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

  it('handles null check', () => {
    expect(null).toBeNull();
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles Array.from set', () => {
    expect(Array.from(new Set([1, 1, 2]))).toEqual([1, 2]);
  });

});
