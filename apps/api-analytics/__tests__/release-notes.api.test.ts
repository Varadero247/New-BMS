import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    changelog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/release-notes';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/release-notes', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/release-notes — List changelogs
// ===================================================================
describe('GET /api/release-notes', () => {
  it('should return a paginated list of changelogs', async () => {
    const changelogs = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        version: '2.1.0',
        title: 'Major release',
        publishedAt: new Date(),
      },
      { id: 'cl-2', version: '2.0.1', title: 'Bug fix', publishedAt: new Date() },
    ];
    (prisma as any).changelog.findMany.mockResolvedValue(changelogs);
    (prisma as any).changelog.count.mockResolvedValue(2);

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.changelogs).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should support pagination query params', async () => {
    (prisma as any).changelog.findMany.mockResolvedValue([]);
    (prisma as any).changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(10);
  });

  it('should cap limit at 50', async () => {
    (prisma as any).changelog.findMany.mockResolvedValue([]);
    (prisma as any).changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes?limit=100');

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(50);
  });

  it('should return an empty list when no changelogs exist', async () => {
    (prisma as any).changelog.findMany.mockResolvedValue([]);
    (prisma as any).changelog.count.mockResolvedValue(0);

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(200);
    expect(res.body.data.changelogs).toHaveLength(0);
    expect(res.body.data.pagination.totalPages).toBe(0);
  });

  it('should handle server errors', async () => {
    (prisma as any).changelog.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/release-notes');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/release-notes/:id — Get single changelog
// ===================================================================
describe('GET /api/release-notes/:id', () => {
  it('should return a changelog by ID', async () => {
    const changelog = {
      id: '00000000-0000-0000-0000-000000000001',
      version: '2.1.0',
      title: 'Major release',
      publishedAt: new Date(),
    };
    (prisma as any).changelog.findUnique.mockResolvedValue(changelog);

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.changelog.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.changelog.version).toBe('2.1.0');
  });

  it('should return 404 for a non-existent changelog', async () => {
    (prisma as any).changelog.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    (prisma as any).changelog.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/release-notes/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
