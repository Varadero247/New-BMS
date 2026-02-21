import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { incIncident: { findMany: jest.fn(), update: jest.fn() } },
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

import router from '../src/routes/riddor';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/riddor', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/riddor', () => {
  it('should return list of RIDDOR reportable incidents', async () => {
    const incidents = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        title: 'Serious injury',
        riddorReportable: 'YES',
      },
      { id: 'inc-2', title: 'Dangerous occurrence', riddorReportable: 'YES' },
    ];
    mockPrisma.incIncident.findMany.mockResolvedValue(incidents);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(mockPrisma.incIncident.findMany).toHaveBeenCalledWith({
      where: { orgId: 'org-1', deletedAt: null, riddorReportable: 'YES' },
      orderBy: { dateOccurred: 'desc' },
      take: 500,
    });
  });

  it('should return empty array when no RIDDOR incidents exist', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/riddor/:id/assess', () => {
  it('should mark incident as RIDDOR reportable', async () => {
    const updated = {
      id: '00000000-0000-0000-0000-000000000001',
      riddorReportable: 'YES',
      riddorRef: 'RIDDOR-2026-001',
    };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true, riddorRef: 'RIDDOR-2026-001' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riddorReportable).toBe('YES');
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({ riddorReportable: 'YES', riddorRef: 'RIDDOR-2026-001' }),
    });
  });

  it('should mark incident as NOT RIDDOR reportable', async () => {
    const updated = { id: '00000000-0000-0000-0000-000000000001', riddorReportable: 'NO' };
    mockPrisma.incIncident.update.mockResolvedValue(updated);
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.incIncident.update).toHaveBeenCalledWith({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      data: expect.objectContaining({ riddorReportable: 'NO' }),
    });
  });

  it('should return 400 if reportable field is missing', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if reportable is not a boolean', async () => {
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: 'yes' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('RIDDOR — extended', () => {
  it('GET returns data as array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET success is true on 200', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('assess update called once on success', async () => {
    mockPrisma.incIncident.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', riddorReportable: 'YES' });
    await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: true });
    expect(mockPrisma.incIncident.update).toHaveBeenCalledTimes(1);
  });

  it('GET data is an array', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/riddor');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET findMany called once per request', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/riddor');
    expect(mockPrisma.incIncident.findMany).toHaveBeenCalledTimes(1);
  });

  it('assess returns success false on 500', async () => {
    mockPrisma.incIncident.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/riddor/00000000-0000-0000-0000-000000000001/assess')
      .send({ reportable: false });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET returns list with correct length', async () => {
    mockPrisma.incIncident.findMany.mockResolvedValue([
      { id: 'i1', title: 'Injury A', riddorReportable: 'YES' },
      { id: 'i2', title: 'Injury B', riddorReportable: 'YES' },
      { id: 'i3', title: 'Occurrence', riddorReportable: 'YES' },
    ]);
    const res = await request(app).get('/api/riddor');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });
});
