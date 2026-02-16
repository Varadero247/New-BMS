import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compCommunication: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/communications';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/communications', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/communications', () => {
  it('should return communications list', async () => {
    (prisma as any).compCommunication.findMany.mockResolvedValue([{ id: '1', subject: 'Test' }]);
    (prisma as any).compCommunication.count.mockResolvedValue(1);
    const res = await request(app).get('/api/communications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    (prisma as any).compCommunication.findMany.mockResolvedValue([]);
    (prisma as any).compCommunication.count.mockResolvedValue(0);
    const res = await request(app).get('/api/communications?status=SENT');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    (prisma as any).compCommunication.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).compCommunication.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/communications');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/communications/:id', () => {
  it('should return communication by id', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue({ id: '1', subject: 'Test' });
    const res = await request(app).get('/api/communications/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/communications/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on error', async () => {
    (prisma as any).compCommunication.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/communications/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/communications', () => {
  it('should create a communication', async () => {
    (prisma as any).compCommunication.count.mockResolvedValue(0);
    (prisma as any).compCommunication.create.mockResolvedValue({ id: '1', subject: 'New', referenceNumber: 'CMC-2026-0001' });
    const res = await request(app).post('/api/communications').send({ complaintId: 'comp-1', subject: 'New', direction: 'OUTBOUND', channel: 'EMAIL' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when complaintId is missing', async () => {
    const res = await request(app).post('/api/communications').send({ subject: 'No complaint id' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on create error', async () => {
    (prisma as any).compCommunication.count.mockResolvedValue(0);
    (prisma as any).compCommunication.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/communications').send({ complaintId: 'comp-1' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/communications/:id', () => {
  it('should update a communication', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue({ id: '1', subject: 'Old' });
    (prisma as any).compCommunication.update.mockResolvedValue({ id: '1', subject: 'Updated' });
    const res = await request(app).put('/api/communications/1').send({ complaintId: 'comp-1', subject: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/communications/nope').send({ complaintId: 'comp-1' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on update error', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).compCommunication.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app).put('/api/communications/1').send({ complaintId: 'comp-1' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/communications/:id', () => {
  it('should soft delete a communication', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).compCommunication.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/communications/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/communications/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).compCommunication.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).compCommunication.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/communications/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
