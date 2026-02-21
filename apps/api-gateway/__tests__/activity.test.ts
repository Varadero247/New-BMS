import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockLogActivity = jest.fn().mockResolvedValue(undefined);
const mockGetActivity = jest.fn().mockResolvedValue({ entries: [], total: 0 });
const mockGetRecentActivity = jest.fn().mockResolvedValue([]);

jest.mock('@ims/activity', () => ({
  logActivity: (...args: any[]) => mockLogActivity(...args),
  getActivity: (...args: any[]) => mockGetActivity(...args),
  getRecentActivity: (...args: any[]) => mockGetRecentActivity(...args),
}));

import activityRoutes from '../src/routes/activity';

describe('Activity Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/activity', activityRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/activity', () => {
    it('returns activity entries for a record', async () => {
      mockGetActivity.mockResolvedValue({
        entries: [{ id: 'a1', action: 'created', recordType: 'ncr', recordId: 'r1' }],
        total: 1,
      });
      const res = await request(app).get('/api/activity?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('requires recordType and recordId', async () => {
      const res = await request(app).get('/api/activity');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/activity/recent', () => {
    it('returns recent activity for org', async () => {
      mockGetRecentActivity.mockResolvedValue([]);
      const res = await request(app).get('/api/activity/recent');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('accepts limit parameter', async () => {
      mockGetRecentActivity.mockResolvedValue([]);
      const res = await request(app).get('/api/activity/recent?limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/activity', () => {
    it('logs a new activity entry', async () => {
      const res = await request(app).post('/api/activity').send({
        recordType: 'ncr',
        recordId: 'r1',
        action: 'created',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid action', async () => {
      const res = await request(app).post('/api/activity').send({
        recordType: 'ncr',
        recordId: 'r1',
        action: 'invalid_action',
      });
      expect(res.status).toBe(400);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app).post('/api/activity').send({ recordType: 'ncr' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/activity — extended', () => {
    it('returns entries as an array', async () => {
      mockGetActivity.mockResolvedValue({ entries: [], total: 0 });
      const res = await request(app).get('/api/activity?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.entries)).toBe(true);
    });

    it('returns total count in response', async () => {
      mockGetActivity.mockResolvedValue({ entries: [], total: 42 });
      const res = await request(app).get('/api/activity?recordType=ncr&recordId=r1');
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(42);
    });

    it('recent activity returns success true', async () => {
      mockGetRecentActivity.mockResolvedValue([]);
      const res = await request(app).get('/api/activity/recent');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
