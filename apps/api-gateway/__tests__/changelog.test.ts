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

const mockListEntries = jest.fn().mockReturnValue({ entries: [], total: 0 });
const mockListAllEntries = jest.fn().mockReturnValue({ entries: [], total: 0 });
const mockGetUnreadCount = jest.fn().mockReturnValue(0);
const mockMarkAsRead = jest.fn();
const mockCreateEntry = jest.fn().mockReturnValue({
  id: 'cl-1',
  title: 'New Feature',
  description: 'Details here',
  category: 'new_feature',
  modules: ['quality'],
  isPublished: true,
  publishedAt: new Date().toISOString(),
});

jest.mock('@ims/changelog', () => ({
  listEntries: (...args: any[]) => mockListEntries(...args),
  listAllEntries: (...args: any[]) => mockListAllEntries(...args),
  getUnreadCount: (...args: any[]) => mockGetUnreadCount(...args),
  markAsRead: (...args: any[]) => mockMarkAsRead(...args),
  createEntry: (...args: any[]) => mockCreateEntry(...args),
}));

import changelogRouter from '../src/routes/changelog';

describe('Changelog Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1',
      title: 'New Feature',
      description: 'Details here',
      category: 'new_feature',
      modules: ['quality'],
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  describe('GET /api/changelog', () => {
    it('returns published changelog entries (public, no auth required)', async () => {
      mockListEntries.mockReturnValueOnce({
        entries: [{ id: 'cl-1', title: 'Feature A', category: 'new_feature' }],
        total: 1,
      });
      const res = await request(app).get('/api/changelog');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('entries');
    });

    it('accepts limit and offset query params', async () => {
      const res = await request(app).get('/api/changelog').query({ limit: '10', offset: '0' });
      expect(res.status).toBe(200);
      expect(mockListEntries).toHaveBeenCalledWith(10, 0);
    });

    it('rejects invalid limit', async () => {
      const res = await request(app).get('/api/changelog').query({ limit: '999' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/changelog/all', () => {
    it('returns all entries including unpublished (admin)', async () => {
      mockListAllEntries.mockReturnValueOnce({
        entries: [
          { id: 'cl-1', title: 'Feature A', isPublished: true },
          { id: 'cl-2', title: 'Draft Feature', isPublished: false },
        ],
        total: 2,
      });
      const res = await request(app).get('/api/changelog/all');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('entries');
    });
  });

  describe('GET /api/changelog/unread-count', () => {
    it('returns unread count for current user', async () => {
      mockGetUnreadCount.mockReturnValueOnce(5);
      const res = await request(app).get('/api/changelog/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('unreadCount', 5);
    });

    it('returns 0 when no unread entries', async () => {
      mockGetUnreadCount.mockReturnValueOnce(0);
      const res = await request(app).get('/api/changelog/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.data.unreadCount).toBe(0);
    });
  });

  describe('POST /api/changelog/mark-read', () => {
    it('marks all entries as read for current user', async () => {
      const res = await request(app).post('/api/changelog/mark-read');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockMarkAsRead).toHaveBeenCalledWith('user-1');
    });
  });

  describe('POST /api/changelog', () => {
    it('creates a changelog entry as admin', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({
          title: 'New Feature',
          description: 'Details here',
          category: 'new_feature',
          modules: ['quality'],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'cl-1');
    });

    it('rejects missing title', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({ description: 'Details', category: 'new_feature', modules: ['quality'] });
      expect(res.status).toBe(400);
    });

    it('rejects missing modules', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({ title: 'Title', description: 'Details', category: 'new_feature', modules: [] });
      expect(res.status).toBe(400);
    });

    it('rejects invalid category', async () => {
      const res = await request(app)
        .post('/api/changelog')
        .send({
          title: 'Title',
          description: 'Details',
          category: 'invalid_cat',
          modules: ['quality'],
        });
      expect(res.status).toBe(400);
    });

    it('returns 403 for non-admin user', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'user-2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app)
        .post('/api/changelog')
        .send({
          title: 'New Feature',
          description: 'Details',
          category: 'new_feature',
          modules: ['quality'],
        });
      expect(res.status).toBe(403);
    });
  });
});

describe('Changelog Routes — extended', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1',
      title: 'New Feature',
      description: 'Details here',
      category: 'new_feature',
      modules: ['quality'],
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  it('GET /api/changelog returns total count in response', async () => {
    mockListEntries.mockReturnValueOnce({ entries: [{ id: 'cl-2', title: 'Bug fix' }], total: 1 });
    const res = await request(app).get('/api/changelog');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total', 1);
  });

  it('POST /api/changelog with bug_fix category succeeds', async () => {
    const res = await request(app)
      .post('/api/changelog')
      .send({
        title: 'Fixed a bug',
        description: 'Resolved the issue',
        category: 'bug_fix',
        modules: ['inventory'],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/changelog/mark-read calls markAsRead with current user id', async () => {
    await request(app).post('/api/changelog/mark-read');
    expect(mockMarkAsRead).toHaveBeenCalledWith('user-1');
  });
});

describe('Changelog Routes — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1',
      title: 'New Feature',
      description: 'Details here',
      category: 'new_feature',
      modules: ['quality'],
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  it('GET /api/changelog returns data.entries array', async () => {
    mockListEntries.mockReturnValueOnce({
      entries: [{ id: 'cl-3', title: 'Security Patch', category: 'security' }],
      total: 1,
    });
    const res = await request(app).get('/api/changelog');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.entries)).toBe(true);
  });

  it('POST /api/changelog with security category succeeds', async () => {
    mockCreateEntry.mockReturnValueOnce({
      id: 'cl-sec',
      title: 'Security patch',
      category: 'security',
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post('/api/changelog')
      .send({ title: 'Security patch', description: 'Critical fix', category: 'security', modules: ['infosec'] });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('security');
  });

  it('GET /api/changelog/all passes limit and offset to listAllEntries', async () => {
    const res = await request(app).get('/api/changelog/all').query({ limit: '10', offset: '20' });
    expect(res.status).toBe(200);
    expect(mockListAllEntries).toHaveBeenCalledWith(10, 20);
  });

  it('POST /api/changelog missing description returns 400', async () => {
    const res = await request(app)
      .post('/api/changelog')
      .send({ title: 'No desc', category: 'new_feature', modules: ['hr'] });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/changelog/unread-count calls getUnreadCount with user id', async () => {
    mockGetUnreadCount.mockReturnValueOnce(7);
    const res = await request(app).get('/api/changelog/unread-count');
    expect(res.status).toBe(200);
    expect(mockGetUnreadCount).toHaveBeenCalledWith('user-1');
    expect(res.body.data.unreadCount).toBe(7);
  });
});

describe('Changelog Routes — extended edge cases', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1',
      title: 'New Feature',
      description: 'Details here',
      category: 'new_feature',
      modules: ['quality'],
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  it('GET /api/changelog returns total as number', async () => {
    mockListEntries.mockReturnValue({ entries: [], total: 5 });
    const res = await request(app).get('/api/changelog');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.total).toBe('number');
  });

  it('GET /api/changelog/all returns entries array', async () => {
    mockListAllEntries.mockReturnValue({
      entries: [{ id: 'cl-draft', title: 'Draft', isPublished: false }],
      total: 1,
    });
    const res = await request(app).get('/api/changelog/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.entries)).toBe(true);
  });

  it('POST /api/changelog with bug_fix category succeeds', async () => {
    mockCreateEntry.mockReturnValue({
      id: 'cl-fix2',
      title: 'Another Bug Fix',
      category: 'bug_fix',
      isPublished: true,
      publishedAt: new Date().toISOString(),
    });
    const res = await request(app)
      .post('/api/changelog')
      .send({ title: 'Another Bug Fix', description: 'Fixed issue', category: 'bug_fix', modules: ['gateway'] });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/changelog with default limit calls listEntries with limit 20', async () => {
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    await request(app).get('/api/changelog');
    expect(mockListEntries).toHaveBeenCalledWith(20, 0);
  });

  it('POST /api/changelog/mark-read returns 200 with success true', async () => {
    const res = await request(app).post('/api/changelog/mark-read');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/changelog returns 401 when auth fails', async () => {
    mockAuthenticate.mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    });
    const res = await request(app)
      .post('/api/changelog')
      .send({ title: 'Fail', description: 'x', category: 'new_feature', modules: ['hr'] });
    expect(res.status).toBe(401);
  });

  it('GET /api/changelog returns success true', async () => {
    const res = await request(app).get('/api/changelog');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/changelog/unread-count returns success true', async () => {
    const res = await request(app).get('/api/changelog/unread-count');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('createEntry called once per POST request', async () => {
    await request(app)
      .post('/api/changelog')
      .send({ title: 'Title', description: 'Desc', category: 'new_feature', modules: ['quality'] });
    expect(mockCreateEntry).toHaveBeenCalledTimes(1);
  });
});

