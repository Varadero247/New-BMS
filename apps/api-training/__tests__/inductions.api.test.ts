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

  it('data is an array', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('each record has employeeName property', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-1', employeeName: 'Charlie', course: { title: 'Manual Handling', code: 'IND-005' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('employeeName');
  });

  it('success is true on 200 response', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Training Inductions — extended', () => {
  it('data length matches number of records from findMany', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'A', course: { title: 'Course 1', code: 'C-001' } },
      { id: '2', employeeName: 'B', course: { title: 'Course 2', code: 'C-002' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.body.data).toHaveLength(2);
  });

  it('course has a title that is a string', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: '1', employeeName: 'Tester', course: { title: 'Fire Safety', code: 'FS-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(typeof res.body.data[0].course.title).toBe('string');
  });

  it('success is false on 500', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Training Inductions — extra', () => {
  it('course code is a string', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([
      { id: 'r-2', employeeName: 'Dave', course: { title: 'PPE Training', code: 'PPE-001' } },
    ]);
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].course.code).toBe('string');
  });

  it('findMany called once per GET request', async () => {
    mockPrisma.trainRecord.findMany.mockResolvedValue([]);
    await request(app).get('/api/inductions');
    expect(mockPrisma.trainRecord.findMany).toHaveBeenCalledTimes(1);
  });

  it('error message code is INTERNAL_ERROR on DB error', async () => {
    mockPrisma.trainRecord.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/inductions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
