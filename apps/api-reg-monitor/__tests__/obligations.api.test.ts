import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { regObligation: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/obligations';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/obligations', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/obligations', () => {
  it('should return list of obligations with pagination', async () => {
    (prisma as any).regObligation.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Annual Report' }]);
    (prisma as any).regObligation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/obligations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support filtering by status', async () => {
    (prisma as any).regObligation.findMany.mockResolvedValue([]);
    (prisma as any).regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/obligations?status=PENDING');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search query', async () => {
    (prisma as any).regObligation.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', title: 'Emissions Report' }]);
    (prisma as any).regObligation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/obligations?search=Emissions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should support pagination parameters', async () => {
    (prisma as any).regObligation.findMany.mockResolvedValue([]);
    (prisma as any).regObligation.count.mockResolvedValue(50);
    const res = await request(app).get('/api/obligations?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).regObligation.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/obligations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/obligations/:id', () => {
  it('should return an obligation by id', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Annual Report' });
    const res = await request(app).get('/api/obligations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if obligation not found', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/obligations/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).regObligation.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/obligations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/obligations', () => {
  it('should create a new obligation', async () => {
    (prisma as any).regObligation.count.mockResolvedValue(0);
    (prisma as any).regObligation.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Annual Report', referenceNumber: 'ROB-2026-0001' });
    const res = await request(app).post('/api/obligations').send({ title: 'Annual Report' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Annual Report');
  });

  it('should create obligation with all optional fields', async () => {
    (prisma as any).regObligation.count.mockResolvedValue(1);
    (prisma as any).regObligation.create.mockResolvedValue({ id: '2', title: 'Quarterly Filing' });
    const res = await request(app).post('/api/obligations').send({
      title: 'Quarterly Filing',
      description: 'Submit quarterly emissions data',
      source: 'EPA Regulation 2026',
      dueDate: '2026-03-31',
      frequency: 'QUARTERLY',
      responsible: 'John Smith',
      status: 'PENDING',
      evidence: 'Form EPA-100',
      notes: 'Include Scope 3 data',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/api/obligations').send({ source: 'EPA' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    (prisma as any).regObligation.count.mockResolvedValue(0);
    (prisma as any).regObligation.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/obligations').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/obligations/:id', () => {
  it('should update an existing obligation', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Old Title' });
    (prisma as any).regObligation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated Title' });
    const res = await request(app).put('/api/obligations/00000000-0000-0000-0000-000000000001').send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('should update status field', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'PENDING' });
    (prisma as any).regObligation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETE' });
    const res = await request(app).put('/api/obligations/00000000-0000-0000-0000-000000000001').send({ status: 'COMPLETE' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if obligation not found for update', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/obligations/00000000-0000-0000-0000-000000000099').send({ title: 'New' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).regObligation.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app).put('/api/obligations/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/obligations/:id', () => {
  it('should soft delete an obligation', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Annual Report' });
    (prisma as any).regObligation.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/obligations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted successfully');
  });

  it('should return 404 if obligation not found for delete', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/obligations/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).regObligation.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).regObligation.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/obligations/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
