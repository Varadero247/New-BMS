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

// Changelog mocks — exact function names from @ims/changelog
const mockListEntries = jest.fn().mockReturnValue({ entries: [], total: 0 });
const mockListAllEntries = jest.fn().mockReturnValue({ entries: [], total: 0 });
const mockGetUnreadCount = jest.fn().mockReturnValue(0);
const mockMarkAsRead = jest.fn();
const mockCreateEntry = jest.fn().mockReturnValue({ id: 'cl-1', title: 'New feature', category: 'new_feature', publishedAt: new Date().toISOString(), isPublished: true });

jest.mock('@ims/changelog', () => ({
  listEntries: (...args: any[]) => mockListEntries(...args),
  listAllEntries: (...args: any[]) => mockListAllEntries(...args),
  getUnreadCount: (...args: any[]) => mockGetUnreadCount(...args),
  markAsRead: (...args: any[]) => mockMarkAsRead(...args),
  createEntry: (...args: any[]) => mockCreateEntry(...args),
}));

// NPS mocks — exact function names from @ims/nps
const mockSubmitResponse = jest.fn().mockReturnValue({ id: 'nps-1', score: 9, category: 'promoter' });
const mockGetAnalytics = jest.fn().mockReturnValue({ npsScore: 42, total: 10, promoters: 6, passives: 2, detractors: 2 });
const mockListResponses = jest.fn().mockReturnValue({ responses: [], total: 0 });

jest.mock('@ims/nps', () => ({
  submitResponse: (...args: any[]) => mockSubmitResponse(...args),
  getAnalytics: (...args: any[]) => mockGetAnalytics(...args),
  listResponses: (...args: any[]) => mockListResponses(...args),
}));

import changelogRoutes from '../src/routes/changelog';
import npsRoutes from '../src/routes/nps';

describe('Changelog Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/changelog', () => {
    it('returns published changelog entries (public)', async () => {
      mockListEntries.mockReturnValue({
        entries: [{ id: 'cl-1', title: 'New feature', category: 'new_feature', publishedAt: new Date().toISOString() }],
        total: 1,
      });
      const res = await request(app).get('/api/changelog');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/changelog/all', () => {
    it('returns all entries including unpublished', async () => {
      const res = await request(app).get('/api/changelog/all');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/changelog/unread-count', () => {
    it('returns unread count for current user', async () => {
      mockGetUnreadCount.mockReturnValue(3);
      const res = await request(app).get('/api/changelog/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(3);
    });
  });

  describe('POST /api/changelog/mark-read', () => {
    it('marks all as read', async () => {
      const res = await request(app).post('/api/changelog/mark-read');
      expect(res.status).toBe(200);
      expect(mockMarkAsRead).toHaveBeenCalled();
    });
  });

  describe('POST /api/changelog', () => {
    it('creates a changelog entry (admin)', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({ title: 'New Feature', description: 'Details here', category: 'new_feature', modules: ['quality'] });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({ description: 'Details', category: 'new_feature' });
      expect(res.status).toBe(400);
    });
  });
});

describe('NPS Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nps', npsRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/nps', () => {
    it('submits NPS response', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 9, comment: 'Great platform!' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects score below 0', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: -1 });
      expect(res.status).toBe(400);
    });

    it('rejects score above 10', async () => {
      const res = await request(app)
        .post('/api/nps')
        .send({ score: 11 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/nps/analytics', () => {
    it('returns NPS analytics', async () => {
      const res = await request(app).get('/api/nps/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('npsScore');
    });
  });

  describe('GET /api/nps/responses', () => {
    it('returns NPS responses', async () => {
      const res = await request(app).get('/api/nps/responses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
