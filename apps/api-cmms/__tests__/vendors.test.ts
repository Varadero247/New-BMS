import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cmmsVendor: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cmmsServiceContract: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

import vendorsRouter from '../src/routes/vendors';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/api/vendors', vendorsRouter);
app.use('/api/contracts', vendorsRouter);

const mockVendor = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Maintenance Co.',
  code: 'ACME-001',
  contactName: 'Jane Doe',
  email: 'jane@acme.com',
  phone: '+1-555-0123',
  address: '123 Main St',
  specialization: 'HVAC',
  rating: 4.5,
  isPreferred: true,
  contractExpiry: new Date('2027-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

const mockContract = {
  id: '00000000-0000-0000-0000-000000000001',
  vendorId: 'vendor-1',
  assetId: null,
  contractNumber: 'SC-001',
  title: 'Annual HVAC Maintenance',
  description: 'Full HVAC maintenance contract',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  value: 50000,
  type: 'FULL_SERVICE',
  status: 'ACTIVE',
  slaResponseHours: 4,
  slaResolutionHours: 24,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('Vendors Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/vendors', () => {
    it('should return paginated vendors', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([mockVendor]);
      prisma.cmmsVendor.count.mockResolvedValue(1);

      const res = await request(app).get('/api/vendors');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by specialization', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);

      const res = await request(app).get('/api/vendors?specialization=HVAC');
      expect(res.status).toBe(200);
    });

    it('should filter by isPreferred', async () => {
      prisma.cmmsVendor.findMany.mockResolvedValue([]);
      prisma.cmmsVendor.count.mockResolvedValue(0);

      const res = await request(app).get('/api/vendors?isPreferred=true');
      expect(res.status).toBe(200);
    });

    it('should handle errors', async () => {
      prisma.cmmsVendor.findMany.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/vendors');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/vendors', () => {
    it('should create a vendor', async () => {
      prisma.cmmsVendor.create.mockResolvedValue(mockVendor);

      const res = await request(app).post('/api/vendors').send({
        name: 'Acme Maintenance Co.',
        code: 'ACME-001',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/vendors').send({});
      expect(res.status).toBe(400);
    });

    it('should handle duplicate vendor code', async () => {
      prisma.cmmsVendor.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app).post('/api/vendors').send({
        name: 'Acme Maintenance Co.',
        code: 'ACME-001',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/vendors/:id', () => {
    it('should return a vendor by ID', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue({ ...mockVendor, serviceContracts: [] });

      const res = await request(app).get('/api/vendors/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/vendors/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/vendors/:id', () => {
    it('should update a vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockVendor);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockVendor, name: 'Updated' });

      const res = await request(app)
        .put('/api/vendors/00000000-0000-0000-0000-000000000001')
        .send({ name: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/vendors/00000000-0000-0000-0000-000000000099')
        .send({ name: 'Updated' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/vendors/:id', () => {
    it('should soft delete a vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockVendor);
      prisma.cmmsVendor.update.mockResolvedValue({ ...mockVendor, deletedAt: new Date() });

      const res = await request(app).delete('/api/vendors/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/vendors/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/vendors/:id/contracts', () => {
    it('should return vendor contracts', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockVendor);
      prisma.cmmsServiceContract.findMany.mockResolvedValue([mockContract]);

      const res = await request(app).get(
        '/api/vendors/00000000-0000-0000-0000-000000000001/contracts'
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 404 for non-existent vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);

      const res = await request(app).get(
        '/api/vendors/00000000-0000-0000-0000-000000000099/contracts'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/vendors/:id/contracts', () => {
    it('should create a contract', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(mockVendor);
      prisma.cmmsServiceContract.create.mockResolvedValue(mockContract);

      const res = await request(app)
        .post('/api/vendors/00000000-0000-0000-0000-000000000001/contracts')
        .send({
          contractNumber: 'SC-001',
          title: 'Annual HVAC Maintenance',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          type: 'FULL_SERVICE',
        });
      expect(res.status).toBe(201);
    });

    it('should return 404 for non-existent vendor', async () => {
      prisma.cmmsVendor.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/vendors/00000000-0000-0000-0000-000000000099/contracts')
        .send({
          contractNumber: 'SC-001',
          title: 'Test',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          type: 'FULL_SERVICE',
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid contract data', async () => {
      const res = await request(app)
        .post('/api/vendors/00000000-0000-0000-0000-000000000001/contracts')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/contracts/:id', () => {
    it('should update a contract', async () => {
      prisma.cmmsServiceContract.findFirst.mockResolvedValue(mockContract);
      prisma.cmmsServiceContract.update.mockResolvedValue({ ...mockContract, title: 'Updated' });

      const res = await request(app)
        .put('/api/contracts/contracts/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent contract', async () => {
      prisma.cmmsServiceContract.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/contracts/contracts/00000000-0000-0000-0000-000000000099')
        .send({ title: 'Updated' });
      expect(res.status).toBe(404);
    });
  });
});
