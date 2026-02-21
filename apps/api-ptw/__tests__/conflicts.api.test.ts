import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ptwPermit: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
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

import router from '../src/routes/conflicts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/conflicts', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/conflicts', () => {
  it('should return empty array when no active permits', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return conflicts when permits share location and area', async () => {
    const permits = [
      {
        id: '1',
        title: 'Permit A',
        location: 'Building 1',
        area: 'Zone A',
        startDate: new Date(),
        endDate: new Date(),
        type: 'HOT_WORK',
      },
      {
        id: '2',
        title: 'Permit B',
        location: 'Building 1',
        area: 'Zone A',
        startDate: new Date(),
        endDate: new Date(),
        type: 'CONFINED_SPACE',
      },
    ];
    mockPrisma.ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].reason).toBe('Same location and area');
    expect(res.body.data[0].permit1.id).toBe('1');
    expect(res.body.data[0].permit2.id).toBe('2');
  });

  it('should not report conflict when permits are in different locations', async () => {
    const permits = [
      {
        id: '1',
        title: 'Permit A',
        location: 'Building 1',
        area: 'Zone A',
        startDate: new Date(),
        endDate: new Date(),
        type: 'HOT_WORK',
      },
      {
        id: '2',
        title: 'Permit B',
        location: 'Building 2',
        area: 'Zone A',
        startDate: new Date(),
        endDate: new Date(),
        type: 'CONFINED_SPACE',
      },
    ];
    mockPrisma.ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should not report conflict when permits are in different areas', async () => {
    const permits = [
      {
        id: '1',
        title: 'Permit A',
        location: 'Building 1',
        area: 'Zone A',
        startDate: new Date(),
        endDate: new Date(),
        type: 'HOT_WORK',
      },
      {
        id: '2',
        title: 'Permit B',
        location: 'Building 1',
        area: 'Zone B',
        startDate: new Date(),
        endDate: new Date(),
        type: 'CONFINED_SPACE',
      },
    ];
    mockPrisma.ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should detect multiple conflicts among several permits', async () => {
    const permits = [
      {
        id: '1',
        title: 'Permit A',
        location: 'Site X',
        area: 'Area 1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'HOT_WORK',
      },
      {
        id: '2',
        title: 'Permit B',
        location: 'Site X',
        area: 'Area 1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'CONFINED_SPACE',
      },
      {
        id: '3',
        title: 'Permit C',
        location: 'Site X',
        area: 'Area 1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'ELECTRICAL',
      },
    ];
    mockPrisma.ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    // 3 pairs: (1,2), (1,3), (2,3)
    expect(res.body.data).toHaveLength(3);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.ptwPermit.findMany.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('findMany called once per request', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([]);
    await request(app).get('/api/conflicts');
    expect(mockPrisma.ptwPermit.findMany).toHaveBeenCalledTimes(1);
  });

  it('data is an array', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('conflict entry has permit1, permit2, and reason properties', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([
      { id: 'p1', title: 'A', location: 'L1', area: 'A1', startDate: new Date(), endDate: new Date(), type: 'HOT_WORK' },
      { id: 'p2', title: 'B', location: 'L1', area: 'A1', startDate: new Date(), endDate: new Date(), type: 'CONFINED_SPACE' },
    ]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const conflict = res.body.data[0];
    expect(conflict).toHaveProperty('permit1');
    expect(conflict).toHaveProperty('permit2');
    expect(conflict).toHaveProperty('reason');
  });
});

describe('PTW Conflicts — extended', () => {
  it('returns no conflicts for a single permit', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([
      { id: '1', title: 'Solo Permit', location: 'Site A', area: 'Zone 1', startDate: new Date(), endDate: new Date(), type: 'HOT_WORK' },
    ]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('conflict entry reason is a string', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([
      { id: 'p1', title: 'A', location: 'L1', area: 'A1', startDate: new Date(), endDate: new Date(), type: 'HOT_WORK' },
      { id: 'p2', title: 'B', location: 'L1', area: 'A1', startDate: new Date(), endDate: new Date(), type: 'ELECTRICAL' },
    ]);
    const res = await request(app).get('/api/conflicts');
    expect(typeof res.body.data[0].reason).toBe('string');
  });

  it('success is true when no conflicts found', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PTW Conflicts — extra', () => {
  it('two permits with matching location and null area produce a conflict (null === null)', async () => {
    mockPrisma.ptwPermit.findMany.mockResolvedValue([
      { id: 'p1', title: 'A', location: 'Site Z', area: null, startDate: new Date(), endDate: new Date(), type: 'HOT_WORK' },
      { id: 'p2', title: 'B', location: 'Site Z', area: null, startDate: new Date(), endDate: new Date(), type: 'ELECTRICAL' },
    ]);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    // null === null is true in JS, so they match as same location+area
    expect(res.body.data).toHaveLength(1);
  });

  it('error code is INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.ptwPermit.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('four permits all in same location and area produce 6 conflicts', async () => {
    const permits = [
      { id: '1', title: 'P1', location: 'L', area: 'A', startDate: new Date(), endDate: new Date(), type: 'HOT_WORK' },
      { id: '2', title: 'P2', location: 'L', area: 'A', startDate: new Date(), endDate: new Date(), type: 'CONFINED_SPACE' },
      { id: '3', title: 'P3', location: 'L', area: 'A', startDate: new Date(), endDate: new Date(), type: 'ELECTRICAL' },
      { id: '4', title: 'P4', location: 'L', area: 'A', startDate: new Date(), endDate: new Date(), type: 'WORKING_AT_HEIGHT' },
    ];
    mockPrisma.ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    // C(4,2) = 6 pairs
    expect(res.body.data).toHaveLength(6);
  });
});
