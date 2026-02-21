import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: { findMany: jest.fn() },
  },
  Prisma: {},
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

import router from '../src/routes/depreciation';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/depreciation', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/depreciation', () => {
  it('should return depreciation data for assets', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      {
        id: '1',
        name: 'Forklift',
        purchaseCost: 50000,
        currentValue: 30000,
        purchaseDate: '2023-01-01',
      },
      {
        id: '2',
        name: 'Pump',
        purchaseCost: 10000,
        currentValue: 7500,
        purchaseDate: '2024-06-01',
      },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Forklift');
  });

  it('should return empty array when no assets with purchase cost', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB connection error'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single asset correctly', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Compressor', purchaseCost: 25000, currentValue: 18000, purchaseDate: '2024-01-15' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Compressor');
    expect(res.body.data[0].purchaseCost).toBe(25000);
    expect(res.body.data[0].currentValue).toBe(18000);
  });

  it('each asset entry has the expected fields', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-2', name: 'Generator', purchaseCost: 80000, currentValue: 60000, purchaseDate: '2022-06-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    const asset = res.body.data[0];
    expect(asset).toHaveProperty('id');
    expect(asset).toHaveProperty('name');
    expect(asset).toHaveProperty('purchaseCost');
    expect(asset).toHaveProperty('currentValue');
    expect(asset).toHaveProperty('purchaseDate');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/depreciation');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('data is an array', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('all returned assets have a name property', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Drill', purchaseCost: 1000, currentValue: 800, purchaseDate: '2025-01-01' },
      { id: 'a-2', name: 'Lathe', purchaseCost: 2000, currentValue: 1500, purchaseDate: '2025-02-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    for (const asset of res.body.data) {
      expect(asset).toHaveProperty('name');
    }
  });

  it('success is true on 200 response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Depreciation — extended', () => {
  it('data length matches number of assets returned by findMany', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Pump', purchaseCost: 5000, currentValue: 3000, purchaseDate: '2023-01-01' },
      { id: 'a-2', name: 'Motor', purchaseCost: 8000, currentValue: 6000, purchaseDate: '2024-01-01' },
      { id: 'a-3', name: 'Valve', purchaseCost: 2000, currentValue: 1500, purchaseDate: '2025-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.body.data).toHaveLength(3);
  });

  it('currentValue is a number for each asset', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Machine', purchaseCost: 10000, currentValue: 7500, purchaseDate: '2024-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(typeof res.body.data[0].currentValue).toBe('number');
  });

  it('handles asset with currentValue zero', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Obsolete Machine', purchaseCost: 5000, currentValue: 0, purchaseDate: '2018-01-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].currentValue).toBe(0);
  });
});

describe('Depreciation — extra', () => {
  it('purchaseCost is a number for each asset', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Lathe', purchaseCost: 12000, currentValue: 9000, purchaseDate: '2023-05-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].purchaseCost).toBe('number');
  });

  it('returns 200 with multiple assets having different costs', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { id: 'a-1', name: 'Asset One', purchaseCost: 100, currentValue: 80, purchaseDate: '2024-01-01' },
      { id: 'a-2', name: 'Asset Two', purchaseCost: 200, currentValue: 150, purchaseDate: '2024-06-01' },
    ]);
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(200);
    expect(res.body.data[0].purchaseCost).toBe(100);
    expect(res.body.data[1].purchaseCost).toBe(200);
  });

  it('error code is INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/depreciation');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
