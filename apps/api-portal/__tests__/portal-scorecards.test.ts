import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalScorecard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import portalScorecardsRouter from '../src/routes/portal-scorecards';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/portal/scorecards', portalScorecardsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/scorecards', () => {
  it('should list scorecards', async () => {
    const items = [
      { id: '00000000-0000-0000-0000-000000000001', portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 85 },
    ];
    (prisma as any).portalScorecard.findMany.mockResolvedValue(items);
    (prisma as any).portalScorecard.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/scorecards');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by portalUserId', async () => {
    (prisma as any).portalScorecard.findMany.mockResolvedValue([]);
    (prisma as any).portalScorecard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/scorecards?portalUserId=00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect((prisma as any).portalScorecard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalUserId: '00000000-0000-0000-0000-000000000001' }) })
    );
  });

  it('should filter by period', async () => {
    (prisma as any).portalScorecard.findMany.mockResolvedValue([]);
    (prisma as any).portalScorecard.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/scorecards?period=2026-Q1');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).portalScorecard.findMany.mockResolvedValue([]);
    (prisma as any).portalScorecard.count.mockResolvedValue(20);

    const res = await request(app).get('/api/portal/scorecards?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it('should handle server error', async () => {
    (prisma as any).portalScorecard.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/scorecards');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/scorecards', () => {
  it('should create a scorecard', async () => {
    const scorecard = { id: '00000000-0000-0000-0000-000000000001', portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 85 };
    (prisma as any).portalScorecard.create.mockResolvedValue(scorecard);

    const res = await request(app)
      .post('/api/portal/scorecards')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 85, qualityScore: 90, deliveryScore: 80 });

    expect(res.status).toBe(201);
    expect(res.body.data.overallScore).toBe(85);
  });

  it('should return 400 for missing overallScore', async () => {
    const res = await request(app)
      .post('/api/portal/scorecards')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for score above 100', async () => {
    const res = await request(app)
      .post('/api/portal/scorecards')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 150 });

    expect(res.status).toBe(400);
  });

  it('should return 400 for negative score', async () => {
    const res = await request(app)
      .post('/api/portal/scorecards')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: -5 });

    expect(res.status).toBe(400);
  });

  it('should handle server error on create', async () => {
    (prisma as any).portalScorecard.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/portal/scorecards')
      .send({ portalUserId: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 85 });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/portal/scorecards/:id', () => {
  it('should return a scorecard', async () => {
    (prisma as any).portalScorecard.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', period: '2026-Q1', overallScore: 85 });

    const res = await request(app).get('/api/portal/scorecards/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).portalScorecard.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/scorecards/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should handle server error on fetch', async () => {
    (prisma as any).portalScorecard.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/scorecards/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
  });
});
