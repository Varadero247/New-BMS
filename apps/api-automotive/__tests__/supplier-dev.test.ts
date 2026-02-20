import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    supplierDevelopment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 't@t.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import supplierDevRouter from '../src/routes/supplier-dev';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/supplier-dev', supplierDevRouter);

const ID1 = '00000000-0000-0000-0000-000000000001';
const ID2 = '00000000-0000-0000-0000-000000000002';

const makeRecord = (overrides: Record<string, unknown> = {}) => ({
  id: ID1,
  devNumber: 'SD-2602-0001',
  supplierName: 'ACME Automotive',
  supplierCode: 'ACM-001',
  program: 'Platform X',
  status: 'UNDER_DEVELOPMENT',
  tier: 'TIER_1',
  score: 85,
  sqa: 'John Smith',
  targetDate: new Date('2026-09-01'),
  issues: null,
  createdBy: 't@t.com',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── GET / ────────────────────────────────────────────────────────────────────

describe('GET /api/supplier-dev', () => {
  it('returns 200 with list of supplier development records', async () => {
    const records = [makeRecord(), makeRecord({ id: ID2, supplierName: 'Beta Parts' })];
    (mockPrisma.supplierDevelopment.findMany as jest.Mock).mockResolvedValue(records);

    const res = await request(app).get('/api/supplier-dev');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('passes status filter to prisma where clause', async () => {
    (mockPrisma.supplierDevelopment.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/supplier-dev?status=APPROVED');

    expect(res.status).toBe(200);
    expect(mockPrisma.supplierDevelopment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'APPROVED' }) }),
    );
  });

  it('passes tier filter to prisma where clause', async () => {
    (mockPrisma.supplierDevelopment.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/supplier-dev?tier=TIER_2');

    expect(mockPrisma.supplierDevelopment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tier: 'TIER_2' }) }),
    );
  });

  it('filters by search param on supplierName case-insensitively', async () => {
    const records = [
      makeRecord({ supplierName: 'ACME Automotive' }),
      makeRecord({ id: ID2, supplierName: 'Beta Parts' }),
    ];
    (mockPrisma.supplierDevelopment.findMany as jest.Mock).mockResolvedValue(records);

    const res = await request(app).get('/api/supplier-dev?search=acme');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].supplierName).toBe('ACME Automotive');
  });

  it('returns 500 when database throws', async () => {
    (mockPrisma.supplierDevelopment.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier-dev');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────

describe('GET /api/supplier-dev/:id', () => {
  it('returns 200 with a single supplier development record', async () => {
    (mockPrisma.supplierDevelopment.findFirst as jest.Mock).mockResolvedValue(makeRecord());

    const res = await request(app).get(`/api/supplier-dev/${ID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(ID1);
  });

  it('returns 404 when record is not found', async () => {
    (mockPrisma.supplierDevelopment.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/supplier-dev/${ID1}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('queries with both id and deletedAt null guard', async () => {
    (mockPrisma.supplierDevelopment.findFirst as jest.Mock).mockResolvedValue(makeRecord());

    await request(app).get(`/api/supplier-dev/${ID1}`);

    expect(mockPrisma.supplierDevelopment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ID1, deletedAt: null } }),
    );
  });
});

// ─── POST / ───────────────────────────────────────────────────────────────────

describe('POST /api/supplier-dev', () => {
  it('creates a new supplier dev record and returns 201', async () => {
    const created = makeRecord();
    (mockPrisma.supplierDevelopment.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.supplierDevelopment.create as jest.Mock).mockResolvedValue(created);

    const res = await request(app)
      .post('/api/supplier-dev')
      .send({
        supplierName: 'ACME Automotive',
        supplierCode: 'ACM-001',
        program: 'Platform X',
        status: 'UNDER_DEVELOPMENT',
        tier: 'TIER_1',
        score: 85,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.supplierName).toBe('ACME Automotive');
  });

  it('falls back to "Unknown Supplier" when supplierName is omitted', async () => {
    (mockPrisma.supplierDevelopment.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.supplierDevelopment.create as jest.Mock).mockResolvedValue(makeRecord({ supplierName: 'Unknown Supplier' }));

    const res = await request(app).post('/api/supplier-dev').send({});

    expect(res.status).toBe(201);
    expect(mockPrisma.supplierDevelopment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ supplierName: 'Unknown Supplier' }),
      }),
    );
  });

  it('returns 500 when create throws', async () => {
    (mockPrisma.supplierDevelopment.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.supplierDevelopment.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/supplier-dev').send({ supplierName: 'Fail Corp' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── PUT /:id ─────────────────────────────────────────────────────────────────

describe('PUT /api/supplier-dev/:id', () => {
  it('updates record and returns 200', async () => {
    const updated = makeRecord({ status: 'APPROVED', score: 90 });
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app)
      .put(`/api/supplier-dev/${ID1}`)
      .send({ status: 'APPROVED', score: 90 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('calls update with the correct id in where clause', async () => {
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockResolvedValue(makeRecord());

    await request(app).put(`/api/supplier-dev/${ID1}`).send({ supplierName: 'Updated Name' });

    expect(mockPrisma.supplierDevelopment.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ID1 } }),
    );
  });

  it('returns 500 when update throws P2025 (record not found)', async () => {
    const err = Object.assign(new Error('Record not found'), { code: 'P2025' });
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockRejectedValue(err);

    const res = await request(app).put(`/api/supplier-dev/${ID1}`).send({ status: 'APPROVED' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── DELETE /:id ──────────────────────────────────────────────────────────────

describe('DELETE /api/supplier-dev/:id', () => {
  it('soft deletes record by setting deletedAt and returns 200', async () => {
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockResolvedValue({ id: ID1, deletedAt: new Date() });

    const res = await request(app).delete(`/api/supplier-dev/${ID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(ID1);
  });

  it('calls update with a deletedAt timestamp (soft delete)', async () => {
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockResolvedValue({ id: ID1 });

    await request(app).delete(`/api/supplier-dev/${ID1}`);

    expect(mockPrisma.supplierDevelopment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ID1 },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('returns 500 when update throws P2025 (record not found)', async () => {
    const err = Object.assign(new Error('Record not found'), { code: 'P2025' });
    (mockPrisma.supplierDevelopment.update as jest.Mock).mockRejectedValue(err);

    const res = await request(app).delete(`/api/supplier-dev/${ID1}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
