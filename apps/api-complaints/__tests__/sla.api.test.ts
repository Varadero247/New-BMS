import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/sla';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/sla', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/sla', () => {
  it('should return SLA overdue and on-track counts', async () => {
    (prisma as any).compComplaint.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(7);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overdue).toBe(3);
    expect(res.body.data.onTrack).toBe(7);
  });

  it('should return zero counts when no complaints match', async () => {
    (prisma as any).compComplaint.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overdue).toBe(0);
    expect(res.body.data.onTrack).toBe(0);
  });

  it('should return 500 on error', async () => {
    (prisma as any).compComplaint.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
