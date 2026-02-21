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

import router from '../src/routes/locations';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/locations', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/locations', () => {
  it('should return location counts', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Warehouse A' },
      { location: 'Warehouse A' },
      { location: 'Factory Floor' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ location: 'Warehouse A', count: 2 }),
        expect.objectContaining({ location: 'Factory Floor', count: 1 }),
      ])
    );
  });

  it('should skip assets with no location', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: null },
      { location: 'Site B' },
      { location: '' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // null location should be excluded; empty string falsy so also excluded
    const locations = res.body.data.map((d: any) => d.location);
    expect(locations).not.toContain(null);
  });

  it('should return empty array when no assets', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('DB connection error'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone A' }]);
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('each entry in data has location and count fields', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Store Room' },
      { location: 'Store Room' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('location');
    expect(res.body.data[0]).toHaveProperty('count');
  });

  it('three distinct locations produce three separate entries', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Alpha' },
      { location: 'Beta' },
      { location: 'Gamma' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('location appearing three times has count of 3', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Hub' },
      { location: 'Hub' },
      { location: 'Hub' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const hub = res.body.data.find((d: any) => d.location === 'Hub');
    expect(hub.count).toBe(3);
  });

  it('data is an array', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Locations — extended', () => {
  it('count field is a number', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone X' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].count).toBe('number');
  });

  it('location field is a string', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([{ location: 'Zone Y' }]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].location).toBe('string');
  });

  it('findMany called once on each new request', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/locations');
    await request(app).get('/api/locations');
    expect(mockPrisma.assetRegister.findMany).toHaveBeenCalledTimes(2);
  });

  it('success is false and code is INTERNAL_ERROR on rejection', async () => {
    mockPrisma.assetRegister.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('two locations with same name are collapsed into one entry', async () => {
    mockPrisma.assetRegister.findMany.mockResolvedValue([
      { location: 'Lab 1' },
      { location: 'Lab 1' },
      { location: 'Lab 2' },
    ]);
    const res = await request(app).get('/api/locations');
    expect(res.status).toBe(200);
    const names = res.body.data.map((d: any) => d.location);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });
});
