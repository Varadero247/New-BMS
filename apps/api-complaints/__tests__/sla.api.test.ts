import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { count: jest.fn() } },
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

import router from '../src/routes/sla';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/sla', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/sla', () => {
  it('should return SLA overdue and on-track counts', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(7);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overdue).toBe(3);
    expect(res.body.data.onTrack).toBe(7);
  });

  it('should return zero counts when no complaints match', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overdue).toBe(0);
    expect(res.body.data.onTrack).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('makes two separate count queries', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(5).mockResolvedValueOnce(10);
    await request(app).get('/api/sla');
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(2);
  });

  it('returns correct data structure with both fields', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(8);
    const res = await request(app).get('/api/sla');
    expect(res.body.data).toHaveProperty('overdue');
    expect(res.body.data).toHaveProperty('onTrack');
    expect(typeof res.body.data.overdue).toBe('number');
    expect(typeof res.body.data.onTrack).toBe('number');
  });

  it('all overdue, none on-track', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(12).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(12);
    expect(res.body.data.onTrack).toBe(0);
  });

  it('none overdue, all on-track', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(15);
    const res = await request(app).get('/api/sla');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(0);
    expect(res.body.data.onTrack).toBe(15);
  });
});
