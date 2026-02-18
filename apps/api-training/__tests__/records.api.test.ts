import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { trainRecord: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/records';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/records', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/records', () => {
  it('should return records with pagination', async () => {
    (prisma as any).trainRecord.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Test' }]);
    (prisma as any).trainRecord.count.mockResolvedValue(1);
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    (prisma as any).trainRecord.findMany.mockResolvedValue([]);
    (prisma as any).trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by title', async () => {
    (prisma as any).trainRecord.findMany.mockResolvedValue([]);
    (prisma as any).trainRecord.count.mockResolvedValue(0);
    const res = await request(app).get('/api/records?search=safety');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).trainRecord.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/records');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/records/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).trainRecord.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/records', () => {
  it('should create', async () => {
    (prisma as any).trainRecord.count.mockResolvedValue(0);
    (prisma as any).trainRecord.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'New', referenceNumber: 'TRN-2026-0001' });
    const res = await request(app).post('/api/records').send({ courseId: 'course-1', employeeId: 'emp-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 when courseId is missing', async () => {
    const res = await request(app).post('/api/records').send({ employeeId: 'emp-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when employeeId is missing', async () => {
    const res = await request(app).post('/api/records').send({ courseId: 'course-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    (prisma as any).trainRecord.count.mockResolvedValue(0);
    (prisma as any).trainRecord.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/records').send({ courseId: 'course-1', employeeId: 'emp-1' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/records/:id', () => {
  it('should update', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).trainRecord.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    const res = await request(app).put('/api/records/00000000-0000-0000-0000-000000000001').send({ courseId: 'course-2' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when record not found', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/records/00000000-0000-0000-0000-000000000099').send({ courseId: 'course-2' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).trainRecord.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/records/00000000-0000-0000-0000-000000000001').send({ courseId: 'course-2' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/records/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).trainRecord.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when record not found', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).trainRecord.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).trainRecord.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/records/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
