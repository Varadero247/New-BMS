import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainCourse: { count: jest.fn() },
    trainRecord: { count: jest.fn() },
    trainCompetency: { count: jest.fn() },
    trainMatrix: { count: jest.fn() },
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

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return training stats', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(10);
    mockPrisma.trainRecord.count.mockResolvedValue(50);
    mockPrisma.trainCompetency.count.mockResolvedValue(8);
    mockPrisma.trainMatrix.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCourses).toBe(10);
    expect(res.body.data.totalRecords).toBe(50);
    expect(res.body.data.totalCompetencies).toBe(8);
    expect(res.body.data.totalGaps).toBe(3);
  });

  it('should return zeros when no data exists', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(0);
    mockPrisma.trainRecord.count.mockResolvedValue(0);
    mockPrisma.trainCompetency.count.mockResolvedValue(0);
    mockPrisma.trainMatrix.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCourses).toBe(0);
    expect(res.body.data.totalRecords).toBe(0);
    expect(res.body.data.totalCompetencies).toBe(0);
    expect(res.body.data.totalGaps).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainCourse.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainRecord.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainCompetency.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.trainMatrix.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all four expected data keys', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(1);
    mockPrisma.trainRecord.count.mockResolvedValue(1);
    mockPrisma.trainCompetency.count.mockResolvedValue(1);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalCourses');
    expect(res.body.data).toHaveProperty('totalRecords');
    expect(res.body.data).toHaveProperty('totalCompetencies');
    expect(res.body.data).toHaveProperty('totalGaps');
  });

  it('all four count queries run per request', async () => {
    mockPrisma.trainCourse.count.mockResolvedValue(5);
    mockPrisma.trainRecord.count.mockResolvedValue(20);
    mockPrisma.trainCompetency.count.mockResolvedValue(3);
    mockPrisma.trainMatrix.count.mockResolvedValue(1);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.trainCourse.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainRecord.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainCompetency.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trainMatrix.count).toHaveBeenCalledTimes(1);
  });
});
