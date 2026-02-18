import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contNotice: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/notices';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/notices', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/notices', () => {
  it('should return notices list', async () => {
    (prisma as any).contNotice.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Notice A', dueDate: '2026-03-01' }]);
    (prisma as any).contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/notices');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status and search filters', async () => {
    (prisma as any).contNotice.findMany.mockResolvedValue([]);
    (prisma as any).contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/notices?status=PENDING&search=renewal');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contNotice.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).contNotice.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/notices');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/notices/:id', () => {
  it('should return notice by id', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Notice A' });
    const res = await request(app).get('/api/notices/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if notice not found', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/notices/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on db error', async () => {
    (prisma as any).contNotice.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/notices/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/notices', () => {
  it('should create a notice', async () => {
    (prisma as any).contNotice.count.mockResolvedValue(0);
    (prisma as any).contNotice.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', contractId: 'c-1', title: 'New Notice', dueDate: '2026-03-01' });
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', title: 'New Notice', dueDate: '2026-03-01' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Notice');
  });

  it('should return 400 if contractId missing', async () => {
    const res = await request(app).post('/api/notices').send({ title: 'Missing Contract', dueDate: '2026-03-01' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if title missing', async () => {
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', dueDate: '2026-03-01' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if dueDate missing', async () => {
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', title: 'Notice' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should accept valid priority enum values', async () => {
    (prisma as any).contNotice.count.mockResolvedValue(0);
    (prisma as any).contNotice.create.mockResolvedValue({ id: '2', contractId: 'c-1', title: 'High Priority', priority: 'HIGH', dueDate: '2026-03-01' });
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', title: 'High Priority', priority: 'HIGH', dueDate: '2026-03-01' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if priority is invalid', async () => {
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', title: 'Notice', dueDate: '2026-03-01', priority: 'URGENT' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    (prisma as any).contNotice.count.mockResolvedValue(0);
    (prisma as any).contNotice.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/notices').send({ contractId: 'c-1', title: 'Notice', dueDate: '2026-03-01' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/notices/:id', () => {
  it('should update a notice', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Old Title' });
    (prisma as any).contNotice.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated Title' });
    const res = await request(app).put('/api/notices/00000000-0000-0000-0000-000000000001').send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if notice not found', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/notices/00000000-0000-0000-0000-000000000099').send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).contNotice.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app).put('/api/notices/00000000-0000-0000-0000-000000000001').send({ title: 'New' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/notices/:id', () => {
  it('should soft delete a notice', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).contNotice.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    const res = await request(app).delete('/api/notices/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if notice not found', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/notices/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).contNotice.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).contNotice.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/notices/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
