import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isThreatIntelligence: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
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

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    return { skip: (page - 1) * limit, limit, page };
  },
}));

import router from '../src/routes/threat-intelligence';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const tiPayload = {
  title: 'New ransomware campaign targeting healthcare',
  source: 'CISA Advisory',
  category: 'TACTICAL',
  threatType: 'RANSOMWARE',
  description: 'LockBit variant targeting healthcare providers',
  severity: 'HIGH',
  confidence: 'HIGH',
  reportedBy: 'soc@company.com',
};

const mockTI = { id: 'ti-1', ...tiPayload, status: 'ACTIVE', deletedAt: null };

describe('ISO 27001:2022 A.5.7 Threat Intelligence Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / returns paginated threat intelligence list', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([mockTI]);
    prisma.isThreatIntelligence.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by category', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/?category=STRATEGIC');
    expect(res.status).toBe(200);
  });

  it('GET / filters by severity', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/?severity=CRITICAL');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.isThreatIntelligence.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  it('POST / creates threat intelligence with ACTIVE status', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, status: 'ACTIVE' });
    const res = await request(app).post('/').send(tiPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('POST / returns 400 on missing title', async () => {
    const { title: _t, ...body } = tiPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on invalid category', async () => {
    const res = await request(app).post('/').send({ ...tiPayload, category: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on invalid severity', async () => {
    const res = await request(app).post('/').send({ ...tiPayload, severity: 'EXTREME' });
    expect(res.status).toBe(400);
  });

  it('POST / accepts optional tlpLevel', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, tlpLevel: 'AMBER' });
    const res = await request(app).post('/').send({ ...tiPayload, tlpLevel: 'AMBER' });
    expect(res.status).toBe(201);
  });

  it('POST / returns 500 on DB error', async () => {
    prisma.isThreatIntelligence.create.mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/').send(tiPayload);
    expect(res.status).toBe(500);
  });

  it('GET /summary returns bySeverity and byCategory counts', async () => {
    prisma.isThreatIntelligence.count.mockResolvedValue(5);
    prisma.isThreatIntelligence.groupBy
      .mockResolvedValueOnce([
        { severity: 'HIGH', _count: { id: 3 } },
        { severity: 'CRITICAL', _count: { id: 2 } },
      ])
      .mockResolvedValueOnce([
        { category: 'TACTICAL', _count: { id: 4 } },
        { category: 'STRATEGIC', _count: { id: 1 } },
      ]);
    const res = await request(app).get('/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(5);
    expect(res.body.data.bySeverity).toHaveProperty('HIGH', 3);
    expect(res.body.data.byCategory).toHaveProperty('TACTICAL', 4);
  });

  it('GET /:id returns single threat intelligence item', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    const res = await request(app).get('/ti-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('ti-1');
  });

  it('GET /:id returns 404 for missing item', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted item', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue({ ...mockTI, deletedAt: new Date() });
    const res = await request(app).get('/ti-1');
    expect(res.status).toBe(404);
  });

  it('PUT /:id updates status to MITIGATED', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    prisma.isThreatIntelligence.update.mockResolvedValue({ ...mockTI, status: 'MITIGATED' });
    const res = await request(app).put('/ti-1').send({ status: 'MITIGATED', mitigationNotes: 'Firewall rule applied' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('MITIGATED');
  });

  it('PUT /:id returns 400 on invalid status', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    const res = await request(app).put('/ti-1').send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 404 for unknown item', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ status: 'ARCHIVED' });
    expect(res.status).toBe(404);
  });

  it('PUT /:id updates severity and confidence', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    prisma.isThreatIntelligence.update.mockResolvedValue({ ...mockTI, severity: 'CRITICAL', confidence: 'HIGH' });
    const res = await request(app).put('/ti-1').send({ severity: 'CRITICAL', confidence: 'HIGH' });
    expect(res.status).toBe(200);
  });

  it('PUT /:id returns 400 on invalid confidence', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    const res = await request(app).put('/ti-1').send({ confidence: 'EXTREME' });
    expect(res.status).toBe(400);
  });
});
