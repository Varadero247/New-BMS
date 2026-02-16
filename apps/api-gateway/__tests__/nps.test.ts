import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1', organisationId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockSubmitResponse = jest.fn().mockReturnValue({
  id: 'nps-1',
  userId: 'user-1',
  orgId: 'org-1',
  score: 9,
  category: 'promoter',
  comment: 'Great platform!',
  createdAt: new Date().toISOString(),
});
const mockGetAnalytics = jest.fn().mockReturnValue({
  npsScore: 42,
  total: 10,
  promoters: 6,
  passives: 2,
  detractors: 2,
  promoterPct: 60,
  detractorPct: 20,
});
const mockListResponses = jest.fn().mockReturnValue({
  responses: [],
  total: 0,
});

jest.mock('@ims/nps', () => ({
  submitResponse: (...args: any[]) => mockSubmitResponse(...args),
  getAnalytics: (...args: any[]) => mockGetAnalytics(...args),
  listResponses: (...args: any[]) => mockListResponses(...args),
}));

import npsRouter from '../src/routes/nps';

describe('NPS Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nps', npsRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1', organisationId: 'org-1' };
      next();
    });
    mockSubmitResponse.mockReturnValue({
      id: 'nps-1',
      userId: 'user-1',
      orgId: 'org-1',
      score: 9,
      category: 'promoter',
      comment: 'Great platform!',
      createdAt: new Date().toISOString(),
    });
    mockGetAnalytics.mockReturnValue({
      npsScore: 42,
      total: 10,
      promoters: 6,
      passives: 2,
      detractors: 2,
      promoterPct: 60,
      detractorPct: 20,
    });
    mockListResponses.mockReturnValue({ responses: [], total: 0 });
  });

  describe('POST /api/nps', () => {
    it('submits an NPS promoter response', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 9, comment: 'Great platform!' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'nps-1');
      expect(res.body.data.category).toBe('promoter');
    });

    it('submits an NPS passive response', async () => {
      mockSubmitResponse.mockReturnValueOnce({ id: 'nps-2', score: 7, category: 'passive' });
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 7 });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('submits an NPS detractor response', async () => {
      mockSubmitResponse.mockReturnValueOnce({ id: 'nps-3', score: 3, category: 'detractor' });
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 3 });
      expect(res.status).toBe(201);
    });

    it('accepts score of 0 (minimum)', async () => {
      mockSubmitResponse.mockReturnValueOnce({ id: 'nps-4', score: 0, category: 'detractor' });
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 0 });
      expect(res.status).toBe(201);
    });

    it('accepts score of 10 (maximum)', async () => {
      mockSubmitResponse.mockReturnValueOnce({ id: 'nps-5', score: 10, category: 'promoter' });
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 10 });
      expect(res.status).toBe(201);
    });

    it('rejects score below 0', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: -1 });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects score above 10', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 11 });
      expect(res.status).toBe(400);
    });

    it('rejects non-integer score', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 7.5 });
      expect(res.status).toBe(400);
    });

    it('rejects missing score', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ comment: 'No score given' });
      expect(res.status).toBe(400);
    });

    it('accepts optional comment', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 8 });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/nps/analytics', () => {
    it('returns NPS analytics for the organisation', async () => {
      const res = await request(app).get('/api/nps/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('npsScore');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('promoters');
      expect(res.body.data).toHaveProperty('detractors');
    });

    it('returns correct NPS score value', async () => {
      const res = await request(app).get('/api/nps/analytics');
      expect(typeof res.body.data.npsScore).toBe('number');
    });
  });

  describe('GET /api/nps/responses', () => {
    it('returns list of NPS responses', async () => {
      mockListResponses.mockReturnValueOnce({
        responses: [{ id: 'nps-1', score: 9, category: 'promoter' }],
        total: 1,
      });
      const res = await request(app).get('/api/nps/responses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('responses');
    });

    it('accepts limit and offset query params', async () => {
      const res = await request(app).get('/api/nps/responses').query({ limit: '10', offset: '0' });
      expect(res.status).toBe(200);
    });

    it('rejects invalid limit param', async () => {
      const res = await request(app).get('/api/nps/responses').query({ limit: '999' });
      expect(res.status).toBe(400);
    });

    it('returns empty list when no responses exist', async () => {
      const res = await request(app).get('/api/nps/responses');
      expect(res.status).toBe(200);
      expect(res.body.data.responses).toHaveLength(0);
    });
  });
});
