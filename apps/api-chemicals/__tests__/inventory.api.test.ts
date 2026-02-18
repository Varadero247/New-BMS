import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemInventory: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    chemRegister: { findFirst: jest.fn() },
    chemIncompatAlert: { create: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/inventory';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/inventory', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  casNumber: '67-64-1',
  orgId: 'org-1',
  isActive: true,
  deletedAt: null,
  incompatibleWith: [],
  storageClass: 'CLASS_3_FLAMMABLE_LIQUID',
};

const mockInventory = {
  id: '00000000-0000-0000-0000-000000000030',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  location: 'Lab A - Cabinet 3',
  storageArea: 'Flammable storage',
  quantityOnhand: 5,
  unit: 'L',
  minStockLevel: 2,
  maxStockLevel: 20,
  expiryDate: null,
  isActive: true,
  chemical: { id: '00000000-0000-0000-0000-000000000001', productName: 'Acetone', casNumber: '67-64-1', storageClass: 'CLASS_3_FLAMMABLE_LIQUID', incompatibleWith: [], pictograms: [], signalWord: 'DANGER' },
};

const validInventoryBody = {
  chemicalId: '00000000-0000-0000-0000-000000000001',
  location: 'Lab A - Cabinet 3',
  quantityOnhand: 5,
  unit: 'L',
};

