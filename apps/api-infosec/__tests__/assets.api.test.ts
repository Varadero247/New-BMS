import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    infoAsset: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/assets';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/assets', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Assets API', () => {
  const mockAsset = {
    id: 'asset-1',
    refNumber: 'IA-0001',
    name: 'Production Database',
    type: 'SOFTWARE',
    classification: 'CONFIDENTIAL',
    description: 'Primary PostgreSQL database',
    owner: 'DBA Team',
    custodian: 'IT Ops',
    location: 'AWS eu-west-1',
    value: 50000,
    riskLevel: 'HIGH',
    status: 'ACTIVE',
    createdBy: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const validCreatePayload = {
    name: 'Production Database',
    type: 'SOFTWARE',
    classification: 'CONFIDENTIAL',
    description: 'Primary PostgreSQL database',
    owner: 'DBA Team',
  };

  // ---- POST /api/assets ----

  describe('POST /api/assets', () => {
    it('should create asset with valid data', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.infoAsset.create as jest.Mock).mockResolvedValueOnce(mockAsset);

      const res = await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockAsset);
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ type: 'SOFTWARE', classification: 'CONFIDENTIAL' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing type', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ name: 'Test', classification: 'CONFIDENTIAL' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid type value', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ name: 'Test', type: 'UNKNOWN_TYPE', classification: 'CONFIDENTIAL' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing classification', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ name: 'Test', type: 'SOFTWARE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid classification value', async () => {
      const res = await request(app)
        .post('/api/assets')
        .send({ name: 'Test', type: 'SOFTWARE', classification: 'TOP_SECRET' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should auto-generate refNumber (IA-0001)', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.infoAsset.create as jest.Mock).mockResolvedValueOnce(mockAsset);

      await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoAsset.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toBe('IA-0001');
    });

    it('should auto-generate sequential refNumber (IA-0005)', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(4);
      (mockPrisma.infoAsset.create as jest.Mock).mockResolvedValueOnce({ ...mockAsset, refNumber: 'IA-0005' });

      await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoAsset.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.refNumber).toBe('IA-0005');
    });

    it('should set status to ACTIVE on create', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.infoAsset.create as jest.Mock).mockResolvedValueOnce(mockAsset);

      await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoAsset.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe('ACTIVE');
    });

    it('should set createdBy from authenticated user', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.infoAsset.create as jest.Mock).mockResolvedValueOnce(mockAsset);

      await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      const createCall = (mockPrisma.infoAsset.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.createdBy).toBe('user-123');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.infoAsset.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/assets')
        .send(validCreatePayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/assets ----

  describe('GET /api/assets', () => {
    it('should return paginated list', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([mockAsset]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(1);

      const res = await request(app).get('/api/assets');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by type', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/assets?type=HARDWARE');

      const findCall = (mockPrisma.infoAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.type).toBe('HARDWARE');
    });

    it('should filter by classification', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/assets?classification=RESTRICTED');

      const findCall = (mockPrisma.infoAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.classification).toBe('RESTRICTED');
    });

    it('should support search across name and description', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/assets?search=database');

      const findCall = (mockPrisma.infoAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
      expect(findCall.where.OR).toHaveLength(3);
    });

    it('should support pagination params', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(50);

      const res = await request(app).get('/api/assets?page=2&limit=10');

      expect(res.status).toBe(200);
      const findCall = (mockPrisma.infoAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.skip).toBe(10);
      expect(findCall.take).toBe(10);
    });

    it('should exclude soft-deleted assets', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.infoAsset.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/assets');

      const findCall = (mockPrisma.infoAsset.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.deletedAt).toBeNull();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.infoAsset.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/assets');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/assets/:id ----

  describe('GET /api/assets/:id', () => {
    it('should return asset detail', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(mockAsset);

      const res = await request(app).get('/api/assets/asset-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockAsset);
    });

    it('should return 404 when asset not found', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/assets/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/assets/asset-1');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/assets/:id ----

  describe('PUT /api/assets/:id', () => {
    it('should update asset', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(mockAsset);
      const updated = { ...mockAsset, name: 'Updated DB' };
      (mockPrisma.infoAsset.update as jest.Mock).mockResolvedValueOnce(updated);

      const res = await request(app)
        .put('/api/assets/asset-1')
        .send({ name: 'Updated DB' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated DB');
    });

    it('should return 404 when asset not found', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/assets/nonexistent')
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid update data', async () => {
      const res = await request(app)
        .put('/api/assets/asset-1')
        .send({ type: 'INVALID_TYPE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- DELETE /api/assets/:id ----

  describe('DELETE /api/assets/:id', () => {
    it('should soft delete asset', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(mockAsset);
      (mockPrisma.infoAsset.update as jest.Mock).mockResolvedValueOnce({ ...mockAsset, deletedAt: new Date() });

      const res = await request(app).delete('/api/assets/asset-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when asset not found for delete', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/assets/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should set deletedBy from authenticated user', async () => {
      (mockPrisma.infoAsset.findFirst as jest.Mock).mockResolvedValueOnce(mockAsset);
      (mockPrisma.infoAsset.update as jest.Mock).mockResolvedValueOnce({ ...mockAsset, deletedAt: new Date() });

      await request(app).delete('/api/assets/asset-1');

      const updateCall = (mockPrisma.infoAsset.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.deletedBy).toBe('user-123');
    });
  });
});
