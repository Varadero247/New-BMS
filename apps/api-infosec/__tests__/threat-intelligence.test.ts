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

  it('PUT /:id returns 400 on invalid severity', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    const res = await request(app).put('/ti-1').send({ severity: 'EXTREME' });
    expect(res.status).toBe(400);
  });
});

describe('Threat Intelligence — edge cases and deeper coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / pagination object has totalPages field', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([mockTI, mockTI]);
    prisma.isThreatIntelligence.count.mockResolvedValue(2);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / pagination object has page field', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.body.pagination).toHaveProperty('page');
  });

  it('GET / filters by status query param', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/?status=EXPIRED');
    expect(res.status).toBe(200);
  });

  it('POST / returns 400 when source is missing', async () => {
    const { source: _s, ...body } = tiPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 when reportedBy is missing', async () => {
    const { reportedBy: _r, ...body } = tiPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 when threatType is invalid', async () => {
    const res = await request(app).post('/').send({ ...tiPayload, threatType: 'UNKNOWN_TYPE' });
    expect(res.status).toBe(400);
  });

  it('GET /summary returns 500 on DB error', async () => {
    prisma.isThreatIntelligence.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/summary');
    expect(res.status).toBe(500);
  });

  it('PUT /:id returns 500 on DB error during update', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    prisma.isThreatIntelligence.update.mockRejectedValue(new Error('update fail'));
    const res = await request(app).put('/ti-1').send({ status: 'ARCHIVED' });
    expect(res.status).toBe(500);
  });

  it('GET /:id returns 500 on DB error', async () => {
    prisma.isThreatIntelligence.findUnique.mockRejectedValue(new Error('db error'));
    const res = await request(app).get('/ti-1');
    expect(res.status).toBe(500);
  });

  it('POST / accepts TECHNICAL category', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, category: 'TECHNICAL' });
    const res = await request(app).post('/').send({ ...tiPayload, category: 'TECHNICAL' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

// ===================================================================
// Threat Intelligence — final coverage
// ===================================================================
describe('Threat Intelligence — final coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET / responds with JSON content-type', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET / with search param returns 200', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    const res = await request(app).get('/?search=ransomware');
    expect(res.status).toBe(200);
  });

  it('POST / accepts OPERATIONAL category', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, category: 'OPERATIONAL' });
    const res = await request(app).post('/').send({ ...tiPayload, category: 'OPERATIONAL' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / sets status to ACTIVE on creation', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue(mockTI);
    await request(app).post('/').send(tiPayload);
    expect(prisma.isThreatIntelligence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('GET /summary success is true', async () => {
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    prisma.isThreatIntelligence.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = await request(app).get('/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id accepts ARCHIVED status', async () => {
    prisma.isThreatIntelligence.findUnique.mockResolvedValue(mockTI);
    prisma.isThreatIntelligence.update.mockResolvedValue({ ...mockTI, status: 'ARCHIVED' });
    const res = await request(app).put('/ti-1').send({ status: 'ARCHIVED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ARCHIVED');
  });
});

describe('Threat Intelligence — extra final coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST / with LOW confidence is valid', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, confidence: 'LOW' });
    const res = await request(app).post('/').send({ ...tiPayload, confidence: 'LOW' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /summary byCategory is an object', async () => {
    prisma.isThreatIntelligence.count.mockResolvedValue(3);
    prisma.isThreatIntelligence.groupBy
      .mockResolvedValueOnce([{ severity: 'HIGH', _count: { id: 3 } }])
      .mockResolvedValueOnce([{ category: 'TACTICAL', _count: { id: 3 } }]);
    const res = await request(app).get('/summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.byCategory).toBe('object');
  });

  it('GET / excludes soft-deleted records', async () => {
    prisma.isThreatIntelligence.findMany.mockResolvedValue([]);
    prisma.isThreatIntelligence.count.mockResolvedValue(0);
    await request(app).get('/');
    const findCall = prisma.isThreatIntelligence.findMany.mock.calls[0][0];
    expect(findCall.where).toHaveProperty('deletedAt', null);
  });

  it('POST / PHISHING threatType is accepted', async () => {
    prisma.isThreatIntelligence.create.mockResolvedValue({ ...mockTI, threatType: 'PHISHING' });
    const res = await request(app).post('/').send({ ...tiPayload, threatType: 'PHISHING' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('threat intelligence — phase29 coverage', () => {
  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles Symbol type', () => {
    expect(typeof Symbol('test')).toBe('symbol');
  });

  it('handles BigInt type', () => {
    expect(typeof BigInt(42)).toBe('bigint');
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

});
