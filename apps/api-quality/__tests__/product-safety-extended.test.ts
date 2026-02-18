import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    safetyCharacteristic: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    safetyIncident: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    recallAction: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  },
  Prisma: { SafetyCharacteristicWhereInput: {}, SafetyIncidentWhereInput: {}, RecallActionWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import productSafetyRouter from '../src/routes/product-safety';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/product-safety', productSafetyRouter);

describe('Product Safety — Safety Characteristics', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/product-safety/characteristics', () => {
    const validBody = {
      partNumber: 'PN-001',
      partName: 'Housing Assembly',
      characteristicType: 'SC',
      description: 'Torque on housing bolts',
      controlMethod: 'Torque wrench verification',
    };

    it('should create a safety characteristic', async () => {
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyCharacteristic.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'PSC-2602-0001', ...validBody, status: 'ACTIVE',
      });

      const res = await request(app).post('/api/product-safety/characteristics').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.characteristicType).toBe('SC');
    });

    it('should accept CC characteristicType', async () => {
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyCharacteristic.create as jest.Mock).mockResolvedValue({ id: 'sc-2' });

      const res = await request(app).post('/api/product-safety/characteristics').send({
        ...validBody, characteristicType: 'CC',
      });
      expect(res.status).toBe(201);
    });

    it('should accept KPC characteristicType', async () => {
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyCharacteristic.create as jest.Mock).mockResolvedValue({ id: 'sc-3' });

      const res = await request(app).post('/api/product-safety/characteristics').send({
        ...validBody, characteristicType: 'KPC',
      });
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing partNumber', async () => {
      const res = await request(app).post('/api/product-safety/characteristics').send({
        partName: 'Test', characteristicType: 'SC', description: 'Test', controlMethod: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid characteristicType', async () => {
      const res = await request(app).post('/api/product-safety/characteristics').send({
        ...validBody, characteristicType: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      const { description, ...noDesc } = validBody;
      const res = await request(app).post('/api/product-safety/characteristics').send(noDesc);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing controlMethod', async () => {
      const { controlMethod, ...noControl } = validBody;
      const res = await request(app).post('/api/product-safety/characteristics').send(noControl);
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyCharacteristic.create as jest.Mock).mockResolvedValue({ id: 'sc-4' });

      const res = await request(app).post('/api/product-safety/characteristics').send({
        ...validBody,
        measurementMethod: 'CMM',
        tolerance: '+/- 0.01mm',
        notes: 'Critical safety item',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyCharacteristic.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/product-safety/characteristics').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/product-safety/characteristics', () => {
    it('should list safety characteristics', async () => {
      (mockPrisma.safetyCharacteristic.findMany as jest.Mock).mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/product-safety/characteristics');
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.safetyCharacteristic.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/product-safety/characteristics?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.totalPages).toBe(5);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.safetyCharacteristic.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.safetyCharacteristic.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/product-safety/characteristics');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/product-safety/characteristics/:id', () => {
    it('should get characteristic by id', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', partNumber: 'PN-001', deletedAt: null,
      });

      const res = await request(app).get('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/product-safety/characteristics/:id', () => {
    it('should update a characteristic', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
      });
      (mockPrisma.safetyCharacteristic.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'UNDER_REVIEW',
      });

      const res = await request(app).put('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000001').send({
        status: 'UNDER_REVIEW',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('UNDER_REVIEW');
    });

    it('should return 404 for non-existent', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000099').send({
        status: 'ACTIVE',
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.safetyCharacteristic.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
      });

      const res = await request(app).put('/api/product-safety/characteristics/00000000-0000-0000-0000-000000000001').send({
        status: 'INVALID_STATUS',
      });
      expect(res.status).toBe(400);
    });
  });
});

describe('Product Safety — Safety Incidents', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/product-safety/incidents', () => {
    const validBody = {
      title: 'Field failure of housing bolt',
      severity: 'HIGH',
      description: 'Bolt torque failure reported in field',
      product: 'Widget Pro',
    };

    it('should create a safety incident', async () => {
      (mockPrisma.safetyIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyIncident.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'PSI-2602-0001', ...validBody, status: 'OPEN',
      });

      const res = await request(app).post('/api/product-safety/incidents').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app).post('/api/product-safety/incidents').send({
        severity: 'HIGH', description: 'Test', product: 'Widget',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing product', async () => {
      const res = await request(app).post('/api/product-safety/incidents').send({
        title: 'Test', severity: 'HIGH', description: 'Test',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid severity', async () => {
      const res = await request(app).post('/api/product-safety/incidents').send({
        ...validBody, severity: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should accept optional source field', async () => {
      (mockPrisma.safetyIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyIncident.create as jest.Mock).mockResolvedValue({ id: 'si-2' });

      const res = await request(app).post('/api/product-safety/incidents').send({
        ...validBody, source: 'CUSTOMER',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.safetyIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.safetyIncident.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/product-safety/incidents').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/product-safety/incidents', () => {
    it('should list safety incidents', async () => {
      (mockPrisma.safetyIncident.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.safetyIncident.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/product-safety/incidents');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by severity', async () => {
      (mockPrisma.safetyIncident.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.safetyIncident.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/product-safety/incidents?severity=HIGH');
      expect(mockPrisma.safetyIncident.findMany).toHaveBeenCalled();
    });
  });

  describe('PUT /api/product-safety/incidents/:id', () => {
    it('should update an incident', async () => {
      (mockPrisma.safetyIncident.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
      });
      (mockPrisma.safetyIncident.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'INVESTIGATING',
      });

      const res = await request(app).put('/api/product-safety/incidents/00000000-0000-0000-0000-000000000001').send({
        status: 'INVESTIGATING',
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      (mockPrisma.safetyIncident.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/product-safety/incidents/00000000-0000-0000-0000-000000000099').send({
        status: 'INVESTIGATING',
      });
      expect(res.status).toBe(404);
    });
  });
});

describe('Product Safety — Recall Actions', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/product-safety/recalls', () => {
    const validBody = {
      product: 'Widget Pro',
      reason: 'Potential bolt torque failure',
      scope: 'Batch 2026-01',
      affectedQuantity: 500,
    };

    it('should create a recall action', async () => {
      (mockPrisma.recallAction.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.recallAction.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'RCL-2602-0001', ...validBody, status: 'INITIATED',
      });

      const res = await request(app).post('/api/product-safety/recalls').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing product', async () => {
      const { product, ...noProduct } = validBody;
      const res = await request(app).post('/api/product-safety/recalls').send(noProduct);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing reason', async () => {
      const { reason, ...noReason } = validBody;
      const res = await request(app).post('/api/product-safety/recalls').send(noReason);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing affectedQuantity', async () => {
      const { affectedQuantity, ...noQty } = validBody;
      const res = await request(app).post('/api/product-safety/recalls').send(noQty);
      expect(res.status).toBe(400);
    });

    it('should return 400 for negative affectedQuantity', async () => {
      const res = await request(app).post('/api/product-safety/recalls').send({
        ...validBody, affectedQuantity: -1,
      });
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.recallAction.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.recallAction.create as jest.Mock).mockResolvedValue({ id: 'rcl-2' });

      const res = await request(app).post('/api/product-safety/recalls').send({
        ...validBody,
        regulatoryBody: 'NHTSA',
        customerNotified: true,
        notes: 'Voluntary',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.recallAction.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.recallAction.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/product-safety/recalls').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/product-safety/recalls', () => {
    it('should list recalls', async () => {
      (mockPrisma.recallAction.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.recallAction.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/product-safety/recalls');
      expect(res.status).toBe(200);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.recallAction.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.recallAction.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/product-safety/recalls');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/product-safety/recalls/:id', () => {
    it('should update a recall', async () => {
      (mockPrisma.recallAction.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null,
      });
      (mockPrisma.recallAction.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'INVESTIGATING',
      });

      const res = await request(app).put('/api/product-safety/recalls/00000000-0000-0000-0000-000000000001').send({
        status: 'INVESTIGATING',
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent', async () => {
      (mockPrisma.recallAction.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/product-safety/recalls/00000000-0000-0000-0000-000000000099').send({
        status: 'INVESTIGATING',
      });
      expect(res.status).toBe(404);
    });
  });
});
