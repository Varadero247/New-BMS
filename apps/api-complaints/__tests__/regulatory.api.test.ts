import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { findMany: jest.fn() } },
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

import router from '../src/routes/regulatory';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/regulatory', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/regulatory', () => {
  it('should return regulatory complaints', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '1', title: 'Regulatory Complaint', isRegulatory: true },
      { id: '2', title: 'Another Regulatory', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return empty list when no regulatory complaints', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single regulatory complaint', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'c-1', title: 'GDPR Breach Report', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('GDPR Breach Report');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    await request(app).get('/api/regulatory');
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledTimes(1);
  });

  it('returned complaints all have isRegulatory true', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '1', title: 'HSE Notification', isRegulatory: true },
      { id: '2', title: 'ICO Report', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    for (const complaint of res.body.data) {
      expect(complaint.isRegulatory).toBe(true);
    }
  });

  it('data is an array', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('each complaint has an id property', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'c-1', title: 'GDPR Issue', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('success is true on 200 response', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
