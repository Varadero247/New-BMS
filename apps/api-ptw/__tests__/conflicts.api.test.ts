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
const app = express();
app.use(express.json());
app.use('/api/conflicts', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/conflicts', () => {
  it('should return empty array when no active permits', async () => {
    (prisma as any).ptwPermit.findMany.mockResolvedValue([]);
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
    (prisma as any).ptwPermit.findMany.mockResolvedValue(permits);
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
    (prisma as any).ptwPermit.findMany.mockResolvedValue(permits);
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
    (prisma as any).ptwPermit.findMany.mockResolvedValue(permits);
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
    (prisma as any).ptwPermit.findMany.mockResolvedValue(permits);
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(200);
    // 3 pairs: (1,2), (1,3), (2,3)
    expect(res.body.data).toHaveLength(3);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).ptwPermit.findMany.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/conflicts');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
