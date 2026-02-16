import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { ptwToolboxTalk: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/toolbox-talks';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/toolbox-talks', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/toolbox-talks', () => {
  it('should return paginated toolbox talks', async () => {
    (prisma as any).ptwToolboxTalk.findMany.mockResolvedValue([{ id: '1', topic: 'Safety Brief' }]);
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/toolbox-talks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support status filter query param', async () => {
    (prisma as any).ptwToolboxTalk.findMany.mockResolvedValue([]);
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/toolbox-talks?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search query param', async () => {
    (prisma as any).ptwToolboxTalk.findMany.mockResolvedValue([{ id: '2', topic: 'Fire Safety' }]);
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/toolbox-talks?search=fire');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return correct pagination metadata', async () => {
    (prisma as any).ptwToolboxTalk.findMany.mockResolvedValue([]);
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(50);
    const res = await request(app).get('/api/toolbox-talks?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.pages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).ptwToolboxTalk.findMany.mockRejectedValue(new Error('DB failure'));
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/toolbox-talks');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('GET /api/toolbox-talks/:id', () => {
  it('should return a toolbox talk by id', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Safety Brief' });
    const res = await request(app).get('/api/toolbox-talks/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if toolbox talk not found', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/toolbox-talks/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error for get by id', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/toolbox-talks/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('POST /api/toolbox-talks', () => {
  it('should create a toolbox talk', async () => {
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(0);
    (prisma as any).ptwToolboxTalk.create.mockResolvedValue({ id: '1', topic: 'Safety Brief', referenceNumber: 'PTT-2026-0001' });
    const res = await request(app).post('/api/toolbox-talks').send({ topic: 'Safety Brief' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.topic).toBe('Safety Brief');
  });

  it('should create with all optional fields', async () => {
    (prisma as any).ptwToolboxTalk.count.mockResolvedValue(2);
    (prisma as any).ptwToolboxTalk.create.mockResolvedValue({ id: '3', topic: 'Fire Safety', referenceNumber: 'PTT-2026-0003' });
    const res = await request(app).post('/api/toolbox-talks').send({
      topic: 'Fire Safety',
      content: 'Detailed fire safety procedures',
      presenter: 'user-2',
      presenterName: 'John Smith',
      scheduledDate: '2026-03-01',
      conductedDate: '2026-03-01',
      attendees: ['user-3', 'user-4'],
      attendeeCount: 2,
      notes: 'All attendees signed in',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when topic is missing', async () => {
    const res = await request(app).post('/api/toolbox-talks').send({ content: 'No topic provided' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when topic is empty string', async () => {
    const res = await request(app).post('/api/toolbox-talks').send({ topic: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/toolbox-talks/:id', () => {
  it('should update an existing toolbox talk', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Old Topic' });
    (prisma as any).ptwToolboxTalk.update.mockResolvedValue({ id: '1', topic: 'New Topic' });
    const res = await request(app).put('/api/toolbox-talks/1').send({ topic: 'New Topic' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when updating non-existent toolbox talk', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/toolbox-talks/nonexistent').send({ topic: 'New Topic' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should allow partial updates', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Safety Brief' });
    (prisma as any).ptwToolboxTalk.update.mockResolvedValue({ id: '1', topic: 'Safety Brief', notes: 'Updated notes' });
    const res = await request(app).put('/api/toolbox-talks/1').send({ notes: 'Updated notes' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error during update', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Safety Brief' });
    (prisma as any).ptwToolboxTalk.update.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).put('/api/toolbox-talks/1').send({ topic: 'New Topic' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UPDATE_ERROR');
  });
});

describe('DELETE /api/toolbox-talks/:id', () => {
  it('should soft delete a toolbox talk', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Safety Brief' });
    (prisma as any).ptwToolboxTalk.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
    const res = await request(app).delete('/api/toolbox-talks/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('toolbox talk deleted successfully');
  });

  it('should return 404 when deleting non-existent toolbox talk', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/toolbox-talks/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error during delete', async () => {
    (prisma as any).ptwToolboxTalk.findFirst.mockResolvedValue({ id: '1', topic: 'Safety Brief' });
    (prisma as any).ptwToolboxTalk.update.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).delete('/api/toolbox-talks/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DELETE_ERROR');
  });
});
