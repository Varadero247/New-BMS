import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsAsset: { findMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    cmmsWorkOrder: { findMany: jest.fn() },
    cmmsInspection: { findMany: jest.fn() },
    cmmsMeterReading: { findMany: jest.fn() },
    cmmsDowntime: { findMany: jest.fn() },
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

import assetsRouter from '../src/routes/assets';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/assets', assetsRouter);

const mockAsset = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'CNC Machine',
  code: 'ASSET-1001',
  description: 'CNC milling machine',
  assetType: 'EQUIPMENT',
  category: 'Manufacturing',
  manufacturer: 'Haas',
  model: 'VF-2',
  serialNumber: 'SN-12345',
  location: 'Building A',
  department: 'Production',
  status: 'ACTIVE',
  purchaseDate: new Date('2024-01-15'),
  purchaseCost: 150000,
  warrantyExpiry: new Date('2027-01-15'),
  parentAssetId: null,
  criticality: 'HIGH',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Assets Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- GET / ---
  describe('GET /api/assets', () => {
    it('should return paginated assets', async () => {
      prisma.cmmsAsset.findMany.mockResolvedValue([mockAsset]);
      prisma.cmmsAsset.count.mockResolvedValue(1);

      const res = await request(app).get('/api/assets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by assetType', async () => {
      prisma.cmmsAsset.findMany.mockResolvedValue([]);
      prisma.cmmsAsset.count.mockResolvedValue(0);

      const res = await request(app).get('/api/assets?assetType=VEHICLE');
      expect(res.status).toBe(200);
      expect(prisma.cmmsAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ assetType: 'VEHICLE' }) })
      );
    });

    it('should filter by status', async () => {
      prisma.cmmsAsset.findMany.mockResolvedValue([]);
      prisma.cmmsAsset.count.mockResolvedValue(0);

      const res = await request(app).get('/api/assets?status=ACTIVE');
      expect(res.status).toBe(200);
      expect(prisma.cmmsAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
      );
    });

    it('should filter by criticality', async () => {
      prisma.cmmsAsset.findMany.mockResolvedValue([]);
      prisma.cmmsAsset.count.mockResolvedValue(0);

      const res = await request(app).get('/api/assets?criticality=CRITICAL');
      expect(res.status).toBe(200);
      expect(prisma.cmmsAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ criticality: 'CRITICAL' }) })
      );
    });

    it('should handle search query', async () => {
      prisma.cmmsAsset.findMany.mockResolvedValue([]);
      prisma.cmmsAsset.count.mockResolvedValue(0);

      const res = await request(app).get('/api/assets?search=CNC');
      expect(res.status).toBe(200);
      expect(prisma.cmmsAsset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('should handle errors gracefully', async () => {
      prisma.cmmsAsset.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/assets');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // --- POST / ---
  describe('POST /api/assets', () => {
    it('should create an asset', async () => {
      prisma.cmmsAsset.create.mockResolvedValue(mockAsset);

      const res = await request(app).post('/api/assets').send({
        name: 'CNC Machine',
        assetType: 'EQUIPMENT',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).post('/api/assets').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle creation errors', async () => {
      prisma.cmmsAsset.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/assets').send({
        name: 'CNC Machine',
        assetType: 'EQUIPMENT',
      });
      expect(res.status).toBe(500);
    });
  });

  // --- GET /:id ---
  describe('GET /api/assets/:id', () => {
    it('should return an asset by ID', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue({ ...mockAsset, workOrders: [], preventivePlans: [], inspections: [] });

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  // --- PUT /:id ---
  describe('PUT /api/assets/:id', () => {
    it('should update an asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(mockAsset);
      prisma.cmmsAsset.update.mockResolvedValue({ ...mockAsset, name: 'Updated CNC' });

      const res = await request(app).put('/api/assets/00000000-0000-0000-0000-000000000001').send({ name: 'Updated CNC' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(null);

      const res = await request(app).put('/api/assets/00000000-0000-0000-0000-000000000099').send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app).put('/api/assets/00000000-0000-0000-0000-000000000001').send({ assetType: 'INVALID' });
      expect(res.status).toBe(400);
    });
  });

  // --- DELETE /:id ---
  describe('DELETE /api/assets/:id', () => {
    it('should soft delete an asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(mockAsset);
      prisma.cmmsAsset.update.mockResolvedValue({ ...mockAsset, deletedAt: new Date() });

      const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/assets/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  // --- GET /:id/history ---
  describe('GET /api/assets/:id/history', () => {
    it('should return asset history', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(mockAsset);
      prisma.cmmsWorkOrder.findMany.mockResolvedValue([]);
      prisma.cmmsInspection.findMany.mockResolvedValue([]);
      prisma.cmmsMeterReading.findMany.mockResolvedValue([]);
      prisma.cmmsDowntime.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001/history');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('workOrders');
      expect(res.body.data).toHaveProperty('inspections');
      expect(res.body.data).toHaveProperty('meterReadings');
      expect(res.body.data).toHaveProperty('downtimes');
    });

    it('should return 404 for non-existent asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000099/history');
      expect(res.status).toBe(404);
    });
  });

  // --- GET /:id/qr-code ---
  describe('GET /api/assets/:id/qr-code', () => {
    it('should return QR code data', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        code: 'ASSET-1001',
        name: 'CNC Machine',
        assetType: 'EQUIPMENT',
        location: 'Building A',
        serialNumber: 'SN-12345',
      });

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000001/qr-code');
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('CMMS_ASSET');
      expect(res.body.data.code).toBe('ASSET-1001');
    });

    it('should return 404 for non-existent asset', async () => {
      prisma.cmmsAsset.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/assets/00000000-0000-0000-0000-000000000099/qr-code');
      expect(res.status).toBe(404);
    });
  });
});
