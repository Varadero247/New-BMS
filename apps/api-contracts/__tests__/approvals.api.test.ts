import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contApproval: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/approvals';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/approvals', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/approvals', () => {
  it('should return approvals', async () => {
    (prisma as any).contApproval.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
    (prisma as any).contApproval.count.mockResolvedValue(1);
    const res = await request(app).get('/api/approvals');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/approvals/:id', () => {
  it('should return 404 if not found', async () => {
    (prisma as any).contApproval.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/approvals/nope');
    expect(res.status).toBe(404);
  });
  it('should return item by id', async () => {
    (prisma as any).contApproval.findFirst.mockResolvedValue({ id: '1' });
    const res = await request(app).get('/api/approvals/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('1');
  });
});

describe('POST /api/approvals', () => {
  it('should create', async () => {
    (prisma as any).contApproval.count.mockResolvedValue(0);
    (prisma as any).contApproval.create.mockResolvedValue({ id: '1', title: 'New' });
    const res = await request(app).post('/api/approvals').send({ contractId: 'contract-1', approver: 'user-1' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /api/approvals/:id', () => {
  it('should update', async () => {
    (prisma as any).contApproval.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).contApproval.update.mockResolvedValue({ id: '1', title: 'Updated' });
    const res = await request(app).put('/api/approvals/1').send({ title: 'Updated' });
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/approvals/:id', () => {
  it('should soft delete', async () => {
    (prisma as any).contApproval.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).contApproval.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/approvals/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
