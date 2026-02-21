import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    trainRecord: { findMany: jest.fn() },
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

import router from '../src/routes/inductions';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/inductions', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/inductions', () => {
  it('should return induction records', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'John Doe', course: { title: 'Site Induction', code: 'IND-001' } },
      {
        id: '2',
        employeeName: 'Jane Smith',
        course: { title: 'Safety Induction', code: 'IND-002' },
      },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].course.title).toBe('Site Induction');
  });

  it('should return empty array when no inductions exist', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single induction record', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Bob Jones', course: { title: 'Fire Safety', code: 'IND-003' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].employeeName).toBe('Bob Jones');
    expect(res.body.data[0].course.code).toBe('IND-003');
  });

  it('each record includes nested course with title and code', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-1', employeeName: 'Alice', course: { title: 'COSHH Awareness', code: 'IND-010' } },
    ]);
    const res = await request(app).get('/api/inductions');
    const record = res.body.data[0];
    expect(record.course).toHaveProperty('title');
    expect(record.course).toHaveProperty('code');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledTimes(1);
  });
});
