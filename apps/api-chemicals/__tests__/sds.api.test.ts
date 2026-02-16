import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemSds: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), count: jest.fn() },
    chemRegister: { findFirst: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/sds';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/sds', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockSds = {
  id: '00000000-0000-0000-0000-000000000010',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  version: '1.0',
  issueDate: '2026-01-15T00:00:00.000Z',
  nextReviewDate: '2027-01-15T00:00:00.000Z',
  status: 'CURRENT',
  createdBy: 'user-1',
  chemical: { id: '00000000-0000-0000-0000-000000000001', productName: 'Acetone', casNumber: '67-64-1', signalWord: 'DANGER', pictograms: ['GHS02_FLAMMABLE'] },
};

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  deletedAt: null,
};

describe('GET /api/sds', () => {
  it('should return a list of SDS records with pagination', async () => {
    (prisma as any).chemSds.findMany.mockResolvedValue([mockSds]);
    (prisma as any).chemSds.count.mockResolvedValue(1);

    const res = await request(app).get('/api/sds');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].version).toBe('1.0');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support status filter', async () => {
    (prisma as any).chemSds.findMany.mockResolvedValue([]);
    (prisma as any).chemSds.count.mockResolvedValue(0);

    const res = await request(app).get('/api/sds?status=CURRENT');
    expect(res.status).toBe(200);
    expect((prisma as any).chemSds.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'CURRENT' }) })
    );
  });

  it('should support search parameter', async () => {
    (prisma as any).chemSds.findMany.mockResolvedValue([]);
    (prisma as any).chemSds.count.mockResolvedValue(0);

    const res = await request(app).get('/api/sds?search=acetone');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemSds.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sds');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/sds/overdue', () => {
  it('should return overdue SDS records', async () => {
    const overdueSds = { ...mockSds, nextReviewDate: '2025-01-01T00:00:00.000Z' };
    (prisma as any).chemSds.findMany.mockResolvedValue([overdueSds]);

    const res = await request(app).get('/api/sds/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when no overdue SDS', async () => {
    (prisma as any).chemSds.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/sds/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    (prisma as any).chemSds.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sds/overdue');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/sds/:id', () => {
  it('should return a single SDS record', async () => {
    (prisma as any).chemSds.findFirst.mockResolvedValue({ ...mockSds, chemical: mockChemical });

    const res = await request(app).get('/api/sds/00000000-0000-0000-0000-000000000010');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('1.0');
  });

  it('should return 404 when SDS not found', async () => {
    (prisma as any).chemSds.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/sds/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemSds.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sds/00000000-0000-0000-0000-000000000010');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('POST /api/sds', () => {
  it('should create a new SDS and supersede existing current', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemSds.updateMany.mockResolvedValue({ count: 1 });
    (prisma as any).chemSds.create.mockResolvedValue(mockSds);

    const res = await request(app).post('/api/sds').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      version: '1.0',
      issueDate: '2026-01-15T00:00:00.000Z',
      nextReviewDate: '2027-01-15T00:00:00.000Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('1.0');
    // Should supersede existing current SDS
    expect((prisma as any).chemSds.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { chemicalId: '00000000-0000-0000-0000-000000000001', status: 'CURRENT' }, data: { status: 'SUPERSEDED' } })
    );
  });

  it('should return 400 when chemicalId is missing', async () => {
    const res = await request(app).post('/api/sds').send({
      version: '1.0',
      issueDate: '2026-01-15T00:00:00.000Z',
      nextReviewDate: '2027-01-15T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('chemicalId is required');
  });

  it('should return 400 when version is missing', async () => {
    const res = await request(app).post('/api/sds').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      issueDate: '2026-01-15T00:00:00.000Z',
      nextReviewDate: '2027-01-15T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/sds').send({
      chemicalId: '00000000-0000-0000-0000-000000000099',
      version: '1.0',
      issueDate: '2026-01-15T00:00:00.000Z',
      nextReviewDate: '2027-01-15T00:00:00.000Z',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 400 on database create error', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemSds.updateMany.mockResolvedValue({ count: 0 });
    (prisma as any).chemSds.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/sds').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      version: '2.0',
      issueDate: '2026-02-01T00:00:00.000Z',
      nextReviewDate: '2027-02-01T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

describe('PUT /api/sds/:id', () => {
  it('should update an existing SDS record', async () => {
    (prisma as any).chemSds.findFirst.mockResolvedValue(mockSds);
    (prisma as any).chemSds.update.mockResolvedValue({ ...mockSds, version: '2.0' });

    const res = await request(app).put('/api/sds/00000000-0000-0000-0000-000000000010').send({
      version: '2.0',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe('2.0');
  });

  it('should return 404 when SDS not found', async () => {
    (prisma as any).chemSds.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/sds/00000000-0000-0000-0000-000000000099').send({
      version: '2.0',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemSds.findFirst.mockResolvedValue(mockSds);
    (prisma as any).chemSds.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/sds/00000000-0000-0000-0000-000000000010').send({
      version: '2.0',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});