describe('GET /api/inventory', () => {
  it('should return a list of inventory records with pagination', async () => {
    (prisma as any).chemInventory.findMany.mockResolvedValue([mockInventory]);
    (prisma as any).chemInventory.count.mockResolvedValue(1);

    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].location).toBe('Lab A - Cabinet 3');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support location filter', async () => {
    (prisma as any).chemInventory.findMany.mockResolvedValue([]);
    (prisma as any).chemInventory.count.mockResolvedValue(0);

    const res = await request(app).get('/api/inventory?location=Lab+A');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search parameter', async () => {
    (prisma as any).chemInventory.findMany.mockResolvedValue([]);
    (prisma as any).chemInventory.count.mockResolvedValue(0);

    const res = await request(app).get('/api/inventory?search=acetone');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemInventory.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/inventory');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/inventory/:id', () => {
  it('should return a single inventory record', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue({ ...mockInventory, usageRecords: [] });

    const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000030');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location).toBe('Lab A - Cabinet 3');
  });

  it('should return 404 when inventory record not found', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemInventory.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/inventory/00000000-0000-0000-0000-000000000030');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/inventory/low-stock', () => {
  it('should return items below minimum stock level', async () => {
    const lowItem = { ...mockInventory, quantityOnhand: 1, minStockLevel: 5 };
    (prisma as any).chemInventory.findMany.mockResolvedValue([lowItem]);

    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter out items above minimum stock level', async () => {
    const normalItem = { ...mockInventory, quantityOnhand: 10, minStockLevel: 5 };
    (prisma as any).chemInventory.findMany.mockResolvedValue([normalItem]);

    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return empty array when no low stock', async () => {
    (prisma as any).chemInventory.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    (prisma as any).chemInventory.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/inventory/expiring', () => {
  it('should return expiring stock items', async () => {
    const expiringItem = { ...mockInventory, expiryDate: '2026-03-01T00:00:00.000Z' };
    (prisma as any).chemInventory.findMany.mockResolvedValue([expiringItem]);

    const res = await request(app).get('/api/inventory/expiring');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should support days query parameter', async () => {
    (prisma as any).chemInventory.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/inventory/expiring?days=30');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    (prisma as any).chemInventory.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/inventory/expiring');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/inventory', () => {
  it('should create an inventory record', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemInventory.create.mockResolvedValue(mockInventory);

    const res = await request(app).post('/api/inventory').send(validInventoryBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location).toBe('Lab A - Cabinet 3');
  });

  it('should check incompatibility and create alerts when storing incompatible chemicals', async () => {
    const chemWithIncompat = { ...mockChemical, incompatibleWith: ['7681-49-4'] };
    const conflictingItem = { id: 'inv-2', location: 'Lab A - Cabinet 3', chemical: { productName: 'Sodium Fluoride', casNumber: '7681-49-4' } };
    (prisma as any).chemRegister.findFirst.mockResolvedValue(chemWithIncompat);
    (prisma as any).chemInventory.findMany.mockResolvedValue([conflictingItem]);
    (prisma as any).chemIncompatAlert.create.mockResolvedValue({});
    (prisma as any).chemInventory.create.mockResolvedValue(mockInventory);

    const res = await request(app).post('/api/inventory').send(validInventoryBody);
    expect(res.status).toBe(201);
    expect((prisma as any).chemIncompatAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          severityLevel: 'CRITICAL',
          chemicalId: mockChemical.id,
        }),
      })
    );
  });

  it('should not check incompatibility when chemical has no incompatibleWith', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemInventory.create.mockResolvedValue(mockInventory);

    const res = await request(app).post('/api/inventory').send(validInventoryBody);
    expect(res.status).toBe(201);
    // findMany for incompatibility check should NOT have been called
    expect((prisma as any).chemInventory.findMany).not.toHaveBeenCalled();
  });

  it('should return 400 when location is missing', async () => {
    const res = await request(app).post('/api/inventory').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      quantityOnhand: 5,
      unit: 'L',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when quantityOnhand is negative', async () => {
    const res = await request(app).post('/api/inventory').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      location: 'Lab A',
      quantityOnhand: -1,
      unit: 'L',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/inventory').send({
      ...validInventoryBody,
      chemicalId: '00000000-0000-0000-0000-000000000099',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 400 on database create error', async () => {
    (prisma as any).chemRegister.findFirst.mockResolvedValue(mockChemical);
    (prisma as any).chemInventory.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/inventory').send(validInventoryBody);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

describe('PUT /api/inventory/:id', () => {
  it('should update an existing inventory record', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(mockInventory);
    (prisma as any).chemInventory.update.mockResolvedValue({ ...mockInventory, quantityOnhand: 10 });

    const res = await request(app).put('/api/inventory/00000000-0000-0000-0000-000000000030').send({
      quantityOnhand: 10,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantityOnhand).toBe(10);
  });

  it('should return 404 when inventory record not found', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/inventory/00000000-0000-0000-0000-000000000099').send({
      quantityOnhand: 10,
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(mockInventory);
    (prisma as any).chemInventory.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/inventory/00000000-0000-0000-0000-000000000030').send({
      quantityOnhand: 10,
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/inventory/:id/inspect', () => {
  it('should record an inspection', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(mockInventory);
    (prisma as any).chemInventory.update.mockResolvedValue({ ...mockInventory, lastInspectedAt: new Date().toISOString(), inspectedBy: 'user-1', meetsStorageReqs: true });

    const res = await request(app).post('/api/inventory/00000000-0000-0000-0000-000000000030/inspect').send({
      meetsStorageReqs: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect((prisma as any).chemInventory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meetsStorageReqs: true,
          inspectedBy: 'user-1',
          lastInspectedAt: expect.any(Date),
        }),
      })
    );
  });

  it('should record inspection with storage issues', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(mockInventory);
    (prisma as any).chemInventory.update.mockResolvedValue({ ...mockInventory, meetsStorageReqs: false, storageIssues: 'Ventilation not working' });

    const res = await request(app).post('/api/inventory/00000000-0000-0000-0000-000000000030/inspect').send({
      meetsStorageReqs: false,
      storageIssues: 'Ventilation not working',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect((prisma as any).chemInventory.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          meetsStorageReqs: false,
          storageIssues: 'Ventilation not working',
        }),
      })
    );
  });

  it('should return 404 when inventory record not found', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/inventory/00000000-0000-0000-0000-000000000099/inspect').send({
      meetsStorageReqs: true,
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemInventory.findFirst.mockResolvedValue(mockInventory);
    (prisma as any).chemInventory.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/inventory/00000000-0000-0000-0000-000000000030/inspect').send({
      meetsStorageReqs: true,
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
