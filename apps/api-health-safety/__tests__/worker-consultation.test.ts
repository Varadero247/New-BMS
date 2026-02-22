import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    hSWorkerConsultation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    hSParticipationBarrier: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
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

import router from '../src/routes/worker-consultation';
const { prisma } = require('../src/prisma');

const app = express();
app.use(express.json());
app.use('/', router);

const consultationPayload = {
  title: 'Monthly OHS Committee Meeting',
  topic: 'HAZARD_IDENTIFICATION',
  description: 'Review new hazards identified in Q1',
  consultationDate: '2026-02-15',
  workerRepresentatives: ['John Smith', 'Mary Jones'],
  method: 'MEETING',
  facilitatedBy: 'OHS Manager',
  participantCount: 12,
};

const mockConsultation = {
  id: 'cons-1',
  ...consultationPayload,
  deletedAt: null,
};

describe('ISO 45001 Worker Consultation Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // GET /
  it('GET / returns paginated consultation records', async () => {
    prisma.hSWorkerConsultation.findMany.mockResolvedValue([mockConsultation]);
    prisma.hSWorkerConsultation.count.mockResolvedValue(1);
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET / filters by topic', async () => {
    prisma.hSWorkerConsultation.findMany.mockResolvedValue([]);
    prisma.hSWorkerConsultation.count.mockResolvedValue(0);
    const res = await request(app).get('/?topic=RISK_ASSESSMENT');
    expect(res.status).toBe(200);
  });

  it('GET / filters by method', async () => {
    prisma.hSWorkerConsultation.findMany.mockResolvedValue([]);
    prisma.hSWorkerConsultation.count.mockResolvedValue(0);
    const res = await request(app).get('/?method=SURVEY');
    expect(res.status).toBe(200);
  });

  it('GET / returns 500 on DB error', async () => {
    prisma.hSWorkerConsultation.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/');
    expect(res.status).toBe(500);
  });

  // POST /
  it('POST / creates a consultation record', async () => {
    prisma.hSWorkerConsultation.create.mockResolvedValue(mockConsultation);
    const res = await request(app).post('/').send(consultationPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST / returns 400 on missing workerRepresentatives', async () => {
    const { workerRepresentatives: _w, ...body } = consultationPayload;
    const res = await request(app).post('/').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / returns 400 on empty workerRepresentatives array', async () => {
    const res = await request(app).post('/').send({ ...consultationPayload, workerRepresentatives: [] });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on invalid topic', async () => {
    const res = await request(app).post('/').send({ ...consultationPayload, topic: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on invalid method', async () => {
    const res = await request(app).post('/').send({ ...consultationPayload, method: 'INVALID' });
    expect(res.status).toBe(400);
  });

  it('POST / returns 400 on participantCount < 1', async () => {
    const res = await request(app).post('/').send({ ...consultationPayload, participantCount: 0 });
    expect(res.status).toBe(400);
  });

  // GET /dashboard
  it('GET /dashboard returns YTD stats', async () => {
    prisma.hSWorkerConsultation.count.mockResolvedValueOnce(8);
    prisma.hSWorkerConsultation.groupBy.mockResolvedValue([
      { topic: 'HAZARD_IDENTIFICATION', _count: { id: 4 } },
      { topic: 'RISK_ASSESSMENT', _count: { id: 4 } },
    ]);
    prisma.hSWorkerConsultation.aggregate.mockResolvedValue({ _sum: { participantCount: 96 } });
    prisma.hSParticipationBarrier.count.mockResolvedValue(2);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('consultationsThisYear', 8);
    expect(res.body.data).toHaveProperty('totalParticipants', 96);
    expect(res.body.data).toHaveProperty('byTopic');
    expect(res.body.data).toHaveProperty('activeBarriers', 2);
  });

  it('GET /dashboard handles zero participants', async () => {
    prisma.hSWorkerConsultation.count.mockResolvedValueOnce(0);
    prisma.hSWorkerConsultation.groupBy.mockResolvedValue([]);
    prisma.hSWorkerConsultation.aggregate.mockResolvedValue({ _sum: { participantCount: null } });
    prisma.hSParticipationBarrier.count.mockResolvedValue(0);
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.totalParticipants).toBe(0);
  });

  // GET /barriers
  it('GET /barriers returns paginated barriers list', async () => {
    prisma.hSParticipationBarrier.findMany.mockResolvedValue([{ id: 'bar-1', barrierType: 'LANGUAGE' }]);
    prisma.hSParticipationBarrier.count.mockResolvedValue(1);
    const res = await request(app).get('/barriers');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  // POST /barriers
  it('POST /barriers records a participation barrier', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(mockConsultation);
    prisma.hSParticipationBarrier.create.mockResolvedValue({ id: 'bar-1', barrierType: 'LANGUAGE' });
    const res = await request(app).post('/barriers').send({
      consultationId: '00000000-0000-0000-0000-000000000001',
      barrierType: 'LANGUAGE',
      description: 'Some workers speak limited English',
    });
    expect(res.status).toBe(201);
  });

  it('POST /barriers returns 400 on invalid barrierType', async () => {
    const res = await request(app).post('/barriers').send({
      consultationId: 'cons-1',
      barrierType: 'INVALID',
      description: 'test',
    });
    expect(res.status).toBe(400);
  });

  it('POST /barriers returns 404 when consultation not found', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/barriers').send({
      consultationId: '00000000-0000-0000-0000-000000000001',
      barrierType: 'LANGUAGE',
      description: 'test',
    });
    expect(res.status).toBe(404);
  });

  // GET /:id
  it('GET /:id returns a single consultation', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(mockConsultation);
    const res = await request(app).get('/cons-1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('cons-1');
  });

  it('GET /:id returns 404 for missing record', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });

  it('GET /:id returns 404 for soft-deleted record', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue({ ...mockConsultation, deletedAt: new Date() });
    const res = await request(app).get('/cons-1');
    expect(res.status).toBe(404);
  });

  // PUT /:id
  it('PUT /:id updates consultation fields', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(mockConsultation);
    prisma.hSWorkerConsultation.update.mockResolvedValue({ ...mockConsultation, outcomeSummary: 'Agreed on 3 new controls' });
    const res = await request(app).put('/cons-1').send({ outcomeSummary: 'Agreed on 3 new controls' });
    expect(res.status).toBe(200);
  });

  it('PUT /:id returns 404 for unknown consultation', async () => {
    prisma.hSWorkerConsultation.findUnique.mockResolvedValue(null);
    const res = await request(app).put('/unknown').send({ outcomeSummary: 'test' });
    expect(res.status).toBe(404);
  });
});
