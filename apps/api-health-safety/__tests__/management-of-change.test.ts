import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hSChangeRequest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
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

import router from '../src/routes/management-of-change';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const changePayload = {
  title: 'Replace chemical solvent with water-based alternative',
  changeType: 'MATERIAL',
  description: 'Switch from organic solvent to water-based cleaner',
  rationale: 'Reduce fire risk and VOC emissions',
  proposedDate: '2026-03-01',
  affectedActivities: ['Cleaning', 'Degreasing'],
  requestedBy: 'production.manager@company.com',
};

const mockChange = {
  id: 'chg-1',
  referenceNumber: 'MOC-2026-001',
  ...changePayload,
  status: 'DRAFT',
  deletedAt: null,
};

describe('ISO 45001 Management of Change Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated change requests', async () => {
    prisma.hSChangeRequest.findMany.mockResolvedValue([mockChange]);
    prisma.hSChangeRequest.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by status', async () => {
    prisma.hSChangeRequest.findMany.mockResolvedValue([]);
    prisma.hSChangeRequest.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=APPROVED');
    expect(res.status).toBe(200);
  });

  it('GET / filters by changeType', async () => {
    prisma.hSChangeRequest.findMany.mockResolvedValue([]);
    prisma.hSChangeRequest.count.mockResolvedValue(0);
    const res = await request(app).get('/?changeType=EQUIPMENT');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hSChangeRequest.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // POST /
  it('POST / creates a change request with MOC reference', async () => {
    prisma.hSChangeRequest.count.mockResolvedValue(0);
    prisma.hSChangeRequest.create.mockResolvedValue({ ...mockChange, referenceNumber: 'MOC-2026-001' });
    const res = await request(app).post('/').send(changePayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / sets initial status to DRAFT', async () => {
    prisma.hSChangeRequest.count.mockResolvedValue(1);
    prisma.hSChangeRequest.create.mockResolvedValue({ ...mockChange, status: 'DRAFT' });
    await request(app).post('/').send(changePayload);
    expect(prisma.hSChangeRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'DRAFT' }) })
    );
  });

  it('POST / returns 400 on missing title', async () => {
    const { title: _t, ...body } = changePayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on invalid changeType', async () => {
    const res = await request(app).post('/').send({ ...changePayload, changeType: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on empty affectedActivities', async () => {
    const res = await request(app).post('/').send({ ...changePayload, affectedActivities: [] });
    expect(res.status).toBe(400);
  });

  // GET /dashboard
  it('GET /dashboard returns status breakdown', async () => {
    prisma.hSChangeRequest.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total', 10);
    expect(res.body.data).toHaveProperty('draft', 2);
    expect(res.body.data).toHaveProperty('implemented', 2);
  });

  // GET /:id
  it('GET /:id returns a single change request', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    const res = await request(app).get('/chg-1');
    expect(res.status).toBe(200);
    expect(res.body.data.referenceNumber).toBe('MOC-2026-001');
  });

  it('GET /:id returns 404 for missing change request', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted record', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue({ ...mockChange, deletedAt: new Date() });
    const res = await request(app).get('/chg-1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates change request status', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    prisma.hSChangeRequest.update.mockResolvedValue({ ...mockChange, status: 'PENDING_REVIEW' });
    const res = await request(app).put('/chg-1').send({ status: 'PENDING_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING_REVIEW');
  });

  it('PUT /:id returns 404 for unknown change', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'APPROVED' });
    expect(res.status).toBe(404);
  });

  // PUT /:id/approve
  it('PUT /:id/approve approves a change request', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    prisma.hSChangeRequest.update.mockResolvedValue({ ...mockChange, status: 'APPROVED', approvedBy: 'manager@co.com', approvedAt: new Date() });
    const res = await request(app).put('/chg-1/approve').send({ approvedBy: 'manager@co.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('PUT /:id/approve returns 400 on missing approvedBy', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    const res = await request(app).put('/chg-1/approve').send({});
    expect(res.status).toBe(400);
  });

  it('PUT /:id/approve returns 404 for unknown change', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/approve').send({ approvedBy: 'manager' });
    expect(res.status).toBe(404);
  });

  // PUT /:id/implement
  it('PUT /:id/implement marks change as implemented', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    prisma.hSChangeRequest.update.mockResolvedValue({ ...mockChange, status: 'IMPLEMENTED', actualImplementedDate: new Date() });
    const res = await request(app).put('/chg-1/implement');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IMPLEMENTED');
  });

  it('PUT /:id/implement returns 404 for unknown change', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/implement');
    expect(res.status).toBe(404);
  });

  // DELETE /:id
  it('DELETE /:id soft-deletes a change request', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(mockChange);
    prisma.hSChangeRequest.update.mockResolvedValue({ ...mockChange, deletedAt: new Date() });
    const res = await request(app).delete('/chg-1');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });

  it('DELETE /:id returns 404 for unknown change', async () => {
    prisma.hSChangeRequest.findUnique.mockResolvedValue(null);
    const res = await request(app).delete('/unknown');
    expect(res.status).toBe(404);
  });
});