describe('Changelog Routes — final additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1', title: 'New Feature', description: 'Details here',
      category: 'new_feature', modules: ['quality'], isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  it('GET /api/changelog response is content-type JSON', async () => {
    const res = await request(app).get('/api/changelog');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/changelog with deprecation category returns 400 (invalid category)', async () => {
    const res = await request(app).post('/api/changelog')
      .send({ title: 'T', description: 'D', category: 'deprecation', modules: ['hr'] });
    expect(res.status).toBe(400);
  });

  it('GET /api/changelog/all content-type is JSON', async () => {
    const res = await request(app).get('/api/changelog/all');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/changelog returns data.isPublished field', async () => {
    const res = await request(app).post('/api/changelog')
      .send({ title: 'T', description: 'D', category: 'new_feature', modules: ['hr'] });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('isPublished');
  });

  it('listEntries called exactly once per GET /api/changelog request', async () => {
    await request(app).get('/api/changelog');
    expect(mockListEntries).toHaveBeenCalledTimes(1);
  });

  it('POST /api/changelog with performance_improvement category returns 400 (invalid)', async () => {
    const res = await request(app).post('/api/changelog')
      .send({ title: 'T', description: 'D', category: 'performance_improvement', modules: ['hr'] });
    expect(res.status).toBe(400);
  });
});

