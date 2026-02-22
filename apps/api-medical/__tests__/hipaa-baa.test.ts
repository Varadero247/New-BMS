import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hipaaBaa: {
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

import router from '../src/routes/hipaa-baa';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const baaPayload = {
  businessAssociate: 'Acme Cloud Services',
  contactName: 'John Smith',
  contactEmail: 'john@acme.com',
  effectiveDate: '2026-01-01',
  servicesProvided: 'Cloud hosting of EHR data',
  phiAccessed: ['demographics', 'medical records'],
  createdBy: 'privacy@clinic.com',
};

describe('HIPAA BAA Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated BAA list', async () => {
    prisma.hipaaBaa.findMany.mockResolvedValue([{ id: 'b1', businessAssociate: 'Acme' }]);
    prisma.hipaaBaa.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by status', async () => {
    prisma.hipaaBaa.findMany.mockResolvedValue([]);
    prisma.hipaaBaa.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=ACTIVE');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hipaaBaa.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // POST /
  it('POST / creates a BAA with ACTIVE status', async () => {
    prisma.hipaaBaa.create.mockResolvedValue({ id: 'b1', ...baaPayload, status: 'ACTIVE' });
    const res = await request(app).post('/').send(baaPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST / returns 400 on missing businessAssociate', async () => {
    const { businessAssociate: _ba, ...body } = baaPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on empty phiAccessed array', async () => {
    const res = await request(app).post('/').send({ ...baaPayload, phiAccessed: [] });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on invalid contactEmail', async () => {
    const res = await request(app).post('/').send({ ...baaPayload, contactEmail: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  // GET /expiring
  it('GET /expiring returns BAAs expiring within 90 days', async () => {
    prisma.hipaaBaa.findMany.mockResolvedValue([{ id: 'b1', expiryDate: new Date() }]);
    const res = await request(app).get('/expiring');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /expiring returns empty when none expiring', async () => {
    prisma.hipaaBaa.findMany.mockResolvedValue([]);
    const res = await request(app).get('/expiring');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  // GET /stats
  it('GET /stats returns aggregate counts', async () => {
    prisma.hipaaBaa.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: 10, active: 7, expired: 2, pendingSignature: 1 });
  });

  it('GET /stats returns 500 on DB error', async () => {
    prisma.hipaaBaa.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/stats');
    expect(res.status).toBe(500);
  });

  // GET /:id
  it('GET /:id returns a single BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', ...baaPayload, deletedAt: null });
    const res = await request(app).get('/b1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('b1');
  });

  it('GET /:id returns 404 for missing BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: new Date() });
    const res = await request(app).get('/b1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates BAA fields', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    prisma.hipaaBaa.update.mockResolvedValue({ id: 'b1', status: 'UNDER_REVIEW' });
    const res = await request(app).put('/b1').send({ status: 'UNDER_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('UNDER_REVIEW');
  });

  it('PUT /:id returns 404 for unknown BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
  });

  it('PUT /:id returns 400 on invalid status', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    const res = await request(app).put('/b1').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });

  // DELETE /:id (soft delete)
  it('DELETE /:id terminates BAA (soft delete)', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    prisma.hipaaBaa.update.mockResolvedValue({ id: 'b1', status: 'TERMINATED' });
    const res = await request(app).delete('/b1').send({ terminationReason: 'Contract ended' });
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('terminated');
  });

  it('DELETE /:id returns 404 for unknown BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue(null);
    const res = await request(app).delete('/unknown');
    expect(res.status).toBe(404);
  });

  // PUT /:id/renew
  it('PUT /:id/renew renews a BAA with new expiry date', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    prisma.hipaaBaa.update.mockResolvedValue({ id: 'b1', status: 'ACTIVE', expiryDate: new Date('2027-01-01') });
    const res = await request(app).put('/b1/renew').send({ expiryDate: '2027-01-01' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('PUT /:id/renew returns 400 on missing expiryDate', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    const res = await request(app).put('/b1/renew').send({});
    expect(res.status).toBe(400);
  });

  it('PUT /:id/renew returns 404 for unknown BAA', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown/renew').send({ expiryDate: '2027-01-01' });
    expect(res.status).toBe(404);
  });

  it('PUT /:id/renew returns 400 on invalid date format', async () => {
    prisma.hipaaBaa.findUnique.mockResolvedValue({ id: 'b1', deletedAt: null });
    const res = await request(app).put('/b1/renew').send({ expiryDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });
});