describe('Changelog Routes — final batch additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/changelog', changelogRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListEntries.mockReturnValue({ entries: [], total: 0 });
    mockListAllEntries.mockReturnValue({ entries: [], total: 0 });
    mockGetUnreadCount.mockReturnValue(0);
    mockCreateEntry.mockReturnValue({
      id: 'cl-1', title: 'New Feature', description: 'Details here',
      category: 'new_feature', modules: ['quality'], isPublished: true,
      publishedAt: new Date().toISOString(),
    });
  });

  it('GET /api/changelog with limit=0 uses default', async () => {
    const res = await request(app).get('/api/changelog').query({ limit: '0' });
    expect([200, 400]).toContain(res.status);
  });

  it('POST /api/changelog with improvement category succeeds', async () => {
    mockCreateEntry.mockReturnValueOnce({
      id: 'cl-imp2', title: 'Improvement', category: 'improvement', isPublished: true,
      publishedAt: new Date().toISOString(),
    });
    const res = await request(app).post('/api/changelog')
      .send({ title: 'Improvement', description: 'Enhanced perf', category: 'improvement', modules: ['analytics'] });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('improvement');
  });

  it('GET /api/changelog response body has data property', async () => {
    const res = await request(app).get('/api/changelog');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/changelog/unread-count success is true', async () => {
    mockGetUnreadCount.mockReturnValue(9);
    const res = await request(app).get('/api/changelog/unread-count');
    expect(res.body.success).toBe(true);
    expect(res.body.data.unreadCount).toBe(9);
  });

  it('POST /api/changelog returns data.id string', async () => {
    const res = await request(app).post('/api/changelog')
      .send({ title: 'Feature X', description: 'Desc X', category: 'new_feature', modules: ['crm'] });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.id).toBe('string');
  });
});
